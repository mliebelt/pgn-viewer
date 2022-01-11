import { parse, split } from '@mliebelt/pgn-parser'
import {ParseTreeOrArray, ParseTree, PgnMove} from '@mliebelt/pgn-parser/lib/types'
import { Chess } from 'chess.js'
import * as types from './types'
import * as nag from './nag'
import {StringBuilder} from "./sb"


/**
 * Defines the base functionality for reading and working with PGN.
 * The configuration is the part of the configuration given to the PgnViewer this is relevant
 * for the reader.
 * @param {*} configuration Given values this are relevant for reading and working with PGN
 */
export class PgnReader {
    configuration: types.PgnReaderConfiguration
    games: ParseTree[]
    moves: types.PgnReaderMove[]
    chess: Chess
    currentGameIndex: number
    endGame: any

    constructor(configuration: types.PgnReaderConfiguration) {
        function initializeConfiguration (configuration) {
            function readPgnFromFile (url) {
                const request = new XMLHttpRequest()
                request.open('GET', url, false)
                request.send()
                if (request.status === 200) {
                    return request.responseText
                }
                return ""
            }
            let defaults = {
                notation: 'short',
                position: 'start',
                locale: 'en'
            }
            if (! configuration.pgn) {
                if (typeof configuration.pgnFile === 'undefined') {
                    configuration.pgn = '*'
                } else {
                    configuration.pgn = readPgnFromFile(configuration.pgnFile)
                }
            }
            return Object.assign(defaults, configuration)
        }
        this.configuration = initializeConfiguration(configuration)
        this.chess = Chess()
        if (! this.configuration.lazyLoad) {
            this.loadPgn()
        }

    }
    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param move given move in JSON notation
     * @return {*} the SAN string created from the move
     */
    san(move: types.PgnReaderMove) {
        function getFig (fig) {
            if (fig === 'P') {
                return ''
            }
            return fig
        }
        let notation = move.notation;
        if (typeof notation.row === 'undefined') {
            return notation.notation; // move like O-O and O-O-O
            // TODO What if the move has a NAG? This will be ignored here?
        }
        const fig = notation.fig ? getFig(notation.fig) : ''
        let disc = notation.disc ? notation.disc : ''
        const strike = notation.strike ? notation.strike : ''
        // Pawn moves with capture need the col as "discriminator"
        if (strike && !fig) { // Pawn capture
            disc = move.from.substring(0,1)
        }
        const check = notation.check ? notation.check : ''
        const prom = notation.promotion ? '=' + getFig(notation.promotion.substring(1,2)) : ''
        if (this.configuration.notation === 'short') {
            return fig + disc + strike + notation.col + notation.row + prom + check
        }
        return fig + move.from + (notation.strike ? strike : '-') + move.to + prom + check
    }

    sanWithNags (move) {
        let _san = this.san(move);
        if (move.nag) {
            _san += nag.nagToSymbol(move.nag);
        }
        return _san;
    }

    loadPgn() {
        let hasManyGames = (): boolean => {
            return this.configuration.manyGames
        }
        if (hasManyGames()) {
            this.loadMany()
            this.loadOne(this.games[0])
            return this
        }
        let _mgame = parse(this.configuration.pgn, {startRule: 'game'})
        this.games = [_mgame as ParseTree]
        this.loadOne(_mgame)
        return this
    }

    loadMany () {
        this.games = parse(this.configuration.pgn, {startRule: 'games'}) as ParseTree[];
    }
    loadOne (game:ParseTreeOrArray) {
        let interpretHeaders = (_game): void => {
            if (_game.tags.SetUp) {
                const setup = _game.tags.SetUp
                if (setup === '0') {
                    this.configuration.position = 'start'
                } else {
                    this.configuration.position = _game.tags.FEN
                }
            }
            if (_game.tags.Result) {
                this.endGame = _game.tags.Result
            }
        }

        this.currentGameIndex = typeof game === 'number' ? game : 0
        let _game: ParseTree = typeof game === 'number' ? this.games[game] : game as ParseTree
        interpretHeaders(_game)
        this.readMoves(_game.moves)
        if (this.configuration.startPlay && this.configuration.hideMovesBefore) {
            let new_fen = this.deleteMovesBefore(this.configuration.startPlay)
            let new_pgn = this.writePgn()
            this.configuration.startPlay = null
            this.configuration.hideMovesBefore = false
            this.configuration.pgn = new_pgn
            this.configuration.position = new_fen
            this.loadPgn()
        }
    }
    possibleMoves(game) {
        const dests = new Map();
        game.SQUARES.forEach(s => {
            const ms = game.moves({square: s, verbose: true})
            if (ms.length) dests[s] = ms.map(m => m.to)
        })
        return dests
    }
    readMoves(moves) {
        let correctVariations = (): void => {
            this.getMoves().forEach(function(move) {
                for (let i = 0; i < move.variations.length; i++) {
                    move.variations[i] = move.variations[i][0]
                }
            })
        };
        let remindEndGame = (movesMainLine): void =>  {
            if (typeof movesMainLine[movesMainLine.length - 1] === "string") {
                this.endGame = movesMainLine.pop()
            }
        }
        let correctTurn = (): void => {
            function getTurn (fen) {
                const tokens = fen.split(/\s+/)
                return tokens[1]
            }

            if ((getTurn(this.configuration.position) === 'b') &&
                (this.isMove(0)) &&
                (this.moves[0].turn === 'w')) {
                this.getMoves().forEach(function(move) {
                    move.turn = (move.turn === 'w') ? 'b' : 'w'
                })
            }
        }

        let movesMainLine = moves;
        remindEndGame(movesMainLine);
        this.eachMove(movesMainLine);
        correctTurn();
        correctVariations();
    };
    isMove(id) {
        return this.getMoves().length > id;
    };
    isDeleted (id) {
        if (! this.isMove(id))
            return true // Every non-existing moves is "deleted"
        const current = this.getMoves()[id]
        if (current === null) {
            return true
        }
        if (id === 0 && (current)) {
            return false
        }
        return false // default
    }
    getMove (id) {
        return this.getMoves() ? this.getMoves()[id] : undefined
    }
    deleteMove (id): void {
        let removeFromArray = (array, index): types.PgnReaderMove => {
            const ret = array[index]
            array.splice(index, 1)
            return ret
        };

        if (this.isDeleted(id)) {
            return
        }
        // 1. Main line first move
        if (id === 0) {
            // Delete all moves
            this.moves = []
            return
        }
        let current = this.getMove(id)
        // 2. First move of variation
        if (this.startVariation(current)) {
            const vars = this.getMove(this.getMove(current.prev).next).variations
            for (let i = 0; vars.length; i++) {
                if (vars[i] === current) {
                    removeFromArray(vars, i)
                    if (current.next !== undefined) {
                        this.deleteMove(current.next)
                    }
                    this.getMoves()[current.index] = null
                    return
                }
            }
        }
        // 3. Some line some other move, no variation
        if (current.variations.length === 0) {
            if (current.next !== undefined && (current.next !== null)) {
                this.deleteMove(current.next)
            }
            this.moves[current.prev].next = null
            this.moves[id] = null
            return
        }
        // 4. Some line some other move, with variation
        if (current.variations.length > 0) {
            if (current.next !== undefined) {
                this.deleteMove(current.next)
            }
            let variationMove = removeFromArray(current.variations, 0)
            let varLevel = variationMove.variationLevel
            this.moves[current.prev].next = variationMove.index
            this.moves[id] = null
            this.updateVariationLevel(variationMove, varLevel - 1)
        }
    }
    updateVariationLevel (move, varLevel) {
        if (arguments.length === 0) {
            // Workaround: we don't know which is the first move, so this this with index 0
            const my_move = this.getFirstMove();
            this.updateVariationLevel(my_move, 0);
        } else {
            move.variationLevel = varLevel;
            if (move.next !== undefined) {
                this.updateVariationLevel(this.getMove(move.next), varLevel);
            }
            if (move.variations) {
                for (let i = 0; i < move.variations.length; i++) {
                    this.updateVariationLevel(move.variations[i], varLevel + 1);
                }
            }
        }
    }
    findMove(moveRep) {
        if (!isNaN(moveRep)) {   // the following goes only over the main line, move number cannot denote a variation
            moveRep = moveRep - 1;
            let move = this.getMove(0);
            while (moveRep > 0) {
                moveRep = moveRep - 1;
                move = this.getMove(move.next);
            }
            return move;
        }
        let moves = this.getMoves();
        for (let move of moves) {
            if (move.fen.startsWith(moveRep)) {
                return move;
            } else if (move.notation.notation === moveRep) {
                return move;
            }
        }
        return undefined;
    }
    deleteMovesBefore (id) {
        // Inner function, this really deletes
        let deleteMovesBeforeIncluding = (id) => {
            let my_fen = this.moves[id].fen
            this.moves[id] = null;
            if (id <= 0) return my_fen;
            deleteMovesBeforeIncluding(id - 1);
            return my_fen;
        };
        if (id === undefined) {
            return "";
        }
        if (id === null) {
            return "";
        }
        if (id <= 0) {
            return "";
        }
        let my_fen = deleteMovesBeforeIncluding(id - 1);
        this.getMove(id).prev = null;
        return my_fen // Need position to start game here
    };
    promoteMove (id) {
        /**
         * Returns the first move of a variation.
         */
        let firstMoveOfVariation = (move) => {
            if (this.startVariation(move)) {
                return move
            }
            return firstMoveOfVariation(this.getMove(move.prev))
        }

        const move = this.getMove(id);
        // 1. Check this is variation
        if ((typeof move.variationLevel == "undefined") || (move.variationLevel === 0)) {
            return;
        }

        // 2. Get the first move of the variation
        const myFirst = firstMoveOfVariation(move);

        // 3. Get the index of this moves variation array
        const higherVariationMove = (myFirst.prev == null) ? this.getFirstMove() : this.getMove(this.getMove(myFirst.prev).next)
        let indexVariation;
        for (let i = 0; i < higherVariationMove.variations.length; i++) {
            if (higherVariationMove.variations[i] === myFirst) {
                indexVariation = i
            }
        }

        // 4. If variation index is > 0 (not the first variation)
        if (indexVariation > 0) {
            // Just switch with the previous index
            let tmpMove = higherVariationMove.variations[indexVariation - 1]
            higherVariationMove.variations[indexVariation - 1] = higherVariationMove.variations[indexVariation]
            higherVariationMove.variations[indexVariation] = tmpMove
        } else if (higherVariationMove.prev == null) {
            // 5. Special case: variation has no previous move, switch main line
            const tmpVariations = higherVariationMove.variations
            higherVariationMove.variations = myFirst.variations
            myFirst.variations = tmpVariations
            myFirst.variations[0] = higherVariationMove
            // Update the variation level because there will be changes
            this.updateVariationLevel(myFirst, 0)
        } else {
            // 6. Now the most difficult case: create new array from line above, switch this with
            // the variation
            let tmpMove = higherVariationMove
            const tmpVariations = higherVariationMove.variations
            const prevMove = this.getMove(higherVariationMove.prev)
            prevMove.next = myFirst.index
            tmpMove.variations = myFirst.variations
            myFirst.variations = tmpVariations
            myFirst.variations[0] = tmpMove
            this.updateVariationLevel(myFirst, myFirst.variationLevel - 1)
        }
    }
    startMainLine(move): boolean  {
        return  move.variationLevel === 0 && (typeof move.prev !== "number")
    }
    startVariation (move): boolean {
        return  move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (this.getMoves()[move.prev].next !== move.index))
    }
    endVariation (move):boolean {
        return move.variationLevel > 0 && ! move.next
    }
    afterMoveWithVariation (move): boolean {
        return this.getMoves()[move.prev] && (this.getMoves()[move.prev].variations.length > 0)
    }
    writePgn (): string {

        // Prepend a space if necessary
        function prepend_space(sb) {
            if ( (!sb.isEmpty()) && (sb.lastChar() !== " ")) {
                sb.append(" ");
            }
        }

        function write_comment (comment, sb) {
            if (comment === undefined || comment === null) {
                return;
            }
            prepend_space(sb);
            sb.append("{");
            sb.append(comment);
            sb.append("}");
        };

        let write_game_comment = (sb) => {
            let gc = this.getGameComment()
            let gc1 = gc ? gc.comment : undefined
            write_comment(gc1, sb)
        }

        function write_comment_move (move, sb) {
            write_comment(move.commentMove, sb)
        }

        function write_comment_after (move, sb) {
            write_comment(move.commentAfter, sb)
        }

        function write_comment_diag (move, sb) {
            let has_diags = (move) => {
                return move.commentDiag &&
                    ( ( move.commentDiag.colorArrows && move.commentDiag.colorArrows.length > 0 ) ||
                        ( move.commentDiag.colorFields && move.commentDiag.colorFields.length > 0 )
                    )
            }
            let arrows = (move) => { return move.commentDiag.colorArrows || [] }
            let fields = (move) => { return move.commentDiag.colorFields || [] }

            if (has_diags(move)) {
                let sbdiags: StringBuilder = new StringBuilder("")
                let first = true
                sbdiags.append("[%csl ")
                fields(move).forEach( (field) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("")
                    first = false
                    sbdiags.append(field)
                })
                sbdiags.append("]")
                first = true
                sbdiags.append("[%cal ")
                arrows(move).forEach( (arrow) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("")
                    first = false
                    sbdiags.append(arrow)
                })
                sbdiags.append("]")
                write_comment(sbdiags.toString(), sb)
            }
        }

        let write_move_number = (move, sb) => {
            prepend_space(sb)
            if (move.turn === "w") {
                sb.append("" + move.moveNumber)
                sb.append(".")
            } else if (this.startVariation(move)) {
                sb.append("" + move.moveNumber)
                sb.append("...")
            }
        }

        function write_notation (move, sb) {
            prepend_space(sb);
            sb.append(move.notation.notation);
        };

        function write_NAGs (move, sb) {
            if (move.nag) {
                move.nag.forEach(function(ele) {
                    sb.append(ele);
                });
            }
        };

        function write_variation (move, sb) {
            prepend_space(sb);
            sb.append("(");
            write_move(move, sb);
            prepend_space(sb);
            sb.append(")");
        };

        function write_variations (move, sb) {
            for (let i = 0; i < move.variations.length; i++) {
                write_variation(move.variations[i], sb);
            }
        };

        let get_next_move = (move) => {
            return move.next ? this.getMove(move.next) : null;
        };

        /**
         * Write the normalised notation: comment move, move number (if necessary),
         * comment before, move, NAGs, comment after, variations.
         * Then go into recursion for the next move.
         * @param move the move in the exploded format
         * @param sb the string builder to use
         */
        function write_move (move, sb) {
            if (move === null || move === undefined) {
                return;
            }
            write_comment_move(move, sb);
            write_move_number(move, sb);
            write_notation(move, sb);
            //write_check_or_mate(move, sb);    // not necessary if san from chess.src is used
            write_NAGs(move, sb);
            write_comment_after(move, sb);
            write_comment_diag(move, sb);
            write_variations(move, sb);
            const next = get_next_move(move);
            write_move(next, sb);
        };

        let write_end_game = (_sb) => {
            if (this.endGame) {
                _sb.append(" ");
                _sb.append(this.endGame);
            }
        };

        function write_pgn2 (move, _sb): string {
            write_game_comment(sb)
            write_move(move, _sb)
            write_end_game(_sb)
            return _sb.toString()
        };
        const sb: StringBuilder = new StringBuilder("");
        let indexFirstMove = 0;
        while (this.getMove(indexFirstMove) === null) { indexFirstMove += 1; }
        return write_pgn2(this.getMove(indexFirstMove), sb);
    };
    setToStart (): void {
        if (this.configuration.position === 'start') {
            this.chess.reset()
        } else {
            this.chess.load(this.configuration.position)
        }
    }
    eachMove (movesMainLine) {
        this.moves = [];
        let current = -1;
        let findPrevMove = (level, index): types.PgnReaderMove => {
            while (index >= 0) {
                if (this.moves[index].variationLevel === level) {
                    return this.moves[index]
                }
                index--
            }
            return null
        }
        let eachMoveVariation = (moveArray, level, prev): void => {
            function wireMoves(current, prev, currentMove, prevMove) {
                if (prevMove != null) {
                    currentMove.prev = prev;
                    if (! prevMove.next) { // only set, if not set already
                        prevMove.next = current;
                    }
                }
                currentMove.index = current;
            };
            function getMoveNumberFromPosition (fen) {
                const tokens = fen.split(/\s+/)
                const move_number = parseInt(tokens[5], 10)
                return (tokens[1] === 'b') ? move_number : move_number - 1
            }
            let prevMove = (prev != null ? this.moves[prev] : null)
            moveArray.forEach( (move, i) => {
                current++;
                move.variationLevel = level;
                this.moves.push(move);
                if (i > 0) {
                    if (this.moves[current - 1].variationLevel > level) {
                        prevMove = findPrevMove(level, current -1);
                        prev = prevMove.index;
                    } else {
                        prev = current - 1;
                        prevMove = this.moves[prev];
                    }
                }
                wireMoves(current, prev, move, prevMove);
                // Checks the move on a real board, and hold the fen
                // TODO: Use the position from the configuration, to ensure, this games
                // could be played not starting at the start position.
                if (typeof move.prev == "number") {
                    this.chess.load(this.getMove(move.prev).fen);
                } else {
                    this.setToStart();
                }
                let pgn_move = this.chess.move(move.notation.notation, {'sloppy' : true});
                if (pgn_move === null) {
                    throw new Error("No legal move: " + move.notation.notation)
                }
                let fen = this.chess.fen();
                move.fen = fen;
                move.from = pgn_move.from;
                move.to = pgn_move.to;
                move.notation.notation = pgn_move.san;

                if (pgn_move.flags === 'c') {
                    move.notation.strike = 'x';
                }
                if (this.chess.in_checkmate()) {
                    move.notation.check = '#';
                } else if (this.chess.in_check()) {
                    move.notation.check = '+';
                }
                move.moveNumber = getMoveNumberFromPosition(fen);

                move.variations.forEach(function(variation) {
                    eachMoveVariation(variation, level + 1, prev);
                });
            });
        };
        eachMoveVariation(movesMainLine, 0, null)
    }
    addMove (move, moveNumber) {
        let getTurn = (moveNumber): types.Color => {
            return this.getMove(moveNumber).turn === "w" ? 'b' : "w"
        }

        // Special case: first move, so there is no previous move
        let existingFirstMove = (move) => {
            let first_move_notation = (): string => {
                if (typeof this.getMove(0) == 'undefined') return null
                return this.getMove(0).notation.notation
            }
            this.setToStart()
            let pgn_move = this.chess.move(move)
            if (! pgn_move) {
                return null
            } else if (first_move_notation() === pgn_move.san) {
                return 0
            } else {   // TODO: Could be a variation of the first move ...
                return existingVariationFirstMove(pgn_move)
            }
        }

        // Handles the first move this may be a variation of the first move, returns this.
        // If not, returns null
        let existingVariationFirstMove = (pgn_move) => {
            if (typeof this.getMove(0) == 'undefined') return null;
            let variations = this.getMove(0).variations;
            let vari;
            for (vari in variations) {
                if (variations[vari].notation.notation === pgn_move.san) return variations[vari].moveNumber;
            }
            return null; // no variation found
        }

        // Returns the existing move number or null
        // Should include all variations as well
        let existingMove = (move, moveNumber) => {
            if (moveNumber == null) return existingFirstMove(move);
            let prevMove = this.getMove(moveNumber);
            if (typeof prevMove == "undefined") return null;
            this.chess.load(prevMove.fen);
            let pgn_move = this.chess.move(move);
            let nextMove = this.getMove(prevMove.next);
            if (typeof nextMove == "undefined") return null;
            if (nextMove.notation.notation === pgn_move.san) {
                return prevMove.next;
            } else { // check if there exists variations
                let mainMove = this.getMove(prevMove.next);
                for (let i = 0; i < mainMove.variations.length; i++) {
                    let variation = mainMove.variations[i];
                    if (variation.notation.notation === pgn_move.san) {
                        return variation.index;
                    }
                }
            }
            return null;
        }

        // Handle possible variation
        let handleVariation = (move, prev, next): void => {
            //console.log("handle variation: prev == " + prev + " next == " + next);
            let prevMove = this.getMove(prev)
            if (prevMove === undefined) { // special case: variation on first move
                if (next <= 0) return // First move
                this.getMove(0).variations.push(move)
                move.variationLevel = 1
                return
            }
            if (prevMove.next) {    // has a next move set, so should be a variation
                this.getMove(prevMove.next).variations.push(move)
                move.variationLevel = (prevMove.variationLevel ? prevMove.variationLevel : 0) + 1
                if (move.turn === 'b') {
                    move.moveNumber = prevMove.moveNumber
                }
            } else {    // main variation
                prevMove.next = next
                move.variationLevel = prevMove.variationLevel
            }
        }

        let curr = existingMove(move, moveNumber);
        if (typeof curr == 'number') return curr;
        // @ts-ignore
        let real_move: types.PgnReaderMove = { "notation": {}};
        real_move.from = move.from;
        real_move.to = move.to;
        real_move.variations = [];
        if (moveNumber == null) {
            this.setToStart();
            real_move.turn = this.chess.turn();
            real_move.moveNumber = 1;
        } else {
            this.chess.load(this.getMove(moveNumber).fen);
            real_move.turn = getTurn(moveNumber);
            if (real_move.turn === "w") {
                real_move.moveNumber = this.getMove(moveNumber).moveNumber + 1;
            } else {
                real_move.moveNumber = this.getMove(moveNumber).moveNumber;
            }
        }
        let pgn_move = this.chess.move(move);
        real_move.fen = this.chess.fen();
        // san is the real notation, in case of O-O is this O-O.
        // to is the to field, in case of (white) O-O is this g1.
        if (pgn_move.san.substring(0,1) !== "O") {
            real_move.notation.notation = pgn_move.san;
            real_move.notation.col = pgn_move.to.substring(0,1);
            real_move.notation.row = pgn_move.to.substring(1,2);
            if (pgn_move.piece !== "p") {
                real_move.notation.fig = pgn_move.piece.charAt(0).toUpperCase();
            }
            if (pgn_move.promotion) {
                real_move.notation.promotion = '=' + pgn_move.promotion.toUpperCase();
            }
            if (pgn_move.flags.includes(this.chess.FLAGS.CAPTURE) || (pgn_move.flags.includes(this.chess.FLAGS.EP_CAPTURE))) {
                real_move.notation.strike = 'x';
            }
            // real_move.notation.ep = pgn_move.flags.includes(this.chess.FLAGS.EP_CAPTURE)
            if (this.chess.in_check()) {
                if (this.chess.in_checkmate()) {
                    real_move.notation.check = '#';
                } else {
                    real_move.notation.check = '+';
                }
            }
        } else {
            real_move.notation.notation = pgn_move.san;
        }
        this.getMoves().push(real_move);
        real_move.prev = moveNumber;
        let next = this.getMoves().length - 1;
        real_move.index = next;
        handleVariation(real_move, moveNumber, next);
        return next;
    };
    changeNag (_nag, moveNumber, added) {
        let move = this.getMove(moveNumber)
        if (move.nag == null) {
            move.nag = []
        }
        let nagSym = (_nag[0] === "$") ? _nag : nag.symbolToNag(_nag)
        if (added) {
            if (move.nag.indexOf(nagSym) === -1) {
                move.nag.push(nagSym)
            }
        } else {
            let index = move.nag.indexOf(nagSym)
            if (index > -1) {
                move.nag.splice(index, 1)
            }
        }
    }
    clearNags (moveNumber) {
        let move = this.getMove(moveNumber)
        move.nag = []
    }
    getOrderedMoves (current, returnedMoves) {
        if (arguments.length === 0) {
            return this.getOrderedMoves(this.getFirstMove(), [])
        }
        returnedMoves.push(current)
        if (current.variations) {
            for (let i = 0; i < current.variations.length; i++) {
                this.getOrderedMoves(current.variations[i], returnedMoves);
            }
        }
        if (current.next) {
            return this.getOrderedMoves(this.getMove(current.next), returnedMoves);
        } else {
            return returnedMoves;
        }
    }
    getMoves() {
        return this.moves ? this.moves : []
    }
    getFirstMove() {
        let _moves = this.getMoves()
        for (const _move of _moves) {
            if (_move.variationLevel == null || _move.variationLevel == 0 && _move.prev == null) {
                return _move
            }
        }
        return null
    }
    getTags() {
        if (! this.games) { return new Map() }
        let _tags = this.games[this.currentGameIndex].tags
        return new Map(Object.entries(_tags))
    }
    getGameComment() {
        if (! this.games) { return undefined }
        return this.games[this.currentGameIndex].gameComment ? this.games[this.currentGameIndex].gameComment : undefined
    }
    getGames() {
        return this.games
    }
    getEndGame() {
        return this.endGame;
    }
    setShapes(move, shapes) {
        if (! move.commentDiag) {
            move.commentDiag = {};
        }
        // Ensure everything is reset
        move.commentDiag.colorArrows = []
        move.commentDiag.colorFields = []

        shapes.forEach( (shape) => {
            if (shape.dest) { // arrow
                let colArrow = shape.brush.slice(0,1).toUpperCase()
                let arr = shape.orig + shape.dest
                move.commentDiag.colorArrows.push(colArrow + arr)
            } else { // field
                let colField = shape.brush.slice(0,1).toUpperCase()
                let fie = shape.orig
                move.commentDiag.colorFields.push(colField + fie)
            }
        })
    }



}
const pgnReader = function (configuration) {

    // Ensure this at least one game (or the only game) is loaded

    // This defines the public API of the pgn function.
    return {
        configuration: this.configuration,
        deleteMove: this.deleteMove,
        deleteMovesBefore: this.deleteMovesBefore,
        isDeleted: this.isDeleted,
        promoteMove: this.promoteMove,
        readMoves: this.readMoves,
        findMove: this.findMove,
        getMoves: this.getMoves,
        getOrderedMoves: this.getOrderedMoves,
        getMove: this.getMove,
        getFirstMove: this.getFirstMove,
        getEndGame: this.getEndGame,
        getGameComment: this.getGameComment,
        getTags: this.getTags,
        getGames: this.getGames,
        loadOne: this.loadOne,
        // getParser: () => parser,
        writePgn: this.writePgn,
        startVariation: this.startVariation,
        startMainLine: this.startMainLine,
        endVariation: this.endVariation,
        afterMoveWithVariation: this.afterMoveWithVariation,
        changeNag: this.changeNag,
        clearNags: this.clearNags,
        addMove: this.addMove,
        hasDiagramNag: nag.hasDiagramNag,
        PGN_NAGS: nag.PGN_NAGS,
        PROMOTIONS: types.PROMOTIONS,
        NAGS: nag.NAGs,
        san: this.san,
        sanWithNags: this.sanWithNags,
        nagToSymbol: nag.nagToSymbol,
        chess: this.chess,
        loadPgn: this.loadPgn,
        possibleMoves: this.possibleMoves,
        setShapes: this.setShapes
    };
};


// let parse = require('@mliebelt/pgn-parser').parse
import { parse } from '@mliebelt/pgn-parser'
// let parse = require('../tmp-lib/lib').parse
// import { parse } from '@mliebelt/pgn-parser'
import { ParseTree, PgnMove, PgnDate, PgnTime, TimeControl} from '@mliebelt/pgn-parser'
// import {ParseTreeOrArray, ParseTree, PgnMove, Tags, PgnDate, PgnTime, TimeControl} from '@mliebelt/pgn-parser'
import {Chess} from 'chess.js'
import * as nag from './nag'
export { hasDiagramNag } from './nag'
import {StringBuilder} from "./sb"
import {
    Color,
    Field,
    GameComment,
    Message,
    PgnReaderConfiguration,
    PgnReaderMove,
    PrimitiveMove,
    Shape
} from "./types"

let isBrowser=new Function("try {return this===window;}catch(e){ return false;}")


/**
 * Defines the base functionality for reading and working with PGN.
 * The configuration is the part of the configuration given to the PgnViewer that is relevant
 * for the reader.
 * The reader is an abstraction that just knows the current games, and handles changes by keeping the change
 * in the state of the game. So all local storage in the reader should be avoided besides `configuration`, `games`
 * and `currentGameIndex`.
 * @param {*} configuration Given values are relevant for reading and working with PGN
 */
export class PgnReader {
    configuration: PgnReaderConfiguration
    games: ParseTree[]
    moves: PgnReaderMove[]
    chess
    currentGameIndex: number
    endGame: string

    constructor(configuration: PgnReaderConfiguration) {
        function initializeConfiguration (configuration: PgnReaderConfiguration) {
            function browserReadFromURL(url: string) {
                const request = new XMLHttpRequest()
                request.open('GET', url, false)
                request.send()
                if (request.status === 200) {
                    return request.responseText
                }
                throw new Error("URL not found or could not read: " + url)
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
                    // the following only works in the browser
                    configuration.pgn = isBrowser() ? browserReadFromURL(configuration.pgnFile) : '*'
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
    san(move: PgnReaderMove): string {
        function getFig (fig: string) {
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

    sanWithNags (move: PgnReaderMove): string {
        let _san = this.san(move);
        if (move.nag) {
            _san += nag.nagToSymbol(move.nag);
        }
        return _san;
    }

    loadPgn():PgnReader {
        let hasManyGames = (): boolean => {
            return this.configuration.manyGames || (this.configuration.manyGames !== undefined)
        }
        if (hasManyGames()) {
            this.loadMany()
            this.loadOne(this.games[0])
            return this
        }
        let _mgame = parse(this.configuration.pgn, {startRule: 'game'}) as unknown as ParseTree
        this.games = [_mgame]
        this.loadOne(_mgame)
        return this
    }

    loadMany () {
        this.games = parse(this.configuration.pgn, {startRule: 'games'}) as unknown as ParseTree[];
    }
    loadOne (game:ParseTree|number) {
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
            } else {
                this.endGame = undefined
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
    possibleMoves(move: number|string): Map<Field, Field[]> {
        let _fen = typeof move === 'number' ? this.getMove(move as undefined as number).fen : move
        const dests = new Map();
        if (! this.chess.load(_fen)) { // Not a valid position, no move possible
            return dests
        }
        this.chess.SQUARES.forEach(s => {
            const ms = this.chess.moves({square: s, verbose: true})
            if (ms.length) dests.set(s, ms.map(m => m.to))
        })
        return dests
    }
    readMoves(moves: PgnMove[]) {
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
    isMove(id: number): boolean {
        return this.getMoves().length > id;
    };
    isDeleted (id: number): boolean {
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
    getMove (id: number): PgnReaderMove|undefined {
        return this.getMoves() ? this.getMoves()[id] : undefined
    }
    deleteMove (id: number): void {
        let removeFromArray = (array, index): PgnReaderMove => {
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
    updateVariationLevel (move: PgnReaderMove, varLevel: number): void {
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
    findMove(moveRep: number|string): PgnReaderMove|undefined {
        if (!isNaN(moveRep as number)) {   // the following goes only over the main line, move number cannot denote a variation
            let moveNum = moveRep as number - 1
            let move = this.getMove(0)
            while (moveNum > 0) {
                moveNum = moveNum - 1
                move = this.getMove(move.next)
            }
            return move
        }
        let moves = this.getMoves();
        for (let move of moves) {
            if (move.fen.startsWith(moveRep as string)) {
                return move
            } else if (move.notation.notation === moveRep) {
                return move
            }
        }
        return undefined
    }
    deleteMovesBefore (moveRep: number|string): string {
        // Inner function, this really deletes
        let deleteMovesBeforeIncluding = (id) => {
            let my_fen = this.moves[id].fen
            this.moves[id] = null
            if (id <= 0) return my_fen
            deleteMovesBeforeIncluding(id - 1)
            return my_fen
        }
        let move = this.findMove(moveRep)
        if (move === undefined) {
            return ""
        }
        if (move.index <= 0) {
            return ""
        }
        let my_fen = deleteMovesBeforeIncluding(move.index - 1)
        this.getMove(move.index).prev = null
        return my_fen // Need position to start game here
    }
    promoteMove (id: number) {
        /**
         * Returns the first move of a variation.
         */
        let firstMoveOfVariation = (move: PgnReaderMove): PgnReaderMove => {
            if (this.startVariation(move)) {
                return move
            }
            return firstMoveOfVariation(this.getMove(move.prev))
        }

        const move: PgnReaderMove = this.getMove(id);
        // 1. Check this is variation
        if ((typeof move.variationLevel == "undefined") || (move.variationLevel === 0)) {
            return;
        }

        // 2. Get the first move of the variation
        const myFirst: PgnReaderMove = firstMoveOfVariation(move);

        // 3. Get the index of this moves variation array
        const higherVariationMove = (myFirst.prev == null) ? this.getFirstMove() : this.getMove(this.getMove(myFirst.prev).next)
        let indexVariation: number;
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
    startMainLine(move: PgnReaderMove): boolean  {
        return  move.variationLevel === 0 && (typeof move.prev !== "number")
    }
    startVariation (move: PgnReaderMove): boolean {
        return  move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (this.getMoves()[move.prev].next !== move.index))
    }
    endVariation (move: PgnReaderMove):boolean {
        return move.variationLevel > 0 && ! move.next
    }
    afterMoveWithVariation (move: PgnReaderMove): boolean {
        return this.getMoves()[move.prev] && (this.getMoves()[move.prev].variations.length > 0)
    }
    writePgn (): string {

        // Prepend a space if necessary
        function prepend_space(sb) {
            if ( (!sb.isEmpty()) && (sb.lastChar() !== " ")) {
                sb.append(" ")
            }
        }

        function write_comment (comment, sb) {
            if (comment === undefined || comment === null) {
                return
            }
            prepend_space(sb)
            sb.append("{").append(comment).append("}")
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
                sb.append("" + move.moveNumber).append(".")
            } else if (this.startVariation(move)) {
                sb.append("" + move.moveNumber).append("...")
            }
        }

        let write_notation = (move, sb) => {
            prepend_space(sb)
            sb.append(this.san(move))
        }

        function write_NAGs (move, sb) {
            if (move.nag) {
                move.nag.forEach(function(ele) {
                    sb.append(ele)
                })
            }
        }

        function write_variation (move, sb) {
            prepend_space(sb)
            sb.append("(")
            write_move(move, sb)
            prepend_space(sb)
            sb.append(")")
        }

        function write_variations (move, sb) {
            for (let i = 0; i < move.variations.length; i++) {
                write_variation(move.variations[i], sb);
            }
        }

        let get_next_move = (move) => {
            return move.next ? this.getMove(move.next) : null
        }

        /**
         * Write the normalised notation: comment move, move number (if necessary),
         * comment before, move, NAGs, comment after, variations.
         * Then go into recursion for the next move.
         * @param move the move in the exploded format
         * @param sb the string builder to use
         */
        function write_move (move, sb) {
            if (move === null || move === undefined) {
                return
            }
            write_comment_move(move, sb)
            write_move_number(move, sb)
            write_notation(move, sb)
            //write_check_or_mate(move, sb);    // not necessary if san from chess.src is used
            write_NAGs(move, sb)
            write_comment_after(move, sb)
            write_comment_diag(move, sb)
            write_variations(move, sb)
            const next = get_next_move(move)
            write_move(next, sb)
        }

        let write_end_game = (_sb) => {
            if (this.endGame) {
                _sb.append(" ").append(this.endGame)
            }
        }

        function write_pgn2 (move, _sb): string {
            write_game_comment(sb)
            write_move(move, _sb)
            write_end_game(_sb)
            return _sb.toString()
        }
        const sb: StringBuilder = new StringBuilder("")
        let indexFirstMove = 0
        while (this.getMove(indexFirstMove) === null) { indexFirstMove += 1; }
        return write_pgn2(this.getMove(indexFirstMove), sb)
    }

    /**
     * Sets the position to the start position, depending on the configuration. Returns the resulting position as FEN string.
     * @return string The position as FEN string
     */
    setToStart (): string {
        if (this.configuration.position === 'start') {
            this.chess.reset()
        } else {
            this.chess.load(this.configuration.position)
        }
        return this.chess.fen()
    }
    eachMove (movesMainLine: PgnMove[]) {
        this.moves = []
        let current = -1
        let findPrevMove = (level: number, index: number): PgnReaderMove => {
            while (index >= 0) {
                if (this.moves[index].variationLevel === level) {
                    return this.moves[index]
                }
                index--
            }
            return null
        }
        let eachMoveVariation = (moveArray: PgnMove[], level, prev): void => {
            function wireMoves(current, prev, currentMove, prevMove) {
                if (prevMove != null) {
                    currentMove.prev = prev
                    if (! prevMove.next) { // only set, if not set already
                        prevMove.next = current
                    }
                }
                currentMove.index = current
            }
            function getMoveNumberFromPosition (fen: string) {
                const tokens = fen.split(/\s+/)
                const move_number = parseInt(tokens[5], 10)
                return (tokens[1] === 'b') ? move_number : move_number - 1
            }
            let prevMove = (prev != null ? this.moves[prev] : null)
            moveArray.forEach( (move, i) => {
                current++
                // PgnMove and PgnReaderMove are similar, but different. The following is a hack to convert one to the other.
                let _move: PgnReaderMove = move as unknown as PgnReaderMove
                _move.variationLevel = level
                this.moves.push(_move)
                if (i > 0) {
                    if (this.moves[current - 1].variationLevel > level) {
                        prevMove = findPrevMove(level, current -1)
                        prev = prevMove.index
                    } else {
                        prev = current - 1
                        prevMove = this.moves[prev]
                    }
                }
                wireMoves(current, prev, _move, prevMove);
                // Checks the move on a real board, and hold the fen
                // TODO: Use the position from the configuration, to ensure, this games
                // could be played not starting at the start position.
                if (typeof _move.prev == "number") {
                    this.chess.load(this.getMove(_move.prev).fen);
                } else {
                    this.setToStart();
                }
                // TODO: It is not possible to use here `san` instead of  the ugly `notation.notation`. In case of `Pe4`
                // chess.js spits an error. No solution for this yet.
                let pgn_move = this.chess.move(_move.notation.notation, {'sloppy' : true});
                if (pgn_move === null) {
                    throw new Error("No legal move: " + _move.notation.notation)
                }
                let fen = this.chess.fen();
                _move.fen = fen;
                _move.from = pgn_move.from;
                _move.to = pgn_move.to;
                _move.notation.notation = pgn_move.san;

                if (pgn_move.flags === 'c') {
                    _move.notation.strike = 'x';
                }
                if (this.chess.in_checkmate()) {
                    _move.notation.check = '#';
                } else if (this.chess.in_check()) {
                    _move.notation.check = '+';
                }
                _move.moveNumber = getMoveNumberFromPosition(fen);

                move.variations.forEach(function(variation) {
                    eachMoveVariation(variation, level + 1, prev);
                });
            });
        };
        eachMoveVariation(movesMainLine, 0, null)
    }
    addMove (move: PrimitiveMove, moveNumber: number): number {
        let getTurn = (moveNumber): Color => {
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
        let existingMove = (move, moveNumber): number|null => {
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
        let realMove: PgnReaderMove = {
            variations: [],
            nag: [],
            notation: { notation: null},
            from: 'a0', to: 'a0'
        }
        if (moveNumber == null) {
            this.setToStart();
            realMove.turn = this.chess.turn();
            realMove.moveNumber = 1;
        } else {
            this.chess.load(this.getMove(moveNumber).fen);
            realMove.turn = getTurn(moveNumber);
            if (realMove.turn === "w") {
                realMove.moveNumber = this.getMove(moveNumber).moveNumber + 1;
            } else {
                realMove.moveNumber = this.getMove(moveNumber).moveNumber;
            }
        }
        let pgn_move = this.chess.move(move as unknown as string);
        realMove.fen = this.chess.fen();
        realMove.from = pgn_move.from;
        realMove.to = pgn_move.to;
        // san is the real notation, in case of O-O is this O-O.
        // to is the to field, in case of (white) O-O is this g1.
        if (pgn_move.san.substring(0,1) !== "O") {
            realMove.notation.notation = pgn_move.san;
            realMove.notation.col = pgn_move.to.substring(0,1);
            realMove.notation.row = pgn_move.to.substring(1,2);
            if (pgn_move.piece !== "p") {
                realMove.notation.fig = pgn_move.piece.charAt(0).toUpperCase();
            }
            if (pgn_move.promotion) {
                realMove.notation.promotion = '=' + pgn_move.promotion.toUpperCase();
            }
            if (pgn_move.flags.includes(this.chess.FLAGS.CAPTURE) || (pgn_move.flags.includes(this.chess.FLAGS.EP_CAPTURE))) {
                realMove.notation.strike = 'x';
            }
            // real_move.notation.ep = pgn_move.flags.includes(this.chess.FLAGS.EP_CAPTURE)
            if (this.chess.in_check()) {
                if (this.chess.in_checkmate()) {
                    realMove.notation.check = '#';
                } else {
                    realMove.notation.check = '+';
                }
            }
        } else {
            realMove.notation.notation = pgn_move.san;
        }
        this.getMoves().push(realMove);
        realMove.prev = moveNumber;
        let next = this.getMoves().length - 1;
        realMove.index = next;
        handleVariation(realMove, moveNumber, next);
        return next;
    };
    changeNag (_nag: string, moveNumber: number, added: boolean) {
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
    clearNags (moveNumber: number) {
        let move = this.getMove(moveNumber)
        move.nag = []
    }
    // TODO This function is only used once in the whole system, can we get rid of it.
    // And it is only used in the viewer, perhaps it should go to there ...
    getOrderedMoves (current: PgnReaderMove, returnedMoves: PgnReaderMove[]): PgnReaderMove[] {
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
    getMoves(): PgnReaderMove[] {
        return this.moves ? this.moves : []
    }
    getFirstMove(): PgnReaderMove|null {
        let _moves = this.getMoves()
        for (const _move of _moves) {
            if (_move.variationLevel == null || _move.variationLevel == 0 && _move.prev == null) {
                return _move
            }
        }
        return null
    }
    getTags(): Map<string, string | Message[] | PgnDate | PgnTime | TimeControl> {
        if (! this.games) { return new Map() }
        let _tags = this.games[this.currentGameIndex].tags
        return new Map(Object.entries(_tags))
    }
    getGameComment(): GameComment {
        if (! this.games) { return undefined }
        return this.games[this.currentGameIndex].gameComment ? this.games[this.currentGameIndex].gameComment : undefined
    }
    getGames(): ParseTree[] {
        return this.games
    }
    getEndGame(): string {
        return this.endGame;
    }
    getPosition(index:number|null) {
        if (index === null) {
            this.chess.reset()
            return this.chess.fen()
        } else {
            return this.getMove(index).fen
        }
        return null
    }
    setShapes(move:PgnReaderMove, shapes: Shape[]) {
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
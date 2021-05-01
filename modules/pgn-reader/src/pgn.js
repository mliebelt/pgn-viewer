import parser from '@mliebelt/pgn-parser';
import Chess from 'chess.js';

// Initializes a new instance of the StringBuilder class
// and appends the given value if supplied
function StringBuilder(value) {
    let that = {};
    that.strings = new Array("");
    // Appends the given value to the end of this instance.
    let append = function (value) {
        if (value) {
            that.strings.push(value);
        }
    };

    // Return true if the receiver is empty. Don't compute length!!
    let isEmpty = function () {
        for (let i = 0; i < that.strings.length; i++) {
            if (that.strings[i].length > 0) {
                return false;
            }
        }
        return true;
    };

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    let lastChar = function () {
        if (that.strings.length === 0) {
            return null;
        }
        return that.strings[that.strings.length - 1].slice(-1);
    };

    // Converts this instance to a String.
    let toString = function () {
        return that.strings.join("");
    };

    append(value);

    return {
        append: append,
        toString: toString,
        isEmpty: isEmpty,
        lastChar: lastChar
    };
}

/**
 * Defines the base functionality for reading and working with PGN.
 * The configuration is the part of the configuration given to the PgnViewer that is relevant
 * for the reader.
 * @param {*} configuration Given values that are relevant for reading and working with PGN
 */
const pgnReader = function (configuration) {
    const that = {};
    function initializeConfiguration (configuration) {
        function readPgnFromFile (url) {
            const request = new XMLHttpRequest()
            request.open('GET', url, false)
            request.send()
            if (request.status === 200) {
                return request.responseText
            }
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
    that.configuration = initializeConfiguration(configuration)
    // that.startMove = 0;
    const chess = new Chess()
    const PGN_TAGS = {
        event: "the name of the tournament or match event",
        site: "the location of the event",
        date: "the starting date of the game (format: YYYY.MM.TT)",
        round: "the playing round ordinal of the game",
        white: "the player of the white pieces (last name, pre name)",
        black: "the player of the black pieces (last name, pre name)",
        result: "the result of the game (1 - 0, 1/2 - 1/2, 0 - 1)",
        // from here, the keys are optional, order may be different
        board: "the board number in a team event",
        eco: "ECO-Opening-Key (ECO = 'Encyclopaedia of Chess Openings')",
        whitemyelo: "myELO-score white (at the beginning of the game)",
        blackmyelo: "myELO-score black (at the beginning of the game)",
        whitedays: "rate in days for white",
        blackdays: "rate in days for black",
        mychessno: "identification-no. of the game on the myChess.de - server",
        // From here it was from Wikipedia
        annotator: "The person providing notes to the game.",
        plycount: "String value denoting total number of half-moves played.",
        timecontrol: "40/7200:3600 (moves per seconds: sudden death seconds)",
        time: 'Time the game started, in "HH:MM:SS" format, in local clock time.',
        termination: 'Gives more details about the termination of the game. It may be "abandoned", "adjudication" (result determined by third-party adjudication), "death", "emergency", "normal", "rules infraction", "time forfeit", or "unterminated".',
        mode: '"OTB" (over-the-board) "ICS" (Internet Chess Server)',
        setup: '"0": position is start position, "1": tag FEN defines the position',
        fen: 'Alternative start position, tag SetUp has to be set to "1"'
    }
    const PROMOTIONS = {
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight'
    }
    /**
     * Returns the NAGs as defined in http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c10
     * The index is the index number after the '$' sign like in $3 == 'very good move'.
     * For a complete index, see https://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs
     * @type {Array} the array with the (english) explanations.
     */
    const NAGs = new Array(220);
    NAGs[1]=    "!";    // 1
    NAGs[2]=    "?";    // 2
    NAGs[3]=    "‼";   // 3
    NAGs[4]=    "⁇";   // 4
    NAGs[5]=    "⁉";   // 5
    NAGs[6]=    "⁈";   // 6
    NAGs[7]=    "□";    // 7
    NAGs[10]=    "=";    // 10
    NAGs[13]=    "∞";    // 13
    NAGs[14]=    "⩲";    // 14➢0x2a72
    NAGs[15]=    "⩱";    // 15 0x2a71
    NAGs[16]=    "±";    // 16
    NAGs[17]=    "∓";    // 17
    NAGs[18]=    "+−";   // 18
    NAGs[19]=    "-+";    // 19
    NAGs[22]=    "⨀";
    NAGs[23]=    "⨀";
    NAGs[32]=    "⟳";
    NAGs[33]=    "⟳";
    NAGs[36]=    "→";
    NAGs[37]=    "→";
    NAGs[40]=    "↑";
    NAGs[41]=    "↑";
    NAGs[44]=    "=∞";
    NAGs[132]=   "⇆";
    NAGs[133]=   "⇆";
    NAGs[136]=   "⊕";
    NAGs[140]=   "∆";
    NAGs[146]=   "N";
    NAGs[220]=   "D";
    NAGs[221]=   "D";

    const PGN_NAGS = {};

    // build the reverse index
    for (let i = 0; i < NAGs.length; i++) {
        PGN_NAGS[NAGs[i]] = i;
    }
    // Special case for duplicate NAGs
    PGN_NAGS['!!'] = 3;
    PGN_NAGS['??'] = 4;
    PGN_NAGS['!?'] = 5;
    PGN_NAGS['?!'] = 6;

    /**
     * Returns the NAG notation from the array of symbols
     * @param array the NAG symbols like $1, $3, ...
     * @returns {string} the result string like !, !!
     */
    function nagToSymbol (array) {
        let ret_string = "";
        if (array === null || array === undefined) {
            return ret_string;
        }
        for (let i = 0; i < array.length; i++) {
            const number = parseInt(array[i].substring(1));
            if (number !== 220) { // Don't add diagrams to notation
                const ret = NAGs[number];
                ret_string += (typeof ret != 'undefined') ? ret : "$"+number;
            }
        }
        return ret_string;
    }

    /**
     * Returns the internationalized variation of the figure, or the original itself.
     * Optional pawn symbols are ignored (SAN is used for output, not reading).
     */
    function getFig (fig) {
        if (fig === 'P') {
            return '';
        }
        return fig;
    }

    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param move given move in JSON notation
     * @return {*} the SAN string created from the move
     */
    function san (move) {
        let notation = move.notation;
        if (typeof notation.row === 'undefined') {
            return notation.notation; // move like O-O and O-O-O
        }
        const fig = notation.fig ? getFig(notation.fig) : '';
        const disc = notation.disc ? notation.disc : '';
        const strike = notation.strike ? notation.strike : '';
        // Pawn moves with capture need the col as "discriminator"
        const check = notation.check ? notation.check : '';
        const mate = notation.mate ? notation.mate : '';
        const prom = notation.promotion ? '=' + getFig(notation.promotion.substring(1,2)) : '';
        if (that.configuration.notation === 'short') {
            if (notation.notation) {
                return notation.notation + prom + check + mate;
            } else {
                return fig + disc + strike + notation.col + notation.row + prom + check + mate;
            }
        } else if (that.configuration.notation === 'long') {
            return fig + move.from + (notation.strike ? strike : '-') + move.to + prom + check + mate;
        }
    }

    function sanWithNags (move) {
        let _san = san(move);
        if (move.nag) {
            _san += nagToSymbol(move.nag);
        }
        return _san;
    }

    /**
     * Returns the SYM notation for a single NAG (like !!, ?!, ...)
     * @param string the NAG in the chess notation
     * @returns {*} the symbold like $0, $3, ...
     */
    function symbolToNag (string) {
        const nag = PGN_NAGS[string];
        if (nag === "undefined") {
            return null;
        } else {
            return "$" + nag;
        }
    };

    /**
     * Main function, automatically called when calling pgn function.
     * Special handling here, when startPlay and hideMovesBefore are set,
     * the moves from the beginning to the startPlay are cut. Ugly, but working.
     */
    let loadPgn = function () {
        function hasManyGames() {
            return that.configuration.manyGames
        }

        if (hasManyGames()) {
            loadMany()
            loadOne(that.games[0])
            return that
        }
        let _mgame = parser.parse(that.configuration.pgn, {startRule: 'game'})
        that.games = [_mgame]
        loadOne(_mgame)
        return that
    }

    function loadMany () {
        that.games = parser.parse(that.configuration.pgn, {startRule: 'games'});
    }
    function loadOne (game) {
        function interpretHeaders (_game) {
            if (_game.tags.SetUp) {
                const setup = _game.tags.SetUp
                if (setup === '0') {
                    that.configuration.position = 'start'
                } else {
                    that.configuration.position = _game.tags.FEN
                }
            }
            if (_game.tags.Result) {
                that.endGame = _game.tags.Result
            }
        }

        that.currentGameIndex = typeof game === 'number' ? game : 0
        let _game = typeof game === 'number' ? that.games[game] : game
        interpretHeaders(_game);
        readMoves(_game.moves);
        if (that.configuration.startPlay && that.configuration.hideMovesBefore) {
            let new_fen = deleteMovesBefore(that.configuration.startPlay);
            let new_pgn = writePgn();
            that.configuration.startPlay = null;
            that.configuration.hideMovesBefore = false;
            that.configuration.pgn = new_pgn;
            that.configuration.position = new_fen;
            loadPgn();
        }
    }

    function wireMoves(current, prev, currentMove, prevMove) {
        if (prevMove != null) {
            currentMove.prev = prev;
            if (! prevMove.next) { // only set, if not set already
                prevMove.next = current;
            }
        }
        currentMove.index = current;
    };

    /**
     * Read moves read the moves that are not part of the headers.
     */
    function readMoves(moves) {

        /**
         * Originally variations are kept as array of moves. But after having linked prev and next,
         * it is much easier to keep only the first move of the variation.
         */
        function correctVariations () {
            getMoves().forEach(function(move) {
                for (let i = 0; i < move.variations.length; i++) {
                    move.variations[i] = move.variations[i][0]
                }
            })
        };
        function remindEndGame (movesMainLine) {
            if (typeof movesMainLine[movesMainLine.length - 1] === "string") {
                that.endGame = movesMainLine.pop();
            }
        };
        /**
         * If black started with a move, FEN must be set to a black start position.
         * Then turn should be switched for all moves, if first moves is falsly white.
         */
        function correctTurn () {
            function getTurn (fen) {
                const tokens = fen.split(/\s+/)
                return tokens[1]
            }

            if ((getTurn(that.configuration.position) === 'b') &&
                    (isMove(0)) &&
                    (that.moves[0].turn === 'w')) {
                getMoves().forEach(function(move) {
                    move.turn = (move.turn === 'w') ? 'b' : 'w'
                })
            }
        };

        let movesMainLine = moves;
        remindEndGame(movesMainLine);
        eachMove(movesMainLine);
        correctTurn();
        correctVariations();
    };

    /**
     * Checks if the move with index id is a valid move
     * @param id the index of the moves in the moves array
     * @returns {boolean} true, if there exists a move with that index, false else
     */
    function isMove(id) {
        return getMoves().length > id;
    };

    /**
     * Returns true, if the move with ID id is deleted.
     * @param id the numerical index
     * @returns {boolean} true, if deleted
     */
    function isDeleted (id) {
        if (! isMove(id))
            return true; // Every non-existing moves is "deleted"
        const current = getMoves()[id];
        if (current === null) {
            return true;
        }
        if (id === 0 && (current)) // The first move is not deleted
            return false;
//        return (current.prev === null); // All moves without a previous move are deleted
    };


    /**
     * Returns the move that matches the id. Take into consideration:
     * <ul><li>if the move has no pre, and it is not the first one, the move should be considered deleted</li>
     * <li>if the move has no pre, but it is the first one, it is the first move</li>
     * </ul>
     * So only remove a move, if the move is not deleted
     * @param id the ID of the move
     */
    function getMove (id) {
        return getMoves() ? getMoves()[id] : undefined
    };


    /**
     * Updates the variation level for all moves. If no arguments are given,
     * update the variation level for all moves.
     */
    function updateVariationLevel (move, varLevel) {
        if (arguments.length === 0) {
            // Workaround: we don't know which is the first move, so that that with index 0
            const my_move = getMove(0);
            updateVariationLevel(my_move, 0);
        } else {
            move.variationLevel = varLevel;
            if (move.next !== undefined) {
                updateVariationLevel(getMove(move.next), varLevel);
            }
            if (move.variations) {
                for (let i = 0; i < move.variations.length; i++) {
                    updateVariationLevel(move.variations[i], varLevel + 1);
                }
            }
        }
    };

    /**
     * Deletes the move that matches the id (including the move itself).
     * There are some cases to expect:
     * <ul><li>the first move of the main line: delete everything</li>
     * <li>some move in between of the main line: make the first variation the main line, and the rest variations the
     * variations of the now main line</li>
     * <li>the first move of some variation: delete the whole variation</li>
     * <li>some move in the variation (not the first): delete the rest moves of that variation</li>
     * </ul>
     */
    function deleteMove (id) {
        /**
         * Removes the object at index from the array, returns the object.
         */
        function removeFromArray (array, index) {
            const ret = array[index];
            array.splice(index, 1);
            return ret;
        };

        if (isDeleted(id)) {
            return;
        }
        // 1. Main line first move
        if (id === 0) {
            // Delete all moves
            that.moves = [];
            return;
        }
        let current = getMove(id);
        // 2. First move of variation
        if (startVariation(current)) {
            const vars = getMove(getMove(current.prev).next).variations;
            for (let i = 0; vars.length; i++) {
                if (vars[i] === current) {
                    removeFromArray(vars, i);
                    if (current.next !== undefined) {
                       deleteMove(current.next);
                    }
                    getMoves()[current.index] = null;
                    return;
                }
            }
        }
        // 3. Some line some other move, no variation
        if (current.variations.length === 0) {
            if (current.next !== undefined && (current.next !== null)) {
                deleteMove(current.next);
            }
            that.moves[current.prev].next = null;
            that.moves[id] = null;
            return;
        }
        // 4. Some line some other move, with variation
        if (current.variations.length > 0) {
            if (current.next !== undefined) {
                deleteMove(current.next);
            }
            let variationMove = removeFromArray(current.variations, 0);
            let varLevel = variationMove.variationLevel;
            that.moves[current.prev].next = variationMove.index;
            that.moves[id] = null;
            updateVariationLevel(variationMove, varLevel - 1);
        }
    };

    /**
     * Find a move from a given representation. This may be an index, or a FEN string, or a notation.
     */
    function findMove(moveRep) {
        if (!isNaN(moveRep)) {   // the following goes only over the main line, move number cannot denote a variation
            moveRep = moveRep - 1;
            let move = getMove(0);
            while (moveRep > 0) {
                moveRep = moveRep - 1;
                move = getMove(move.next);
            }
            return move;
        }
        let moves = getMoves();
        for (let move of moves) {
            if (move.fen.startsWith(moveRep)) {
                return move;
            } else if (move.notation.notation === moveRep) {
                return move;
            }
        }
        return undefined;
    }

    /**
     * Delete the moves before the current move, but without deleting the rest.
     * TODO: This should be written in such a way, that this is only used when the game
     * has not already started, so when loading the moves and interpreting them
     * 3 cases:
     * 1. Nothing special, just skip that.
     * 2. startPlay is set, nothing to do here as well.
     * 3. hideMovesBefore == true: Ensure that everything is done again after having called this function.
     * 
     * So no, this should not be called from the UI, but when reading the moves.
     * @param id
     */
    function deleteMovesBefore (id) {
        // Inner function, that really deletes
        let deleteMovesBeforeIncluding = function (id) {
            let my_fen = that.moves[id].fen
            that.moves[id] = null;
            if (id <= 0) return my_fen;
            deleteMovesBeforeIncluding(id - 1);
            return my_fen;
        };
        if (id === undefined) return;
        if (id === null) return;
        if (id <= 0) return;
        let my_fen = deleteMovesBeforeIncluding(id - 1);
        getMove(id).prev = null;
        return my_fen // Need position to start game here
    };

    /**
     * Promotes the variation that is denoted by the move ID.
     * These are the relevant cases:
     * <ul>
     * <li>Move is part of the main line: no promotion</li>
     * <li>Move is part of the first variation: move the variation to the next level (or main line), make the previous promoted line the first variation.</li>
     * <li>Move is part of second or higher variation: just switch index of variation arrays</li>
     * </ul>
     */
    function promoteMove (id) {
        /**
         * Returns the first move of a variation.
         */
        function firstMoveOfVariation (move) {
            if (startVariation(move)) {
                return move;
            }
            return firstMoveOfVariation(getMove(move.prev));
        };
        const move = getMove(id);
        // 1. Check that is variation
        if ((typeof move.variationLevel == "undefined") || (move.variationLevel === 0)) {
            return;
        }

        // 2. Get the first move of the variation
        const myFirst = firstMoveOfVariation(move);

        // 3. Get the index of that moves variation array
        const higherVariationMove = getMove(getMove(myFirst.prev).next);
        let indexVariation;
        for (let i = 0; i < higherVariationMove.variations.length; i++) {
            if (higherVariationMove.variations[i] === myFirst) {
                indexVariation = i;
            }
        }

        // 4. If variation index is > 0 (not the first variation)
        if (indexVariation > 0) {
            // Just switch with the previous index
            let tmpMove = higherVariationMove.variations[indexVariation-1];
            higherVariationMove.variations[indexVariation-1] = higherVariationMove.variations[indexVariation];
            higherVariationMove.variations[indexVariation] = tmpMove;
        } else {
            // 5. Now the most difficult case: create new array from line above, switch that with
            // the variation
            let tmpMove = higherVariationMove;
            const tmpVariations = higherVariationMove.variations;
            const prevMove = getMove(higherVariationMove.prev);
            prevMove.next = myFirst.index;
            tmpMove.variations = myFirst.variations;
            myFirst.variations = tmpVariations;
            myFirst.variations[0] = tmpMove;
        }
        // Update the variation level because there will be changes
        updateVariationLevel();
    };


    // Returns true, if the move is the start of teh main line
    function startMainLine (move) {
        return  move.variationLevel === 0 && (typeof move.prev !== "number") ;
    };

    // Returns true, if the move is the start of a (new) variation
    function startVariation (move) {
        return  move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (getMoves()[move.prev].next !== move.index));
    };
    // Returns true, if the move is the end of a variation
    function endVariation (move) {
        return move.variationLevel > 0 && ! move.next;
    };

    // Returns true, if the move is after a move with at least one variation
    function afterMoveWithVariation (move) {
        return getMoves()[move.prev] && (getMoves()[move.prev].variations.length > 0);
    };

    /**
     * Writes the pgn (fully) of the current game. The algorithm goes like that:
     * * Start with the first move (there has to be only one in the main line)
     * * For each move (call that recursively)
     * * print-out the move itself
     * * then the variations (one by one)
     * * then the next move of the main line
     * @return the string of all moves
     */
    function writePgn () {

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

        function write_game_comment (sb) {
            write_comment(getGameComment(), sb)
        }

        function write_comment_move (move, sb) {
            write_comment(move.commentMove, sb);
        };

        function write_comment_after (move, sb) {
            write_comment(move.commentAfter, sb);
        };

        function write_comment_diag (move, sb) {
            let has_diags = (move) => {
                return move.commentDiag &&
                    ( ( move.commentDiag.colorArrows && move.commentDiag.colorArrows.length > 0 ) ||
                      ( move.commentDiag.colorFields && move.commentDiag.colorFields.length > 0 )
                );
            }
            let arrows = (move) => { return move.commentDiag.colorArrows || []; }
            let fields = (move) => { return move.commentDiag.colorFields || []; }

            if (has_diags(move)) {
                let sbdiags = StringBuilder("");
                let first = true
                sbdiags.append("[%csl ")
                fields(move).forEach( (field) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("");
                    first = false;
                    sbdiags.append(field);
                });
                sbdiags.append("]");
                first = true
                sbdiags.append("[%cal ")
                arrows(move).forEach( (arrow) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("")
                    first = false;
                    sbdiags.append(arrow);
                });
                sbdiags.append("]");
                write_comment(sbdiags.toString(), sb);
            }
        }

        function write_move_number (move, sb) {
            prepend_space(sb);
            if (move.turn === "w") {
                sb.append("" + move.moveNumber);
                sb.append(".");
            } else if (startVariation(move)) {
                sb.append("" + move.moveNumber);
                sb.append("...");
            }
        };

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

        function get_next_move (move) {
            return move.next ? getMove(move.next) : null;
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

        function write_end_game (_sb) {
            if (that.endGame) {
                _sb.append(" ");
                _sb.append(that.endGame);
            }
        };

        function write_pgn2 (move, _sb) {
            write_game_comment(sb)
            write_move(move, _sb)
            write_end_game(_sb)
            return _sb.toString()
        };
        const sb = StringBuilder("");
        let indexFirstMove = 0;
        while (getMove(indexFirstMove) === null) { indexFirstMove += 1; }
        return write_pgn2(getMove(indexFirstMove), sb);
    };

    /**
     * Return true if the diagram NAG (== $220) is found.
     * @param move
     */
    function hasDiagramNag (move) {
        if (typeof move.nag == "undefined") return false;
        if (move.nag == null) return false;
        return move.nag.indexOf('$220') > -1;
    };

    function setToStart () {
        if (that.configuration.position === 'start') {
            chess.reset()
        } else {
            chess.load(that.configuration.position)
        }
    }

    /**
     * Final algorithm to read and map the moves. Seems to be tricky ...
     * @param movesMainLine all the moves of the game
     */
    function eachMove (movesMainLine) {
        that.moves = [];
        let current = -1;
        /**
         * Search for the right previous move. Go back until you find a move on the same
         * level. Only used inside the eachMode algorithm
         * @param level the current level to the move
         * @param index the current index where the search (backwards) should start
         * @returns {*} the resulting move or null, if none was found (should not happen)
         */
        function findPrevMove (level, index) {
            while (index >= 0) {
                if (that.moves[index].variationLevel === level) {
                    return that.moves[index];
                }
                index--;
            }
            return null;
        };
        /**
         * Recursive call that does the whole work
         * @param moveArray move array, first call with the main line
         * @param level the level of variation, 0 for the main line
         * @param prev the index of the previous move
         *          * null when main line and the first move
         *          * the correct one if the index is 0
         *          * overwritten by current - 1 if iterating and not the first move
         */
        function eachMoveVariation (moveArray, level, prev) {
            // Computes the correct move numer from the position
            function getMoveNumberFromPosition (fen) {
                const tokens = fen.split(/\s+/);
                const move_number = parseInt(tokens[5], 10);
                return (tokens[1] === 'b') ? move_number : move_number - 1;
            };
            let prevMove = (prev != null ? that.moves[prev] : null);
            moveArray.forEach(function(move, i) {
                current++;
                move.variationLevel = level;
                that.moves.push(move);
                if (i > 0) {
                    if (that.moves[current - 1].variationLevel > level) {
                        prevMove = findPrevMove(level, current -1);
                        prev = prevMove.index;
                    } else {
                        prev = current - 1;
                        prevMove = that.moves[prev];
                    }
                }
                wireMoves(current, prev, move, prevMove);
                // Checks the move on a real board, and hold the fen
                // TODO: Use the position from the configuration, to ensure, that games
                // could be played not starting at the start position.
                if (typeof move.prev == "number") {
                    chess.load(getMove(move.prev).fen);
                } else {
                    setToStart();
                }
                let pgn_move = chess.move(move.notation.notation, {'sloppy' : true});
                if (pgn_move === null) {
                    throw new Error("No legal move: " + move.notation.notation)
                }
                let fen = chess.fen();
                move.fen = fen;
                move.from = pgn_move.from;
                move.to = pgn_move.to;
                move.notation.notation = pgn_move.san;

                if (pgn_move.flags === 'c') {
                    move.notation.strike = 'x';
                }
                if (chess.in_checkmate()) {
                    move.notation.check = '#';
                } else if (chess.in_check()) {
                    move.notation.check = '+';
                }
                move.moveNumber = getMoveNumberFromPosition(fen);

                move.variations.forEach(function(variation) {
                    eachMoveVariation(variation, level + 1, prev);
                });
            });
        };
        eachMoveVariation(movesMainLine, 0, null);
    };

    /**
     * Returns a map of possible moves.
     * @param {*} game the chess to use
     */
    let possibleMoves = function(game) {
        const dests = new Map();
        game.SQUARES.forEach(s => {
          const ms = game.moves({square: s, verbose: true});
          if (ms.length) dests[s] = ms.map(m => m.to);
        });
        return dests;
    };

    /**
     * Adds the move to the current state after moveNumber.
     * In all cases the following has to be done:
     * * compute a complete move object
     * * Add that to the end of moves (returning the index)
     * * Wire the previous move to that new one
     *
     * Depending on the current situation, the following will be necessary:
     * * add to the end of the main line
     * * add to the end of a variation
     * * add as a new variation to the current one
     * * completely ignore it, because the move is already there
     * @param move the move notation (simplest form)
     * @param moveNumber the number of the previous made move, null if it is the first one
     */
    function addMove (move, moveNumber) {
        function getTurn (moveNumber) {
              return getMove(moveNumber).turn === "w" ? 'b' : "w";
        };

        // Special case: first move, so there is no previous move
        function existingFirstMove(move) {
            function first_move_notation() {
                if (typeof getMove(0) == 'undefined') return null;
                return getMove(0).notation.notation;
            }
            setToStart();
            let pgn_move = chess.move(move);
            if (! pgn_move) {
                return null;
             } else if (first_move_notation() === pgn_move.san) {
                return 0;
             } else {   // TODO: Could be a variation of the first move ...
                return existingVariationFirstMove(pgn_move);
             }
        }

        // Handles the first move that may be a variation of the first move, returns that.
        // If not, returns null
        function existingVariationFirstMove(pgn_move) {
            if (typeof getMove(0) == 'undefined') return null;
            let variations = getMove(0).variations;
            let vari;
            for (vari in variations) {
                if (variations[vari].notation.notation === pgn_move.san) return variations[vari].moveNumber;
            }
            return null; // no variation found
        }

        // Returns the existing move number or null
        // Should include all variations as well
        function existingMove(move, moveNumber) {
            if (moveNumber == null) return existingFirstMove(move);
            let prevMove = getMove(moveNumber);
            if (typeof prevMove == "undefined") return null;
            chess.load(prevMove.fen);
            let pgn_move = chess.move(move);
            let nextMove = getMove(prevMove.next);
            if (typeof nextMove == "undefined") return null;
            if (nextMove.notation.notation === pgn_move.san) {
                return prevMove.next;
            } else { // check if there exists variations
                let mainMove = getMove(prevMove.next);
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
        function handleVariation(move, prev, next) {
            //console.log("handle variation: prev == " + prev + " next == " + next);
            let prevMove = getMove(prev);
            if (prevMove === undefined) { // special case: variation on first move
                if (next <= 0) return; // First move
                getMove(0).variations.push(move);
                move.variationLevel = 1;
                return;
            }
            if (prevMove.next) {    // has a next move set, so should be a variation
                getMove(prevMove.next).variations.push(move);
                move.variationLevel = (prevMove.variationLevel ? prevMove.variationLevel : 0) + 1;
                if (move.turn === 'b') {
                    move.moveNumber = prevMove.moveNumber;
                }
            } else {    // main variation
                prevMove.next = next;
                move.variationLevel = prevMove.variationLevel;
            }
        }

        let curr = existingMove(move, moveNumber);
        if (typeof curr == 'number') return curr;
        let real_move = {};
        real_move.from = move.from;
        real_move.to = move.to;
        real_move.notation = {};
        real_move.variations = [];
        if (moveNumber == null) {
            setToStart();
            real_move.turn = chess.turn();
            real_move.moveNumber = 1;
        } else {
            chess.load(getMove(moveNumber).fen);
            real_move.turn = getTurn(moveNumber);
            if (real_move.turn === "w") {
                real_move.moveNumber = getMove(moveNumber).moveNumber + 1;
            } else {
                real_move.moveNumber = getMove(moveNumber).moveNumber;
            }
        }
        let pgn_move = chess.move(move);
        real_move.fen = chess.fen();
        // san is the real notation, in case of O-O is that O-O.
        // to is the to field, in case of (white) O-O is that g1.
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
            if (pgn_move.flags.includes(chess.FLAGS.CAPTURE) || (pgn_move.flags.includes(chess.FLAGS.EP_CAPTURE))) {
                real_move.notation.strike = 'x';
            }
            real_move.notation.ep = pgn_move.flags.includes(chess.FLAGS.EP_CAPTURE)
            if (chess.in_check()) {
                if (chess.in_checkmate()) {
                    real_move.notation.mate = '#';
                } else {
                    real_move.notation.check = '+';
                }
            }
        } else {
            real_move.notation.notation = pgn_move.san;
        }
        getMoves().push(real_move);
        real_move.prev = moveNumber;
        let next = getMoves().length - 1;
        real_move.index = next;
        handleVariation(real_move, moveNumber, next);
        return next;
    };

    /**
     * Adds the nag to the move with move number moveNumber
     * @param nag the nag in normal notation or as symbol
     * @param moveNumber the number of the move
     * @param added true, if the nag should be added
     */
    function changeNag (nag, moveNumber, added) {
        let move = getMove(moveNumber);
        if (move.nag == null) {
            move.nag = [];
        }
        let nagSym = (nag[0] === "$") ? nag : symbolToNag(nag);
        if (added) {
            if (move.nag.indexOf(nagSym) === -1) {
                move.nag.push(nagSym);
            }
        } else {
            let index = move.nag.indexOf(nagSym);
            if (index > -1) {
                move.nag.splice(index, 1);
            }
        }
    };

    function clearNags (moveNumber) {
        let move = getMove(moveNumber);
        move.nag = [];
    };

    /**
     * Return all moves in the order they are displayed: move, variations of that move,
     * next move, ...
     */
    function getOrderedMoves (current, returnedMoves) {
        returnedMoves.push(current);
        if (current.variations) {
            for (let i = 0; i < current.variations.length; i++) {
                getOrderedMoves(current.variations[i], returnedMoves);
            }
        }
        if (current.next) {
            return getOrderedMoves(getMove(current.next), returnedMoves);
        } else {
            return returnedMoves;
        }
    };

    function getMoves() {
        return that.moves ? that.moves : []
    }

    function getTags() {
        if (! that.games) { return new Map() }
        let _tags = that.games[that.currentGameIndex].tags
        return new Map(Object.entries(_tags))

    }

    /**
     * Return the game comment, if there.
     */
    function getGameComment() {
        if (! that.games) { return undefined }
        return that.games[that.currentGameIndex].gameComment ? that.games[that.currentGameIndex].gameComment.comment : undefined
    }

    function getGames() {
        return that.games
    }

    function getEndGame() {
        return that.endGame;
    }

    function setShapes(move, shapes) {
        if (! move.commentDiag) {
            move.commentDiag = {};
        }
        // Ensure everything is reset
        move.commentDiag.colorArrows = [];
        move.commentDiag.colorFields = [];

        shapes.forEach( (shape) => {
            if (shape.dest) { // arrow
                let colArrow = shape.brush.slice(0,1).toUpperCase()
                let arr = shape.orig + shape.dest;
                move.commentDiag.colorArrows.push(colArrow + arr);
            } else { // field
                let colField = shape.brush.slice(0,1).toUpperCase();
                let fie = shape.orig;
                move.commentDiag.colorFields.push(colField + fie);
            }
        })
    }

    // Ensure that at least one game (or the only game) is loaded
    if (! that.configuration.lazyLoad) {
        loadPgn()
    }

    // This defines the public API of the pgn function.
    return {
        configuration: that.configuration,
        deleteMove: deleteMove,
        deleteMovesBefore: deleteMovesBefore,
        isDeleted: isDeleted,
        promoteMove: promoteMove,
        readMoves: readMoves,
        findMove: findMove,
        getMoves: getMoves,
        getOrderedMoves: getOrderedMoves,
        getMove: getMove,
        getEndGame: getEndGame,
        getGameComment: getGameComment,
        getTags: getTags,
        getGames: getGames,
        loadOne: loadOne,
        getParser: () => parser,
        writePgn: writePgn,
        startVariation: startVariation,
        startMainLine: startMainLine,
        endVariation: endVariation,
        afterMoveWithVariation: afterMoveWithVariation,
        changeNag: changeNag,
        clearNags: clearNags,
        addMove: addMove,
        hasDiagramNag: hasDiagramNag,
        PGN_NAGS: PGN_NAGS,
        PROMOTIONS: PROMOTIONS,
        NAGS: NAGs,
        san: san,
        sanWithNags: sanWithNags,
        chess: chess,
        loadPgn: loadPgn,
        possibleMoves: possibleMoves,
        setShapes: setShapes
    };
};

export { StringBuilder, pgnReader };


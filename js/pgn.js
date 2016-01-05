'use strict';
/**
 * Defines the pgnReader function / object that is used for reading and writing
 * pgn. This should build then a structure that is easier to
 * use, but contains all the information necessary to do all
 * the things we want to do. So calling this function with no argument will
 * just give you a pgnReader that is able to record moves and write them out.
 * @param spec object with keys
 *  'pgn': the pgn string, if missing replaced with an empty string
 * @returns {{}}
 */

    // Initializes a new instance of the StringBuilder class
// and appends the given value if supplied
function StringBuilder(value) {
    var that = {};
    that.strings = new Array("");
    // Appends the given value to the end of this instance.
    var append = function (value) {
        if (value) {
            that.strings.push(value);
        }
    };

    // Clears the string buffer
    var clear = function () {
        that.strings.length = 1;
    };

    // Returns the length of the final string (without building it)
    var length = function () {
        return that.strings.reduce(function(previousValue, currentValue, index, array){
            return previousValue + currentValue.length;
        }, 0);
    };

    // Return true if the receiver is empty. Don't compute length!!
    var isEmpty = function () {
        for (var i = 0; i < that.strings.length; i++) {
            if (that.strings[i].length > 0) {
                return false;
            }
        }
        return true;
    }

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    var lastChar = function () {
        if (that.strings.length === 0) {
            return null;
        }
        return that.strings[that.strings.length - 1].slice(-1);
    }

    // Converts this instance to a String.
    var toString = function () {
        return that.strings.join("");
    };

    append(value);

    return {
        append: append,
        clear: clear,
        toString: toString,
        length: length,
        isEmpty: isEmpty,
        lastChar: lastChar
    }
}



var pgnReader = function (configuration) {
    var that = {};
    var initialize_configuration = function(configuration) {
        if (typeof configuration.position == 'undefined') {
            configuration.position = 'start';
        }
        if (typeof configuration.pgn == 'undefined') {
            configuration.pgn = '';
        }
        if (typeof configuration.locale == 'undefined') {
            configuration.locale = 'en';
        }
    }
    initialize_configuration(configuration);
    var parser = pgnParser;
    var game = new Chess();
    that.PGN_KEYS = {
        Event: "the name of the tournament or match event",
        Site: "the location of the event",
        Date: "the starting date of the game (format: YYYY.MM.TT)",
        Round: "the playing round ordinal of the game",
        White: "the player of the white pieces (last name, pre name)",
        Black: "the player of the black pieces (last name, pre name)",
        Result: "the result of the game (1 - 0, 1/2 - 1/2, 0 - 1)",
        // from here, the keys are optional, order may be different
        Board: "the board number in a team event",
        ECO: "ECO-Opening-Key (ECO = 'Encyclopaedia of Chess Openings')",
        WhitemyELO: "myELO-score white (at the beginning of the game)",
        BlackmyELO: "myELO-score black (at the beginning of the game)",
        WhiteDays: "rate in days for white",
        BlackDays: "rate in days for black",
        myChessNo: "identification-no. of the game on the myChess.de - server",
        // From here it was from Wikipedia
        Annotator: "The person providing notes to the game.",
        PlyCount: "String value denoting total number of half-moves played.",
        TimeControl: "40/7200:3600 (moves per seconds: sudden death seconds)",
        Time: 'Time the game started, in "HH:MM:SS" format, in local clock time.',
        Termination: 'Gives more details about the termination of the game. It may be "abandoned", "adjudication" (result determined by third-party adjudication), "death", "emergency", "normal", "rules infraction", "time forfeit", or "unterminated".',
        Mode: '"OTB" (over-the-board) "ICS" (Internet Chess Server)'
    };
    /**
     * Returns the NAGs as defined in http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c10
     * The index is the index number after the '$' sign like in $3 == 'very good move'.
     * @type {Array} the array with the (english) explanations.
     */
    that.NAGs = [
        null,   // Just to fill, index 0
        "!",    // 1
        "?",    // 2
        "!!",   // 3
        "??",   // 4
        "!?",   // 5
        "?!",   // 6
        "□",    // 7
        null,   // 8
        null,   // 9
        "=",    // 10
        null,   // 11
        null,   // 12
        "∞",    // 13
        "⩲",    // 14
        "⩱",    // 15
        "±",    // 16
        "∓",    // 17
        "+−",   // 18
        "-+"    // 19
    ];

    that.PGN_NAGS = {};

    // build the reverse index
    for (var i = 0; i < that.NAGs.length; i++) {
        that.PGN_NAGS[that.NAGs[i]] = i;
    }

    /**
     * Returns the NAG notation from the array of symbols
     * @param array the NAG symbols like $1, $3, ...
     * @returns {string} the result string like !, !!
     */
    var nag_to_symbol = function(array) {
        var ret_string = "";
        if (array === null || array === undefined) {
            return ret_string;
        }
        for (var i = 0; i < array.length; i++) {
            var number = parseInt(array[i].substring(1));
            var ret = that.NAGs[number];
            ret_string += (typeof ret != 'undefined') ? ret : "";
        }
        return ret_string;
    };

    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param notation
     * @return {*}
     */
    var san = function(notation) {
        if (typeof notation.row == 'undefined') {
            return notation.notation; // move like O-O and O-O-O
        }
        var fig = i18n.t(notation.fig);
        var disc = notation.disc ? notation.disc : '';
        var strike = notation.strike ? notation.strike : '';
        var check = notation.check ? notation.check : '';
        var prom = notation.promotion ? notation.promotion : '';
        return fig + disc + strike + notation.col + notation.row + prom + check;
    };

    var sanWithNags = function (move) {
        var _san = san(move.notation);
        if (move.nag) {
            _san += nag_to_symbol(move.nag);
        }
        return _san;
    };

    /**
     * Returns the SYM notation for a single NAG (like !!, ?!, ...)
     * @param string the NAG in the chess notation
     * @returns {*} the symbold like $0, $3, ...
     */
    var symbol_to_nag = function(string) {
        var nag = that.PGN_NAGS[string];
        if (nag === "undefined") {
            return null;
        } else {
            return "$" + nag;
        }
    };

    /**
     * Main function, automatically called when calling pgn function.
     */
    var load_pgn = function () {
        var restString = readHeaders();
        readMoves(restString);
        return that;
    };

    /**
     * Reads the headers from the pgn string given, returns what is not consumed
     * by the headers.
     * @returns {string} the remaining moves
     */
    var readHeaders = function () {
        /**
         * Split the headers (marked by []), and collect them in the return value.
         * @param string the pgn string that contains (at the beginning) the headers of the game
         * @returns the headers read
         */
        var splitHeaders = function (string) {
            var headers = {};
            var list = string.match(/\[([^\]]+)]/g);
            if (list === null) { return headers; }
            for (var i=0; i < list.length; i++) {
                var ret = list[i].match(/\[(\w+)\s+\"([^\"]+)\"/);
                if (ret) {
                    var key = ret[1];
                    if (that.PGN_KEYS[key]) {
                        headers[key] = ret[2];
                    }
                }
            }
            return headers;
        };
        that.headers = splitHeaders(configuration.pgn);
        var index = configuration.pgn.lastIndexOf("]");
        return configuration.pgn.substring(index + 1);
    };

    /**
     * Read moves read the moves that are not part of the headers.
     */
    var readMoves = function(movesString) {
        var wireMoves = function(current, prev, currentMove, prevMove) {
            if (prevMove != null) {
                currentMove.prev = prev;
                if (! prevMove.next) { // only set, if not set already
                    prevMove.next = current;
                }
            }
            currentMove.index = current;
        };
        var remindEndGame = function() {
            if (typeof that.movesMainLine[that.movesMainLine.length - 1] == "string") {
                that.endGame = that.movesMainLine.pop();
            }
        };
        that.moves_string = movesString.trim();
        // Store moves in a separate object.
        that.movesMainLine = parser.parse(that.moves_string)[0];
        remindEndGame();
        eachMove(wireMoves);
    };


    /**
     * Returns the move that matches the id.
     * @param id the ID of the move
     */
    var getMove = function(id) {
        return that.moves[id];
    };

    // Returns true, if the move is the start of a (new) variation
    var startVariation = function(move) {
        return  move.variationLevel > 0 &&
            ( (move.prev === undefined) || (that.moves[move.prev].next != move.index));
    };
    // Returns true, if the move is the end of a variation
    var endVariation = function(move) {
        return move.variationLevel > 0 && ! move.next;
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
    var write_pgn = function() {
        var left_variation = false;

        // Prepend a space if necessary
        function prepend_space(sb) {
            if ( (!sb.isEmpty()) && (sb.lastChar() != " ")) {
                sb.append(" ");
            }
        }

        var write_comment = function(comment, sb) {
            if (comment === undefined || comment === null) {
                return;
            }
            prepend_space(sb);
            sb.append("{");
            sb.append(comment);
            sb.append("}");
        };

        var write_comment_move = function(move, sb) {
            write_comment(move.commentMove, sb);
        };

        var write_comment_before = function(move, sb) {
            write_comment(move.commentBefore, sb);
        };

        var write_comment_after = function(move, sb) {
            write_comment(move.commentAfter, sb);
        };

        var write_move_number = function (move, sb) {
            prepend_space(sb);
            if (move.turn === "w") {
                sb.append("" + move.moveNumber);
                sb.append(".");
            } else if (startVariation(move)) {
                sb.append("" + move.moveNumber);
                sb.append("...");
            }
        };

        var write_notation = function (move, sb) {
            prepend_space(sb);
            sb.append(move.notation.notation);
        };

        var write_NAGs = function(move, sb) {
            sb.append(nag_to_symbol(move.nag));
        };

        var write_variation = function (variation, sb) {
            prepend_space(sb);
            sb.append("(");
            write_move(variation[0], sb);
            prepend_space(sb);
            sb.append(")");
        };

        var write_variations = function (move, sb) {
            for (var i = 0; i < move.variations.length; i++) {
                write_variation(move.variations[i], sb);
            }
        };

        var get_next_move = function (move) {
            return move.next ? getMove(move.next) : null;
        };

        /**
         * Write the normalised notation: comment move, move number (if necessary),
         * comment before, move, NAGs, comment after, variations.
         * Then go into recursion for the next move.
         * @param move the move in the exploded format
         * @param sb the string builder to use
         */
        var write_move = function(move, sb) {
            if (move === null || move === undefined) {
                return;
            }
            write_comment_move(move, sb);
            write_move_number(move, sb);
            write_comment_before(move, sb);
            write_notation(move, sb);
            write_NAGs(move, sb);
            write_comment_after(move, sb);
            write_variations(move, sb);
            var next = get_next_move(move);
            write_move(next, sb);
        };

        var write_pgn2 = function(move, _sb) {

            write_move(move, sb);
            return sb.toString();
        };
        var sb = StringBuilder("");
        return write_pgn2(getMove(0), sb);
    };

    /**
     * Return true if the diagram NAG (== $220) is found.
     * @param move
     */
    var has_diagram_nag = function(move) {
        if (typeof move.nag == "undefined") return false;
        if (move.nag == null) return false;
        return move.nag.indexOf('$220') > -1;
    };

    /**
     * Final algorithm to read and map the moves. Seems to be tricky ...
     * @param called the function that will be called (here wireMoves in readMoves)
     */
    var eachMove = function(called) {
        that.moves = [];
        var current = -1;
        /**
         * Search for the right previous move. Go back until you find a move on the same
         * level. Only used inside the eachMode algorithm
         * @param level the current level to the move
         * @param index the current index where the search (backwards) should start
         * @returns {*} the resulting move or null, if none was found (should not happen)
         */
        var findPrevMove = function(level, index) {
            while (index >= 0) {
                if (that.moves[index].variationLevel == level) {
                    return that.moves[index]
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
        var eachMoveVariation = function(moveArray, level, prev) {
            var prevMove = (prev != null ? that.moves[prev] : null);
            $.each(moveArray, function(i, move) {
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
                called(current, prev, move, prevMove);
                // Checks the move on a real board, and hold the fen
                // TODO: Use the position from the configuration, to ensure, that games
                // could be played not starting at the start position.
                if (typeof move.prev == "number") {
                    game.load(getMove(move.prev).fen);
                } else {
                    if (configuration.position == 'start') {
                        game.reset();
                    } else {
                        game.load(configuration.position);
                    }
                }
                var pgn_move = game.move(move.notation.notation);
                if (pgn_move == null) {
                //    window.alert("No legal move: " + move.notation.notation);
                }
                var fen = game.fen();
                move.fen = fen;
                if (pgn_move != null && pgn_move.flags == 'c') {
                    move.notation.strike = 'x';
                }

                $.each(move.variations, function(v, variation) {
                    eachMoveVariation(variation, level + 1, prev);
                })
            })
        };
        eachMoveVariation(that.movesMainLine, 0, null);
    };
    load_pgn();

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
    var addMove = function (move, moveNumber) {
//        window.alert("Move " + move + " after move with number " + moveNumber + " to do.");
        var get_turn = function (moveNumber) {
              return getMove(moveNumber).turn === "w" ? 'b' : "w";
        };

        // Returns the existing move number or null
        // Should include all variations as well
        function existing_move(move, moveNumber) {
            if (moveNumber == null) return null;
            var prevMove = getMove(moveNumber);
            if (typeof prevMove == "undefined") return null;
            game.load(prevMove.fen);
            var pgn_move = game.move(move);
            var nextMove = getMove(prevMove.next);
            if (typeof nextMove == "undefined") return null;
            if (nextMove.notation.notation == pgn_move.san) {
                return prevMove.next;
            } else { // check if there exists variations
                var mainMove = getMove(prevMove.next);
                for (i = 0; i < mainMove.variations.length; i++) {
                    var variation = mainMove.variations[i];
                    if (variation[0].notation.notation == pgn_move.san) {
                        return variation[0].index;
                    }
                }
            }
            return null;
        }

        // Handle possible variation
        function handle_variation(move, prev, next) {
            var prevMove = getMove(prev);
            if (prevMove.next) {    // has a next move set, so should be a variation
                getMove(prevMove.next).variations.push([move]);
                move.variationLevel = (prevMove.variationLevel ? prevMove.variationLevel : 0) + 1;
                if (move.turn == 'b') {
                    move.moveNumber = prevMove.moveNumber;
                }
            } else {    // main variation
                prevMove.next = next;
                move.variationLevel = prevMove.variationLevel;
            }
        }

        var curr = existing_move(move, moveNumber);
        if (curr) return curr;
        var real_move = {};
        real_move.notation = {};
        real_move.variations = [];
        if (moveNumber == null) {
            if (configuration.position == 'start') {
                game.reset();
            } else {
                game.load(configuration.position)
            }
            real_move.turn = "w";
            real_move.moveNumber = 1;
        } else {
            game.load(getMove(moveNumber).fen);
            real_move.turn = get_turn(moveNumber);
            if (real_move.turn === "w") {
                real_move.moveNumber = getMove(getMove(moveNumber).prev).moveNumber + 1;
            }
        }
        var pgn_move = game.move(move);
        real_move.fen = game.fen();
        // san is the real notation, in case of O-O is that O-O.
        // to is the to field, in case of (white) O-O is that g1.
        if (pgn_move.san.substring(0,1) != "O") {
            real_move.notation.notation = pgn_move.san;
            real_move.notation.col = pgn_move.to.substring(0,1);
            real_move.notation.row = pgn_move.to.substring(1,2);
            if (pgn_move.piece != "p") {
                real_move.notation.fig = pgn_move.piece.charAt(0).toUpperCase();
            }
            if (pgn_move.flags == game.FLAGS.CAPTURE) {
                real_move.notation.disc = 'x';
            }
        } else {
            real_move.notation.notation = pgn_move.san;
        }
        that.moves.push(real_move);
        real_move.prev = moveNumber;
        var next = that.moves.length - 1;
        real_move.index = next;
        if (moveNumber != null) {
            handle_variation(real_move, moveNumber, next);
        }
        return next;
    };

    /**
     * Adds the nag to the move with move number moveNumber
     * @param nag the nag in normal notation or as symbol
     * @param moveNumber the number of the move
     * @param added true, if the nag should be added
     */
    var changeNag = function (nag, moveNumber, added) {
        var move = getMove(moveNumber);
        if (move.nag == null) {
            move.nag = [];
        }
        var nagSym = (nag[0] == "$") ? nag : symbol_to_nag(nag);
        if (added) {
            move.nag.push(nagSym);
        } else {
            var index = move.nag.indexOf(nagSym);
            if (index > -1) {
                move.nag.splice(index, 1);
            }
        }
    };

    var clearNags = function (moveNumber) {
        var move = getMove(moveNumber);
        move.nag = [];
    };

    // This defines the public API of the pgn function.
    return {
        movesString: function () { return that.moves_string; },
        readHeaders: readHeaders,
        readMoves: function () { return readMoves; },
        getMoves: function () { return that.moves; },
        movesMainLine: that.movesMainLine,
        getMove: getMove,
        getHeaders: function() { return that.headers; },
//        splitHeaders: splitHeaders,
        getParser: function() { return parser; },
        eachMove: function() { return eachMove(); },
        write_pgn: write_pgn,
        nag_to_symbol: nag_to_symbol,
        startVariation: startVariation,
        endVariation: endVariation,
        changeNag: changeNag,
        clearNags: clearNags,
        addMove: addMove,
        has_diagram_nag: has_diagram_nag,
        PGN_NAGS: that.PGN_NAGS,
        NAGS: that.NAGs,
        san: san,
        sanWithNags: sanWithNags
    }
};

/*
 What could be a good API for using the PGN object after having read the moves?
 The following are the things that happen when someone is playing on the board (changing
 the PGN implicitly):
 * Adding a move at the end, rewiring that move with others
   * Adding it as a first variation
   * Adding it as another variation
   * Adding it at the end of the main line or the end of a variation
 * Removing a move (with all moves following, no other option, removing all references as well (prev move))
 * Changing the NAGs of a move
 * Adding or removing comments to a move (before or after the move)

 APIs could be:
 * addMove(move, moveBefore):
        depending on the kind of moveBefore, it will be added as
         next move main line,
         first move first variation
         first move next variation
         last move current variation (similar t onext move main line)
         first move next variation / new variation
 * deleteMove(move):
        ensures that nothing is left, all references are deleted, the moves array is set to null, there are no references left (prev / next) in other moves
 * addNag(nag,move):
        add the nag of the given move
 * clearNags(move): Clear the nags of the move with number <move>
 * changeCommentMove(comment, move)
 * changeCommentBefore(comment, move)
 * changeCommentAfter(comment, move)
 * getMove(index): exists,
 */

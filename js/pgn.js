'use strict';
/**
 * Defines the pgn function / object that is used for readin
 * pgn. This should build then a structure that is easier to
 * use, but contains all the information necessary to do all
 * the things we want to do.
 * @param spec
 * @returns {{}}
 */

var pgnReader = function (spec) {
    var that = {};
    var parser = pgnParser;
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
    that.PGN_NAGS = [];

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
        that.headers = splitHeaders(spec.pgn);
        var index = spec.pgn.lastIndexOf("]");
        return spec.pgn.substring(index + 1);
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
                $.each(move.variations, function(v, variation) {
                    eachMoveVariation(variation, level + 1, prev);
                })
            })
        };
        eachMoveVariation(that.movesMainLine, 0, null);
    };
    load_pgn();

    // This defines the public API of the pgn function.
    return {
        movesString: function () { return that.moves_string; },
        readHeaders: readHeaders,
        readMoves: function () { return readMoves; },
        getMoves: function () { return that.moves; },
        movesMainLine: that.movesMainLine,
        getMove: getMove,
        getHeaders: function() { return that.headers; },
        splitHeaders: splitHeaders,
        getParser: function() { return parser; },
        eachMove: eachMove
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
         last move current variation
 * deleteMove(move):
        ensures that nothing is left, all references are deleted, the moves array is set to null there
 * changeNag(nag,move):
        change the nag of the given move
 * changeCommentBefore(comment, move)
 * changeCommentAfter(comment, move)
 * getMove(index): exists,
 */

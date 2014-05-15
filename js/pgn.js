'use strict';
/**
 * Defines the pgn function / object that is used for readin
 * pgn. This should build then a structure that is easier to
 * use, but contains all the informatione necessary to do all
 * the things we want to do.
 * @param spec
 * @returns {{}}
 */

var pgn = function (spec) {
    var that = {};
    that.PGN_KEYS = {
        Event: "the name of the tournament or match event",
        Site: "the location of the event",
        Date: "the starting date of the game (format: YYYY.MM.TT)",
        Round: "the playing round ordinal of the game",
        Board: "the board number in a team event",
        White: "the player of the white pieces (last name, pre name)",
        Black: "the player of the black pieces (last name, pre name)",
        Result: "the result of the game (1 - 0, 1/2 - 1/2, 0 - 1)",
        ECO: "ECO-Opening-Key (ECO = 'Encyclopaedia of Chess Openings')",
        WhitemyELO: "myELO-score white (at the beginning of the game)",
        BlackmyELO: "myELO-score black (at the beginning of the game)",
        TimeControl: "This tag describes the time control used with the game. The first digit shows the number of moves and the second the time-limit. (10/2592000)",
        WhiteDays: "rate in days for white",
        BlackDays: "rate in days for black",
        myChessNo: "identification-no. of the game on the myChess.de - server"
    }
    /**
     * Main function, automatically called when calling pgn function.
     */
    function load_pgn() {
        // work here with the pgn, bind the resulting structure inside the pgn instance itself
        var input = that.inputPgn();
        var restString = readHeaders();
        that.moves = readMoves(restString);
        return that;
    };

    /**
     * Reads the headers from the pgn string given, returns what is not consumed
     * by the headers.
     * @returns {string} the remainding moves
     */
    function readHeaders() {
        var h = splitHeaders(spec.pgn);
        // return at the end what is not consumed by the headers.
        that.headers = h;
        var index = spec.pgn.lastIndexOf("]");
        return spec.pgn.substring(index + 1);
    }

    /**
     * Split the headers (marked by []), and collect them in the return value.
     * @param string the pgn string that contains (at the beginning) the headers of the game
     * @returns the headers read
     */
    function splitHeaders(string) {
        var h = {};
        var list = string.match(/\[([^\]]+)]/g);
        if (list === null) { return h; };
        for (var i=0; i < list.length; i++) {
            var ret = list[i].match(/\[(\w+)\s+\"([^\"]+)\"/);
            if (ret) {
                var key = ret[1];
                if (that.PGN_KEYS[key]) {
                    h[key] = ret[2];
                }
            }
        }
        return h;
    }

    /**
     * Read moves read the moves that are not part of the headers.
     */
    function readMoves(movesString) {
        that.moves_string = movesString.trim();
    }

    // This defines the public API of the pgn function.
    that.inputPgn = function () { return spec.pgn; };
    that.readHeaders = readHeaders;
    that.readMoves = readMoves;
    that.getHeaders = function() { return that.headers; };
    that.splitHeaders = splitHeaders;
    load_pgn();
    return that;
}
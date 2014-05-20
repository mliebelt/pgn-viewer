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
    var grammar = "{ function makeInteger(o) { return parseInt(o.join(''), 10); } } pgn = pw:pgnStartWhite all:pgnBlack? { arr = (all ? all : []); arr.push(pw); arr.reverse(); return arr; } / pb:pgnStartBlack all:pgnWhite? { arr = (all ? all : []); arr.push(pb); arr.reverse(); return arr; } / whiteSpace? { return [[]]; } pgnStartWhite = whiteSpace? pw:pgnWhite { return pw; } pgnStartBlack = whiteSpace? me:moveEllipse all:pgnBlack { last = all[all.length - 1]; last.moveNumber = me; return all; } pgnWhite = whiteSpace? mn:moveNumber whiteSpace? hm:halfMove  whiteSpace? all:pgnBlack? { arr = (all ? all : []); move = {}; move.turn = 'w'; move.moveNumber = mn; move.notation = hm; arr.push(move); return arr; } pgnBlack = whiteSpace? hm:halfMove whiteSpace? all:pgnWhite? { arr = (all ? all : []); move = {}; move.turn = 'b', move.notation = hm; arr.push(move); return arr; } moveNumber = num:integer'.' { return num; } integer 'integer' = digits:[0-9]+ { return makeInteger(digits); } whiteSpace = ' '+ { return '';} halfMove = fig:figure? & checkdisc disc:discriminator str:strike? col:column row:row pr:promotion? ch:check? {return (fig ? fig : '') + (disc ? disc : '') + (str ? str : '') + col + row + (ch ? ch : ''); } / fig:figure? str:strike? col:column row:row pr:promotion? ch:check? {return (fig ? fig : '') + (str ? str : '') + col + row + (pr ? pr : '') +  (ch ? ch : ''); } / 'O-O-O' / 'O-O' check = '+' / '#' promotion = '=' f:figure { return '=' + f; } discriminator = column / row checkdisc = discriminator strike? column row moveEllipse = num:integer'...' { return num; } figure = [RNBQK] column = [a-h] row = [1-8] strike = 'x'";
    var parser = PEG.buildParser(grammar);
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

    }
    /**
     * Main function, automatically called when calling pgn function.
     */
    function load_pgn() {
        // work here with the pgn, bind the resulting structure inside the pgn instance itself
        var input = that.inputPgn();
        var restString = readHeaders();
        readMoves(restString);
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
        // Store moves in a separate object.
        that.moves = parser.parse(that.moves_string)[0];
        // Has to be brought into the right order
        that.moves.reverse();
    }

    /**
     * Returns the move that matches the id.
     * @param id the ID of the move
     */
    function getMove(id) {
        return that.moves[id];
    }

    // This defines the public API of the pgn function.
    that.inputPgn = function () { return spec.pgn; };
    that.movesString = function () { return that.moves_string; };
    that.readHeaders = readHeaders;
    that.readMoves = function () { return readMoves; };
    // returns the object to be used outside
    that.getMoves = function () { return that.moves; };
    that.getMove = function (id) { return that.getMove(id); };

    that.getHeaders = function() { return that.headers; };
    that.splitHeaders = splitHeaders;
    that.getParser = function() { return parser; };
    load_pgn();
    return that;
}
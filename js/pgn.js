var pgn = function (spec) {
    var that = {};
    function load_pgn() {
        // work here with the pgn, bind the resulting structure inside the pgn instance itself
        var input = that.inputPgn();
        that.headers = that.readHeaders();
        that.moves = that.readMoves();
    }
    function readHeaders() {
        var h = {};
    }
    that.inputPgn = function () {
        return spec.pgn;
    }
    return that;
}
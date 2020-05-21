/**
 * Ensure that the div element for the board is empty.
 */
var clearHTML = function(boardId) {
    var divBoard = document.getElementById(boardId);
    var child;
    while (child = divBoard.firstChild) {
        divBoard.removeChild(child);
    }
};

describe("PGN Viewer", function() {
    var pgnv;
    beforeEach(function() {
        clearHTML("b");
    });

    describe("When working with base commands", function () {
        it("should return base and board from calling pgnView", function () {
            let res = pgnView('b', { pgn: ''})
            expect(typeof res.base).toBe("object")
            expect(res.base.chess).toBeDefined()
            expect(res.base.getPgn()).toBeDefined()
            expect(res.board).toBeDefined()
        })
        it("should return base and board from calling pgnEdit", function () {
            let res = pgnView('b', { pgn: ''})
            expect(typeof res.base).toBe("object")
            expect(res.base.chess).toBeDefined()
            expect(res.base.getPgn()).toBeDefined()
            expect(res.board).toBeDefined()
        })
        it("should return base and board from calling pgnBoard", function () {
            let res = pgnBoard('b', { pgn: ''})
            expect(typeof res.base).toBe("object")
            expect(res.base.chess).toBeDefined()
            expect(res.base.getPgn()).toBeDefined()
            expect(res.board).toBeDefined()
        })
        it("should return base and board from calling pgnPrint", function () {
            let res = pgnPrint('b', { pgn: ''})
            expect(typeof res).toBe("object")
        })
    })
});
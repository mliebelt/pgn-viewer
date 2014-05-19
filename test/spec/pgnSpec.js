/**
 * Checks all functionality for reading and interpreting a spec.
 */
describe("When working with a pgn file as string", function() {
    var my_pgn;

    beforeEach(function() {
        my_pgn =  pgnReader({pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 Be7 8. Qd2 Qc7 "});
    });

    describe("When creating move objects", function() {
        beforeEach(function() {
            m1 = move({notation: "e4", beforeComment: "Es geht los!"});
        });

        it("should have the content set", function() {
            expect(m1.notation).toEqual("e4");
            expect(m1.prev).toBeUndefined();
            expect(m1.next).toBeUndefined();

        })
    })

    describe("When having read the moves", function() {
        it("should have 16 half-moves read", function() {
            expect(my_pgn.getMoves().length).toEqual(16);
            var first = my_pgn.getMoves()[0];
            var sec = my_pgn.getMoves()[1];
            var seventh = my_pgn.getMoves()[6];
            expect(first.notation).toEqual("e4");
            expect(first.turn).toEqual('w');
            expect(sec.turn).toEqual('b');
            expect(sec.moveNumber).toEqual(1);
            expect(seventh.moveNumber).toEqual(4);
            expect(seventh.turn).toEqual('w');
            expect(seventh.notation).toEqual('Nxd4');
        })
    })

    it("should have a parser available", function() {
        expect(my_pgn.getParser()).toBeDefined();
    })

})

describe("When reading PGN with headers", function() {
    beforeEach(function() {
        var pgn_string = ['[Event "Casual Game"]',
            '[Site "Berlin GER"]',
            '[Date "1852.??.??"]',
            '[EventDate "?"]',
            '[Round "?"]',
            '[Result "1-0"]',
            '[White "Adolf Anderssen"]',
            '[Black "Jean Dufresne"]',
            '1. e2 e4 2. Nf3 Nc6'];
        my_pgn = pgnReader({pgn: pgn_string.join(" ")});
    });

    it("should know the input pgn", function() {
        expect(my_pgn.movesString()).toEqual("1. e2 e4 2. Nf3 Nc6");
    })

    it("should split headers into parts", function() {
        var h = my_pgn.splitHeaders('[a "Hallo"] [b "Hallo"]');
        expect(h["a"]).toBeUndefined();  // Because that is not an allowed key
    })

    it("should have these headers read", function() {
        expect(Object.keys(my_pgn.getHeaders()).length).toEqual(7); // EventDate is not valid
        expect(my_pgn.getHeaders().Site).toEqual("Berlin GER");
        expect(my_pgn.getHeaders().Date).toEqual("1852.??.??");
        expect(my_pgn.movesString()).toEqual("1. e2 e4 2. Nf3 Nc6");
    })
})



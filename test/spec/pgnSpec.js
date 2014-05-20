/**
 * Checks all functionality for reading and interpreting a spec.
 */
describe("When working with a pgn file as string", function() {
    var my_pgn;

    beforeEach(function() {
        my_pgn =  pgnReader({pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 Be7 8. Qd2 Qc7 "});
    });

    describe("When having read the moves", function() {
        it("should have 16 half-moves read", function() {
            expect(my_pgn.getMoves().length).toEqual(16);
            var first = my_pgn.getMoves()[0];
            var sec = my_pgn.getMoves()[1];
            var seventh = my_pgn.getMoves()[6];
            expect(first.notation).toEqual("e4");
            expect(first.turn).toEqual('w');
            expect(sec.turn).toEqual('b');
            expect(sec.moveNumber).toBeUndefined();
            expect(seventh.moveNumber).toEqual(4);
            expect(seventh.turn).toEqual('w');
            expect(seventh.notation).toEqual('Nxd4');
        })
    })

    it("should have a parser available", function() {
        expect(my_pgn.getParser()).toBeDefined();
    })

})

describe("When working with different PGN beginnings and endings", function() {
    var my_pgn;

    it("should work with no moves at all", function() {
        my_pgn = pgnReader({pgn: ""});
        expect(my_pgn.getMoves().length).toEqual(0);
    });

    it("should work with white's first move only", function() {
        my_pgn = pgnReader({pgn: "1. e4"});
        expect(my_pgn.getMoves().length).toEqual(1);
        expect(my_pgn.getMoves()[0].notation).toEqual("e4");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
    })

    it ("should work with black's first move only", function() {
        my_pgn = pgnReader({pgn: "1... e5"});
        expect(my_pgn.getMoves().length).toEqual(1);
        expect(my_pgn.getMoves()[0].notation).toEqual("e5");
        expect(my_pgn.getMoves()[0].turn).toEqual("b");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
    })

    it ("should work with white beginning and black ending", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. d4 cxd4"});
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMoves()[0].notation).toEqual("e4");
        expect(my_pgn.getMoves()[0].turn).toEqual("w");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
        expect(my_pgn.getMoves()[3].notation).toEqual("cxd4");
        expect(my_pgn.getMoves()[3].turn).toEqual("b");
        expect(my_pgn.getMoves()[3].moveNumber).toBeUndefined();
    })

    it ("should work with black beginning and white ending", function() {
        my_pgn = pgnReader({pgn: "1... e5 2. d4 cxd4 3. c3"});
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMoves()[0].notation).toEqual("e5");
        expect(my_pgn.getMoves()[0].turn).toEqual("b");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
        expect(my_pgn.getMoves()[1].notation).toEqual("d4");
        expect(my_pgn.getMoves()[1].turn).toEqual("w");
        expect(my_pgn.getMoves()[1].moveNumber).toEqual(2);
        expect(my_pgn.getMoves()[2].notation).toEqual("cxd4");
        expect(my_pgn.getMoves()[2].turn).toEqual("b");
        expect(my_pgn.getMoves()[2].moveNumber).toBeUndefined();
    })
})

describe("When using all kind of notation", function() {
    var my_pgn;
    it ("should know how to move all kind of figures", function() {
        my_pgn = pgnReader({pgn: "1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nc3 Nf6 5. O-O e6 6. Re1 "});
        expect(my_pgn.getMoves().length).toEqual(11);
    })

    it ("should know different variants of strikes", function() {
        my_pgn = pgnReader({pgn: "1. e5 d5 2. xd5 Nc6 3. 5xc6 bxc6 4. Qdxd6"});
        expect(my_pgn.getMoves().length).toEqual(7);
        expect(my_pgn.getMoves()[2].notation).toEqual("xd5");
    })

    it ("should know all special symbols normally needed (promotion, check, mate)", function() {
        my_pgn = pgnReader({pgn: "1. f3 e5 2. g4 Qh4#"});
        expect(my_pgn.getMoves().length).toEqual(4);
        my_pgn = pgnReader({pgn: "1. e7+ d2 2. e8=Q d1=R#"});
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
        expect(my_pgn.getMoves().length).toEqual(4);
    })
})



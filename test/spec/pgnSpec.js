/**
 * Created by mliebelt on 11.05.2014.
 */
describe("When working with a pgn file as string", function() {
    var my_pgn;

    beforeEach(function() {
        my_pgn =  pgn({pgn: "1. e2 e4"});
    });

    it("should know the input pgn", function() {
        expect(my_pgn.inputPgn()).toEqual("1. e2 e4");
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
            my_pgn = pgn({pgn: pgn_string.join(" ")});
        });

        it("should have these headers read", function() {
            expect(Object.keys(my_pgn.getHeaders()).length).toEqual(7); // EventDate is not valid
            expect(my_pgn.getHeaders().Site).toEqual("Berlin GER");
            expect(my_pgn.getHeaders().Date).toEqual("1852.??.??");
            expect(my_pgn.moves_string).toEqual("1. e2 e4 2. Nf3 Nc6");
        })
    })

    it("should split headers into parts", function() {
        var h = my_pgn.splitHeaders('[a "Hallo"] [b "Hallo"]');
        expect(h["a"]).toBeUndefined();  // Because that is not an allowed key
    })

})

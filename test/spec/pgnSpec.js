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
})

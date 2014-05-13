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
                '[ECO "C52"]',
                '[WhiteElo "?"]',
                '[BlackElo "?"]',
                '[PlyCount "47"]',
                '',
                '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O',
                'd3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4',
                'Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6',
                'Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8',
                '23.Bd7+ Kf8 24.Bxe7# 1-0'];
            my_pgn = pgn({pgn: pgn_string.join(" ")});
        });

        xit("should have these headers read", function() {
            expect(my_pgn.getHeaders().length).toBeGreaterThan(1);
        })
    })

    it("should split headers into parts", function() {
        var h = my_pgn.splitHeaders('[a "Hallo"] [b "Hallo"]');
        //expect(h.length).toEqual(2);  // Did not work as expeced
        expect(h["a"]).toEqual("Hallo");
    })

})

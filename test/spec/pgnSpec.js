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
            expect(first.notation.notation).toEqual("e4");
            expect(first.turn).toEqual('w');
            expect(sec.turn).toEqual('b');
            //expect(sec.moveNumber).toBeUndefined();
            expect(seventh.moveNumber).toEqual(4);
            expect(seventh.turn).toEqual('w');
            expect(seventh.notation.notation).toEqual('Nxd4');
        })
    });

    it("should have a parser available", function() {
        expect(my_pgn.getParser()).toBeDefined();
    })

});

describe("ambiguator or variations of formats", function() {
    var my_pgn;
    // Not a real disambiguator, because when pawns are captured, the column has to be used.
    xit ("should read and remember disambiguator", function() {
        my_pgn = pgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"});
        expect(my_pgn.getMoves()[0].notation.disc).toEqual('d');
    });

    it("should use disambiguator on output", function() {
        my_pgn = pgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"});
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual('dxe5');
    });

    it ("should understand that Long Algebraic Notation can be used when strike", function() {
        my_pgn = pgnReader({pgn: '4... Nf6xe4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'});
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual("Nxe4");
    });

    // chess.js does not allow to leave out the strike symbol, or I have to have more in the long notation
    // even with the long variation, the move Nf6-e4 is not accepted, even not in sloppy mode
    xit ("should understand that Long Algebraic Notation can leave out strike symbol", function() {
        my_pgn = pgnReader({pgn: '4... Nf6e4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'});
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual("Nxe4");
    });

    it ("should understand that Long Algebraic Notation can be used", function() {
        my_pgn = pgnReader({pgn: '1. e2-e4 e7-e5'});
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual("e4");
        expect(my_pgn.sanWithNags(my_pgn.getMove(1))).toEqual("e5");
    });

    it ("should understand that disambiguator is needed here", function() {
        my_pgn = pgnReader({pgn: 'fxe5', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 1 4'});
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual("fxe5");
    })
    
    xit ("should understand optional pawn symbols", function () {
        my_pgn = pgnReader({pgn: '1. Pe4 Pe5 2. Pd4 Pexd4'});
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.sanWithNags(my_pgn.getMove(0))).toEqual("e4");
        expect(my_pgn.sanWithNags(my_pgn.getMove(1))).toEqual("e5");
        expect(my_pgn.sanWithNags(my_pgn.getMove(2))).toEqual("d4");
        expect(my_pgn.sanWithNags(my_pgn.getMove(3))).toEqual("exd4");
    })
})

describe("When working with different PGN beginnings and endings", function() {
    var my_pgn;

    it("should work with no moves at all", function() {
        my_pgn = pgnReader({pgn: ""});
        expect(my_pgn.getMoves().length).toEqual(0);
    });

    it("should work with white's first   move only", function() {
        my_pgn = pgnReader({pgn: "1. e4"});
        expect(my_pgn.getMoves().length).toEqual(1);
        expect(my_pgn.getMoves()[0].notation.notation).toEqual("e4");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
    });

    it ("should work with black's first move only", function() {
        my_pgn = pgnReader({pgn: "1... e5", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"});
        expect(my_pgn.getMoves().length).toEqual(1);
        expect(my_pgn.getMoves()[0].notation.notation).toEqual("e5");
        expect(my_pgn.getMoves()[0].turn).toEqual("b");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
    });

    it ("should work with white beginning and black ending", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. d4 exd4"});
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMoves()[0].notation.notation).toEqual("e4");
        expect(my_pgn.getMoves()[0].turn).toEqual("w");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
        expect(my_pgn.getMoves()[3].notation.notation).toEqual("exd4");
        expect(my_pgn.getMoves()[3].turn).toEqual("b");
        //expect(my_pgn.getMoves()[3].moveNumber).toBeUndefined();
    });

    it ("should work with black beginning and white ending", function() {
        my_pgn = pgnReader({pgn: "1... e5 2. d4 exd4 3. c3", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"});
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMoves()[0].notation.notation).toEqual("e5");
        expect(my_pgn.getMoves()[0].turn).toEqual("b");
        expect(my_pgn.getMoves()[0].moveNumber).toEqual(1);
        expect(my_pgn.getMoves()[1].notation.notation).toEqual("d4");
        expect(my_pgn.getMoves()[1].turn).toEqual("w");
        expect(my_pgn.getMoves()[1].moveNumber).toEqual(2);
        expect(my_pgn.getMoves()[2].notation.notation).toEqual("exd4");
        expect(my_pgn.getMoves()[2].turn).toEqual("b");
        //expect(my_pgn.getMoves()[2].moveNumber).toBeUndefined();
    })
});

describe("When using all kind of notation", function() {
    var my_pgn;
    it ("should know how to move all kind of figures", function() {
        my_pgn = pgnReader({pgn: "1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nf3 d5 5. O-O e6 6. Re1 "});
        expect(my_pgn.getMoves().length).toEqual(11);
    });

    it ("should know different variants of strikes", function() {
        my_pgn = pgnReader({pgn: "1. e4 d5 2. exd5 Nc6 3. dxc6 bxc6"});
        expect(my_pgn.getMoves().length).toEqual(6);
        expect(my_pgn.getMoves()[2].notation.notation).toEqual("exd5");
    });

    it ("should know all special symbols normally needed (promotion, check, mate)", function() {
        my_pgn = pgnReader({pgn: "1. f3 e5 2. g4 Qh4#"});
        expect(my_pgn.getMoves().length).toEqual(4);
        my_pgn = pgnReader({pgn: "1. e7+ d2 2. e8=Q d1=R#"});
    })

    it ("should be robust with missing symbols (check)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7 Ke7 7. Nd5#"});
        expect(my_pgn.getMoves().length).toEqual(13);
        //expect(my_pgn.getMoves()[10].notation.notation).toEqual("Bxf7+");
        expect(my_pgn.getMoves()[10].notation.check).toEqual('+');
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#");
    })

    it ("should be robust with missing symbols (mate)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5"})
        expect(my_pgn.getMoves().length).toEqual(13);
        expect(my_pgn.getMoves()[12].notation.check).toEqual('#');
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#");
    })
});

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
            '[SetUp "0"]',
            '1. e4 e5 2. Nf3 Nc6'];
        var pgn_string2 = ['[SetUp "1"]', '[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]'];
        my_pgn = pgnReader({pgn: pgn_string.join(" ")});
        my_pgn2 = pgnReader({pgn: pgn_string2.join(" ")});
    });

    // Disabled that because not used any where
    xit("should know the input pgn (the moves)", function() {
        expect(my_pgn.movesString()).toEqual("1. e2 e4 2. Nf3 Nc6");
        expect(my_pgn.getMoves().length).toEqual(4);
    });

    it("should have these headers read", function() {
        expect(Object.keys(my_pgn.getHeaders()).length).toEqual(8); // EventDate is not valid
        expect(my_pgn.getHeaders().Site).toEqual("Berlin GER");
        expect(my_pgn.getHeaders().Date).toEqual("1852.??.??");
        expect(my_pgn.getHeaders().SetUp).toEqual("0");
        expect(my_pgn.configuration.position).toEqual("start");
    });

    it("should have header mapped to FEN", function() {
        expect(Object.keys(my_pgn2.getHeaders()).length).toEqual(2); // EventDate is not valid
        expect(my_pgn2.getHeaders().SetUp).toEqual("1");
        expect(my_pgn2.configuration.position).toEqual("8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57");
    })
});

describe("When reading pgn with wrong headers", function() {
    beforeEach(function() {
        var pgn_string = ['[Event "Casual Game"]',
            '[Site "Berlin GER"]',
            '[Date "1852.??.??"]',
            '[EventDate "?"]',
            '[Round "?"]',
            '[Result "1-0"]',
            '[White "Adolf Anderssen"]',
            '[Black "Jean Dufresne"]',
            '[a "Hallo"]',
            '[b "Hallo"]',
            '1. e2 e4 2. Nf3 Nc6'];
        var my_pgn = pgnReader({pgn: pgn_string.join(" ")});
    });
    it("should ignore wrong headers", function() {
        var h = my_pgn.getHeaders();
        expect(h["a"]).toBeUndefined();  // Because that is not an allowed key
    });
});

describe("When reading PGN with variations", function() {
    var my_pgn;

    it("should understand one variation for white", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) exf4"});
        expect(my_pgn.movesMainLine().length).toEqual(4);
        expect(my_pgn.getMove(0).variations.length).toEqual(0);
        expect(my_pgn.getMove(1).variations.length).toEqual(0);
        expect(my_pgn.getMove(2).variations.length).toEqual(1);
        expect(my_pgn.getMove(3).variations.length).toEqual(0);
        expect(my_pgn.getMove(2).variations[0].notation.notation).toEqual("Nf3");
        expect(my_pgn.getMove(my_pgn.getMove(2).variations[0].next).notation.notation).toEqual("Nc6");
        expect(my_pgn.getMove(3).prev).toEqual(1);
        expect(my_pgn.getMove(1).next).toEqual(2);
        expect(my_pgn.getMove(3).next).toEqual(4);
        expect(my_pgn.getMove(4).prev).toEqual(3);
        expect(my_pgn.getMove(5).prev).toEqual(2);
    });

    it("should understand one variation for black with move number", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 (1... d5 2. exd5 Qxd5)"});
        expect(my_pgn.movesMainLine().length).toEqual(2);
        expect(my_pgn.getMove(1).variations.length).toEqual(1);
        expect(my_pgn.getMove(0).variations.length).toEqual(0);
        expect(my_pgn.getMove(1).variations[0].notation.notation).toEqual("d5");
        expect(my_pgn.getMove(2).prev).toEqual(0);
        expect(my_pgn.getMove(3).prev).toEqual(2);
    });

    it("should understand one variation for black without move number", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5)"});
        expect(my_pgn.movesMainLine().length).toEqual(2);
        expect(my_pgn.getMove(1).variations.length).toEqual(1);
        expect(my_pgn.getMove(0).variations.length).toEqual(0);
        expect(my_pgn.getMove(1).variations[0].notation.notation).toEqual("d5");
        expect(my_pgn.getMove(2).prev).toEqual(0);
        expect(my_pgn.getMove(3).prev).toEqual(2);
    });

    it("should understand nested variations", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5 (2... Nf6))"});
        expect(my_pgn.movesMainLine().length).toEqual(2);
        expect(my_pgn.getMove(1).variations[0].notation.notation).toEqual("d5");
        expect(my_pgn.getMove(4).variations.length).toEqual(1);
        expect(my_pgn.getMove(4).variations[0].notation.notation).toEqual("Nf6");
        expect(my_pgn.getMove(2).prev).toEqual(0);
        expect(my_pgn.getMove(5).prev).toEqual(3);
    });

    it ("should know how to handle variation of the first move", function () {
        my_pgn = pgnReader({pgn: "1. e4 ( 1. d4 d5 ) e5"});
        expect(my_pgn.getMove(1).prev).toEqual(undefined);
        expect(my_pgn.getMove(my_pgn.getMove(0).next).notation.notation).toEqual("e5");
        expect(my_pgn.getMove(my_pgn.getMove(1).next).notation.notation).toEqual("d5");
    })

    it ("should know about variations in syntax for variants", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 )"});
        expect(my_pgn.movesMainLine().length).toEqual(2);
        expect(my_pgn.getMove(1).variations[0].notation.notation).toEqual("d5");
    })
});

describe("When reading variations with comments", function() {
    var my_pgn;

    it("should understand move, before and after comment in principle", function() {
        my_pgn = pgnReader({pgn: "{START} 1. {BEFORE} d4 {AFTER} e5"});
        expect(my_pgn.getMove(0).commentMove).toEqual("START");
        expect(my_pgn.getMove(0).commentBefore).toEqual("BEFORE");
        expect(my_pgn.getMove(0).commentAfter).toEqual("AFTER");
        expect(my_pgn.getMove(0).notation.notation).toEqual("d4");
    });

    it("should understand comments for variation with white", function() {
        my_pgn = pgnReader({pgn: "1. d4 ({START} 1. {BEFORE} e4 {AFTER} e5) 1... d5"});
        var var_first = my_pgn.getMove(0).variations[0];
        expect(var_first.commentMove).toEqual("START");
        expect(var_first.commentBefore).toEqual("BEFORE");
        expect(var_first.commentAfter).toEqual("AFTER");
        expect(var_first.notation.notation).toEqual("e4");
    })
});

describe("When iterating over moves", function() {
    var moves;
    beforeEach(function () {
        moves = [];
    });
    var flatMoves = function (pgn) {
        var my_pgn = pgnReader({pgn: pgn});
        moves = my_pgn.getMoves();
    };
    it("should find the main line", function () {
        flatMoves("1. e4 e5");
        expect(moves.length).toEqual(2);
        expect(moves[0].notation.notation).toEqual("e4");
        expect(moves[1].notation.notation).toEqual("e5");
    });

    it("should find the first variation", function () {
        flatMoves("1. e4 e5 (1... d5)");
        expect(moves.length).toEqual(3);
        expect(moves[0].notation.notation).toEqual("e4");
        expect(moves[2].notation.notation).toEqual("d5");
    });

    it("should find all variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. d4 (2. Nf3 Nc6)");
        expect(moves.length).toEqual(6);
        expect(moves[0].notation.notation).toEqual("e4");
        expect(moves[2].notation.notation).toEqual("d5");
        expect(moves[3].notation.notation).toEqual("d4");
        expect(moves[4].notation.notation).toEqual("Nf3");
    });

    it("should find nested variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. Nf3 Nc6 (2... d6 3. d4 (3. Be2)) 3. Bb5");
        expect(moves.length).toEqual(9);
        expect(moves[0].notation.notation).toEqual("e4");
        expect(moves[1].notation.notation).toEqual("e5");
        expect(moves[2].notation.notation).toEqual("d5");
        expect(moves[4].notation.notation).toEqual("Nc6");
        expect(moves[5].notation.notation).toEqual("d6");
        expect(moves[6].notation.notation).toEqual("d4");
        expect(moves[7].notation.notation).toEqual("Be2");
        expect(moves[8].notation.notation).toEqual("Bb5");
    });

    it ("should find follow-ups of nested variations", function() {
        flatMoves("1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5) 3. Nf3 {is hot}) 2... Nc6");
        expect(moves.length).toEqual(8);
        expect(moves[5].prev).toEqual(3);
        expect(moves[5].next).toBeUndefined();
        expect(moves[6].prev).toEqual(4);
        expect(moves[6].next).toBeUndefined();
        expect(moves[7].prev).toEqual(2);
        expect(moves[7].next).toBeUndefined();

    });

    it("should know its indices", function () {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4");
        for (var i = 0; i < moves.length; i++) {
            expect(moves[i].index).toEqual(i);
        }
    });

    it ("should know its previous and next move", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4");
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toEqual(4);
        expect(moves[2].prev).toEqual(0);
        expect(moves[2].next).toEqual(3);
        expect(moves[3].prev).toEqual(2);
        expect(moves[3].next).toBeUndefined();
        expect(moves[4].prev).toEqual(1);
        expect(moves[4].next).toBeUndefined();
    });

    it ("should know its previous and next move with 2 variations", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) (1... c5) 2. d4");
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toEqual(5);
        expect(moves[2].prev).toEqual(0);
        expect(moves[2].next).toEqual(3);
        expect(moves[3].prev).toEqual(2);
        expect(moves[3].next).toBeUndefined();
        expect(moves[4].prev).toEqual(0);
        expect(moves[4].next).toBeUndefined();
        expect(moves[5].prev).toEqual(1);
        expect(moves[5].next).toBeUndefined();
    });

    it ("should read complete games", function() {
        flatMoves("1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. Nf3 Nc6 6. exd6 cxd6 7. Nc3 g6 8. Nd5 {ein grober Fehler, der sofort einen Bauern verliert} Nxd5 9. cxd5 Qa5+ 10. Bd2 Qxd5 11. Qa4 Bg7 12. Bc4 {Weiß stellt sich immer schlechter} Qe4+ 13. Be3 d5 14. Bb5 {sieht nach Bauernrückgewinn aus} O-O 15. Bxc6 bxc6 16. Qxc6 {der Bauer ist vergiftet} Bg4 17. O-O (17. Nh4 Qd3 18. Nf3 (18. f3 Qxe3+) 18... Rac8 19. Qa4 Bxf3 20. gxf3 Rc2 {kostet die Dame}) 17... Bxf3 18. gxf3 Qxf3 {ist noch am Besten für Weiß} 19. Qd7 e6 20. Rfc1 Bxd4 21. Bxd4 Qg4+ { kostet den zweiten Bauern} 22. Kf1 Qxd4 23. b3 Rfd8 24. Qb7 e5 25. Rd1 Qb6 26.  Qe7 Qd6 {jeder Abtausch hilft} 27. Qxd6 Rxd6 28. Rd2 Rc8 29. Re1 f6 30. Red1 d4 31. f4 Kf7 32. fxe5 fxe5 33. Ke2 Ke6 34. a4 Rc3 35. Rd3 Rxd3 36. Kxd3 Rc6 37.  Rb1 Rc3+ 38. Kd2 Rh3 39. b4 Kd5 40. a5 Rxh2+ 41. Kc1 Kc4 {und Weiß hat nichts mehr} 42. Rb2 Rxb2 43. Kxb2 Kxb4 {höchste Zeit, aufzugeben} 44. Kc2 e4 45. Kd2 Kb3 46. a6 Kb2 47. Ke2 Kc2 48. Ke1 d3 49. Kf2 d2 50. Kg3 d1=Q 51. Kf4 Qd5 52.  Kg3 Qe5+ 53. Kf2 Kd2 54. Kg2 Ke2 55. Kh3 Kf2 56. Kg4 Qg3#");
        expect(moves[0].prev).toBeUndefined();
    })
});

describe("Default a new read algorithm for PGN", function() {
    var my_pgn;
    it ("should read the main line", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3"});
        var moves = my_pgn.getMoves();
        expect(moves.length).toEqual(3);
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toEqual(2);
        expect(moves[2].prev).toEqual(1);
        expect(moves[2].next).toBeUndefined();
    });

    it ("should read one variation for black", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 (1... d5 2. Nf3)"});
        var moves = my_pgn.getMoves();
        expect(moves.length).toEqual(4);
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toBeUndefined();
        expect(moves[2].prev).toEqual(0);
        expect(moves[2].next).toEqual(3);
        expect(moves[3].prev).toEqual(2);
        expect(moves[3].next).toBeUndefined();
    });

    it ("should read one variation for white", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6)"});
        var moves = my_pgn.getMoves();
        expect(moves.length).toEqual(5);
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toEqual(2);
        expect(moves[2].prev).toEqual(1);
        expect(moves[2].next).toBeUndefined();
        expect(moves[3].prev).toEqual(1);
        expect(moves[3].next).toEqual(4);
        expect(moves[4].prev).toEqual(3);
        expect(moves[4].next).toBeUndefined();
    });

    it ("should read one variation for white with move after", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) 2... e#xf4 3. Nf3"});
        
        var moves = my_pgn.getMoves();
        expect(moves.length).toEqual(7);
        expect(moves[0].prev).toBeUndefined();
        expect(moves[0].next).toEqual(1);
        expect(moves[1].prev).toEqual(0);
        expect(moves[1].next).toEqual(2);
        expect(moves[2].prev).toEqual(1);
        expect(moves[2].next).toEqual(5);
        expect(moves[3].prev).toEqual(1);
        expect(moves[3].next).toEqual(4);
        expect(moves[4].prev).toEqual(3);
        expect(moves[4].next).toBeUndefined();
        expect(moves[5].prev).toEqual(2);
        expect(moves[5].next).toEqual(6);
        expect(moves[6].prev).toEqual(5);
        expect(moves[6].next).toBeUndefined();
    })
});

describe("Additional notations like", function() {
    it("should read all notation symbols in the standard notation", function() {
        var my_pgn = pgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"});
        var moves = my_pgn.getMoves();
        expect(moves.length).toEqual(6);
        expect(moves[0].nag).toEqual(["$1"]);
        expect(moves[1].nag).toEqual(["$2"]);
        expect(moves[2].nag).toEqual(["$3"]);
        expect(moves[3].nag).toEqual(["$4"]);
        expect(moves[4].nag).toEqual(["$6"]);
        expect(moves[5].nag).toEqual(["$5"]);
    })
});

describe("Writing PGN like", function() {
    it("should write an empty PGN string", function() {
        var my_pgn = pgnReader({pgn: ""});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("");
    });

    it("should write the normalized notation of the main line with only one move", function() {
        var my_pgn = pgnReader({pgn: "1. e4"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4");
    });

    it("should write the normalized notation of the main line", function() {
        var my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 2. Nf3 Nc6 3. Bb5");
    });

    it("should write the notation for a main line including comments", function () {
        var my_pgn = pgnReader({pgn: "{FIRST} 1. {SECOND} e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("{FIRST} 1. {SECOND} e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5");
    });

    it("should write all NAGs in their known parts", function () {
        var my_pgn = pgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?");
    });

    it("should write the notation for a main line with one variation", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3");
    });

    it("should write the notation for a main line with several variations", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3");
    });

    it("should write the notation for a main line with stacked variations", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4) 3. d4 ) 2. Nf3"});
        var res = my_pgn.write_pgn();
        expect(res).toEqual("1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4 ) 3. d4 ) 2. Nf3");
    });
    it("should write the end of the game", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 0-1"});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 0-1");
    });
    it("should write the end of the game, understand all results: 1-0", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 1-0"});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 1-0");
    });
    it("should write the end of the game, understand all results: *", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 *"});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 *");
    });
    it("should write the end of the game, understand all results: 1/2-1/2", function () {
        var my_pgn = pgnReader({pgn: "1. e4 e5 1/2-1/2"});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 1/2-1/2");
    });
    it("should write the end of the game as part of tags", function () {
        var my_pgn = pgnReader({pgn: '[Result "0-1"] 1. e4 e5'});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 0-1");
    });
    it("should write the end of the game as part of tags, understand all results: *", function () {
        var my_pgn = pgnReader({pgn: '[Result "*"] 1. e4 e5'});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 *");
    });
    it("should write the end of the game as part of tags, understand all results: 1/2-1/2", function () {
        var my_pgn = pgnReader({pgn: '[Result "1/2-1/2"] 1. e4 e5'});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 1/2-1/2");
    });
    it("should write the end of the game as part of tags, understand all results: 1-0", function () {
        var my_pgn = pgnReader({pgn: '[Result "1-0"] 1. e4 e5'});
        expect(my_pgn.write_pgn()).toEqual("1. e4 e5 1-0");
    });
});

describe("When reading a PGN game", function () {
    it ("should have the fen stored with each move", function () {
        var my_pgn = pgnReader({pgn: "1. d4 e5"});
        expect(my_pgn.getMoves().length).toEqual(2);
        expect(my_pgn.getMoves()[0].fen).toBeDefined();
        expect(my_pgn.getMoves()[1].fen).toBeDefined();
    });
});

describe("When making moves in PGN", function() {
    var empty, my_pgn;
    beforeEach(function () {
        my_pgn = pgnReader({pgn: "1. d4 e5"});
        empty = pgnReader({pgn: ""});
    });

    it("should have no moves with an empty PGN string", function () {
        expect(empty.getMoves().length).toEqual(0);
    });

    it("should write a move on the initial position", function () {
        empty.addMove("e4", null);
        expect(empty.getMoves().length).toEqual(1);
        expect(empty.getMove(0).notation.notation).toEqual("e4");
    });

    it("should write a move in the position with white on turn", function () {
        my_pgn.addMove("e4", 1);
        expect(my_pgn.getMoves().length).toEqual(3);
        expect(my_pgn.getMove(2).turn).toEqual("w");
    });

    it("should write a move in the position with black on turn", function () {
        my_pgn = pgnReader({pgn: "1. d4 e5 2. e4"});
        my_pgn.addMove("exd4", 2);
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMove(3).turn).toEqual("b");
    });

    it("should use the existing move in the main line", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("Nf3", 1);
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMove(2).turn).toEqual("w");
        expect(my_pgn.getMove(2).notation.notation).toEqual("Nf3");
    });

    it("should start new variation in the middle of the main line", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("f4", 1);
        expect(my_pgn.getMoves().length).toEqual(5);
        expect(my_pgn.getMove(4).turn).toEqual("w");
        expect(my_pgn.getMove(4).notation.notation).toEqual("f4");
        expect(my_pgn.getMove(2).variations.length).toEqual(1);
        expect(my_pgn.getMove(2).variations[0].notation.notation).toEqual("f4");
    });

    it("should start a second variation in the middle of the main line, when the current move has already a variation", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("f4", 1); // first variation
        my_pgn.addMove("d4", 1); // second variation to the same FEN
        expect(my_pgn.getMoves().length).toEqual(6);
        expect(my_pgn.getMove(5).turn).toEqual("w");
        expect(my_pgn.getMove(5).notation.notation).toEqual("d4");
        expect(my_pgn.getMove(2).variations.length).toEqual(2);
        expect(my_pgn.getMove(2).variations[0].notation.notation).toEqual("f4");
        expect(my_pgn.getMove(2).variations[1].notation.notation).toEqual("d4");
    });

    it("should use the existing move in the variation", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("Nf3", 1); // first main line
        my_pgn.addMove("Nc6", 2); // second main line
        expect(my_pgn.getMoves().length).toEqual(4);
        expect(my_pgn.getMove(2).turn).toEqual("w");
        expect(my_pgn.getMove(2).notation.notation).toEqual("Nf3");
        expect(my_pgn.getMove(3).turn).toEqual("b");
        expect(my_pgn.getMove(3).notation.notation).toEqual("Nc6");
    });

    it("should know how to  notate castling", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5"});
        my_pgn.addMove("O-O", 5);
        expect(my_pgn.getMoves().length).toEqual(7);
        expect(my_pgn.getMove(6).turn).toEqual("w");
        expect(my_pgn.getMove(6).notation.notation).toEqual("O-O");
        my_pgn.addMove("O-O", 6);
        expect(my_pgn.getMoves().length).toEqual(8);
        expect(my_pgn.getMove(7).turn).toEqual("b");
        expect(my_pgn.getMove(7).notation.notation).toEqual("O-O");
    })
});

describe("When deleting lines" , function () {
    it("should delete the whole main line", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"});
        my_pgn.deleteMove(0);
        expect(my_pgn.isDeleted(0)).toBeTruthy();
    });

    it("should delete the rest of the line (without variation)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"});
        my_pgn.deleteMove(2);
        expect(my_pgn.isDeleted(0)).toBeFalsy();
        expect(my_pgn.isDeleted(1)).toBeFalsy();
        expect(my_pgn.isDeleted(2)).toBeTruthy();
        expect(my_pgn.isDeleted(3)).toBeTruthy();
    });

    it("should delete the rest of the line, replace it by the first variation", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) Nc6"});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        my_pgn.deleteMove(2);
        expect(my_pgn.isDeleted(0)).toBeFalsy();
        expect(my_pgn.isDeleted(1)).toBeFalsy();
        expect(my_pgn.isDeleted(2)).toBeTruthy();
        expect(my_pgn.isDeleted(5)).toBeTruthy();
        expect(my_pgn.getMove(3).variationLevel).toEqual(0);
        expect(my_pgn.getMove(4).variationLevel).toEqual(0);
        expect(my_pgn.getMove(1).next).toEqual(3);
    });

    it("should delete the whole variation with the first move", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) (2. d4 exd4) Nc6"});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        my_pgn.deleteMove(3);
        expect(my_pgn.isDeleted(0)).toBeFalsy();
        expect(my_pgn.isDeleted(1)).toBeFalsy();
        expect(my_pgn.isDeleted(2)).toBeFalsy();
        expect(my_pgn.isDeleted(3)).toBeTruthy();
        expect(my_pgn.isDeleted(4)).toBeTruthy();
        expect(my_pgn.getMove(2).variationLevel).toEqual(0);
        expect(my_pgn.getMove(5).variationLevel).toEqual(1);
        expect(my_pgn.getMove(6).variationLevel).toEqual(1);
    });

    it("should delete the rest of a variation (including the move)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4 3. Nf3 d6) (2. d4 exd4) Nc6"});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        my_pgn.deleteMove(4);
        expect(my_pgn.isDeleted(3)).toBeFalsy();
        expect(my_pgn.isDeleted(4)).toBeTruthy();
    });

});

describe("When upvoting lines", function () {
    var pgn = "1. e4 e5 2. Nf3 (2. f4 exf4) (2. d4 exd4)";

    it("should upvote the second line as first line", function () {
        my_pgn = pgnReader({pgn: pgn});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        expect(my_pgn.getMove(2).variations[0].index).toEqual(3);
        expect(my_pgn.getMove(2).variations[1].index).toEqual(5);
        my_pgn.promoteMove(5);
        expect(my_pgn.getMove(2).variations[0].index).toEqual(5);
        expect(my_pgn.getMove(2).variations[1].index).toEqual(3);
    });

    it("should upvote the first line as main line", function () {
        my_pgn = pgnReader({pgn: pgn});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        expect(my_pgn.getMove(2).variations[0].index).toEqual(3);
        expect(my_pgn.getMove(2).variations[1].index).toEqual(5);
        my_pgn.promoteMove(3);
        expect(my_pgn.startVariation(my_pgn.getMove(2))).toBeTruthy();
        expect(my_pgn.getMove(2).variationLevel).toEqual(1);
        expect(my_pgn.getMove(3).variationLevel).toEqual(0);
    });

    it("should ignore upvoting the main line", function () {
        my_pgn = pgnReader({pgn: pgn});
        expect(my_pgn.getMove(3).variationLevel).toEqual(1);
        expect(my_pgn.getMove(2).variations[0].index).toEqual(3);
        expect(my_pgn.getMove(2).variations[1].index).toEqual(5);
        my_pgn.promoteMove(2);
        expect(my_pgn.getMove(2).variations[0].index).toEqual(3);
        expect(my_pgn.getMove(2).variations[1].index).toEqual(5);
    });


})
describe("When working with NAGs", function () {
    var my_pgn;
    beforeEach(function () {
        my_pgn = pgnReader({pgn: "1. d4 e5"});
    });

    it ("should add selected NAG as first when empty", function () {
        my_pgn.changeNag("??", 1, true);
        expect(my_pgn.getMove(1).nag[0]).toEqual("$4");
        my_pgn.changeNag("!!", 0, true);
        expect(my_pgn.getMove(0).nag[0]).toEqual("$3");
    });

    it("should add selected NAG as last when already some", function () {
        my_pgn.changeNag("??", 1, true);
        my_pgn.changeNag("!!", 1, true);
        expect(my_pgn.getMove(1).nag[1]).toEqual("$3");
        expect(my_pgn.getMove(1).nag[0]).toEqual("$4");
    });

    it("should clear all NAGs", function () {
        my_pgn.changeNag("??", 1, true);
        expect(my_pgn.getMove(1).nag[0]).toEqual("$4");
        my_pgn.clearNags(1);
        expect(my_pgn.getMove(1).nag.length).toEqual(0);
    });

    it("should ignore clear when no NAGs", function () {
        my_pgn.clearNags(1);
        expect(my_pgn.getMove(1).nag.length).toEqual(0);
        my_pgn.clearNags(1);
        expect(my_pgn.getMove(1).nag.length).toEqual(0);
    });
});


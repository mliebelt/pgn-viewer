
const should = require('should');
const pgnReader = require('../lib/pgn').pgnReader;

/**
 * Checks all functionality for reading and interpreting a spec.
 */


describe("ambiguator or variations of formats", function() {
    let my_pgn;
    // Not a real disambiguator, because when pawns are captured, the column has to be used.
    xit ("should read and remember disambiguator", function() {
        my_pgn = pgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"});
        should(my_pgn.getMoves()[0].notation.disc).equal('d');
    });

    it("should use disambiguator on output", function() {
        my_pgn = pgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"});
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal('dxe5');
    });

    it ("should understand that Long Algebraic Notation can be used when strike", function() {
        my_pgn = pgnReader({pgn: '4... Nf6xe4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'});
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal("Nxe4");
    });

    // chess.src does not allow to leave out the strike symbol, or I have to have more in the long notation
    // even with the long variation, the move Nf6-e4 is not accepted, even not in sloppy mode
    xit ("should understand that Long Algebraic Notation can leave out strike symbol", function() {
        my_pgn = pgnReader({pgn: '4... Nf6e4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'});
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal("Nxe4");
    });

    it ("should understand that Long Algebraic Notation can be used", function() {
        my_pgn = pgnReader({pgn: '1. e2-e4 e7-e5'});
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal("e4");
        should(my_pgn.sanWithNags(my_pgn.getMove(1))).equal("e5");
    });

    it ("should understand that disambiguator is needed here", function() {
        my_pgn = pgnReader({pgn: 'fxe5', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 1 4'});
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal("fxe5");
    })
    
    xit ("should understand optional pawn symbols", function () {
        my_pgn = pgnReader({pgn: '1. Pe4 Pe5 2. Pd4 Pexd4'});
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal("e4");
        should(my_pgn.sanWithNags(my_pgn.getMove(1))).equal("e5");
        should(my_pgn.sanWithNags(my_pgn.getMove(2))).equal("d4");
        should(my_pgn.sanWithNags(my_pgn.getMove(3))).equal("exd4");
    })
})

describe("When working with different PGN beginnings and endings", function() {
    let my_pgn;

    it("should work with no moves at all", function() {
        my_pgn = pgnReader({pgn: ""});
        should(my_pgn.getMoves().length).equal(0);
    });

    it("should work with white's first   move only", function() {
        my_pgn = pgnReader({pgn: "1. e4"});
        should(my_pgn.getMoves().length).equal(1);
        should(my_pgn.getMoves()[0].notation.notation).equal("e4");
        should(my_pgn.getMoves()[0].moveNumber).equal(1);
    });

    it ("should work with black's first move only", function() {
        my_pgn = pgnReader({pgn: "1... e5", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"});
        should(my_pgn.getMoves().length).equal(1);
        should(my_pgn.getMoves()[0].notation.notation).equal("e5");
        should(my_pgn.getMoves()[0].turn).equal("b");
        should(my_pgn.getMoves()[0].moveNumber).equal(1);
    });

    it ("should work with white beginning and black ending", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. d4 exd4"});
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.getMoves()[0].notation.notation).equal("e4");
        should(my_pgn.getMoves()[0].turn).equal("w");
        should(my_pgn.getMoves()[0].moveNumber).equal(1);
        should(my_pgn.getMoves()[3].notation.notation).equal("exd4");
        should(my_pgn.getMoves()[3].turn).equal("b");
        //should(my_pgn.getMoves()[3].moveNumber).toBeUndefined();
    });

    it ("should work with black beginning and white ending", function() {
        my_pgn = pgnReader({pgn: "1... e5 2. d4 exd4 3. c3", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"});
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.getMoves()[0].notation.notation).equal("e5");
        should(my_pgn.getMoves()[0].turn).equal("b");
        should(my_pgn.getMoves()[0].moveNumber).equal(1);
        should(my_pgn.getMoves()[1].notation.notation).equal("d4");
        should(my_pgn.getMoves()[1].turn).equal("w");
        should(my_pgn.getMoves()[1].moveNumber).equal(2);
        should(my_pgn.getMoves()[2].notation.notation).equal("exd4");
        should(my_pgn.getMoves()[2].turn).equal("b");
        //should(my_pgn.getMoves()[2].moveNumber).toBeUndefined();
    })
});

describe("When using all kind of notation", function() {
    let my_pgn;
    it ("should know how to move all kind of figures", function() {
        my_pgn = pgnReader({pgn: "1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nf3 d5 5. O-O e6 6. Re1 "});
        should(my_pgn.getMoves().length).equal(11);
    });

    it ("should know different variants of strikes", function() {
        my_pgn = pgnReader({pgn: "1. e4 d5 2. exd5 Nc6 3. dxc6 bxc6"});
        should(my_pgn.getMoves().length).equal(6);
        should(my_pgn.getMoves()[2].notation.notation).equal("exd5");
    });

    it ("should know all special symbols normally needed (promotion, check, mate)", function() {
        my_pgn = pgnReader({pgn: "1. f3 e5 2. g4 Qh4#"});
        should(my_pgn.getMoves().length).equal(4);
        my_pgn = pgnReader({pgn: "1. e7 d2 2. e8=Q d1=R+", position: "5rk1/8/4P3/8/8/3p4/5R2/6K1 w - - 0 1"});
    })

    it ("should be robust with missing symbols (check)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7 Ke7 7. Nd5#"});
        should(my_pgn.getMoves().length).equal(13);
        //should(my_pgn.getMoves()[10].notation.notation).equal("Bxf7+");
        should(my_pgn.getMoves()[10].notation.check).equal('+');
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#");
    })

    it ("should be robust with missing symbols (mate)", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5"})
        should(my_pgn.getMoves().length).equal(13);
        should(my_pgn.getMoves()[12].notation.check).equal('#');
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#");
    })
});

describe("When reading PGN with headers", function() {
    let pgn_string = null
    let pgn_string2 = null
    let my_pgn = null
    let my_pgn2 = null
    beforeEach(function() {
        pgn_string = ['[Event "Casual Game"]',
            '[Site "Berlin GER"]',
            '[Date "1852.12.31"]',
            '[Round "1"]',
            '[Result "1-0"]',
            '[White "Adolf Anderssen"]',
            '[Black "Jean Dufresne"]',
            '[SetUp "0"]',
            '1. e4 e5 2. Nf3 Nc6'];
        pgn_string2 = ['[SetUp "1"]', '[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]', '*'];
        my_pgn = pgnReader({pgn: pgn_string.join(" ")});
        my_pgn2 = pgnReader({pgn: pgn_string2.join(" ")});
    });

    it("should have these headers read", function() {
        should(my_pgn.getTags().size).equal(9);
        should(my_pgn.getTags().get("Site")).equal("Berlin GER");
        should(my_pgn.getTags().get("Date").value).equal("1852.12.31");
        should(my_pgn.getTags().get("SetUp")).equal("0");
        should(my_pgn.configuration.position).equal("start");
    });

    it("should have header mapped to FEN", function() {
        should(my_pgn2.getTags().size).equal(3);
        should(my_pgn2.getTags().get("SetUp")).equal("1");
        should(my_pgn2.configuration.position).equal("8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57");
    });

    it("should accept variations of case in header", function() {
        let pgn = pgnReader({pgn: '[Setup "1"] [fen "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *'});
        should(pgn.getTags().size).equal(3);
        should(pgn.getTags().get("SetUp")).equal("1");
        should(pgn.configuration.position).equal("8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57");
    })

    it("should understand unknown tags and record them", function () {
        let pgn = pgnReader({pgn: '[PuzzleCategory "Material"] [PuzzleEngine "Stockfish 13"] ' +
                '[PuzzleMakerVersion "0.5"] [PuzzleWinner "White"] *'})
        let tags = pgn.getTags()
        should(tags.size).equal(5)
        should(tags.get("PuzzleCategory")).equal("Material")
        should(tags.get("PuzzleEngine")).equal("Stockfish 13")
        should(tags.get("PuzzleMakerVersion")).equal("0.5")
        should(tags.get("PuzzleWinner")).equal("White")
    })

    it("should read unusual spacing of tags", function () {
        let pgn = pgnReader({pgn: '[  White    "Me"   ]  [  Black  "Magnus"   ] 1. e4'})
        should.exist(pgn)
        let tags = pgn.getTags()
        should.exist(tags)
        should(tags.get('White')).equal("Me")

    })
});

describe("When reading pgn with wrong headers", function() {
    beforeEach(function() {
        let pgn_string = ['["Event" "Casual Game"]',
            '["Site" "Berlin GER"]',
            '["Date" "1852.??.??"]',
            '["EventDate" "?"]',
            '["Round" "?"]',
            '["Result" "1-0"]',
            '["White" "Adolf Anderssen"]',
            '["Black" "Jean Dufresne"]',
            '[a "Hallo"]',
            '[b "Hallo"]',
            '1. e2 e4 2. Nf3 Nc6'];
        let my_pgn = pgnReader({pgn: pgn_string.join(" ")});
    });
    xit("should ignore wrong headers", function() { // is now a syntax error, not ignored
        let h = my_pgn.getTags();
        should.not.exist(h.get("a"));  // Because that is not an allowed key
    });
});

describe("When reading PGN with comments", function() {
    let my_pgn;
    it("should read all sorts of comments", function() {
        my_pgn = pgnReader({pgn: "{Before move} 1. e4 {After move} {[%csl Ya4, Gb4]}"});
        let first = my_pgn.getMove(0);
        should(my_pgn.getGameComment()).equal("Before move");
        should(first.commentAfter).equal("After move");
        should(first.commentDiag.colorFields.length).equal(2);
    });
    it ("should understand format of diagram circles", function() {
        my_pgn = pgnReader({pgn: "1. e4 {[%csl Ya4, Gb4,Rc4]}"});
        let first = my_pgn.getMove(0);
        should(first.commentDiag.colorFields.length).equal(3);
        should(first.commentDiag.colorFields[0]).equal("Ya4");
        should(first.commentDiag.colorFields[1]).equal("Gb4");
        should(first.commentDiag.colorFields[2]).equal("Rc4");
    })
    it ("should understand format of diagram arrows", function() {
        my_pgn = pgnReader({pgn: "1. e4 {[%cal Ya4b2, Gb4h8,Rc4c8]}"});
        let first = my_pgn.getMove(0);
        should(first.commentDiag.colorArrows.length).equal(3);
        should(first.commentDiag.colorArrows[0]).equal("Ya4b2");
        should(first.commentDiag.colorArrows[1]).equal("Gb4h8");
        should(first.commentDiag.colorArrows[2]).equal("Rc4c8");
    })
    it ("should understand both circles and arrows", function() {
        my_pgn = pgnReader({pgn: "e4 {[%csl Yf4,Gg5,Gd4,Rc4,Bb4,Ya4][%cal Gg1f3,Rf1c4,Gh2h4,Rg2g4,Bf2f4,Ye2e4]}"});
        let first = my_pgn.getMove(0);
        should(first.commentDiag.colorArrows.length).equal(6);
        should(first.commentDiag.colorFields.length).equal(6);
    })
    it("should ignore empty comments #211", function () {
        my_pgn = pgnReader({pgn: "e4 { [%csl Gf6] }"})
        let move = my_pgn.getMove(0)
        should.exist(move)
        should(move.commentDiag.colorFields.length).equal(1)
        should(move.commentDiag.colorFields[0]).equal("Gf6")
        should(move.commentAfter).undefined()
    })
});

describe("When reading PGN with variations", function() {
    let my_pgn;

    it("should understand one variation for white", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) exf4"});
        should(my_pgn.getMove(0).variations.length).equal(0);
        should(my_pgn.getMove(1).variations.length).equal(0);
        should(my_pgn.getMove(2).variations.length).equal(1);
        should(my_pgn.getMove(3).variations.length).equal(0);
        should(my_pgn.getMove(2).variations[0].notation.notation).equal("Nf3");
        should(my_pgn.getMove(my_pgn.getMove(2).variations[0].next).notation.notation).equal("Nc6");
        should(my_pgn.getMove(3).prev).equal(1);
        should(my_pgn.getMove(1).next).equal(2);
        should(my_pgn.getMove(3).next).equal(4);
        should(my_pgn.getMove(4).prev).equal(3);
        should(my_pgn.getMove(5).prev).equal(2);
    });

    it("should understand one variation for black with move number", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 (1... d5 2. exd5 Qxd5)"});
        should(my_pgn.getMove(1).variations.length).equal(1);
        should(my_pgn.getMove(0).variations.length).equal(0);
        should(my_pgn.getMove(1).variations[0].notation.notation).equal("d5");
        should(my_pgn.getMove(2).prev).equal(0);
        should(my_pgn.getMove(3).prev).equal(2);
    });

    it("should understand all variations for black and white with different move number formats", function () {
        my_pgn = pgnReader({pgn: "1. e4 (1... c4?) e5 (1... d5 2 exd5 2... Qxd5)"});
        should(my_pgn.getMove(0).variations.length).equal(1);
        should(my_pgn.getMove(1).variations.length).equal(0);
        should(my_pgn.getMove(2).variations[0].notation.notation).equal("d5");
        should(my_pgn.getMove(3).prev).equal(0);
        should(my_pgn.getMove(4).prev).equal(3);
    });

    it("should understand one variation for black without move number", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5)"});
        should(my_pgn.getMove(1).variations.length).equal(1);
        should(my_pgn.getMove(0).variations.length).equal(0);
        should(my_pgn.getMove(1).variations[0].notation.notation).equal("d5");
        should(my_pgn.getMove(2).prev).equal(0);
        should(my_pgn.getMove(3).prev).equal(2);
    });

    it("should understand nested variations", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5 (2... Nf6))"});
        should(my_pgn.getMove(1).variations[0].notation.notation).equal("d5");
        should(my_pgn.getMove(4).variations.length).equal(1);
        should(my_pgn.getMove(4).variations[0].notation.notation).equal("Nf6");
        should(my_pgn.getMove(2).prev).equal(0);
        should(my_pgn.getMove(5).prev).equal(3);
    });

    it ("should know how to handle variation of the first move", function () {
        my_pgn = pgnReader({pgn: "1. e4 ( 1. d4 d5 ) e5"});
        should(my_pgn.getMove(1).prev).equal(undefined);
        should(my_pgn.getMove(my_pgn.getMove(0).next).notation.notation).equal("e5");
        should(my_pgn.getMove(my_pgn.getMove(1).next).notation.notation).equal("d5");
    })

    it ("should know about variations in syntax for variants", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 )"});
        should(my_pgn.getMove(1).variations[0].notation.notation).equal("d5");
    })

    it ("should know about variations in syntax for variants including results", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 ) 1-0"});
        should(my_pgn.getMove(1).variations[0].notation.notation).equal("d5");
    })
});

describe("When reading variations with comments", function() {
    let my_pgn;

    it("should understand game comment and after comment in principle", function() {
        my_pgn = pgnReader({pgn: "{START} 1. d4 {AFTER} e5"});
        let move = my_pgn.getMove(0);
        should(my_pgn.getGameComment()).equal("START");
        should(move.commentAfter).equal("AFTER");
        should(move.notation.notation).equal("d4");
    });

    it("should understand comments for variation with white", function() {
        my_pgn = pgnReader({pgn: "1. d4 ({START} 1. e4 {AFTER} e5) 1... d5"});
        let var_first = my_pgn.getMove(0).variations[0];
        should(var_first.commentMove).equal("START");
        should(var_first.commentAfter).equal("AFTER");
        should(var_first.notation.notation).equal("e4");
    })
});

describe("When iterating over moves", function() {
    let moves;
    beforeEach(function () {
        moves = [];
    });
    let flatMoves = function (pgn) {
        let my_pgn = pgnReader({pgn: pgn});
        moves = my_pgn.getMoves();
    };
    it("should find the main line", function () {
        flatMoves("1. e4 e5");
        should(moves.length).equal(2);
        should(moves[0].notation.notation).equal("e4");
        should(moves[1].notation.notation).equal("e5");
    });

    it("should find the first variation", function () {
        flatMoves("1. e4 e5 (1... d5)");
        should(moves.length).equal(3);
        should(moves[0].notation.notation).equal("e4");
        should(moves[2].notation.notation).equal("d5");
    });

    it("should find all variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. d4 (2. Nf3 Nc6)");
        should(moves.length).equal(6);
        should(moves[0].notation.notation).equal("e4");
        should(moves[2].notation.notation).equal("d5");
        should(moves[3].notation.notation).equal("d4");
        should(moves[4].notation.notation).equal("Nf3");
    });

    it("should find nested variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. Nf3 Nc6 (2... d6 3. d4 (3. Be2)) 3. Bb5");
        should(moves.length).equal(9);
        should(moves[0].notation.notation).equal("e4");
        should(moves[1].notation.notation).equal("e5");
        should(moves[2].notation.notation).equal("d5");
        should(moves[4].notation.notation).equal("Nc6");
        should(moves[5].notation.notation).equal("d6");
        should(moves[6].notation.notation).equal("d4");
        should(moves[7].notation.notation).equal("Be2");
        should(moves[8].notation.notation).equal("Bb5");
    });

    it ("should find follow-ups of nested variations", function() {
        flatMoves("1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5) 3. Nf3 {is hot}) 2... Nc6");
        should(moves.length).equal(8);
        should(moves[5].prev).equal(3);
        should.not.exist(moves[5].next);
        should(moves[6].prev).equal(4);
        should.not.exist(moves[6].next);
        should(moves[7].prev).equal(2);
        should.not.exist(moves[7].next);

    });

    it("should know its indices", function () {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4");
        for (let i = 0; i < moves.length; i++) {
            should(moves[i].index).equal(i);
        }
    });

    it ("should know its previous and next move", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4");
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should(moves[1].next).equal(4);
        should(moves[2].prev).equal(0);
        should(moves[2].next).equal(3);
        should(moves[3].prev).equal(2);
        should.not.exist(moves[3].next);
        should(moves[4].prev).equal(1);
        should.not.exist(moves[4].next);
    });

    it ("should know its previous and next move with 2 variations", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) (1... c5) 2. d4");
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should(moves[1].next).equal(5);
        should(moves[2].prev).equal(0);
        should(moves[2].next).equal(3);
        should(moves[3].prev).equal(2);
        should.not.exist(moves[3].next);
        should(moves[4].prev).equal(0);
        should.not.exist(moves[4].next);
        should(moves[5].prev).equal(1);
        should.not.exist(moves[5].next);
    });

    it ("should read complete games", function() {
        flatMoves("1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. Nf3 Nc6 6. exd6 cxd6 7. Nc3 g6 8. Nd5 {ein grober Fehler, der sofort einen Bauern verliert} Nxd5 9. cxd5 Qa5+ 10. Bd2 Qxd5 11. Qa4 Bg7 12. Bc4 {Weiß stellt sich immer schlechter} Qe4+ 13. Be3 d5 14. Bb5 {sieht nach Bauernrückgewinn aus} O-O 15. Bxc6 bxc6 16. Qxc6 {der Bauer ist vergiftet} Bg4 17. O-O (17. Nh4 Qd3 18. Nf3 (18. f3 Qxe3+) 18... Rac8 19. Qa4 Bxf3 20. gxf3 Rc2 {kostet die Dame}) 17... Bxf3 18. gxf3 Qxf3 {ist noch am Besten für Weiß} 19. Qd7 e6 20. Rfc1 Bxd4 21. Bxd4 Qg4+ { kostet den zweiten Bauern} 22. Kf1 Qxd4 23. b3 Rfd8 24. Qb7 e5 25. Rd1 Qb6 26.  Qe7 Qd6 {jeder Abtausch hilft} 27. Qxd6 Rxd6 28. Rd2 Rc8 29. Re1 f6 30. Red1 d4 31. f4 Kf7 32. fxe5 fxe5 33. Ke2 Ke6 34. a4 Rc3 35. Rd3 Rxd3 36. Kxd3 Rc6 37.  Rb1 Rc3+ 38. Kd2 Rh3 39. b4 Kd5 40. a5 Rxh2+ 41. Kc1 Kc4 {und Weiß hat nichts mehr} 42. Rb2 Rxb2 43. Kxb2 Kxb4 {höchste Zeit, aufzugeben} 44. Kc2 e4 45. Kd2 Kb3 46. a6 Kb2 47. Ke2 Kc2 48. Ke1 d3 49. Kf2 d2 50. Kg3 d1=Q 51. Kf4 Qd5 52.  Kg3 Qe5+ 53. Kf2 Kd2 54. Kg2 Ke2 55. Kh3 Kf2 56. Kg4 Qg3#");
        should.not.exist(moves[0].prev);
    })
});

describe("Default a new read algorithm for PGN", function() {
    let my_pgn;
    it ("should read the main line", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3"});
        let moves = my_pgn.getMoves();
        should(moves.length).equal(3);
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should(moves[1].next).equal(2);
        should(moves[2].prev).equal(1);
        should.not.exist(moves[2].next);
    });

    it ("should read one variation for black", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 (1... d5 2. Nf3)"});
        let moves = my_pgn.getMoves();
        should(moves.length).equal(4);
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should.not.exist(moves[1].next);
        should(moves[2].prev).equal(0);
        should(moves[2].next).equal(3);
        should(moves[3].prev).equal(2);
        should.not.exist(moves[3].next);
    });

    it ("should read one variation for white", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6)"});
        let moves = my_pgn.getMoves();
        should(moves.length).equal(5);
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should(moves[1].next).equal(2);
        should(moves[2].prev).equal(1);
        should.not.exist(moves[2].next);
        should(moves[3].prev).equal(1);
        should(moves[3].next).equal(4);
        should(moves[4].prev).equal(3);
        should.not.exist(moves[4].next);
    });

    it ("should read one variation for white with move after", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) 2... exf4 3. Nf3"});
        
        let moves = my_pgn.getMoves();
        should(moves.length).equal(7);
        should.not.exist(moves[0].prev);
        should(moves[0].next).equal(1);
        should(moves[1].prev).equal(0);
        should(moves[1].next).equal(2);
        should(moves[2].prev).equal(1);
        should(moves[2].next).equal(5);
        should(moves[3].prev).equal(1);
        should(moves[3].next).equal(4);
        should(moves[4].prev).equal(3);
        should.not.exist(moves[4].next);
        should(moves[5].prev).equal(2);
        should(moves[5].next).equal(6);
        should(moves[6].prev).equal(5);
        should.not.exist(moves[6].next);
    })
});

describe("Additional notations like", function() {
    it("should read all notation symbols in the standard notation", function() {
        let my_pgn = pgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"});
        let moves = my_pgn.getMoves();
        should(moves.length).equal(6);
        should(moves[0].nag).deepEqual(["$1"]);
        should(moves[1].nag).deepEqual(["$2"]);
        should(moves[2].nag).deepEqual(["$3"]);
        should(moves[3].nag).deepEqual(["$4"]);
        should(moves[4].nag).deepEqual(["$6"]);
        should(moves[5].nag).deepEqual(["$5"]);
    })
});

describe("Writing PGN like", function() {
    xit("should write an empty PGN string", function() {
        let my_pgn = pgnReader({pgn: ""});
        let res = my_pgn.writePgn();
        should(res).equal("");
    });

    it("should write the normalized notation of the main line with only one move", function() {
        let my_pgn = pgnReader({pgn: "1. e4"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4");
    });

    it("should write the normalized notation of the main line", function() {
        let my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 2. Nf3 Nc6 3. Bb5");
    });

    it("should write the notation for a main line including comments", function () {
        let my_pgn = pgnReader({pgn: "{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5"});
        let res = my_pgn.writePgn();
        should(res).equal("{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5");
    });

    it("should write all NAGs in their known parts", function () {
        let my_pgn = pgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$6 a6$5");
    });

    it("should write the notation for a main line with one variation", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3");
    });

    it("should write the notation for a main line with several variations", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3");
    });

    it("should write the notation for a main line with stacked variations", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4) 3. d4 ) 2. Nf3"});
        let res = my_pgn.writePgn();
        should(res).equal("1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4 ) 3. d4 ) 2. Nf3");
    });
    it("should write the end of the game", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 0-1"});
        should(my_pgn.writePgn()).equal("1. e4 e5 0-1");
    });
    it("should write the end of the game, understand all results: 1-0", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 1-0"});
        should(my_pgn.writePgn()).equal("1. e4 e5 1-0");
    });
    it("should write the end of the game, understand all results: *", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 *"});
        should(my_pgn.writePgn()).equal("1. e4 e5 *");
    });
    it("should write the end of the game, understand all results: 1/2-1/2", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5 1/2-1/2"});
        should(my_pgn.writePgn()).equal("1. e4 e5 1/2-1/2");
    });
    it("should write the end of the game as part of tags", function () {
        let my_pgn = pgnReader({pgn: '[Result "0-1"] 1. e4 e5'});
        should(my_pgn.writePgn()).equal("1. e4 e5 0-1");
    });
    it("should write the end of the game as part of tags, understand all results: *", function () {
        let my_pgn = pgnReader({pgn: '[Result "*"] 1. e4 e5'});
        should(my_pgn.writePgn()).equal("1. e4 e5 *");
    });
    it("should write the end of the game as part of tags, understand all results: 1/2-1/2", function () {
        let my_pgn = pgnReader({pgn: '[Result "1/2-1/2"] 1. e4 e5'});
        should(my_pgn.writePgn()).equal("1. e4 e5 1/2-1/2");
    });
    it("should write the end of the game as part of tags, understand all results: 1-0", function () {
        let my_pgn = pgnReader({pgn: '[Result "1-0"] 1. e4 e5'});
        should(my_pgn.writePgn()).equal("1. e4 e5 1-0");
    });
    it("should write promotion correct", function () {
        let my_pgn = pgnReader({position: '8/6P1/8/2k5/8/8/8/7K w - - 0 1', pgn: '1. g8=R'});
        should(my_pgn.writePgn()).equal("1. g8=R");
    });
});

describe("When reading a PGN game", function () {
    it ("should have the fen stored with each move", function () {
        let my_pgn = pgnReader({pgn: "1. d4 e5"});
        should(my_pgn.getMoves().length).equal(2);
        should.exist(my_pgn.getMoves()[0].fen);
        should.exist(my_pgn.getMoves()[1].fen);
    });
});

describe("When making moves in PGN", function() {
    let empty, my_pgn;
    beforeEach(function () {
        my_pgn = pgnReader({pgn: "1. d4 e5"});
        empty = pgnReader({pgn: "*"});
    });

    it("should have no moves with an empty PGN string", function () {
        should(empty.getMoves().length).equal(0);
    });

    it("should write a move on the initial position", function () {
        empty.addMove("e4", null);
        should(empty.getMoves().length).equal(1);
        should(empty.getMove(0).notation.notation).equal("e4");
    });

    it("should write a move in the position with white on turn", function () {
        my_pgn.addMove("e4", 1);
        should(my_pgn.getMoves().length).equal(3);
        should(my_pgn.getMove(2).turn).equal("w");
    });

    it("should write a move in the position with black on turn", function () {
        my_pgn = pgnReader({pgn: "1. d4 e5 2. e4"});
        my_pgn.addMove("exd4", 2);
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.getMove(3).turn).equal("b");
    });

    it("should use the existing move in the main line", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("Nf3", 1);
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.getMove(2).turn).equal("w");
        should(my_pgn.getMove(2).notation.notation).equal("Nf3");
    });

    it("should start new variation in the middle of the main line", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("f4", 1);
        should(my_pgn.getMoves().length).equal(5);
        should(my_pgn.getMove(4).turn).equal("w");
        should(my_pgn.getMove(4).notation.notation).equal("f4");
        should(my_pgn.getMove(2).variations.length).equal(1);
        should(my_pgn.getMove(2).variations[0].notation.notation).equal("f4");
    });

    it("should start a second variation in the middle of the main line, when the current move has already a variation", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("f4", 1); // first variation
        my_pgn.addMove("d4", 1); // second variation to the same FEN
        should(my_pgn.getMoves().length).equal(6);
        should(my_pgn.getMove(5).turn).equal("w");
        should(my_pgn.getMove(5).notation.notation).equal("d4");
        should(my_pgn.getMove(2).variations.length).equal(2);
        should(my_pgn.getMove(2).variations[0].notation.notation).equal("f4");
        should(my_pgn.getMove(2).variations[1].notation.notation).equal("d4");
    });

    it("should use the existing move in the variation", function () {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"});
        my_pgn.addMove("Nf3", 1); // first main line
        my_pgn.addMove("Nc6", 2); // second main line
        should(my_pgn.getMoves().length).equal(4);
        should(my_pgn.getMove(2).turn).equal("w");
        should(my_pgn.getMove(2).notation.notation).equal("Nf3");
        should(my_pgn.getMove(3).turn).equal("b");
        should(my_pgn.getMove(3).notation.notation).equal("Nc6");
    });

    it("should know how to  notate castling", function() {
        my_pgn = pgnReader({pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5"});
        my_pgn.addMove("O-O", 5);
        should(my_pgn.getMoves().length).equal(7);
        should(my_pgn.getMove(6).turn).equal("w");
        should(my_pgn.getMove(6).notation.notation).equal("O-O");
        my_pgn.addMove("O-O", 6);
        should(my_pgn.getMoves().length).equal(8);
        should(my_pgn.getMove(7).turn).equal("b");
        should(my_pgn.getMove(7).notation.notation).equal("O-O");
    })
});

describe("When deleting lines" , function () {
    it("should delete the whole main line", function() {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"});
        my_pgn.deleteMove(0);
        my_pgn.isDeleted(0).should.be.true();
    });

    it("should delete the rest of the line (without variation)", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"});
        my_pgn.deleteMove(2);
        should(my_pgn.isDeleted(0)).not.be.ok();
        should(my_pgn.isDeleted(1)).not.be.ok();
        my_pgn.isDeleted(2).should.be.true();
        my_pgn.isDeleted(3).should.be.true();
    });

    it("should delete the rest of the line, replace it by the first variation", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) Nc6"});
        should(my_pgn.getMove(3).variationLevel).equal(1);
        my_pgn.deleteMove(2);
        should(my_pgn.isDeleted(0)).not.be.ok();
        should(my_pgn.isDeleted(1)).not.be.ok();
        my_pgn.isDeleted(2).should.be.true();
        my_pgn.isDeleted(5).should.be.true();
        should(my_pgn.getMove(3).variationLevel).equal(0);
        should(my_pgn.getMove(4).variationLevel).equal(0);
        should(my_pgn.getMove(1).next).equal(3);
    });

    it("should delete the whole variation with the first move", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) (2. d4 exd4) Nc6"});
        should(my_pgn.getMove(3).variationLevel).equal(1);
        my_pgn.deleteMove(3);
        should(my_pgn.isDeleted(0)).not.be.ok();
        should(my_pgn.isDeleted(1)).not.be.ok();
        should(my_pgn.isDeleted(2)).not.be.ok();
        my_pgn.isDeleted(3).should.be.true();
        my_pgn.isDeleted(4).should.be.true();
        should(my_pgn.getMove(2).variationLevel).equal(0);
        should(my_pgn.getMove(5).variationLevel).equal(1);
        should(my_pgn.getMove(6).variationLevel).equal(1);
    });

    it("should delete the rest of a variation (including the move)", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4 3. Nf3 d6) (2. d4 exd4) Nc6"});
        should(my_pgn.getMove(3).variationLevel).equal(1);
        my_pgn.deleteMove(4);
        should(my_pgn.isDeleted(3)).not.be.ok();
        my_pgn.isDeleted(4).should.be.true();
    });

    it("should delete the moves before (without the move)", function () {
        let my_pgn = pgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"});
        my_pgn.deleteMovesBefore(0);
        should(my_pgn.getMoves().length).equal(4);
        my_pgn.deleteMovesBefore(1);
        should(my_pgn.getMoves().length).equal(4);
        my_pgn.isDeleted(0).should.be.true();
    });

});

describe("When upvoting lines", function () {
    let pgn = "1. e4 e5 2. Nf3 (2. f4 exf4) (2. d4 exd4)"
    let pgn2 = "e4 (d4 d5) (c4 c5) e5"

    it("should upvote the second line as first line", function () {
        let my_pgn = pgnReader({pgn: pgn})
        should(my_pgn.getMove(3).variationLevel).equal(1)
        should(my_pgn.getMove(2).variations[0].index).equal(3)
        should(my_pgn.getMove(2).variations[1].index).equal(5)
        my_pgn.promoteMove(5)
        should(my_pgn.getMove(2).variations[0].index).equal(5)
        should(my_pgn.getMove(2).variations[1].index).equal(3)
    })

    it("should upvote the first line as main line", function () {
        let my_pgn = pgnReader({pgn: pgn});
        should(my_pgn.getMove(3).variationLevel).equal(1);
        should(my_pgn.getMove(2).variations[0].index).equal(3);
        should(my_pgn.getMove(2).variations[1].index).equal(5);
        my_pgn.promoteMove(3);
        my_pgn.startVariation(my_pgn.getMove(2)).should.be.true();
        should(my_pgn.getMove(2).variationLevel).equal(1);
        should(my_pgn.getMove(3).variationLevel).equal(0);
    });

    it("should ignore upvoting the main line", function () {
        let my_pgn = pgnReader({pgn: pgn});
        should(my_pgn.getMove(3).variationLevel).equal(1);
        should(my_pgn.getMove(2).variations[0].index).equal(3);
        should(my_pgn.getMove(2).variations[1].index).equal(5);
        my_pgn.promoteMove(2);
        should(my_pgn.getMove(2).variations[0].index).equal(3);
        should(my_pgn.getMove(2).variations[1].index).equal(5);
    })

    it("should handle first move variations, upvote first line", function () {
        let my_pgn = pgnReader({pgn: pgn2})
        should(my_pgn.getMoves().length).equal(6)
        my_pgn.promoteMove(1)
        should(my_pgn.getMove(1).variationLevel).equal(0)
        should(my_pgn.getMove(1).variations[0].index).equal(0)
        should(my_pgn.getMove(0).variationLevel).equal(1)
    })

    it("should handle first move variations, upvote second line", function () {
        let my_pgn = pgnReader({pgn: pgn2})
        should(my_pgn.getMoves().length).equal(6)
        my_pgn.promoteMove(3)
        should(my_pgn.getMove(3).variationLevel).equal(1)
        should(my_pgn.getMove(0).variations[0].index).equal(3)
        should(my_pgn.getMove(0).variationLevel).equal(0)
    })

    it("should handle non-first move variations, upvote of any line", function () {
        let my_pgn = pgnReader({pgn: pgn2})
        should(my_pgn.getMoves().length).equal(6)
        my_pgn.promoteMove(2)
        should(my_pgn.getMove(1).variationLevel).equal(0)
        should(my_pgn.getMove(1).variations[0].index).equal(0)
        should(my_pgn.getMove(0).variationLevel).equal(1)
    })

    it("should handle non-first move variations, upvote of any line 2", function () {
        let my_pgn = pgnReader({pgn: pgn})
        should(my_pgn.getMoves().length).equal(7)
        my_pgn.promoteMove(4)
        should(my_pgn.getMove(3).variationLevel).equal(0)
        should(my_pgn.getMove(3).variations[0].index).equal(2)
        should(my_pgn.getMove(2).variationLevel).equal(1)
        should(my_pgn.getMove(0).variationLevel).equal(0)
    })

});

describe("When working with NAGs", function () {
    let my_pgn;
    beforeEach(function () {
        my_pgn = pgnReader({pgn: "1. d4 e5"});
    });

    it ("should add selected NAG as first when empty", function () {
        my_pgn.changeNag("??", 1, true);
        should(my_pgn.getMove(1).nag[0]).equal("$4");
        my_pgn.changeNag("!!", 0, true);
        should(my_pgn.getMove(0).nag[0]).equal("$3");
    });

    it("should add selected NAG as last when already some", function () {
        my_pgn.changeNag("??", 1, true);
        my_pgn.changeNag("!!", 1, true);
        should(my_pgn.getMove(1).nag[1]).equal("$3");
        should(my_pgn.getMove(1).nag[0]).equal("$4");
    });

    it("should clear all NAGs", function () {
        my_pgn.changeNag("??", 1, true);
        should(my_pgn.getMove(1).nag[0]).equal("$4");
        my_pgn.clearNags(1);
        should(my_pgn.getMove(1).nag.length).equal(0);
    });

    it("should ignore clear when no NAGs", function () {
        my_pgn.clearNags(1);
        should(my_pgn.getMove(1).nag.length).equal(0);
        my_pgn.clearNags(1);
        should(my_pgn.getMove(1).nag.length).equal(0);
    });
});

describe("Working with games with special characters", function () {
    it("should ignore 1 space at beginning and end", function () {
        let my_pgn = pgnReader({pgn: " 1. d4 e5"})
        should(my_pgn.getMoves().length).equal(2)
    })

    it("should ignore more spaces at beginning and end", function () {
        let my_pgn = pgnReader({pgn: "     1. d4 e5"})
        should(my_pgn.getMoves().length).equal(2)
    })

    it("should understand a complex example from generated WP site", function () {
        let my_pgn = pgnReader({ pgn: '  1. e4 e5 2. Nf3 Nc6 3. Bb5 ', position: 'start', orientation: 'white',
            pieceStyle: 'merida', theme: 'zeit', boardSize: '', width: '', locale: 'en_US',
            showNotation: true, layout: '', movesHeight: '', colorMarker: '', showResult: '',
            coordsInner: '1', coordsFactor: '1', startPlay: '', headers: '1'})
        should(my_pgn.getMoves().length).equal(5)
    })
})

describe("should handle errors in PGN by throwing errors", function () {
    it("should read wrong chess moves in PGN by matching", function () {
        // try {
        //     pgnReader({pgn: 'd5'}).load_pgn()
        // } catch (err) {
        //     should.exist(err)
        // }
        (function () { pgnReader({pgn: 'd5'}).load_pgn() } ).should.throw('No legal move: d5')
    })
    it("should read syntactically wrong PGN by throwing SyntaxError", function () {

        (function() {pgnReader({pgn: 'ddd3'}).load_pgn()}).should.throw('Expected [1-8] but "d" found.')
    })
})

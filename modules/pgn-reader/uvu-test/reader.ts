import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import {PgnReader, Shape} from '../src';
import {readFile} from "../lib/fetch";
import {PgnReaderMove} from "@mliebelt/pgn-types";

const reader = suite('Base functionality of the reader without any configuration');

reader('should be able to read a main line', () => {
    const pgn = 'e4 e5 Nf3 Nc6';
    const reader = new PgnReader({pgn});

    assert.is(reader.getMoves().length, 4);
    assert.is(reader.writePgn(), '1. e4 e5 2. Nf3 Nc6');
});

reader('should be able to read a main line with one variant', () => {
    const pgn = 'e4 e5 Nf3 Nc6 (Nf6 d4 exd4)';
    const reader = new PgnReader({pgn});

    assert.is(reader.getMoves().length, 7);
    assert.is(reader.writePgn(), '1. e4 e5 2. Nf3 Nc6 ( 2... Nf6 3. d4 exd4 )');

    const move = reader.findMove('Nf6');
    assert.ok(move);

    assert.is(move.moveNumber, 2);
    assert.is(move.turn, 'b');
    assert.is(move.notation.notation, 'Nf6');
    assert.is(move.variationLevel, 1);

    const prev = reader.getMove(move.prev);
    assert.is(prev.moveNumber, 2);
    // assert.is(reader.san(prev), 'Nf3');
    assert.is(prev.turn, 'w');
});

reader('should be able to read a main line with many variants on different levels', () => {
    const pgn = 'e4 (d4 d5)(c4) e5 Nf3 (f4 d5 (Nc6))';
    const reader = new PgnReader({pgn});

    assert.is(reader.getMoves().length, 9);
    assert.is(reader.getMove(0).variations.length, 2);

    const m3 = reader.getMove(3);
    assert.is(m3.variations.length, 0);
    // expect(reader.startVariation(m3)).to.be.true;
    // expect(reader.endVariation(m3)).to.be.true;

    const m8 = reader.getMove(8);
    assert.is(m8.variationLevel, 2);

    const prev8 = reader.getMove(m8.prev);
    assert.is(prev8.variationLevel, 1);
});

reader('should understand game comment and after comment in principle', () => {
    const pgn = '{START} 1. d4 {AFTER} e5';
    const reader = new PgnReader({pgn});

    const move = reader.getMove(0);
    assert.is(reader.getGameComment().comment, 'START');
    assert.is(move.commentAfter, 'AFTER');
    assert.is(move.notation.notation, 'd4');
});

reader('should emmit an error when reading many games with `manyGames == true`', () => {
    assert.throws(() => {
        new PgnReader({pgn: 'e4 e5 *\n\nd4 d5 *'});
    }, 'Expected end of input or whitespace but &quot;d&quot; found.');
});

reader('should ensure that lazyLoad works', () => {
    const reader = new PgnReader({lazyLoad: true, manyGames: true, pgn: "e4 e5 *\n\nd4 d5"});

    assert.ok(reader);
    assert.equal(reader.getMoves(), []);
    assert.equal(reader.getGames(), undefined);

    reader.loadPgn();

    assert.is(reader.getGames().length, 2);
    assert.is(reader.getMoves().length, 2);
    assert.is(reader.getMove(0).notation.notation, 'e4');
});

reader('should ensure that pgnFile works (workaround)', () => {
    const content = readFile('test/2games.pgn');
    const reader = new PgnReader({pgn: content, manyGames: true});

    assert.is(reader.getGames().length, 2);
});

reader('should ensure that error is thrown if file is not found / could not be read (workaround)', () => {
    assert.throws(() => {
        readFile('2games-missing.pgn')
    }, 'File not found or could not read: 2games-missing.pgn');
});

reader('should ensure that startPlay works', () => {
    const reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6', startPlay: 3, hideMovesBefore: false});

    assert.is(reader.getMoves().length, 4);
    assert.is(reader.getMove(0).notation.notation, 'e4');
});

reader.run();

const formats = suite('When reading various formats');

formats('should read and remember disambiguator', () => {
    const reader = new PgnReader({
        pgn: '4. dxe5',
        position: 'rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4'
    });

    assert.equal(reader.getMoves()[0].notation.disc, 'd');
});

formats('should use disambiguator on output', () => {
    const reader = new PgnReader({
        pgn: '4. dxe5',
        position: 'rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4'
    });

    assert.equal(reader.sanWithNags(reader.getMove(0)), 'dxe5');
});

formats('should understand that Long Algebraic Notation can be used when strike', () => {
    const reader = new PgnReader({
        pgn: '4... Nf6xe4',
        position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'
    });
    assert.equal(reader.sanWithNags(reader.getMove(0)), "Nxe4");
});

formats('should understand that Long Algebraic Notation can leave out strike symbol', () => {
    const reader = new PgnReader({pgn: '4... Nf6e4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'})
    assert.equal(reader.sanWithNags(reader.getMove(0)),"Nxe4")
})

formats('should understand that Long Algebraic Notation can be used when bishop', () => {
    const reader = new PgnReader({pgn: '1. e2-e4 e7-e5'})
    assert.equal(reader.sanWithNags(reader.getMove(0)),"e4")
    assert.equal(reader.sanWithNags(reader.getMove(1)),"e5")
})

formats('should understand that disambiguator is needed here', () => {
    const reader = new PgnReader({
        pgn: 'fxe5',
        position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 1 4'
    });

    assert.equal(reader.sanWithNags(reader.getMove(0)), "fxe5");
});

// xit ("should allow disambiguator that is not needed", function () {
//     reader = new PgnReader({pgn: 'Ngf3'})
//     should.equal(reader.sanWithNags(reader.getMove(0)),"Nf3")
// })
// TODO This is not possible at the moment, because chess.js does not allow notation that includes the pawn symbol.
// So if that should be implemented, the logic of reading the game has to be changed.
// xit ("should understand optional pawn symbols", function () {
//     reader = new PgnReader({pgn: '1. Pe4 Pe5 2. Pd4 Pexd4'})
//     should.equal(reader.getMoves().length,4)
//     should.equal(reader.sanWithNags(reader.getMove(0)),"e4")
//     should.equal(reader.sanWithNags(reader.getMove(1)),"e5")
//     should.equal(reader.sanWithNags(reader.getMove(2)),"d4")
//     should.equal(reader.sanWithNags(reader.getMove(3)),"exd4")
// })
// TODO Does not work either, some of them ok, some not. Reason seems to be, that chess.js does not allow all formats.
// Solution could be to try different formats, if the source notation does not work.
// xit("should understand different notations", function () {
//     reader = new PgnReader({pgn: 'Ng1f3'})  // works
//     should.equal(reader.getMoves().length,1)
//     reader = new PgnReader({pgn: 'Ng1-f3'}) // works
//     should.equal(reader.getMoves().length,1)
//     reader = new PgnReader({pgn: 'Nxf3'})
//     should.equal(reader.getMoves().length,1)
//     reader = new PgnReader({pgn: 'Ngf3'})
//     should.equal(reader.getMoves().length,1)
//     reader = new PgnReader({pgn: 'N1f3'})
//     should.equal(reader.getMoves().length,1)
// })

formats.run();

const beginningsEndings = suite('When working with different PGN beginnings and endings');

beginningsEndings('should work with no moves at all', () => {
    const reader = new PgnReader({pgn: ''});

    assert.equal(reader.getMoves().length, 0);
    assert.equal(reader.getGames().length, 1);
});

beginningsEndings('should work with white\'s first move only', () => {
    const reader = new PgnReader({pgn: '1. e4'});

    assert.equal(reader.getMoves().length, 1);
    assert.equal(reader.getMoves()[0].notation.notation, 'e4');
    assert.equal(reader.getMoves()[0].moveNumber, 1);
});

beginningsEndings('should work with black\'s first move only', () => {
    const reader = new PgnReader({
        pgn: '1... e5',
        position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    });

    assert.equal(reader.getMoves().length, 1);
    assert.equal(reader.getMoves()[0].notation.notation, 'e5');
    assert.equal(reader.getMoves()[0].turn, 'b');
    assert.equal(reader.getMoves()[0].moveNumber, 1);
});

beginningsEndings('should work with white beginning and black ending', () => {
    const reader = new PgnReader({pgn: '1. e4 e5 2. d4 exd4'});

    assert.equal(reader.getMoves().length, 4);
    assert.equal(reader.getMoves()[0].notation.notation, 'e4');
    assert.equal(reader.getMoves()[0].turn, 'w');
    assert.equal(reader.getMoves()[0].moveNumber, 1);
    assert.equal(reader.getMoves()[3].notation.notation, 'exd4');
    assert.equal(reader.getMoves()[3].turn, 'b');
});

beginningsEndings('should work with black beginning and white ending', () => {
    const reader = new PgnReader({
        pgn: '1... e5 2. d4 exd4 3. c3',
        position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    });

    assert.equal(reader.getMoves().length, 4);
    assert.equal(reader.getMoves()[0].notation.notation, 'e5');
    assert.equal(reader.getMoves()[0].turn, 'b');
    assert.equal(reader.getMoves()[0].moveNumber, 1);
    assert.equal(reader.getMoves()[1].notation.notation, 'd4');
    assert.equal(reader.getMoves()[1].turn, 'w');
    assert.equal(reader.getMoves()[1].moveNumber, 2);
    assert.equal(reader.getMoves()[2].notation.notation, 'exd4');
    assert.equal(reader.getMoves()[2].turn, 'b');
});

beginningsEndings.run();

const notation = suite('When using all kind of notation');

notation('should know how to move all kind of figures', () => {
    const reader = new PgnReader({
        pgn: '1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nf3 d5 5. O-O e6 6. Re1'
    });

    assert.equal(reader.getMoves().length, 11);
});

notation('should know different variants of strikes', () => {
    const reader = new PgnReader({
        pgn: '1. e4 d5 2. exd5 Nc6 3. dxc6 bxc6'
    });

    assert.equal(reader.getMoves().length, 6);
    assert.equal(reader.getMoves()[2].notation.notation, 'exd5');
});

notation('should know all special symbols normally needed (promotion, check, mate)', () => {
    let reader = new PgnReader({pgn: '1. f3 e5 2. g4 Qh4#'});
    assert.equal(reader.getMoves().length, 4);

    new PgnReader({
        pgn: '1. e7 d2 2. e8=Q d1=R+',
        position: '5rk1/8/4P3/8/8/3p4/5R2/6K1 w - - 0 1'
    });
});

notation('should be robust with missing symbols (check)', () => {
    const reader = new PgnReader({
        pgn: '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7 Ke7 7. Nd5#'
    });

    assert.equal(reader.getMoves().length, 13);
    assert.equal(reader.getMoves()[10].notation.check, '+');

    const res = reader.writePgn();
    assert.equal(res, '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#');
});

notation('should be robust with missing symbols (mate)', () => {
    const reader = new PgnReader({
        pgn: '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5'
    });

    assert.equal(reader.getMoves().length, 13);
    assert.equal(reader.getMoves()[12].notation.check, '#');

    const res = reader.writePgn();
    assert.equal(res, '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#');
});

notation.run();

const tags = suite('When reading pgn with tags');

tags.before(context => {
    context.pgn_string = ['[Event "Casual Game"]',
        '[Site "Berlin GER"]',
        '[Date "1852.12.31"]',
        '[Round "1"]',
        '[Result "1-0"]',
        '[White "Adolf Anderssen"]',
        '[Black "Jean Dufresne"]',
        '[SetUp "0"]',
        '1. e4 e5 2. Nf3 Nc6']
    context.pgn_string2 = ['[SetUp "1"]', '[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]', '*']
    context.reader = new PgnReader({pgn: context.pgn_string.join(" ")})
    context.reader2 = new PgnReader({pgn: context.pgn_string2.join(" ")})
})
tags('should have these tags read', context => {
    // test setup

    assert.equal(context.reader.getTags().size, 9);
    assert.equal(context.reader.getTags().get('Site'), 'Berlin GER');
    assert.equal(context.reader.getTags().get('Date').value, '1852.12.31');
    assert.equal(context.reader.getTags().get('SetUp'), '0');
    assert.equal(context.reader.configuration.position, 'start');
});

tags('should have tag mapped to FEN', context => {
    // test setup

    assert.equal(context.reader2.getTags().get('SetUp'), '1');
    assert.equal(context.reader2.configuration.position, '8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57');
});

tags('should accept variations of case in tags', () => {
    let pgn = new PgnReader({pgn: '[Setup "1"] [fen "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *'})
    assert.equal(pgn.getTags().get('SetUp'), '1');
    assert.equal(pgn.configuration.position, '8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57');
});

tags('should understand unknown tags and record them', () => {
    let pgn = new PgnReader({pgn: '[PuzzleCategory "Material"] [PuzzleEngine "Stockfish 13"] ' +
            '[PuzzleMakerVersion "0.5"] [PuzzleWinner "White"] *'})
    let tags = pgn.getTags()
    assert.equal(tags.get('PuzzleCategory'), 'Material');
    assert.equal(tags.get('PuzzleEngine'), 'Stockfish 13');
    assert.equal(tags.get('PuzzleMakerVersion'), '0.5');
    assert.equal(tags.get('PuzzleWinner'), 'White');
});

tags('should read unusual spacing of tags', () => {
    let pgn = new PgnReader({pgn: '[  White    "Me"   ]  [  Black  "Magnus"   ] 1. e4'})
    let tags = pgn.getTags()
    assert.equal(tags.get('White'), 'Me');
});

tags.run();

const variations = suite('When reading pgn with variations');

variations('should understand one variation for white', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) exf4"})
    assert.equal(reader.getMove(0).variations.length, 0);
    assert.equal(reader.getMove(1).variations.length, 0);
    assert.equal(reader.getMove(2).variations.length, 1);
    assert.equal(reader.getMove(3).variations.length, 0);
    assert.equal(reader.getMove(2).variations[0].notation.notation, "Nf3");
    assert.equal(reader.getMove(reader.getMove(2).variations[0].next).notation.notation,"Nc6")
    assert.equal(reader.getMove(3).prev,1)
    assert.equal(reader.getMove(1).next,2)
    assert.equal(reader.getMove(3).next,4)
    assert.equal(reader.getMove(4).prev,3)
    assert.equal(reader.getMove(5).prev,2)
});

variations('should understand one variation for black with move number', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5 Qxd5)"})
    assert.equal(reader.getMove(1).variations.length, 1);
    assert.equal(reader.getMove(0).variations.length, 0);
    assert.equal(reader.getMove(1).variations[0].notation.notation,"d5")
    assert.equal(reader.getMove(2).prev,0)
    assert.equal(reader.getMove(3).prev,2)
});

variations('should understand all variations for black and white with different move number formats', () => {
    const reader = new PgnReader({pgn: "1. e4 (1... c4?) e5 (1... d5 2 exd5 2... Qxd5)"})
    assert.equal(reader.getMove(0).variations.length,1)
    assert.equal(reader.getMove(1).variations.length,0)
    assert.equal(reader.getMove(2).variations[0].notation.notation,"d5")
    assert.equal(reader.getMove(3).prev,0)
    assert.equal(reader.getMove(4).prev,3)
})

variations('should understand one variation for black without move number', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5)"})
    assert.equal(reader.getMove(1).variations.length,1)
    assert.equal(reader.getMove(0).variations.length,0)
    assert.equal(reader.getMove(1).variations[0].notation.notation,"d5")
    assert.equal(reader.getMove(2).prev,0)
    assert.equal(reader.getMove(3).prev,2)
})

variations('should understand nested variations', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5 (2... Nf6))"})
    assert.equal(reader.getMove(1).variations[0].notation.notation,"d5")
    assert.equal(reader.getMove(4).variations.length,1)
    assert.equal(reader.getMove(4).variations[0].notation.notation,"Nf6")
    assert.equal(reader.getMove(2).prev,0)
    assert.equal(reader.getMove(5).prev,3)
})

variations('should know how to handle variation of the first move', () => {
    const reader = new PgnReader({pgn: "1. e4 ( 1. d4 d5 ) e5"})
    assert.equal(reader.getMove(1).prev,undefined)
    assert.equal(reader.getMove(reader.getMove(0).next).notation.notation,"e5")
    assert.equal(reader.getMove(reader.getMove(1).next).notation.notation,"d5")
})

variations('should know about variations in syntax for variants', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 )"})
    assert.equal(reader.getMove(1).variations[0].notation.notation,"d5")
})

variations('should know about variations in syntax for variants including results', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 ) 1-0"})
    assert.equal(reader.getMove(1).variations[0].notation.notation,"d5")
})
variations.run();

const iterating = suite('When iterating over moves');

iterating('should find the main line', () => {
    const moves = new PgnReader({pgn: "1. e4 e5"}).getMoves();
    assert.equal(moves.length, 2);
    assert.equal(moves[0].notation.notation, 'e4');
    assert.equal(moves[1].notation.notation, 'e5');
});

iterating('should find the first variation', () => {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5)"}).getMoves();
    assert.equal(moves.length, 3);
    assert.equal(moves[0].notation.notation, 'e4');
    assert.equal(moves[2].notation.notation, 'd5');
});

iterating('should find all variations', () => {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5) 2. d4 (2. Nf3 Nc6)"}).getMoves();
    assert.equal(moves.length, 6);
    assert.equal(moves[0].notation.notation, 'e4');
    assert.equal(moves[2].notation.notation, 'd5');
    assert.equal(moves[3].notation.notation, 'd4');
    assert.equal(moves[4].notation.notation, 'Nf3');
});

iterating('should find nested variations', () => {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5) 2. Nf3 Nc6 (2... d6 3. d4 (3. Be2)) 3. Bb5"}).getMoves();
    assert.equal(moves.length, 9);
    assert.equal(moves[0].notation.notation, 'e4');
    assert.equal(moves[1].notation.notation, 'e5');
    assert.equal(moves[2].notation.notation, 'd5');
    assert.equal(moves[4].notation.notation, 'Nc6');
    assert.equal(moves[5].notation.notation, 'd6');
    assert.equal(moves[6].notation.notation, 'd4');
    assert.equal(moves[7].notation.notation, 'Be2');
    assert.equal(moves[8].notation.notation, 'Bb5');
});

iterating('should find follow-ups of nested variations', () => {
    const moves = new PgnReader({pgn: "1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5) 3. Nf3 {is hot}) 2... Nc6"}).getMoves();
    assert.equal(moves.length, 8);
    assert.equal(moves[5].prev, 3);
    assert.is(moves[5].next, undefined);
    assert.equal(moves[6].prev, 4);
    assert.is(moves[6].next, undefined);
    assert.equal(moves[7].prev, 2);
    assert.is(moves[7].next, undefined);
});

iterating('should know its indices', function () {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5) 2. d4"}).getMoves();
    for (let i = 0; i < moves.length; i++) {
        assert.equal(moves[i].index,i)
    }
})

iterating ("should know its previous and next move", function() {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5) 2. d4"}).getMoves();
    assert.is(moves[0].prev, undefined)
    assert.equal(moves[0].next,1)
    assert.equal(moves[1].prev,0)
    assert.equal(moves[1].next,4)
    assert.equal(moves[2].prev,0)
    assert.equal(moves[2].next,3)
    assert.equal(moves[3].prev,2)
    assert.is(moves[3].next, undefined)
    assert.equal(moves[4].prev,1)
    assert.is(moves[4].next, undefined)
})

iterating ("should know its previous and next move with 2 variations", function() {
    const moves = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5) (1... c5) 2. d4"}).getMoves();
    assert.is(moves[0].prev, undefined)
    assert.equal(moves[0].next,1)
    assert.equal(moves[1].prev,0)
    assert.equal(moves[1].next,5)
    assert.equal(moves[2].prev,0)
    assert.equal(moves[2].next,3)
    assert.equal(moves[3].prev,2)
    assert.is(moves[3].next, undefined)
    assert.equal(moves[4].prev,0)
    assert.is(moves[4].next, undefined)
    assert.equal(moves[5].prev,1)
    assert.is(moves[5].next, undefined)
})

iterating ("should read complete games", function() {
    const moves = new PgnReader({pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. Nf3 Nc6 6. exd6 cxd6 7. Nc3 g6 8. Nd5 {ein grober Fehler, der sofort einen Bauern verliert} Nxd5 9. cxd5 Qa5+ 10. Bd2 Qxd5 11. Qa4 Bg7 12. Bc4 {Weiß stellt sich immer schlechter} Qe4+ 13. Be3 d5 14. Bb5 {sieht nach Bauernrückgewinn aus} O-O 15. Bxc6 bxc6 16. Qxc6 {der Bauer ist vergiftet} Bg4 17. O-O (17. Nh4 Qd3 18. Nf3 (18. f3 Qxe3+) 18... Rac8 19. Qa4 Bxf3 20. gxf3 Rc2 {kostet die Dame}) 17... Bxf3 18. gxf3 Qxf3 {ist noch am Besten für Weiß} 19. Qd7 e6 20. Rfc1 Bxd4 21. Bxd4 Qg4+ { kostet den zweiten Bauern} 22. Kf1 Qxd4 23. b3 Rfd8 24. Qb7 e5 25. Rd1 Qb6 26.  Qe7 Qd6 {jeder Abtausch hilft} 27. Qxd6 Rxd6 28. Rd2 Rc8 29. Re1 f6 30. Red1 d4 31. f4 Kf7 32. fxe5 fxe5 33. Ke2 Ke6 34. a4 Rc3 35. Rd3 Rxd3 36. Kxd3 Rc6 37.  Rb1 Rc3+ 38. Kd2 Rh3 39. b4 Kd5 40. a5 Rxh2+ 41. Kc1 Kc4 {und Weiß hat nichts mehr} 42. Rb2 Rxb2 43. Kxb2 Kxb4 {höchste Zeit, aufzugeben} 44. Kc2 e4 45. Kd2 Kb3 46. a6 Kb2 47. Ke2 Kc2 48. Ke1 d3 49. Kf2 d2 50. Kg3 d1=Q 51. Kf4 Qd5 52.  Kg3 Qe5+ 53. Kf2 Kd2 54. Kg2 Ke2 55. Kh3 Kf2 56. Kg4 Qg3#"}).getMoves();
    assert.is(moves[0].prev, undefined)
})

iterating.run();

const defaultRead = suite('Default a new read algorithm for PGN');

defaultRead('should read the main line', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3"})
    const moves = reader.getMoves()
    assert.equal(moves.length, 3);
    assert.is(moves[0].prev, undefined);
    assert.equal(moves[0].next, 1);
    assert.equal(moves[1].prev, 0);
    assert.equal(moves[1].next, 2);
    assert.equal(moves[2].prev, 1);
    assert.is(moves[2].next, undefined);
});

defaultRead('should read one variation for black', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. Nf3)"})
    const moves = reader.getMoves()
    assert.equal(moves.length, 4);
    assert.is(moves[0].prev, undefined);
    assert.equal(moves[0].next, 1);
    assert.equal(moves[1].prev, 0);
    assert.is(moves[1].next, undefined);
    assert.equal(moves[2].prev, 0);
    assert.equal(moves[2].next, 3);
    assert.equal(moves[3].prev, 2);
    assert.is(moves[3].next, undefined);
});

defaultRead('should read one variation for white', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6)"})
    const moves = reader.getMoves()
    assert.equal(moves.length, 5);
    assert.is(moves[0].prev, undefined);
    assert.equal(moves[0].next, 1);
    assert.equal(moves[1].prev, 0);
    assert.equal(moves[1].next, 2);
    assert.equal(moves[2].prev, 1);
    assert.is(moves[2].next, undefined);
    assert.equal(moves[3].prev, 1);
    assert.equal(moves[3].next, 4);
    assert.equal(moves[4].prev, 3);
    assert.is(moves[4].next, undefined);
});

defaultRead('should read one variation for white with move after', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) 2... exf4 3. Nf3"})
    const moves = reader.getMoves()
    assert.equal(moves.length, 7);
    assert.is(moves[0].prev, undefined);
    assert.equal(moves[0].next, 1);
    assert.equal(moves[1].prev,0)
    assert.equal(moves[1].next,2)
    assert.equal(moves[2].prev,1)
    assert.equal(moves[2].next,5)
    assert.equal(moves[3].prev,1)
    assert.equal(moves[3].next,4)
    assert.equal(moves[4].prev,3)
    assert.is(moves[4].next, undefined)
    assert.equal(moves[5].prev,2)
    assert.equal(moves[5].next,6)
    assert.equal(moves[6].prev,5)
    assert.is(moves[6].next, undefined)
});

defaultRead.run();

const writingPgn = suite('When writing pgn for a game');

writingPgn('should write only a result if an empty pgn string is given', () => {
    const reader = new PgnReader({pgn: ""})
    const res = reader.writePgn({tags: 'no'})
    assert.equal(res.trim(), '*');
});

writingPgn('should write the normalized notation of the main line with only one move', () => {
    const reader = new PgnReader({pgn: "1. e4"})
    const res = reader.writePgn()
    assert.equal(res, '1. e4');
});

writingPgn('should write the normalized notation of the main line', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5"})
    const res = reader.writePgn()
    assert.equal(res, '1. e4 e5 2. Nf3 Nc6 3. Bb5');
});

writingPgn('should write the notation for a main line including comments', () => {
    const reader = new PgnReader({pgn: "{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5"})
    const res = reader.writePgn()
    assert.equal(res, '{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5');
});

writingPgn('should write all NAGs in the $<NUMBER> format', () => {
    const reader = new PgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"})
    const res = reader.writePgn()
    assert.equal(res, '1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$6 a6$5');
});

writingPgn('should write the notation for a main line with one variation', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3"})
    const res = reader.writePgn()
    assert.equal(res, '1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3');
});

writingPgn("should write the notation for a main line with several variations", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3"})
    const res = reader.writePgn()
    assert.equal(res,"1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3")
})

writingPgn("should write the notation for a main line with stacked variations", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4) 3. d4 ) 2. Nf3"})
    const res = reader.writePgn()
    assert.equal(res,"1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4 ) 3. d4 ) 2. Nf3")
})
writingPgn("should write the end of the game", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 0-1"})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 0-1")
})
writingPgn("should write the end of the game, understand all results: 1-0", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 1-0"})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1-0")
})
writingPgn("should write the end of the game, understand all results: *", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 *"})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 *")
})
writingPgn("should write the end of the game, understand all results: 1/2-1/2", function () {
    const reader = new PgnReader({pgn: "1. e4 e5 1/2-1/2"})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1/2-1/2")
})
writingPgn("should write the end of the game as part of tags", function () {
    const reader = new PgnReader({pgn: '[Result "0-1"] 1. e4 e5'})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 0-1")
})
writingPgn("should write the end of the game as part of tags, understand all results: *", function () {
    const reader = new PgnReader({pgn: '[Result "*"] 1. e4 e5'})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 *")
})
writingPgn("should write the end of the game as part of tags, understand all results: 1/2-1/2", function () {
    const reader = new PgnReader({pgn: '[Result "1/2-1/2"] 1. e4 e5'})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1/2-1/2")
})
writingPgn("should write the end of the game as part of tags, understand all results: 1-0", function () {
    const reader = new PgnReader({pgn: '[Result "1-0"] 1. e4 e5'})
    assert.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1-0")
})
writingPgn("should write promotion correct", function () {
    const reader = new PgnReader({position: '8/6P1/8/2k5/8/8/8/7K w - - 0 1', pgn: '1. g8=R'})
    assert.equal(reader.writePgn(),"1. g8=R")
})
writingPgn("should write TimeControl tags as expected", function () {
    const reader = new PgnReader({pgn: '[TimeControl "40/6000+30:3000+30"] 1. e4 e5'})
    assert.equal(reader.writePgn(), '[TimeControl "40/6000+30:3000+30"]\n\n1. e4 e5')
})

writingPgn.run();

const endGame = suite('When reading game with an end');

endGame('should return the correct result with getEndGame', () => {
    let reader = new PgnReader({pgn: 'e4 *'})
    assert.equal(reader.getEndGame(), '*');
    reader = new PgnReader({pgn: 'e4 1-0'})
    assert.equal(reader.getEndGame(),'1-0')
});

endGame('should return null with getEndGame if there was no end game noted', () => {
    const reader = new PgnReader({pgn: 'e4'})
    assert.equal(reader.getGames().length, 1);
    assert.equal(reader.getMoves().length, 1);
    assert.is(reader.getEndGame(), undefined);
});

endGame('should return the correct end game if switching games', () => {
    const reader = new PgnReader({pgn: 'e4 e5 *\n\nd4 d5 1-0\n\nc4', manyGames: true})
    assert.equal(reader.getGames().length, 3);
    assert.equal(reader.getEndGame(), '*');
    reader.loadOne(1)
    assert.equal(reader.getMove(0).notation.notation, 'd4');
    assert.equal(reader.getEndGame(), '1-0');
    reader.loadOne(2)
    assert.equal(reader.getMove(0).notation.notation, 'c4');
    assert.is(reader.getEndGame(), undefined);
});

// TODO See ticket #223 for the context
// xit("should return the correct result with getEndGame, if the game was finished by mate or stalemate", function (){
//     reader = new PgnReader({pgn: 'f4 e6 g4 Qh4#'})
//     should.equal(reader.getGames().length,1)
//     should.equal(reader.getEndGame(),'0-1')
// })

endGame.run();

const sanSuite = suite('When using san and sanWithNags');

sanSuite('should get correct san independent of the source format', () => {
    let reader = new PgnReader({pgn: 'e2-e4'})
    assert.equal(reader.san(reader.getMove(0)), 'e4');
    reader = new PgnReader({pgn: 'e4'})
    assert.equal(reader.san(reader.getMove(0)),'e4')
    reader = new PgnReader({pgn: 'e4', notation: 'long'})
    assert.equal(reader.san(reader.getMove(0)),'e2-e4')
});

sanSuite('should get correct san with NAGs', () => {
    const reader = new PgnReader({pgn: 'e4!?$13$27'})
    assert.equal(reader.sanWithNags(reader.getMove(0)), 'e4⁉∞○');
    assert.equal(reader.writePgn(), '1. e4$5$13$27');
});

sanSuite('should emmit correct discriminator', () => {
    let reader = new PgnReader({position: 'rnbqkbnr/p1p2p2/3p2p1/R3p2p/7P/8/1PPPPPP1/RNBQKBN1 w kq - 0 8'})
    let san:string = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'a5', to: 'a3', notation: {}})
    assert.equal(san, 'R5a3');
    reader = new PgnReader({position: 'rnbqkbnr/p1p2p2/3p2p1/R3p2p/7P/8/1PPPPPP1/RNBQKBN1 w kq - 0 8'})
    san = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'a1', to: 'a3', notation: {}})
    assert.equal(san, "R1a3")
    reader = new PgnReader({position: 'r1b1kbnr/p2q1p2/2n1p2p/R1pp2p1/1PPP3P/5N2/4PPP1/RNBQKB2 w kq - 4 12'})
    san = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'b1', to: 'd2', notation: {}})
    assert.equal(san, "Nbd2")
    reader = new PgnReader({position: 'r1b1kbnr/p2q1p2/2n1p2p/R1pp2p1/1PPP3P/5N2/4PPP1/RNBQKB2 w kq - 4 12'})
    san = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'f3', to: 'd2', notation: {}})
    assert.equal(san, "Nfd2")
});

sanSuite('should know pinned pieces when no discriminator is needed', () => {
    const reader = new PgnReader({ position: 'rnbqk1nr/pppp2pp/4p3/8/1b1Pp3/2N3N1/PPP2PPP/R1BQKB1R w KQkq - 0 1'})
    let san:string = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'g3', to: 'e4', notation: {}})
    assert.equal(san, 'Nxe4');
});

sanSuite('should work with start position as well', () => {
    const reader = new PgnReader({})
    let san:string = reader.san(<PgnReaderMove>{nag: [], variations: [], from: 'g1', to: 'f3', notation: {}})
    assert.equal(san, 'Nf3');
});

sanSuite.run();

const manyGames = suite('When reading many games');

manyGames('should ensure switching games works', () => {
    let reader = new PgnReader({pgn: 'e4 e5 * d4 (e4) * c4 *', manyGames: true})
    assert.equal(reader.getGames().length, 3);
    assert.equal(reader.san(reader.getMove(0)), 'e4');
    assert.equal(reader.san(reader.getMove(1)), 'e5');

    reader.loadOne(1)
    assert.equal(reader.san(reader.getMove(0)), 'd4');

    reader.loadOne(2)
    assert.equal(reader.san(reader.getMove(0)), 'c4');
});

manyGames('should ensure lazyLoad and loadOne works', () => {
    const reader = new PgnReader({pgn: 'e4 * d4 * c4 *', manyGames: true, lazyLoad: true})
    assert.is(reader.getGames(), undefined);

    reader.loadMany()
    assert.equal(reader.getGames().length, 3);

    reader.loadOne(0)
    assert.equal(reader.san(reader.getMove(0)), 'e4');

    reader.loadOne(2)
    assert.equal(reader.san(reader.getMove(0)), 'c4');
});

manyGames.run();

const nextMoves = suite('When wanting to get possible next moves');

nextMoves('should compute possibleMoves in postion after 4 moves', () => {
    const reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6'})
    assert.equal(reader.getMoves().length, 4);

    const moves = reader.possibleMoves(3);

    assert.ok(moves);
    assert.equal(moves.get('f3').length, 5);
});

nextMoves('should compute possibleMoves for a given position (nearly mate)', () => {
    const reader = new PgnReader({position: '3k3R/8/4K3/8/8/8/8/8 b - - 0 1'})
    const moves = reader.possibleMoves('3k3R/8/4K3/8/8/8/8/8 b - - 0 1');

    assert.ok(moves);
    assert.equal(moves.get('d8').length, 1);
    assert.equal(moves.get('d8')[0], 'c7');
});

nextMoves.run();

const makingMoves = suite('When making moves in pgn');

makingMoves('should have no moves with an empty PGN string', () => {
    const empty = new PgnReader({pgn: "*"})
    assert.equal(empty.getMoves().length, 0);
});

makingMoves('should write a move on the initial position', () => {
    const empty = new PgnReader({pgn: "*"})
    empty.addMove({ from: 'e2', to:'e4'}, null);

    assert.equal(empty.getMoves().length, 1);
    assert.equal(empty.getMove(0).notation.notation, 'e4');
});

makingMoves('should write a move in the position with white on turn', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.addMove({from: 'e2', to: 'e4'}, 1);

    assert.equal(reader.getMoves().length, 3);
    assert.equal(reader.getMove(2).turn, 'w');
});

makingMoves('should write a move in the position with black on turn', () => {
    const reader = new PgnReader({pgn: "1. d4 e5 2. e4"})
    reader.addMove({from: 'e5', to: 'd4'}, 2);

    assert.equal(reader.getMoves().length, 4);
    assert.equal(reader.getMove(3).turn, 'b');
});

makingMoves('should use the existing move in the main line', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
    reader.addMove({ from: 'g1', to: 'f3'}, 1);

    assert.equal(reader.getMoves().length, 4);
    assert.equal(reader.getMove(2).turn, 'w');
    assert.equal(reader.getMove(2).notation.notation, 'Nf3');
});

makingMoves('should start new variation in the middle of the main line', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
    reader.addMove({ from: 'f2', to: 'f4'}, 1);

    assert.equal(reader.getMoves().length, 5);
    assert.equal(reader.getMove(4).turn, 'w');
    assert.equal(reader.getMove(4).notation.notation, 'f4');
    assert.equal(reader.getMove(2).variations.length, 1);
    assert.equal(reader.getMove(2).variations[0].notation.notation, 'f4');
});

makingMoves('should start a second variation in the middle of the main line, when the current move has already a variation', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
    reader.addMove({from: 'f2', to: 'f4'}, 1);
    reader.addMove({from: 'd2', to: 'd4'}, 1);

    assert.equal(reader.getMoves().length, 6);
    assert.equal(reader.getMove(5).turn, 'w');
    assert.equal(reader.getMove(5).notation.notation, 'd4');
    assert.equal(reader.getMove(2).variations.length, 2);
    assert.equal(reader.getMove(2).variations[0].notation.notation, 'f4');
    assert.equal(reader.getMove(2).variations[1].notation.notation, 'd4');
});

makingMoves('should use the existing move in the variation', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.addMove({from: 'g1', to: 'f3'}, 1);
    reader.addMove({from: 'b8', to: 'c6'}, 2);

    assert.equal(reader.getMoves().length, 4);
    assert.equal(reader.getMove(2).turn, 'w');
    assert.equal(reader.getMove(2).notation.notation, 'Nf3');
    assert.equal(reader.getMove(3).turn, 'b');
    assert.equal(reader.getMove(3).notation.notation, 'Nc6');
});

makingMoves('should know how to notate castling', () => {
    const reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5"})
    reader.addMove('O-O', 5);

    assert.equal(reader.getMoves().length, 7);
    assert.equal(reader.getMove(6).turn, 'w');
    assert.equal(reader.getMove(6).notation.notation, 'O-O');

    reader.addMove('O-O', 6);

    assert.equal(reader.getMoves().length, 8);
    assert.equal(reader.getMove(7).turn, 'b');
    assert.equal(reader.getMove(7).notation.notation, 'O-O');
});

makingMoves.run();

const deletingLines = suite('When deleting lines');

deletingLines('should delete the whole main line', () => {
    const reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
    reader.deleteMove(0);

    assert.is(reader.isDeleted(0), true);
});

deletingLines('should delete the rest of the line (without variation)', () => {
    const reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
    reader.deleteMove(2);

    assert.is(reader.isDeleted(0), false);
    assert.is(reader.isDeleted(1), false);
    assert.is(reader.isDeleted(2), true);
    assert.is(reader.isDeleted(3), true);
});

deletingLines('should delete the rest of the line, replace it by the first variation', () => {
    const reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) Nc6"})
    assert.equal(reader.getMove(3).variationLevel, 1);

    reader.deleteMove(2);

    assert.is(reader.isDeleted(0), false);
    assert.is(reader.isDeleted(1), false);
    assert.is(reader.isDeleted(2), true);
    assert.is(reader.isDeleted(5), true);

    assert.equal(reader.getMove(3).variationLevel, 0);
    assert.equal(reader.getMove(4).variationLevel, 0);
    assert.equal(reader.getMove(1).next, 3);
});

deletingLines('should delete the whole variation with the first move', () => {
    const reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) (2. d4 exd4) Nc6"})
    assert.equal(reader.getMove(3).variationLevel, 1);

    reader.deleteMove(3);

    assert.is(reader.isDeleted(0), false);
    assert.is(reader.isDeleted(1), false);
    assert.is(reader.isDeleted(2), false);
    assert.is(reader.isDeleted(3), true);
    assert.is(reader.isDeleted(4), true);

    assert.equal(reader.getMove(2).variationLevel, 0);
    assert.equal(reader.getMove(5).variationLevel, 1);
    assert.equal(reader.getMove(6).variationLevel, 1);
});

deletingLines('should delete the rest of a variation (including the move)', () => {
    const reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4 3. Nf3 d6) (2. d4 exd4) Nc6"})
    assert.equal(reader.getMove(3).variationLevel, 1);

    reader.deleteMove(4);

    assert.is(reader.isDeleted(3), false);
    assert.is(reader.isDeleted(4), true);
});

// The following test case is wrong, and should be rewritten: what does the move number denote? why deleting 2 times?
// Asserts have to be useful (like what is the resulting pgn then)
// xit("should delete the moves before (without the move)", function () {
//     let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
//     reader.deleteMovesBefore(0)
//     should.equal(reader.getMoves().length,4)
//     reader.deleteMovesBefore(1)
//     should.equal(reader.getMoves().length,4)
//     expect(reader.isDeleted(0)).to.be.true
// })

deletingLines.run();

const upvotingLines = suite('When upvoting lines');
upvotingLines.before(context => {
    context.pgn = "1. e4 e5 2. Nf3 (2. f4 exf4) (2. d4 exd4)"
    context.pgn2 = "e4 (d4 d5) (c4 c5) e5"
})

upvotingLines('should upvote the second line as first line', context => {
    let reader = new PgnReader({pgn: context.pgn})
    assert.equal(reader.getMove(3).variationLevel, 1);
    assert.equal(reader.getMove(2).variations[0].index, 3);
    assert.equal(reader.getMove(2).variations[1].index, 5);

    reader.promoteMove(5);

    assert.equal(reader.getMove(2).variations[0].index, 5);
    assert.equal(reader.getMove(2).variations[1].index, 3);
});

upvotingLines('should upvote the first line as main line', (context) => {
    let reader = new PgnReader({pgn: context.pgn})
    assert.equal(reader.getMove(3).variationLevel, 1);
    assert.equal(reader.getMove(2).variations[0].index, 3);
    assert.equal(reader.getMove(2).variations[1].index, 5);

    reader.promoteMove(3);

    assert.ok(reader.startVariation(reader.getMove(2)));
    assert.equal(reader.getMove(2).variationLevel, 1);
    assert.equal(reader.getMove(3).variationLevel, 0);
});

upvotingLines('should ignore upvoting the main line', (context) => {
    let reader = new PgnReader({pgn: context.pgn})
    assert.equal(reader.getMove(3).variationLevel, 1);
    assert.equal(reader.getMove(2).variations[0].index, 3);
    assert.equal(reader.getMove(2).variations[1].index, 5);

    reader.promoteMove(2);

    assert.equal(reader.getMove(2).variations[0].index, 3);
    assert.equal(reader.getMove(2).variations[1].index, 5);
});

upvotingLines('should handle first move variations, upvote first line', (context) => {
    let reader = new PgnReader({pgn: context.pgn2})

    assert.equal(reader.getMoves().length, 6);

    reader.promoteMove(1);

    assert.equal(reader.getMove(1).variationLevel, 0);
    assert.equal(reader.getMove(1).variations[0].index, 0);
    assert.equal(reader.getMove(0).variationLevel, 1);
});

upvotingLines('should handle first move variations, upvote second line', (context) => {
    let reader = new PgnReader({pgn: context.pgn2})
    assert.equal(reader.getMoves().length, 6);

    reader.promoteMove(3);

    assert.equal(reader.getMove(3).variationLevel, 1);
    assert.equal(reader.getMove(0).variations[0].index, 3);
    assert.equal(reader.getMove(0).variationLevel, 0);
});

upvotingLines('should handle non-first move variations, upvote of any line', context => {
    let reader = new PgnReader({pgn: context.pgn2})
    assert.equal(reader.getMoves().length, 6);

    reader.promoteMove(2);

    assert.equal(reader.getMove(1).variationLevel, 0);
    assert.equal(reader.getMove(1).variations[0].index, 0);
    assert.equal(reader.getMove(0).variationLevel, 1);
});

upvotingLines('should handle non-first move variations, upvote of any line 2', context => {
    let reader = new PgnReader({pgn: context.pgn})
    assert.equal(reader.getMoves().length, 7);

    reader.promoteMove(4);

    assert.equal(reader.getMove(3).variationLevel, 0);
    assert.equal(reader.getMove(3).variations[0].index, 2);
    assert.equal(reader.getMove(2).variationLevel, 1);
    assert.equal(reader.getMove(0).variationLevel, 0);
});

upvotingLines.run();

const searchingMoves = suite('When searching moves');

searchingMoves('should find an existing move based on san', () => {
    const reader = new PgnReader({pgn: 'e4 e5 (d5 exd5)'})
    const move = reader.findMove('d5');

    assert.ok(move);
    assert.equal(move.variationLevel, 1);
    assert.equal(reader.san(move), 'd5');
});

searchingMoves('should find an existing move based on the index of the move', () => {
    const reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6 Bc4 Bc5'})
    let move = reader.findMove(1);
    assert.equal(reader.san(move), 'e4');

    move = reader.findMove(3);
    assert.equal(reader.san(move), 'Nf3');

    move = reader.findMove(6);
    assert.equal(reader.san(move), 'Bc5');
});

searchingMoves.run();

const gameWithVariation = suite('When having read a game with variation');

gameWithVariation('should ensure that startMainLine works', () => {
    let reader:PgnReader = new PgnReader({pgn: 'e4 e5 (d5 exd5 Qxd5) Nf3'})
    assert.ok(reader.startMainLine(reader.getMove(0)));
});

gameWithVariation('should ensure that startVariation works', () => {
    let reader:PgnReader = new PgnReader({pgn: 'e4 e5 (d5 exd5 Qxd5) Nf3'})
    assert.ok(reader.startVariation(reader.findMove('d5')));
});

gameWithVariation('should ensure that endVariation works', () => {
    let reader:PgnReader = new PgnReader({pgn: 'e4 e5 (d5 exd5 Qxd5) Nf3'})
    assert.ok(reader.endVariation(reader.findMove('Qxd5')));
});

gameWithVariation('should ensure that afterMoveWithVariation works', () => {
    let reader:PgnReader = new PgnReader({pgn: 'e4 e5 (d5 exd5 Qxd5) Nf3'})
    assert.ok(reader.afterMoveWithVariation(reader.findMove('Nf3')));
});

gameWithVariation.run();

const workingWithNags = suite('When working with NAGs');

workingWithNags('should add selected NAG as first when empty', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.changeNag('??', 1, true);
    assert.equal(reader.getMove(1).nag[0], '$4');

    reader.changeNag('!!', 0, true);
    assert.equal(reader.getMove(0).nag[0], '$3');
});

workingWithNags('should add selected NAG as last when already some', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.changeNag('??', 1, true);
    reader.changeNag('!!', 1, true);

    assert.equal(reader.getMove(1).nag[1], '$3');
    assert.equal(reader.getMove(1).nag[0], '$4');
});

workingWithNags('should clear all NAGs', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.changeNag('??', 1, true);
    assert.equal(reader.getMove(1).nag[0], '$4');

    reader.clearNags(1);
    assert.equal(reader.getMove(1).nag.length, 0);
});

workingWithNags('should ignore clear when no NAGs', () => {
    const reader = new PgnReader({pgn: "1. d4 e5"})
    reader.clearNags(1);
    assert.equal(reader.getMove(1).nag.length, 0);

    reader.clearNags(1);
    assert.equal(reader.getMove(1).nag.length, 0);
});

workingWithNags.run();

const addArrowsAndCircles = suite('When having a game and wanting to add arrows and circles');

addArrowsAndCircles('should understand how to set arrows', () => {
    let reader: PgnReader = new PgnReader({pgn: 'e4'})
    let move = reader.getMove(0)
    let arrows:Shape[] = [{ brush: 'g', orig: 'g1', dest: 'f3'}, { brush: 'Y', orig: 'e2', dest: 'e4'}]
    assert.equal(reader.san(move), 'e4');

    reader.setShapes(move, arrows);

    assert.equal(move.commentDiag.colorArrows, ['Gg1f3', 'Ye2e4']);
});

addArrowsAndCircles('should understand how to set circles', () => {
    let reader: PgnReader = new PgnReader({pgn: 'e4'})
    let move = reader.getMove(0)
    let circles:Shape[] = [{ brush: 'r', orig: 'f1'}]
    reader.setShapes(move, circles);

    assert.equal(move.commentDiag.colorFields, ['Rf1']);
});

addArrowsAndCircles('should understand how to set arrows and circles', () => {
    let reader: PgnReader = new PgnReader({pgn: 'e4'})
    let move = reader.getMove(0)
    let arrows:Shape[] = [{ brush: 'g', orig: 'g1', dest: 'f3'}, { brush: 'Y', orig: 'e2', dest: 'e4'}]
    let circles:Shape[] = [{ brush: 'r', orig: 'f1'}]
    reader.setShapes(move, arrows.concat(circles));

    assert.equal(move.commentDiag.colorFields, ['Rf1']);
    assert.equal(move.commentDiag.colorArrows, ['Gg1f3', 'Ye2e4']);
});

addArrowsAndCircles.run();

const specialCharacters = suite('Working with games with special characters');

specialCharacters('should ignore 1 space at beginning and end', () => {
    const reader = new PgnReader({pgn: ' 1. d4 e5  '});
    assert.equal(reader.getMoves().length, 2);
});

specialCharacters('should ignore more spaces at beginning and end', () => {
    const reader = new PgnReader({pgn: '     1. d4 e5   '});
    assert.equal(reader.getMoves().length, 2);
});

specialCharacters('should handle BOM on the beginning of games', () => {
    const reader = new PgnReader({
        pgn: '\uFEFF[Event ""]\n' +
            '[Setup "1"]\n' +
            '[FEN "4r1k1/1q3ppp/p7/8/Q3r3/8/P4PPP/R3R1K1 w - - 0 1"]\n' +
            '1. Qxe8+ {} Rxe8 2. Rxe8# *\n'
    });

    assert.ok(reader);
    assert.equal(reader.getMoves().length, 3);
});

specialCharacters.run();

const pgnNotationErrors = suite('When pgn notation has errors');

pgnNotationErrors('should read wrong chess moves in PGN by matching', () => {
    assert.throws(() => {
        new PgnReader({pgn: 'd5'}).loadPgn();
    }, 'No legal move: d5');
});

pgnNotationErrors('should read syntactically wrong PGN by throwing SyntaxError', () => {
    assert.throws(() => {
        new PgnReader({pgn: 'ddd3'}).loadPgn();
    }, 'Expected [1-8] but "d" found.');
});

pgnNotationErrors.run();
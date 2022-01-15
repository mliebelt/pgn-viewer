import * as should from "should"
import {PgnReader} from "../lib"
import {describe} from "mocha"
import * as path from "path"

/**
 * Checks all functionality for reading and interpreting a configuration for the reader.
 */


describe("Base functionality of the reader without any configuration", function () {
    let reader
    it("should be able to read a main line", function () {
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6'})
        should(reader.getMoves().length).equal(4)
        should(reader.writePgn()).equal("1. e4 e5 2. Nf3 Nc6")
    })
    it("should be able to read a main line with one variant", function (){
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6 (Nf6 d4 exd4)'})
        should(reader.getMoves().length).equal(7)
        should(reader.writePgn()).equal("1. e4 e5 2. Nf3 Nc6 ( 2... Nf6 3. d4 exd4 )")
        let move = reader.findMove("Nf6")
        should.exist(move)
        should(move.moveNumber).equal(2)
        should(move.turn).equal('b')
        should(move.notation.notation).equal("Nf6")
        should(move.variationLevel).equal(1)
        let prev = reader.getMove(move.prev)
        should(prev.moveNumber).equal(2)
        should(reader.san(prev)).equal("Nf3")
        should(prev.turn).equal('w')
    })
    it("should be able to read a main line with many variants on different levels", function () {
        reader = new PgnReader({pgn: 'e4 (d4 d5)(c4) e5 Nf3 (f4 d5 (Nc6))'})
        should(reader.getMoves().length).equal(9)
        should(reader.getMove(0).variations.length).equal(2)
        let m3 = reader.getMove(3)
        should(m3.variations.length).equal(0)
        should(reader.startVariation(m3))
        should(reader.endVariation(m3))
        let m8 = reader.getMove(8)
        should(m8.variationLevel).equal(2)
        let prev8 = reader.getMove(m8.prev)
        should(prev8.variationLevel).equal(1)
    })
    it("should understand game comment and after comment in principle", function() {
        reader = new PgnReader({pgn: "{START} 1. d4 {AFTER} e5"})
        let move = reader.getMove(0)
        should(reader.getGameComment().comment).equal("START")
        should(move.commentAfter).equal("AFTER")
        should(move.notation.notation).equal("d4")
    })

    it("should understand comments for variation with white", function() {
        reader = new PgnReader({pgn: "1. d4 ({START} 1. e4 {AFTER} e5) 1... d5"})
        let var_first = reader.getMove(0).variations[0]
        should(var_first.commentMove).equal("START")
        should(var_first.commentAfter).equal("AFTER")
        should(var_first.notation.notation).equal("e4")
    })

    it("should read all sorts of comments", function() {
        reader = new PgnReader({pgn: "{Before move} 1. e4 {After move}"})
        let first = reader.getMove(0)
        should(reader.getGameComment().comment).equal("Before move")
        should(first.commentAfter).equal("After move")
    })
    it("should ignore empty comments #211", function () {
        reader = new PgnReader({pgn: "e4 { [%csl Gf6] }"})
        let move = reader.getMove(0)
        should.exist(move)
        should(move.commentDiag.colorFields.length).equal(1)
        should(move.commentDiag.colorFields[0]).equal("Gf6")
        should(move.commentAfter).undefined()
    })

    it ("should understand format of diagram circles", function() {
        reader = new PgnReader({pgn: "1. e4 {[%csl Ya4, Gb4,Rc4]}"})
        let first = reader.getMove(0)
        should(first.commentDiag.colorFields.length).equal(3)
        should(first.commentDiag.colorFields[0]).equal("Ya4")
        should(first.commentDiag.colorFields[1]).equal("Gb4")
        should(first.commentDiag.colorFields[2]).equal("Rc4")
    })
    it ("should understand format of diagram arrows", function() {
        reader = new PgnReader({pgn: "1. e4 {[%cal Ya4b2, Gb4h8,Rc4c8]}"})
        let first = reader.getMove(0)
        should(first.commentDiag.colorArrows.length).equal(3)
        should(first.commentDiag.colorArrows[0]).equal("Ya4b2")
        should(first.commentDiag.colorArrows[1]).equal("Gb4h8")
        should(first.commentDiag.colorArrows[2]).equal("Rc4c8")
    })
    it ("should understand both circles and arrows", function() {
        reader = new PgnReader({pgn: "e4 {[%csl Yf4,Gg5,Gd4,Rc4,Bb4,Ya4][%cal Gg1f3,Rf1c4,Gh2h4,Rg2g4,Bf2f4,Ye2e4]}"})
        let first = reader.getMove(0)
        should(first.commentDiag.colorArrows.length).equal(6)
        should(first.commentDiag.colorFields.length).equal(6)
    })

    it ("should be able to read additional tags and keep them", function () {
        reader = new PgnReader({ pgn: '[White "Me"] [Black "Magnus"] e4 e5'})
        should(reader.getMoves().length).equal(2)
        let tags = reader.getTags()
        should(tags.get('White')).equal("Me")
        should(tags.get('Black')).equal("Magnus")

    })
    it ("should read 3 games and hold them", function () {
        // Define 3 games (very short)
        // Read them at once
        // Set the current game
        // Get for each game some information (# moves, players, move notation, ...)
    })
    it("should read nags", function() {
        reader = new PgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"})
        let moves = reader.getMoves()
        should(moves.length).equal(6)
        should(moves[0].nag).deepEqual(["$1"])
        should(moves[1].nag).deepEqual(["$2"])
        should(moves[2].nag).deepEqual(["$3"])
        should(moves[3].nag).deepEqual(["$4"])
        should(moves[4].nag).deepEqual(["$6"])
        should(moves[5].nag).deepEqual(["$5"])
    })
    it ("should have the fen stored with each move", function () {
        reader = new PgnReader({pgn: "1. d4 e5"})
        should(reader.getMoves().length).equal(2)
        should.exist(reader.getMoves()[0].fen)
        should.exist(reader.getMoves()[1].fen)
    })
})

describe("When using all kind of configuration in the reader", function () {
    it("should ensure that short notation is written", function () {
        let reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6', notation: 'short'})
        should(reader.getMoves().length).equal(4)
        should(reader.writePgn()).equal('1. e4 e5 2. Nf3 Nc6')
    })
    it("should ensure that long notation is written", function (){
        let reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6', notation: 'long'})
        should(reader.getMoves().length).equal(4)
        should(reader.writePgn()).equal('1. e2-e4 e7-e5 2. Ng1-f3 Nb8-c6')
    })
    it("should ensure that different positions are understood", function () {
        let reader = new PgnReader({pgn: 'e4', position: 'start'})
        should.exist(reader)
        should(reader.getMoves().length).equal(1)
        should(reader.getPosition(null)).startWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
        reader = new PgnReader({ pgn: 'e5', position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'})
        should(reader.getMoves().length).equal(1)
        should(reader.getPosition(0)).startWith('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR')

    })
    it("should ensure that configuring manyGames works", function () {
        let reader = new PgnReader({manyGames: true, pgn: "e4 e5 *\n\nd4 d5 *"})
        should.exist(reader)
        should(reader.getMoves().length).equal(2)
        should(reader.getGames().length).equal(2)
    })
    it("should emmit an error when reading many games with `manyGames == true`", function () {
        (function() {new PgnReader({pgn: 'e4 e5 *\n\nd4 d5 *'})}).should.throw('Expected end of input or whitespace but "d" found.')
    })
    it("should ensure that lazyLoad works", function () {
        let reader = new PgnReader({lazyLoad: true, manyGames: true, pgn: "e4 e5 *\n\nd4 d5 *"})
        should.exist(reader)
        should(reader.getMoves()).is.empty()
        should(reader.getGames()).is.undefined()
        reader.loadPgn()
        should(reader.getGames().length).equal(2)
        should(reader.getMoves().length).equal(2)
        should(reader.getMove(0).notation.notation).equal('e4')
    })
    xit("should ensure that pgnFile works", function () {
        let reader = new PgnReader({pgnFile: 'file://' + path.resolve(__dirname, './2games.pgn'), manyGames: true})
        should(reader.getGames().length).equal(2)
    })
    xit("should ensure that error is thrown if file is not found / could not be read", function () {
        (function () { new PgnReader({pgnFile: '2games-missing.pgn', manyGames: true}) } ).should.throw('File not found or could not read: 2games-missing.pgn')
    })
    it("should ensure that startPlay works", function () {
        let reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6', startPlay: 3, hideMovesBefore: false})
        should(reader.getMoves().length).equal(4)
        should(reader.getMove(0).notation.notation).equal('e4')
    })
    it("should ensure that hideMovesBefore works", function () {
        let reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6', startPlay: 3, hideMovesBefore: true})
        should(reader.getMoves().length).equal(2)
        should(reader.san(reader.getMove(0))).equal('Nf3')
    })
})

describe("When reading various formats", function() {
    let reader
    // Not a real disambiguator, because when pawns are captured, the column has to be used.
    xit ("should read and remember disambiguator", function() {
        reader = new PgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"})
        should(reader.getMoves()[0].notation.disc).equal('d')
    })

    it("should use disambiguator on output", function() {
        reader = new PgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"})
        should(reader.sanWithNags(reader.getMove(0))).equal('dxe5')
    })

    it ("should understand that Long Algebraic Notation can be used when strike", function() {
        reader = new PgnReader({pgn: '4... Nf6xe4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'})
        should(reader.sanWithNags(reader.getMove(0))).equal("Nxe4")
    })

    // chess.src does not allow to leave out the strike symbol, or I have to have more in the long notation
    // even with the long variation, the move Nf6-e4 is not accepted, even not in sloppy mode
    it ("should understand that Long Algebraic Notation can leave out strike symbol", function() {
        reader = new PgnReader({pgn: '4... Nf6e4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'})
        should(reader.sanWithNags(reader.getMove(0))).equal("Nxe4")
    })

    it ("should understand that Long Algebraic Notation can be used", function() {
        reader = new PgnReader({pgn: '1. e2-e4 e7-e5'})
        should(reader.sanWithNags(reader.getMove(0))).equal("e4")
        should(reader.sanWithNags(reader.getMove(1))).equal("e5")
    })

    it ("should understand that disambiguator is needed here", function() {
        reader = new PgnReader({pgn: 'fxe5', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 1 4'})
        should(reader.sanWithNags(reader.getMove(0))).equal("fxe5")
    })
    
    xit ("should understand optional pawn symbols", function () {
        reader = new PgnReader({pgn: '1. Pe4 Pe5 2. Pd4 Pexd4'})
        should(reader.getMoves().length).equal(4)
        should(reader.sanWithNags(reader.getMove(0))).equal("e4")
        should(reader.sanWithNags(reader.getMove(1))).equal("e5")
        should(reader.sanWithNags(reader.getMove(2))).equal("d4")
        should(reader.sanWithNags(reader.getMove(3))).equal("exd4")
    })
})

describe("When working with different PGN beginnings and endings", function() {
    let reader

    it("should work with no moves at all", function() {
        reader = new PgnReader({pgn: ""})
        should(reader.getMoves().length).equal(0)
        should(reader.getGames().length).equal(1)
    })

    it("should work with white's first move only", function() {
        reader = new PgnReader({pgn: "1. e4"})
        should(reader.getMoves().length).equal(1)
        should(reader.getMoves()[0].notation.notation).equal("e4")
        should(reader.getMoves()[0].moveNumber).equal(1)
    })

    it ("should work with black's first move only", function() {
        reader = new PgnReader({pgn: "1... e5", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"})
        should(reader.getMoves().length).equal(1)
        should(reader.getMoves()[0].notation.notation).equal("e5")
        should(reader.getMoves()[0].turn).equal("b")
        should(reader.getMoves()[0].moveNumber).equal(1)
    })

    it ("should work with white beginning and black ending", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. d4 exd4"})
        should(reader.getMoves().length).equal(4)
        should(reader.getMoves()[0].notation.notation).equal("e4")
        should(reader.getMoves()[0].turn).equal("w")
        should(reader.getMoves()[0].moveNumber).equal(1)
        should(reader.getMoves()[3].notation.notation).equal("exd4")
        should(reader.getMoves()[3].turn).equal("b")
        //should(reader.getMoves()[3].moveNumber).toBeUndefined()
    })

    it ("should work with black beginning and white ending", function() {
        reader = new PgnReader({pgn: "1... e5 2. d4 exd4 3. c3", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"})
        should(reader.getMoves().length).equal(4)
        should(reader.getMoves()[0].notation.notation).equal("e5")
        should(reader.getMoves()[0].turn).equal("b")
        should(reader.getMoves()[0].moveNumber).equal(1)
        should(reader.getMoves()[1].notation.notation).equal("d4")
        should(reader.getMoves()[1].turn).equal("w")
        should(reader.getMoves()[1].moveNumber).equal(2)
        should(reader.getMoves()[2].notation.notation).equal("exd4")
        should(reader.getMoves()[2].turn).equal("b")
        //should(reader.getMoves()[2].moveNumber).toBeUndefined()
    })
})

describe("When using all kind of notation", function() {
    let reader
    it ("should know how to move all kind of figures", function() {
        reader = new PgnReader({pgn: "1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nf3 d5 5. O-O e6 6. Re1 "})
        should(reader.getMoves().length).equal(11)
    })

    it ("should know different variants of strikes", function() {
        reader = new PgnReader({pgn: "1. e4 d5 2. exd5 Nc6 3. dxc6 bxc6"})
        should(reader.getMoves().length).equal(6)
        should(reader.getMoves()[2].notation.notation).equal("exd5")
    })

    it ("should know all special symbols normally needed (promotion, check, mate)", function() {
        reader = new PgnReader({pgn: "1. f3 e5 2. g4 Qh4#"})
        should(reader.getMoves().length).equal(4)
        reader = new PgnReader({pgn: "1. e7 d2 2. e8=Q d1=R+", position: "5rk1/8/4P3/8/8/3p4/5R2/6K1 w - - 0 1"})
    })

    it ("should be robust with missing symbols (check)", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7 Ke7 7. Nd5#"})
        should(reader.getMoves().length).equal(13)
        //should(reader.getMoves()[10].notation.notation).equal("Bxf7+")
        should(reader.getMoves()[10].notation.check).equal('+')
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#")
    })

    it ("should be robust with missing symbols (mate)", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5"})
        should(reader.getMoves().length).equal(13)
        should(reader.getMoves()[12].notation.check).equal('#')
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#")
    })
})

describe("When reading pgn with tags", function() {
    let pgn_string = null
    let pgn_string2 = null
    let reader = null
    let reader2 = null
    beforeEach(function() {
        pgn_string = ['[Event "Casual Game"]',
            '[Site "Berlin GER"]',
            '[Date "1852.12.31"]',
            '[Round "1"]',
            '[Result "1-0"]',
            '[White "Adolf Anderssen"]',
            '[Black "Jean Dufresne"]',
            '[SetUp "0"]',
            '1. e4 e5 2. Nf3 Nc6']
        pgn_string2 = ['[SetUp "1"]', '[FEN "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"]', '*']
        reader = new PgnReader({pgn: pgn_string.join(" ")})
        reader2 = new PgnReader({pgn: pgn_string2.join(" ")})
    })

    it("should have these tags read", function() {
        should(reader.getTags().size).equal(9)
        should(reader.getTags().get("Site")).equal("Berlin GER")
        should(reader.getTags().get("Date").value).equal("1852.12.31")
        should(reader.getTags().get("SetUp")).equal("0")
        should(reader.configuration.position).equal("start")
    })

    it("should have tag mapped to FEN", function() {
        should(reader2.getTags().get("SetUp")).equal("1")
        should(reader2.configuration.position).equal("8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57")
    })

    it("should accept variations of case in tags", function() {
        let pgn = new PgnReader({pgn: '[Setup "1"] [fen "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *'})
        should(pgn.getTags().get("SetUp")).equal("1")
        should(pgn.configuration.position).equal("8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57")
    })

    it("should understand unknown tags and record them", function () {
        let pgn = new PgnReader({pgn: '[PuzzleCategory "Material"] [PuzzleEngine "Stockfish 13"] ' +
                '[PuzzleMakerVersion "0.5"] [PuzzleWinner "White"] *'})
        let tags = pgn.getTags()
        should(tags.get("PuzzleCategory")).equal("Material")
        should(tags.get("PuzzleEngine")).equal("Stockfish 13")
        should(tags.get("PuzzleMakerVersion")).equal("0.5")
        should(tags.get("PuzzleWinner")).equal("White")
    })

    it("should read unusual spacing of tags", function () {
        let pgn = new PgnReader({pgn: '[  White    "Me"   ]  [  Black  "Magnus"   ] 1. e4'})
        should.exist(pgn)
        let tags = pgn.getTags()
        should.exist(tags)
        should(tags.get('White')).equal("Me")

    })
})

describe("When reading pgn with variations", function() {
    let reader

    it("should understand one variation for white", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) exf4"})
        should(reader.getMove(0).variations.length).equal(0)
        should(reader.getMove(1).variations.length).equal(0)
        should(reader.getMove(2).variations.length).equal(1)
        should(reader.getMove(3).variations.length).equal(0)
        should(reader.getMove(2).variations[0].notation.notation).equal("Nf3")
        should(reader.getMove(reader.getMove(2).variations[0].next).notation.notation).equal("Nc6")
        should(reader.getMove(3).prev).equal(1)
        should(reader.getMove(1).next).equal(2)
        should(reader.getMove(3).next).equal(4)
        should(reader.getMove(4).prev).equal(3)
        should(reader.getMove(5).prev).equal(2)
    })

    it("should understand one variation for black with move number", function () {
        reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5 Qxd5)"})
        should(reader.getMove(1).variations.length).equal(1)
        should(reader.getMove(0).variations.length).equal(0)
        should(reader.getMove(1).variations[0].notation.notation).equal("d5")
        should(reader.getMove(2).prev).equal(0)
        should(reader.getMove(3).prev).equal(2)
    })

    it("should understand all variations for black and white with different move number formats", function () {
        reader = new PgnReader({pgn: "1. e4 (1... c4?) e5 (1... d5 2 exd5 2... Qxd5)"})
        should(reader.getMove(0).variations.length).equal(1)
        should(reader.getMove(1).variations.length).equal(0)
        should(reader.getMove(2).variations[0].notation.notation).equal("d5")
        should(reader.getMove(3).prev).equal(0)
        should(reader.getMove(4).prev).equal(3)
    })

    it("should understand one variation for black without move number", function () {
        reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5)"})
        should(reader.getMove(1).variations.length).equal(1)
        should(reader.getMove(0).variations.length).equal(0)
        should(reader.getMove(1).variations[0].notation.notation).equal("d5")
        should(reader.getMove(2).prev).equal(0)
        should(reader.getMove(3).prev).equal(2)
    })

    it("should understand nested variations", function() {
        reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5 (2... Nf6))"})
        should(reader.getMove(1).variations[0].notation.notation).equal("d5")
        should(reader.getMove(4).variations.length).equal(1)
        should(reader.getMove(4).variations[0].notation.notation).equal("Nf6")
        should(reader.getMove(2).prev).equal(0)
        should(reader.getMove(5).prev).equal(3)
    })

    it ("should know how to handle variation of the first move", function () {
        reader = new PgnReader({pgn: "1. e4 ( 1. d4 d5 ) e5"})
        should(reader.getMove(1).prev).equal(undefined)
        should(reader.getMove(reader.getMove(0).next).notation.notation).equal("e5")
        should(reader.getMove(reader.getMove(1).next).notation.notation).equal("d5")
    })

    it ("should know about variations in syntax for variants", function() {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 )"})
        should(reader.getMove(1).variations[0].notation.notation).equal("d5")
    })

    it ("should know about variations in syntax for variants including results", function() {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 ) 1-0"})
        should(reader.getMove(1).variations[0].notation.notation).equal("d5")
    })
})

describe("When iterating over moves", function() {
    let moves
    beforeEach(function () {
        moves = []
    })
    let flatMoves = function (pgn) {
        let reader = new PgnReader({pgn: pgn})
        moves = reader.getMoves()
    }
    it("should find the main line", function () {
        flatMoves("1. e4 e5")
        should(moves.length).equal(2)
        should(moves[0].notation.notation).equal("e4")
        should(moves[1].notation.notation).equal("e5")
    })

    it("should find the first variation", function () {
        flatMoves("1. e4 e5 (1... d5)")
        should(moves.length).equal(3)
        should(moves[0].notation.notation).equal("e4")
        should(moves[2].notation.notation).equal("d5")
    })

    it("should find all variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. d4 (2. Nf3 Nc6)")
        should(moves.length).equal(6)
        should(moves[0].notation.notation).equal("e4")
        should(moves[2].notation.notation).equal("d5")
        should(moves[3].notation.notation).equal("d4")
        should(moves[4].notation.notation).equal("Nf3")
    })

    it("should find nested variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. Nf3 Nc6 (2... d6 3. d4 (3. Be2)) 3. Bb5")
        should(moves.length).equal(9)
        should(moves[0].notation.notation).equal("e4")
        should(moves[1].notation.notation).equal("e5")
        should(moves[2].notation.notation).equal("d5")
        should(moves[4].notation.notation).equal("Nc6")
        should(moves[5].notation.notation).equal("d6")
        should(moves[6].notation.notation).equal("d4")
        should(moves[7].notation.notation).equal("Be2")
        should(moves[8].notation.notation).equal("Bb5")
    })

    it ("should find follow-ups of nested variations", function() {
        flatMoves("1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5) 3. Nf3 {is hot}) 2... Nc6")
        should(moves.length).equal(8)
        should(moves[5].prev).equal(3)
        should.not.exist(moves[5].next)
        should(moves[6].prev).equal(4)
        should.not.exist(moves[6].next)
        should(moves[7].prev).equal(2)
        should.not.exist(moves[7].next)

    })

    it("should know its indices", function () {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4")
        for (let i = 0; i < moves.length; i++) {
            should(moves[i].index).equal(i)
        }
    })

    it ("should know its previous and next move", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4")
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should(moves[1].next).equal(4)
        should(moves[2].prev).equal(0)
        should(moves[2].next).equal(3)
        should(moves[3].prev).equal(2)
        should.not.exist(moves[3].next)
        should(moves[4].prev).equal(1)
        should.not.exist(moves[4].next)
    })

    it ("should know its previous and next move with 2 variations", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) (1... c5) 2. d4")
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should(moves[1].next).equal(5)
        should(moves[2].prev).equal(0)
        should(moves[2].next).equal(3)
        should(moves[3].prev).equal(2)
        should.not.exist(moves[3].next)
        should(moves[4].prev).equal(0)
        should.not.exist(moves[4].next)
        should(moves[5].prev).equal(1)
        should.not.exist(moves[5].next)
    })

    it ("should read complete games", function() {
        flatMoves("1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. Nf3 Nc6 6. exd6 cxd6 7. Nc3 g6 8. Nd5 {ein grober Fehler, der sofort einen Bauern verliert} Nxd5 9. cxd5 Qa5+ 10. Bd2 Qxd5 11. Qa4 Bg7 12. Bc4 {Weiß stellt sich immer schlechter} Qe4+ 13. Be3 d5 14. Bb5 {sieht nach Bauernrückgewinn aus} O-O 15. Bxc6 bxc6 16. Qxc6 {der Bauer ist vergiftet} Bg4 17. O-O (17. Nh4 Qd3 18. Nf3 (18. f3 Qxe3+) 18... Rac8 19. Qa4 Bxf3 20. gxf3 Rc2 {kostet die Dame}) 17... Bxf3 18. gxf3 Qxf3 {ist noch am Besten für Weiß} 19. Qd7 e6 20. Rfc1 Bxd4 21. Bxd4 Qg4+ { kostet den zweiten Bauern} 22. Kf1 Qxd4 23. b3 Rfd8 24. Qb7 e5 25. Rd1 Qb6 26.  Qe7 Qd6 {jeder Abtausch hilft} 27. Qxd6 Rxd6 28. Rd2 Rc8 29. Re1 f6 30. Red1 d4 31. f4 Kf7 32. fxe5 fxe5 33. Ke2 Ke6 34. a4 Rc3 35. Rd3 Rxd3 36. Kxd3 Rc6 37.  Rb1 Rc3+ 38. Kd2 Rh3 39. b4 Kd5 40. a5 Rxh2+ 41. Kc1 Kc4 {und Weiß hat nichts mehr} 42. Rb2 Rxb2 43. Kxb2 Kxb4 {höchste Zeit, aufzugeben} 44. Kc2 e4 45. Kd2 Kb3 46. a6 Kb2 47. Ke2 Kc2 48. Ke1 d3 49. Kf2 d2 50. Kg3 d1=Q 51. Kf4 Qd5 52.  Kg3 Qe5+ 53. Kf2 Kd2 54. Kg2 Ke2 55. Kh3 Kf2 56. Kg4 Qg3#")
        should.not.exist(moves[0].prev)
    })
})

describe("Default a new read algorithm for PGN", function() {
    let reader
    it ("should read the main line", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3"})
        let moves = reader.getMoves()
        should(moves.length).equal(3)
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should(moves[1].next).equal(2)
        should(moves[2].prev).equal(1)
        should.not.exist(moves[2].next)
    })

    it ("should read one variation for black", function() {
        reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. Nf3)"})
        let moves = reader.getMoves()
        should(moves.length).equal(4)
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should.not.exist(moves[1].next)
        should(moves[2].prev).equal(0)
        should(moves[2].next).equal(3)
        should(moves[3].prev).equal(2)
        should.not.exist(moves[3].next)
    })

    it ("should read one variation for white", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6)"})
        let moves = reader.getMoves()
        should(moves.length).equal(5)
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should(moves[1].next).equal(2)
        should(moves[2].prev).equal(1)
        should.not.exist(moves[2].next)
        should(moves[3].prev).equal(1)
        should(moves[3].next).equal(4)
        should(moves[4].prev).equal(3)
        should.not.exist(moves[4].next)
    })

    it ("should read one variation for white with move after", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) 2... exf4 3. Nf3"})
        
        let moves = reader.getMoves()
        should(moves.length).equal(7)
        should.not.exist(moves[0].prev)
        should(moves[0].next).equal(1)
        should(moves[1].prev).equal(0)
        should(moves[1].next).equal(2)
        should(moves[2].prev).equal(1)
        should(moves[2].next).equal(5)
        should(moves[3].prev).equal(1)
        should(moves[3].next).equal(4)
        should(moves[4].prev).equal(3)
        should.not.exist(moves[4].next)
        should(moves[5].prev).equal(2)
        should(moves[5].next).equal(6)
        should(moves[6].prev).equal(5)
        should.not.exist(moves[6].next)
    })
})

describe("When writing pgn for a game", function() {
    xit("should write an empty pgn string", function() {
        let reader = new PgnReader({pgn: ""})
        let res = reader.writePgn()
        should(res).equal("")
    })

    it("should write the normalized notation of the main line with only one move", function() {
        let reader = new PgnReader({pgn: "1. e4"})
        let res = reader.writePgn()
        should(res).equal("1. e4")
    })

    it("should write the normalized notation of the main line", function() {
        let reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5"})
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 2. Nf3 Nc6 3. Bb5")
    })

    it("should write the notation for a main line including comments", function () {
        let reader = new PgnReader({pgn: "{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5"})
        let res = reader.writePgn()
        should(res).equal("{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5")
    })

    it("should write all NAGs in the $<NUMBER> format", function () {
        let reader = new PgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"})
        let res = reader.writePgn()
        should(res).equal("1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$6 a6$5")
    })

    it("should write the notation for a main line with one variation", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3"})
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3")
    })

    it("should write the notation for a main line with several variations", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3"})
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3")
    })

    it("should write the notation for a main line with stacked variations", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4) 3. d4 ) 2. Nf3"})
        let res = reader.writePgn()
        should(res).equal("1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4 ) 3. d4 ) 2. Nf3")
    })
    it("should write the end of the game", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 0-1"})
        should(reader.writePgn()).equal("1. e4 e5 0-1")
    })
    it("should write the end of the game, understand all results: 1-0", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 1-0"})
        should(reader.writePgn()).equal("1. e4 e5 1-0")
    })
    it("should write the end of the game, understand all results: *", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 *"})
        should(reader.writePgn()).equal("1. e4 e5 *")
    })
    it("should write the end of the game, understand all results: 1/2-1/2", function () {
        let reader = new PgnReader({pgn: "1. e4 e5 1/2-1/2"})
        should(reader.writePgn()).equal("1. e4 e5 1/2-1/2")
    })
    it("should write the end of the game as part of tags", function () {
        let reader = new PgnReader({pgn: '[Result "0-1"] 1. e4 e5'})
        should(reader.writePgn()).equal("1. e4 e5 0-1")
    })
    it("should write the end of the game as part of tags, understand all results: *", function () {
        let reader = new PgnReader({pgn: '[Result "*"] 1. e4 e5'})
        should(reader.writePgn()).equal("1. e4 e5 *")
    })
    it("should write the end of the game as part of tags, understand all results: 1/2-1/2", function () {
        let reader = new PgnReader({pgn: '[Result "1/2-1/2"] 1. e4 e5'})
        should(reader.writePgn()).equal("1. e4 e5 1/2-1/2")
    })
    it("should write the end of the game as part of tags, understand all results: 1-0", function () {
        let reader = new PgnReader({pgn: '[Result "1-0"] 1. e4 e5'})
        should(reader.writePgn()).equal("1. e4 e5 1-0")
    })
    it("should write promotion correct", function () {
        let reader = new PgnReader({position: '8/6P1/8/2k5/8/8/8/7K w - - 0 1', pgn: '1. g8=R'})
        should(reader.writePgn()).equal("1. g8=R")
    })
})

describe("When reading game with an end", function () {
    it("should return the correct result with getEndGame")
    it("should return null with getEndGame if there was no end game noted")
    it("should return the correct result with getEndGame, if the game was finished by mate or stalemate")
})

describe("When using san and sanWithNags", function () {
    it("should get correct san independent of the source format")
    it("should get correct san with NAGs in the right order??")
})

describe("When reading many games", function () {
    it("should ensure switching games works")
    it("should ensure lazyLoad and loadOne works")
})

describe("When having a game loaded", function () {
    it("should compute possibleMoves in all positions")
    it("should compute possibleMoves for a given position")
})

describe("When making moves in pgn", function() {
    let empty, reader
    beforeEach(function () {
        reader = new PgnReader({pgn: "1. d4 e5"})
        empty = new PgnReader({pgn: "*"})
    })

    it("should have no moves with an empty PGN string", function () {
        should(empty.getMoves().length).equal(0)
    })

    it("should write a move on the initial position", function () {
        empty.addMove("e4", null)
        should(empty.getMoves().length).equal(1)
        should(empty.getMove(0).notation.notation).equal("e4")
    })

    it("should write a move in the position with white on turn", function () {
        reader.addMove("e4", 1)
        should(reader.getMoves().length).equal(3)
        should(reader.getMove(2).turn).equal("w")
    })

    it("should write a move in the position with black on turn", function () {
        reader = new PgnReader({pgn: "1. d4 e5 2. e4"})
        reader.addMove("exd4", 2)
        should(reader.getMoves().length).equal(4)
        should(reader.getMove(3).turn).equal("b")
    })

    it("should use the existing move in the main line", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("Nf3", 1)
        should(reader.getMoves().length).equal(4)
        should(reader.getMove(2).turn).equal("w")
        should(reader.getMove(2).notation.notation).equal("Nf3")
    })

    it("should start new variation in the middle of the main line", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("f4", 1)
        should(reader.getMoves().length).equal(5)
        should(reader.getMove(4).turn).equal("w")
        should(reader.getMove(4).notation.notation).equal("f4")
        should(reader.getMove(2).variations.length).equal(1)
        should(reader.getMove(2).variations[0].notation.notation).equal("f4")
    })

    it("should start a second variation in the middle of the main line, when the current move has already a variation", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("f4", 1) // first variation
        reader.addMove("d4", 1) // second variation to the same FEN
        should(reader.getMoves().length).equal(6)
        should(reader.getMove(5).turn).equal("w")
        should(reader.getMove(5).notation.notation).equal("d4")
        should(reader.getMove(2).variations.length).equal(2)
        should(reader.getMove(2).variations[0].notation.notation).equal("f4")
        should(reader.getMove(2).variations[1].notation.notation).equal("d4")
    })

    it("should use the existing move in the variation", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("Nf3", 1) // first main line
        reader.addMove("Nc6", 2) // second main line
        should(reader.getMoves().length).equal(4)
        should(reader.getMove(2).turn).equal("w")
        should(reader.getMove(2).notation.notation).equal("Nf3")
        should(reader.getMove(3).turn).equal("b")
        should(reader.getMove(3).notation.notation).equal("Nc6")
    })

    it("should know how to  notate castling", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5"})
        reader.addMove("O-O", 5)
        should(reader.getMoves().length).equal(7)
        should(reader.getMove(6).turn).equal("w")
        should(reader.getMove(6).notation.notation).equal("O-O")
        reader.addMove("O-O", 6)
        should(reader.getMoves().length).equal(8)
        should(reader.getMove(7).turn).equal("b")
        should(reader.getMove(7).notation.notation).equal("O-O")
    })
})

describe("When deleting lines" , function () {
    it("should delete the whole main line", function() {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMove(0)
        reader.isDeleted(0).should.be.true()
    })

    it("should delete the rest of the line (without variation)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMove(2)
        should(reader.isDeleted(0)).not.be.ok()
        should(reader.isDeleted(1)).not.be.ok()
        reader.isDeleted(2).should.be.true()
        reader.isDeleted(3).should.be.true()
    })

    it("should delete the rest of the line, replace it by the first variation", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) Nc6"})
        should(reader.getMove(3).variationLevel).equal(1)
        reader.deleteMove(2)
        should(reader.isDeleted(0)).not.be.ok()
        should(reader.isDeleted(1)).not.be.ok()
        reader.isDeleted(2).should.be.true()
        reader.isDeleted(5).should.be.true()
        should(reader.getMove(3).variationLevel).equal(0)
        should(reader.getMove(4).variationLevel).equal(0)
        should(reader.getMove(1).next).equal(3)
    })

    it("should delete the whole variation with the first move", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) (2. d4 exd4) Nc6"})
        should(reader.getMove(3).variationLevel).equal(1)
        reader.deleteMove(3)
        should(reader.isDeleted(0)).not.be.ok()
        should(reader.isDeleted(1)).not.be.ok()
        should(reader.isDeleted(2)).not.be.ok()
        reader.isDeleted(3).should.be.true()
        reader.isDeleted(4).should.be.true()
        should(reader.getMove(2).variationLevel).equal(0)
        should(reader.getMove(5).variationLevel).equal(1)
        should(reader.getMove(6).variationLevel).equal(1)
    })

    it("should delete the rest of a variation (including the move)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4 3. Nf3 d6) (2. d4 exd4) Nc6"})
        should(reader.getMove(3).variationLevel).equal(1)
        reader.deleteMove(4)
        should(reader.isDeleted(3)).not.be.ok()
        reader.isDeleted(4).should.be.true()
    })

    // The following test case is wrong, and should be rewritten: what does the move number denote? why deleting 2 times?
    // Asserts have to be useful (like what is the resulting pgn then) 
    xit("should delete the moves before (without the move)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMovesBefore(0)
        should(reader.getMoves().length).equal(4)
        reader.deleteMovesBefore(1)
        should(reader.getMoves().length).equal(4)
        reader.isDeleted(0).should.be.true()
    })
})

describe("When upvoting lines", function () {
    let pgn = "1. e4 e5 2. Nf3 (2. f4 exf4) (2. d4 exd4)"
    let pgn2 = "e4 (d4 d5) (c4 c5) e5"

    it("should upvote the second line as first line", function () {
        let reader = new PgnReader({pgn: pgn})
        should(reader.getMove(3).variationLevel).equal(1)
        should(reader.getMove(2).variations[0].index).equal(3)
        should(reader.getMove(2).variations[1].index).equal(5)
        reader.promoteMove(5)
        should(reader.getMove(2).variations[0].index).equal(5)
        should(reader.getMove(2).variations[1].index).equal(3)
    })

    it("should upvote the first line as main line", function () {
        let reader = new PgnReader({pgn: pgn})
        should(reader.getMove(3).variationLevel).equal(1)
        should(reader.getMove(2).variations[0].index).equal(3)
        should(reader.getMove(2).variations[1].index).equal(5)
        reader.promoteMove(3)
        reader.startVariation(reader.getMove(2)).should.be.true()
        should(reader.getMove(2).variationLevel).equal(1)
        should(reader.getMove(3).variationLevel).equal(0)
    })

    it("should ignore upvoting the main line", function () {
        let reader = new PgnReader({pgn: pgn})
        should(reader.getMove(3).variationLevel).equal(1)
        should(reader.getMove(2).variations[0].index).equal(3)
        should(reader.getMove(2).variations[1].index).equal(5)
        reader.promoteMove(2)
        should(reader.getMove(2).variations[0].index).equal(3)
        should(reader.getMove(2).variations[1].index).equal(5)
    })

    it("should handle first move variations, upvote first line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should(reader.getMoves().length).equal(6)
        reader.promoteMove(1)
        should(reader.getMove(1).variationLevel).equal(0)
        should(reader.getMove(1).variations[0].index).equal(0)
        should(reader.getMove(0).variationLevel).equal(1)
    })

    it("should handle first move variations, upvote second line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should(reader.getMoves().length).equal(6)
        reader.promoteMove(3)
        should(reader.getMove(3).variationLevel).equal(1)
        should(reader.getMove(0).variations[0].index).equal(3)
        should(reader.getMove(0).variationLevel).equal(0)
    })

    it("should handle non-first move variations, upvote of any line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should(reader.getMoves().length).equal(6)
        reader.promoteMove(2)
        should(reader.getMove(1).variationLevel).equal(0)
        should(reader.getMove(1).variations[0].index).equal(0)
        should(reader.getMove(0).variationLevel).equal(1)
    })

    it("should handle non-first move variations, upvote of any line 2", function () {
        let reader = new PgnReader({pgn: pgn})
        should(reader.getMoves().length).equal(7)
        reader.promoteMove(4)
        should(reader.getMove(3).variationLevel).equal(0)
        should(reader.getMove(3).variations[0].index).equal(2)
        should(reader.getMove(2).variationLevel).equal(1)
        should(reader.getMove(0).variationLevel).equal(0)
    })

})

describe("When searching moves", function () {
    it("should find an existing move based on san")
    it("should find an existing move based on the index of the move")
})

describe("When having read a game with variation", function () {
    it("should ensure that startMainLine works")
    it("should ensure that startVariation works")
    it("should ensure that endVariation works")
    it("should ensure that afterMoveWithVariation works")
})

describe("!!When using setToStart", function () {
    it("should ensure that this can be used everywhere (how about navigating, and then using setToStart??)")
})

describe("When working with NAGs", function () {
    let reader
    beforeEach(function () {
        reader = new PgnReader({pgn: "1. d4 e5"})
    })

    it ("should add selected NAG as first when empty", function () {
        reader.changeNag("??", 1, true)
        should(reader.getMove(1).nag[0]).equal("$4")
        reader.changeNag("!!", 0, true)
        should(reader.getMove(0).nag[0]).equal("$3")
    })

    it("should add selected NAG as last when already some", function () {
        reader.changeNag("??", 1, true)
        reader.changeNag("!!", 1, true)
        should(reader.getMove(1).nag[1]).equal("$3")
        should(reader.getMove(1).nag[0]).equal("$4")
    })

    it("should clear all NAGs", function () {
        reader.changeNag("??", 1, true)
        should(reader.getMove(1).nag[0]).equal("$4")
        reader.clearNags(1)
        should(reader.getMove(1).nag.length).equal(0)
    })

    it("should ignore clear when no NAGs", function () {
        reader.clearNags(1)
        should(reader.getMove(1).nag.length).equal(0)
        reader.clearNags(1)
        should(reader.getMove(1).nag.length).equal(0)
    })
})

describe("When having a game and wanting to add arrows and circles", function () {
    it("should understand how to set arrows")
    it("should understand how to set circles")
    it("should understand how to set arrows andcircles")
})

describe("Working with games with special characters", function () {
    it("should ignore 1 space at beginning and end", function () {
        let reader = new PgnReader({pgn: " 1. d4 e5  "})
        should(reader.getMoves().length).equal(2)
    })

    it("should ignore more spaces at beginning and end", function () {
        let reader = new PgnReader({pgn: "     1. d4 e5   "})
        should(reader.getMoves().length).equal(2)
    })
})

describe("When pgn notation has errors", function () {
    it("should read wrong chess moves in PGN by matching", function () {
        (function () { new PgnReader({pgn: 'd5'}).loadPgn() } ).should.throw('No legal move: d5')
    })
    it("should read syntactically wrong PGN by throwing SyntaxError", function () {
        (function() {new PgnReader({pgn: 'ddd3'}).loadPgn()}).should.throw('Expected [1-8] but "d" found.')
    })
})

const should = require('chai').should()
import { expect } from 'chai'
import {PgnReader, Shape} from "../src"
import {describe} from "mocha"
import {readFile} from "../src/fetch"

/**
 * Checks all functionality for reading and interpreting a configuration for the reader.
 */


describe("Base functionality of the reader without any configuration", function () {
    let reader
    it("should be able to read a main line", function () {
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6'})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.writePgn(),"1. e4 e5 2. Nf3 Nc6")
    })
    it("should be able to read a main line with one variant", function (){
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6 (Nf6 d4 exd4)'})
        should.equal(reader.getMoves().length,7)
        should.equal(reader.writePgn(),"1. e4 e5 2. Nf3 Nc6 ( 2... Nf6 3. d4 exd4 )")
        let move = reader.findMove("Nf6")
        should.exist(move)
        should.equal(move.moveNumber,2)
        should.equal(move.turn,'b')
        should.equal(move.notation.notation,"Nf6")
        should.equal(move.variationLevel,1)
        let prev = reader.getMove(move.prev)
        should.equal(prev.moveNumber,2)
        should.equal(reader.san(prev),"Nf3")
        should.equal(prev.turn, 'w')
    })
    it("should be able to read a main line with many variants on different levels", function () {
        reader = new PgnReader({pgn: 'e4 (d4 d5)(c4) e5 Nf3 (f4 d5 (Nc6))'})
        should.equal(reader.getMoves().length,9)
        should.equal(reader.getMove(0).variations.length,2)
        let m3 = reader.getMove(3)
        should.equal(m3.variations.length,0)
        expect(reader.startVariation(m3)).to.be.true
        expect(reader.endVariation(m3)).to.be.true
        let m8 = reader.getMove(8)
        should.equal(m8.variationLevel,2)
        let prev8 = reader.getMove(m8.prev)
        should.equal(prev8.variationLevel,1)
    })
    it("should understand game comment and after comment in principle", function() {
        reader = new PgnReader({pgn: "{START} 1. d4 {AFTER} e5"})
        let move = reader.getMove(0)
        should.equal(reader.getGameComment().comment,"START")
        should.equal(move.commentAfter,"AFTER")
        should.equal(move.notation.notation,"d4")
    })

    it("should understand comments for variation with white", function() {
        reader = new PgnReader({pgn: "1. d4 ({START} 1. e4 {AFTER} e5) 1... d5"})
        let var_first = reader.getMove(0).variations[0]
        should.equal(var_first.commentMove,"START")
        should.equal(var_first.commentAfter,"AFTER")
        should.equal(var_first.notation.notation,"e4")
    })

    it("should read all sorts of comments", function() {
        reader = new PgnReader({pgn: "{Before move} 1. e4 {After move}"})
        let first = reader.getMove(0)
        should.equal(reader.getGameComment().comment,"Before move")
        should.equal(first.commentAfter,"After move")
    })
    it("should ignore empty comments #211", function () {
        reader = new PgnReader({pgn: "e4 { [%csl Gf6] }"})
        let move = reader.getMove(0)
        should.exist(move)
        should.equal(move.commentDiag.colorFields.length,1)
        should.equal(move.commentDiag.colorFields[0],"Gf6")
        expect(move.commentAfter).to.be.undefined
    })

    it ("should understand format of diagram circles", function() {
        reader = new PgnReader({pgn: "1. e4 {[%csl Ya4, Gb4,Rc4]}"})
        let first = reader.getMove(0)
        should.equal(first.commentDiag.colorFields.length,3)
        should.equal(first.commentDiag.colorFields[0],"Ya4")
        should.equal(first.commentDiag.colorFields[1],"Gb4")
        should.equal(first.commentDiag.colorFields[2],"Rc4")
    })
    it ("should understand format of diagram arrows", function() {
        reader = new PgnReader({pgn: "1. e4 {[%cal Ya4b2, Gb4h8,Rc4c8]}"})
        let first = reader.getMove(0)
        should.equal(first.commentDiag.colorArrows.length,3)
        should.equal(first.commentDiag.colorArrows[0],"Ya4b2")
        should.equal(first.commentDiag.colorArrows[1],"Gb4h8")
        should.equal(first.commentDiag.colorArrows[2],"Rc4c8")
    })
    it ("should understand both circles and arrows", function() {
        reader = new PgnReader({pgn: "e4 {[%csl Yf4,Gg5,Gd4,Rc4,Bb4,Ya4][%cal Gg1f3,Rf1c4,Gh2h4,Rg2g4,Bf2f4,Ye2e4]}"})
        let first = reader.getMove(0)
        should.equal(first.commentDiag.colorArrows.length,6)
        should.equal(first.commentDiag.colorFields.length,6)
    })

    it ("should be able to read additional tags and keep them", function () {
        reader = new PgnReader({ pgn: '[White "Me"] [Black "Magnus"] e4 e5'})
        should.equal(reader.getMoves().length,2)
        let tags = reader.getTags()
        should.equal(tags.get('White'),"Me")
        should.equal(tags.get('Black'),"Magnus")

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
        should.equal(moves.length,6)
        expect(moves[0].nag).to.deep.equal(["$1"])
        expect(moves[1].nag).to.deep.equal(["$2"])
        expect(moves[2].nag).to.deep.equal(["$3"])
        expect(moves[3].nag).to.deep.equal(["$4"])
        expect(moves[4].nag).to.deep.equal(["$6"])
        expect(moves[5].nag).to.deep.equal(["$5"])
    })
    it ("should have the fen stored with each move", function () {
        reader = new PgnReader({pgn: "1. d4 e5"})
        should.equal(reader.getMoves().length,2)
        should.exist(reader.getMoves()[0].fen)
        should.exist(reader.getMoves()[1].fen)
    })
})

describe("When using all kind of configuration in the reader", function () {
    let reader
    it("should ensure that short notation is written", function () {
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6', notation: 'short'})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.writePgn(),'1. e4 e5 2. Nf3 Nc6')
    })
    it("should ensure that long notation is written", function (){
        reader = new PgnReader({ pgn: 'e4 e5 Nf3 Nc6', notation: 'long'})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.writePgn({notation: 'long'}),'1. e2-e4 e7-e5 2. Ng1-f3 Nb8-c6')
    })
    it("should ensure that different positions are understood", function () {
        reader = new PgnReader({pgn: 'e4', position: 'start'})
        should.exist(reader)
        should.equal(reader.getMoves().length,1)
        expect(reader.getPosition(null).startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')).to.be.true
        reader = new PgnReader({ pgn: 'e5', position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'})
        should.equal(reader.getMoves().length,1)
        expect(reader.getPosition(0).startsWith('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR')).to.be.true

    })
    it("should ensure that configuring manyGames works", function () {
        reader = new PgnReader({manyGames: true, pgn: "e4 e5 *\n\nd4 d5 *"})
        should.exist(reader)
        should.equal(reader.getMoves().length,2)
        should.equal(reader.getGames().length,2)
    })
    it("should emmit an error when reading many games with `manyGames == true`", function () {
        expect(function() {new PgnReader({pgn: 'e4 e5 *\n\nd4 d5 *'})})
            .to.throw('Expected end of input or whitespace but "d" found.')
    })
    it("should ensure that lazyLoad works", function () {
        reader = new PgnReader({lazyLoad: true, manyGames: true, pgn: "e4 e5 *\n\nd4 d5 *"})
        should.exist(reader)
        expect(reader.getMoves()).to.be.empty
        expect(reader.getGames()).to.be.undefined
        reader.loadPgn()
        should.equal(reader.getGames().length,2)
        should.equal(reader.getMoves().length,2)
        should.equal(reader.getMove(0).notation.notation,'e4')
    })
    it("should ensure that pgnFile works (workaround)", function () {
        let content = readFile('test/2games.pgn')
        reader = new PgnReader({pgn: content, manyGames: true})
        should.equal(reader.getGames().length,2)
    })
    it("should ensure that error is thrown if file is not found / could not be read (workaround)", function () {
        expect(function () { readFile( '2games-missing.pgn') })
            .to.throw('File not found or could not read: 2games-missing.pgn')
    })
    it("should ensure that startPlay works", function () {
        reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6', startPlay: 3, hideMovesBefore: false})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMove(0).notation.notation,'e4')
    })
    // Get broken when implementing pgn-writer as separat package, no idea why
    xit("should ensure that hideMovesBefore works", function () {
        reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6', startPlay: 3, hideMovesBefore: true})
        should.equal(reader.getMoves().length,2)
        should.equal(reader.san(reader.getMove(0)),'Nf3')
    })
})

describe("When reading various formats", function() {
    let reader
    it ("should read and remember disambiguator", function() {
        reader = new PgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"})
        should.equal(reader.getMoves()[0].notation.disc,'d')
    })

    it("should use disambiguator on output", function() {
        reader = new PgnReader({pgn: "4. dxe5", position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"})
        should.equal(reader.sanWithNags(reader.getMove(0)),'dxe5')
    })

    it ("should understand that Long Algebraic Notation can be used when strike", function() {
        reader = new PgnReader({pgn: '4... Nf6xe4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'})
        should.equal(reader.sanWithNags(reader.getMove(0)),"Nxe4")
    })

    // chess.src does not allow to leave out the strike symbol, or I have to have more in the long notation
    // even with the long variation, the move Nf6-e4 is not accepted, even not in sloppy mode
    it ("should understand that Long Algebraic Notation can leave out strike symbol", function() {
        reader = new PgnReader({pgn: '4... Nf6e4', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4'})
        should.equal(reader.sanWithNags(reader.getMove(0)),"Nxe4")
    })

    it ("should understand that Long Algebraic Notation can be used", function() {
        reader = new PgnReader({pgn: '1. e2-e4 e7-e5'})
        should.equal(reader.sanWithNags(reader.getMove(0)),"e4")
        should.equal(reader.sanWithNags(reader.getMove(1)),"e5")
    })

    it ("should understand that disambiguator is needed here", function() {
        reader = new PgnReader({pgn: 'fxe5', position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 1 4'})
        should.equal(reader.sanWithNags(reader.getMove(0)),"fxe5")
    })
    xit ("should allow disambiguator that is not needed", function () {
        reader = new PgnReader({pgn: 'Ngf3'})
        should.equal(reader.sanWithNags(reader.getMove(0)),"Nf3")
    })
    // TODO This is not possible at the moment, because chess.js does not allow notation that includes the pawn symbol.
    // So if that should be implemented, the logic of reading the game has to be changed.
    xit ("should understand optional pawn symbols", function () {
        reader = new PgnReader({pgn: '1. Pe4 Pe5 2. Pd4 Pexd4'})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.sanWithNags(reader.getMove(0)),"e4")
        should.equal(reader.sanWithNags(reader.getMove(1)),"e5")
        should.equal(reader.sanWithNags(reader.getMove(2)),"d4")
        should.equal(reader.sanWithNags(reader.getMove(3)),"exd4")
    })
    // TODO Does not work either, some of them ok, some not. Reason seems to be, that chess.js does not allow all formats.
    // Solution could be to try different formats, if the source notation does not work.
    xit("should understand different notations", function () {
        reader = new PgnReader({pgn: 'Ng1f3'})  // works
        should.equal(reader.getMoves().length,1)
        reader = new PgnReader({pgn: 'Ng1-f3'}) // works
        should.equal(reader.getMoves().length,1)
        reader = new PgnReader({pgn: 'Nxf3'})
        should.equal(reader.getMoves().length,1)
        reader = new PgnReader({pgn: 'Ngf3'})
        should.equal(reader.getMoves().length,1)
        reader = new PgnReader({pgn: 'N1f3'})
        should.equal(reader.getMoves().length,1)
    })
})

describe("When working with different PGN beginnings and endings", function() {
    let reader

    it("should work with no moves at all", function() {
        reader = new PgnReader({pgn: ""})
        should.equal(reader.getMoves().length,0)
        should.equal(reader.getGames().length,1)
    })

    it("should work with white's first move only", function() {
        reader = new PgnReader({pgn: "1. e4"})
        should.equal(reader.getMoves().length,1)
        should.equal(reader.getMoves()[0].notation.notation,"e4")
        should.equal(reader.getMoves()[0].moveNumber,1)
    })

    it ("should work with black's first move only", function() {
        reader = new PgnReader({pgn: "1... e5", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"})
        should.equal(reader.getMoves().length,1)
        should.equal(reader.getMoves()[0].notation.notation,"e5")
        should.equal(reader.getMoves()[0].turn,"b")
        should.equal(reader.getMoves()[0].moveNumber,1)
    })

    it ("should work with white beginning and black ending", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. d4 exd4"})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMoves()[0].notation.notation,"e4")
        should.equal(reader.getMoves()[0].turn,"w")
        should.equal(reader.getMoves()[0].moveNumber,1)
        should.equal(reader.getMoves()[3].notation.notation,"exd4")
        should.equal(reader.getMoves()[3].turn,"b")
        //should.equal(reader.getMoves()[3].moveNumber).toBeUndefined()
    })

    it ("should work with black beginning and white ending", function() {
        reader = new PgnReader({pgn: "1... e5 2. d4 exd4 3. c3", position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"})
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMoves()[0].notation.notation,"e5")
        should.equal(reader.getMoves()[0].turn,"b")
        should.equal(reader.getMoves()[0].moveNumber,1)
        should.equal(reader.getMoves()[1].notation.notation,"d4")
        should.equal(reader.getMoves()[1].turn,"w")
        should.equal(reader.getMoves()[1].moveNumber,2)
        should.equal(reader.getMoves()[2].notation.notation,"exd4")
        should.equal(reader.getMoves()[2].turn,"b")
        //should.equal(reader.getMoves()[2].moveNumber).toBeUndefined()
    })
})


describe("When using all kind of notation", function() {
    let reader
    it ("should know how to move all kind of figures", function() {
        reader = new PgnReader({pgn: "1. e4 Nf6 2. Bb5 c6 3. Ba4 Qa5 4. Nf3 d5 5. O-O e6 6. Re1 "})
        should.equal(reader.getMoves().length,11)
    })

    it ("should know different variants of strikes", function() {
        reader = new PgnReader({pgn: "1. e4 d5 2. exd5 Nc6 3. dxc6 bxc6"})
        should.equal(reader.getMoves().length,6)
        should.equal(reader.getMoves()[2].notation.notation,"exd5")
    })

    it ("should know all special symbols normally needed (promotion, check, mate)", function() {
        reader = new PgnReader({pgn: "1. f3 e5 2. g4 Qh4#"})
        should.equal(reader.getMoves().length,4)
        reader = new PgnReader({pgn: "1. e7 d2 2. e8=Q d1=R+", position: "5rk1/8/4P3/8/8/3p4/5R2/6K1 w - - 0 1"})
    })

    it ("should be robust with missing symbols (check)", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7 Ke7 7. Nd5#"})
        should.equal(reader.getMoves().length,13)
        //should.equal(reader.getMoves()[10].notation.notation,"Bxf7+")
        should.equal(reader.getMoves()[10].notation.check,'+')
        let res = reader.writePgn()
        should.equal(res,"1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#")
    })

    it ("should be robust with missing symbols (mate)", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5"})
        should.equal(reader.getMoves().length,13)
        should.equal(reader.getMoves()[12].notation.check,'#')
        let res = reader.writePgn()
        should.equal(res,"1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#")
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
        should.equal(reader.getTags().size,9)
        should.equal(reader.getTags().get("Site"),"Berlin GER")
        should.equal(reader.getTags().get("Date").value,"1852.12.31")
        should.equal(reader.getTags().get("SetUp"),"0")
        should.equal(reader.configuration.position,"start")
    })

    it("should have tag mapped to FEN", function() {
        should.equal(reader2.getTags().get("SetUp"),"1")
        should.equal(reader2.configuration.position,"8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57")
    })

    it("should accept variations of case in tags", function() {
        let pgn = new PgnReader({pgn: '[Setup "1"] [fen "8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57"] *'})
        should.equal(pgn.getTags().get("SetUp"),"1")
        should.equal(pgn.configuration.position,"8/p6p/P5p1/8/4p1K1/6q1/5k2/8 w - - 12 57")
    })

    it("should understand unknown tags and record them", function () {
        let pgn = new PgnReader({pgn: '[PuzzleCategory "Material"] [PuzzleEngine "Stockfish 13"] ' +
                '[PuzzleMakerVersion "0.5"] [PuzzleWinner "White"] *'})
        let tags = pgn.getTags()
        should.equal(tags.get("PuzzleCategory"),"Material")
        should.equal(tags.get("PuzzleEngine"),"Stockfish 13")
        should.equal(tags.get("PuzzleMakerVersion"),"0.5")
        should.equal(tags.get("PuzzleWinner"),"White")
    })

    it("should read unusual spacing of tags", function () {
        let pgn = new PgnReader({pgn: '[  White    "Me"   ]  [  Black  "Magnus"   ] 1. e4'})
        should.exist(pgn)
        let tags = pgn.getTags()
        should.exist(tags)
        should.equal(tags.get('White'),"Me")

    })
})

describe("When reading pgn with variations", function() {
    let reader

    it("should understand one variation for white", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) exf4"})
        should.equal(reader.getMove(0).variations.length,0)
        should.equal(reader.getMove(1).variations.length,0)
        should.equal(reader.getMove(2).variations.length,1)
        should.equal(reader.getMove(3).variations.length,0)
        should.equal(reader.getMove(2).variations[0].notation.notation,"Nf3")
        should.equal(reader.getMove(reader.getMove(2).variations[0].next).notation.notation,"Nc6")
        should.equal(reader.getMove(3).prev,1)
        should.equal(reader.getMove(1).next,2)
        should.equal(reader.getMove(3).next,4)
        should.equal(reader.getMove(4).prev,3)
        should.equal(reader.getMove(5).prev,2)
    })

    it("should understand one variation for black with move number", function () {
        reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. exd5 Qxd5)"})
        should.equal(reader.getMove(1).variations.length,1)
        should.equal(reader.getMove(0).variations.length,0)
        should.equal(reader.getMove(1).variations[0].notation.notation,"d5")
        should.equal(reader.getMove(2).prev,0)
        should.equal(reader.getMove(3).prev,2)
    })

    it("should understand all variations for black and white with different move number formats", function () {
        reader = new PgnReader({pgn: "1. e4 (1... c4?) e5 (1... d5 2 exd5 2... Qxd5)"})
        should.equal(reader.getMove(0).variations.length,1)
        should.equal(reader.getMove(1).variations.length,0)
        should.equal(reader.getMove(2).variations[0].notation.notation,"d5")
        should.equal(reader.getMove(3).prev,0)
        should.equal(reader.getMove(4).prev,3)
    })

    it("should understand one variation for black without move number", function () {
        reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5)"})
        should.equal(reader.getMove(1).variations.length,1)
        should.equal(reader.getMove(0).variations.length,0)
        should.equal(reader.getMove(1).variations[0].notation.notation,"d5")
        should.equal(reader.getMove(2).prev,0)
        should.equal(reader.getMove(3).prev,2)
    })

    it("should understand nested variations", function() {
        reader = new PgnReader({pgn: "1. e4 e5 (d5 2. exd5 Qxd5 (2... Nf6))"})
        should.equal(reader.getMove(1).variations[0].notation.notation,"d5")
        should.equal(reader.getMove(4).variations.length,1)
        should.equal(reader.getMove(4).variations[0].notation.notation,"Nf6")
        should.equal(reader.getMove(2).prev,0)
        should.equal(reader.getMove(5).prev,3)
    })

    it ("should know how to handle variation of the first move", function () {
        reader = new PgnReader({pgn: "1. e4 ( 1. d4 d5 ) e5"})
        should.equal(reader.getMove(1).prev,undefined)
        should.equal(reader.getMove(reader.getMove(0).next).notation.notation,"e5")
        should.equal(reader.getMove(reader.getMove(1).next).notation.notation,"d5")
    })

    it ("should know about variations in syntax for variants", function() {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 )"})
        should.equal(reader.getMove(1).variations[0].notation.notation,"d5")
    })

    it ("should know about variations in syntax for variants including results", function() {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 ) 1-0"})
        should.equal(reader.getMove(1).variations[0].notation.notation,"d5")
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
        should.equal(moves.length,2)
        should.equal(moves[0].notation.notation,"e4")
        should.equal(moves[1].notation.notation,"e5")
    })

    it("should find the first variation", function () {
        flatMoves("1. e4 e5 (1... d5)")
        should.equal(moves.length,3)
        should.equal(moves[0].notation.notation,"e4")
        should.equal(moves[2].notation.notation,"d5")
    })

    it("should find all variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. d4 (2. Nf3 Nc6)")
        should.equal(moves.length,6)
        should.equal(moves[0].notation.notation,"e4")
        should.equal(moves[2].notation.notation,"d5")
        should.equal(moves[3].notation.notation,"d4")
        should.equal(moves[4].notation.notation,"Nf3")
    })

    it("should find nested variations", function () {
        flatMoves("1. e4 e5 (1... d5) 2. Nf3 Nc6 (2... d6 3. d4 (3. Be2)) 3. Bb5")
        should.equal(moves.length,9)
        should.equal(moves[0].notation.notation,"e4")
        should.equal(moves[1].notation.notation,"e5")
        should.equal(moves[2].notation.notation,"d5")
        should.equal(moves[4].notation.notation,"Nc6")
        should.equal(moves[5].notation.notation,"d6")
        should.equal(moves[6].notation.notation,"d4")
        should.equal(moves[7].notation.notation,"Be2")
        should.equal(moves[8].notation.notation,"Bb5")
    })

    it ("should find follow-ups of nested variations", function() {
        flatMoves("1. e4 e5 2. Nf3 (2. f4 exf4 (2... d5) 3. Nf3 {is hot}) 2... Nc6")
        should.equal(moves.length,8)
        should.equal(moves[5].prev,3)
        expect(moves[5].next).to.not.exist
        should.equal(moves[6].prev,4)
        expect(moves[6].next).to.not.exist
        should.equal(moves[7].prev,2)
        should.not.exist(moves[7].next)

    })

    it("should know its indices", function () {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4")
        for (let i = 0; i < moves.length; i++) {
            should.equal(moves[i].index,i)
        }
    })

    it ("should know its previous and next move", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) 2. d4")
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.equal(moves[1].next,4)
        should.equal(moves[2].prev,0)
        should.equal(moves[2].next,3)
        should.equal(moves[3].prev,2)
        should.not.exist(moves[3].next)
        should.equal(moves[4].prev,1)
        should.not.exist(moves[4].next)
    })

    it ("should know its previous and next move with 2 variations", function() {
        flatMoves("1. e4 e5 (1... d5 2. exd5) (1... c5) 2. d4")
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.equal(moves[1].next,5)
        should.equal(moves[2].prev,0)
        should.equal(moves[2].next,3)
        should.equal(moves[3].prev,2)
        should.not.exist(moves[3].next)
        should.equal(moves[4].prev,0)
        should.not.exist(moves[4].next)
        should.equal(moves[5].prev,1)
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
        should.equal(moves.length,3)
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.equal(moves[1].next,2)
        should.equal(moves[2].prev,1)
        should.not.exist(moves[2].next)
    })

    it ("should read one variation for black", function() {
        reader = new PgnReader({pgn: "1. e4 e5 (1... d5 2. Nf3)"})
        let moves = reader.getMoves()
        should.equal(moves.length,4)
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.not.exist(moves[1].next)
        should.equal(moves[2].prev,0)
        should.equal(moves[2].next,3)
        should.equal(moves[3].prev,2)
        should.not.exist(moves[3].next)
    })

    it ("should read one variation for white", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6)"})
        let moves = reader.getMoves()
        should.equal(moves.length,5)
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.equal(moves[1].next,2)
        should.equal(moves[2].prev,1)
        should.not.exist(moves[2].next)
        should.equal(moves[3].prev,1)
        should.equal(moves[3].next,4)
        should.equal(moves[4].prev,3)
        should.not.exist(moves[4].next)
    })

    it ("should read one variation for white with move after", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. f4 (2. Nf3 Nc6) 2... exf4 3. Nf3"})

        let moves = reader.getMoves()
        should.equal(moves.length,7)
        should.not.exist(moves[0].prev)
        should.equal(moves[0].next,1)
        should.equal(moves[1].prev,0)
        should.equal(moves[1].next,2)
        should.equal(moves[2].prev,1)
        should.equal(moves[2].next,5)
        should.equal(moves[3].prev,1)
        should.equal(moves[3].next,4)
        should.equal(moves[4].prev,3)
        should.not.exist(moves[4].next)
        should.equal(moves[5].prev,2)
        should.equal(moves[5].next,6)
        should.equal(moves[6].prev,5)
        should.not.exist(moves[6].next)
    })
})

describe("When writing pgn for a game", function() {
    let reader
    let res
    it("should write only a result if an empty pgn string is given", function() {
        reader = new PgnReader({pgn: ""})
        res = reader.writePgn({tags: 'no'})
        should.equal(res.trim(),"*")
    })

    it("should write the normalized notation of the main line with only one move", function() {
        reader = new PgnReader({pgn: "1. e4"})
        res = reader.writePgn()
        should.equal(res,"1. e4")
    })

    it("should write the normalized notation of the main line", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5"})
        res = reader.writePgn()
        should.equal(res,"1. e4 e5 2. Nf3 Nc6 3. Bb5")
    })

    it("should write the notation for a main line including comments", function () {
        reader = new PgnReader({pgn: "{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5"})
        res = reader.writePgn()
        should.equal(res,"{FIRST} 1. e4 {THIRD} e5 {FOURTH} 2. Nf3 Nc6 3. Bb5")
    })

    it("should write all NAGs in the $<NUMBER> format", function () {
        reader = new PgnReader({pgn: "1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5?! a6!?"})
        res = reader.writePgn()
        should.equal(res,"1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$6 a6$5")
    })

    it("should write the notation for a main line with one variation", function () {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3"})
        res = reader.writePgn()
        should.equal(res,"1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) 2. Nf3")
    })

    it("should write the notation for a main line with several variations", function () {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3"})
        res = reader.writePgn()
        should.equal(res,"1. e4 e5 ( 1... d5 2. exd5 Qxd5 ) ( 1... c5 2. Nf3 d6 ) 2. Nf3")
    })

    it("should write the notation for a main line with stacked variations", function () {
        reader = new PgnReader({pgn: "1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4) 3. d4 ) 2. Nf3"})
        res = reader.writePgn()
        should.equal(res,"1. e4 e5 ( 1... c5 2. Nf3 d6 ( 2... Nc6 3. d4 ) 3. d4 ) 2. Nf3")
    })
    it("should write the end of the game", function () {
        reader = new PgnReader({pgn: "1. e4 e5 0-1"})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 0-1")
    })
    it("should write the end of the game, understand all results: 1-0", function () {
        reader = new PgnReader({pgn: "1. e4 e5 1-0"})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1-0")
    })
    it("should write the end of the game, understand all results: *", function () {
        reader = new PgnReader({pgn: "1. e4 e5 *"})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 *")
    })
    it("should write the end of the game, understand all results: 1/2-1/2", function () {
        reader = new PgnReader({pgn: "1. e4 e5 1/2-1/2"})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1/2-1/2")
    })
    it("should write the end of the game as part of tags", function () {
        reader = new PgnReader({pgn: '[Result "0-1"] 1. e4 e5'})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 0-1")
    })
    it("should write the end of the game as part of tags, understand all results: *", function () {
        reader = new PgnReader({pgn: '[Result "*"] 1. e4 e5'})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 *")
    })
    it("should write the end of the game as part of tags, understand all results: 1/2-1/2", function () {
        reader = new PgnReader({pgn: '[Result "1/2-1/2"] 1. e4 e5'})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1/2-1/2")
    })
    it("should write the end of the game as part of tags, understand all results: 1-0", function () {
        reader = new PgnReader({pgn: '[Result "1-0"] 1. e4 e5'})
        should.equal(reader.writePgn({tags: 'no'}),"1. e4 e5 1-0")
    })
    it("should write promotion correct", function () {
        reader = new PgnReader({position: '8/6P1/8/2k5/8/8/8/7K w - - 0 1', pgn: '1. g8=R'})
        should.equal(reader.writePgn(),"1. g8=R")
    })
})

describe("When reading game with an end", function () {
    let reader
    it("should return the correct result with getEndGame", function (){
        reader = new PgnReader({pgn: 'e4 *'})
        should.equal(reader.getEndGame(),'*')
        reader = new PgnReader({pgn: 'e4 1-0'})
        should.equal(reader.getEndGame(),'1-0')
    })
    it("should return null with getEndGame if there was no end game noted", function (){
        reader = new PgnReader({pgn: 'e4'})
        should.equal(reader.getGames().length,1)
        should.equal(reader.getMoves().length,1)
        expect(reader.getEndGame()).to.be.undefined
    })
    it("should return the correct end game if switching games", function () {
        reader = new PgnReader({pgn: 'e4 e5 *\n\nd4 d5 1-0\n\nc4', manyGames: true})
        should.equal(reader.getGames().length,3)
        should.equal(reader.getEndGame(),'*')
        reader.loadOne(1)
        should.equal(reader.getMove(0).notation.notation,'d4')
        should.equal(reader.getEndGame(),'1-0')
        reader.loadOne(2)
        should.equal(reader.getMove(0).notation.notation,'c4')
        expect(reader.getEndGame()).to.be.undefined
    })
    // TODO See ticket #223 for the context
    xit("should return the correct result with getEndGame, if the game was finished by mate or stalemate", function (){
        reader = new PgnReader({pgn: 'f4 e6 g4 Qh4#'})
        should.equal(reader.getGames().length,1)
        should.equal(reader.getEndGame(),'0-1')
    })
})

describe("When using san and sanWithNags", function () {
    let reader: PgnReader
    it("should get correct san independent of the source format", function (){
        reader = new PgnReader({pgn: 'e2-e4'})
        should.equal(reader.san(reader.getMove(0)),'e4')
        reader = new PgnReader({pgn: 'e4'})
        should.equal(reader.san(reader.getMove(0)),'e4')
        reader = new PgnReader({pgn: 'e4', notation: 'long'})
        should.equal(reader.san(reader.getMove(0)),'e2-e4')
    })
    it("should get correct san with NAGs", function () {
        reader = new PgnReader({pgn: 'e4!?$13$27'})
        should.equal(reader.sanWithNags(reader.getMove(0)),'e4⁉∞○')
        should.equal(reader.writePgn(),'1. e4$5$13$27')
    })
})

describe("When reading many games", function () {
    let reader: PgnReader
    it("should ensure switching games works", function () {
        reader = new PgnReader({pgn: 'e4 * d4 * c4 *', manyGames: true})
        should.equal(reader.getGames().length,3)
        should.equal(reader.san(reader.getMove(0)),'e4')
        reader.loadOne(1)
        should.equal(reader.san(reader.getMove(0)),'d4')
        reader.loadOne(2)
        should.equal(reader.san(reader.getMove(0)),'c4')
    })
    it("should ensure lazyLoad and loadOne works", function (){
        reader = new PgnReader({pgn: 'e4 * d4 * c4 *', manyGames: true, lazyLoad: true})
        expect(reader.getGames()).to.be.undefined
        reader.loadMany()
        should.equal(reader.getGames().length,3)
        reader.loadOne(0)
        should.equal(reader.san(reader.getMove(0)),'e4')
        reader.loadOne(2)
        should.equal(reader.san(reader.getMove(0)),'c4')
    })
})

describe("When wanting to get possible next moves", function () {
    let reader: PgnReader
    it("should compute possibleMoves in postion after 4 moves", function () {
        reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6'})
        should.equal(reader.getMoves().length,4)
        let moves = reader.possibleMoves(3)
        should.exist(moves)
        should.equal(moves.get('f3').length,5)
    })
    it("should compute possibleMoves for a given position (nearly mate)", function () {
        reader = new PgnReader({position: '3k3R/8/4K3/8/8/8/8/8 b - - 0 1'})
        let moves = reader.possibleMoves('3k3R/8/4K3/8/8/8/8/8 b - - 0 1')
        should.exist(moves)
        should.equal(moves.get('d8').length,1)
        should.equal(moves.get('d8')[0],'c7')
    })
})

describe("When making moves in pgn", function() {
    let empty, reader
    beforeEach(function () {
        reader = new PgnReader({pgn: "1. d4 e5"})
        empty = new PgnReader({pgn: "*"})
    })

    it("should have no moves with an empty PGN string", function () {
        should.equal(empty.getMoves().length,0)
    })

    it("should write a move on the initial position", function () {
        empty.addMove("e4", null)
        should.equal(empty.getMoves().length,1)
        should.equal(empty.getMove(0).notation.notation,"e4")
    })

    it("should write a move in the position with white on turn", function () {
        reader.addMove("e4", 1)
        should.equal(reader.getMoves().length,3)
        should.equal(reader.getMove(2).turn,"w")
    })

    it("should write a move in the position with black on turn", function () {
        reader = new PgnReader({pgn: "1. d4 e5 2. e4"})
        reader.addMove("exd4", 2)
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMove(3).turn,"b")
    })

    it("should use the existing move in the main line", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("Nf3", 1)
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMove(2).turn,"w")
        should.equal(reader.getMove(2).notation.notation,"Nf3")
    })

    it("should start new variation in the middle of the main line", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("f4", 1)
        should.equal(reader.getMoves().length,5)
        should.equal(reader.getMove(4).turn,"w")
        should.equal(reader.getMove(4).notation.notation,"f4")
        should.equal(reader.getMove(2).variations.length,1)
        should.equal(reader.getMove(2).variations[0].notation.notation,"f4")
    })

    it("should start a second variation in the middle of the main line, when the current move has already a variation", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("f4", 1) // first variation
        reader.addMove("d4", 1) // second variation to the same FEN
        should.equal(reader.getMoves().length,6)
        should.equal(reader.getMove(5).turn,"w")
        should.equal(reader.getMove(5).notation.notation,"d4")
        should.equal(reader.getMove(2).variations.length,2)
        should.equal(reader.getMove(2).variations[0].notation.notation,"f4")
        should.equal(reader.getMove(2).variations[1].notation.notation,"d4")
    })

    it("should use the existing move in the variation", function () {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nc6"})
        reader.addMove("Nf3", 1) // first main line
        reader.addMove("Nc6", 2) // second main line
        should.equal(reader.getMoves().length,4)
        should.equal(reader.getMove(2).turn,"w")
        should.equal(reader.getMove(2).notation.notation,"Nf3")
        should.equal(reader.getMove(3).turn,"b")
        should.equal(reader.getMove(3).notation.notation,"Nc6")
    })

    it("should know how to  notate castling", function() {
        reader = new PgnReader({pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5"})
        reader.addMove("O-O", 5)
        should.equal(reader.getMoves().length,7)
        should.equal(reader.getMove(6).turn,"w")
        should.equal(reader.getMove(6).notation.notation,"O-O")
        reader.addMove("O-O", 6)
        should.equal(reader.getMoves().length,8)
        should.equal(reader.getMove(7).turn,"b")
        should.equal(reader.getMove(7).notation.notation,"O-O")
    })
})

describe("When deleting lines" , function () {
    it("should delete the whole main line", function() {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMove(0)
        expect(reader.isDeleted(0)).to.be.true
    })

    it("should delete the rest of the line (without variation)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMove(2)
        expect(reader.isDeleted(0)).not.be.ok
        expect(reader.isDeleted(1)).not.be.ok
        expect(reader.isDeleted(2)).to.be.true
        expect(reader.isDeleted(3)).to.be.true
    })

    it("should delete the rest of the line, replace it by the first variation", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) Nc6"})
        should.equal(reader.getMove(3).variationLevel,1)
        reader.deleteMove(2)
        expect(reader.isDeleted(0)).not.be.ok
        expect(reader.isDeleted(1)).not.be.ok
        expect(reader.isDeleted(2)).to.be.true
        expect(reader.isDeleted(5)).to.be.true
        should.equal(reader.getMove(3).variationLevel,0)
        should.equal(reader.getMove(4).variationLevel,0)
        should.equal(reader.getMove(1).next,3)
    })

    it("should delete the whole variation with the first move", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4) (2. d4 exd4) Nc6"})
        should.equal(reader.getMove(3).variationLevel,1)
        reader.deleteMove(3)
        expect(reader.isDeleted(0)).not.be.ok
        expect(reader.isDeleted(1)).not.be.ok
        expect(reader.isDeleted(2)).not.be.ok
        expect(reader.isDeleted(3)).to.be.true
        expect(reader.isDeleted(4)).to.be.true
        should.equal(reader.getMove(2).variationLevel,0)
        should.equal(reader.getMove(5).variationLevel,1)
        should.equal(reader.getMove(6).variationLevel,1)
    })

    it("should delete the rest of a variation (including the move)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 (2. f4 exf4 3. Nf3 d6) (2. d4 exd4) Nc6"})
        should.equal(reader.getMove(3).variationLevel,1)
        reader.deleteMove(4)
        expect(reader.isDeleted(3)).not.be.ok
        expect(reader.isDeleted(4)).to.be.true
    })

    // The following test case is wrong, and should be rewritten: what does the move number denote? why deleting 2 times?
    // Asserts have to be useful (like what is the resulting pgn then)
    xit("should delete the moves before (without the move)", function () {
        let reader = new PgnReader({pgn: "1. e4 e5  2. Nf3 Nc6"})
        reader.deleteMovesBefore(0)
        should.equal(reader.getMoves().length,4)
        reader.deleteMovesBefore(1)
        should.equal(reader.getMoves().length,4)
        expect(reader.isDeleted(0)).to.be.true
    })
})

describe("When upvoting lines", function () {
    let pgn = "1. e4 e5 2. Nf3 (2. f4 exf4) (2. d4 exd4)"
    let pgn2 = "e4 (d4 d5) (c4 c5) e5"

    it("should upvote the second line as first line", function () {
        let reader = new PgnReader({pgn: pgn})
        should.equal(reader.getMove(3).variationLevel,1)
        should.equal(reader.getMove(2).variations[0].index,3)
        should.equal(reader.getMove(2).variations[1].index,5)
        reader.promoteMove(5)
        should.equal(reader.getMove(2).variations[0].index,5)
        should.equal(reader.getMove(2).variations[1].index,3)
    })

    it("should upvote the first line as main line", function () {
        let reader = new PgnReader({pgn: pgn})
        should.equal(reader.getMove(3).variationLevel,1)
        should.equal(reader.getMove(2).variations[0].index,3)
        should.equal(reader.getMove(2).variations[1].index,5)
        reader.promoteMove(3)
        expect(reader.startVariation(reader.getMove(2))).to.be.true
        should.equal(reader.getMove(2).variationLevel,1)
        should.equal(reader.getMove(3).variationLevel,0)
    })

    it("should ignore upvoting the main line", function () {
        let reader = new PgnReader({pgn: pgn})
        should.equal(reader.getMove(3).variationLevel,1)
        should.equal(reader.getMove(2).variations[0].index,3)
        should.equal(reader.getMove(2).variations[1].index,5)
        reader.promoteMove(2)
        should.equal(reader.getMove(2).variations[0].index,3)
        should.equal(reader.getMove(2).variations[1].index,5)
    })

    it("should handle first move variations, upvote first line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should.equal(reader.getMoves().length,6)
        reader.promoteMove(1)
        should.equal(reader.getMove(1).variationLevel,0)
        should.equal(reader.getMove(1).variations[0].index,0)
        should.equal(reader.getMove(0).variationLevel,1)
    })

    it("should handle first move variations, upvote second line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should.equal(reader.getMoves().length,6)
        reader.promoteMove(3)
        should.equal(reader.getMove(3).variationLevel,1)
        should.equal(reader.getMove(0).variations[0].index,3)
        should.equal(reader.getMove(0).variationLevel,0)
    })

    it("should handle non-first move variations, upvote of any line", function () {
        let reader = new PgnReader({pgn: pgn2})
        should.equal(reader.getMoves().length,6)
        reader.promoteMove(2)
        should.equal(reader.getMove(1).variationLevel,0)
        should.equal(reader.getMove(1).variations[0].index,0)
        should.equal(reader.getMove(0).variationLevel,1)
    })

    it("should handle non-first move variations, upvote of any line 2", function () {
        let reader = new PgnReader({pgn: pgn})
        should.equal(reader.getMoves().length,7)
        reader.promoteMove(4)
        should.equal(reader.getMove(3).variationLevel,0)
        should.equal(reader.getMove(3).variations[0].index,2)
        should.equal(reader.getMove(2).variationLevel,1)
        should.equal(reader.getMove(0).variationLevel,0)
    })

})

describe("When searching moves", function () {
    let reader: PgnReader
    it("should find an existing move based on san", function () {
        reader = new PgnReader({pgn: 'e4 e5 (d5 exd5)'})
        let move = reader.findMove('d5')
        should.exist(move)
        should.equal(move.variationLevel,1)
        should.equal(reader.san(move),'d5')
    })
    it("should find an existing move based on the index of the move", function () {
        reader = new PgnReader({pgn: 'e4 e5 Nf3 Nc6 Bc4 Bc5'})
        let move = reader.findMove(1)   // index starts with 1
        should.equal(reader.san(move),'e4')
        move = reader.findMove(3)
        should.equal(reader.san(move),'Nf3')
        move =reader.findMove(6)
        should.equal(reader.san(move),'Bc5')
    })
})

describe("When having read a game with variation", function () {
    let reader:PgnReader = new PgnReader({pgn: 'e4 e5 (d5 exd5 Qxd5) Nf3'})
    it("should ensure that startMainLine works", function (){
        expect(reader.startMainLine(reader.getMove(0))).to.be.true
    })
    it("should ensure that startVariation works", function () {
        expect(reader.startVariation(reader.findMove('d5'))).to.be.true
    })
    it("should ensure that endVariation works", function () {
        expect(reader.endVariation(reader.findMove('Qxd5'))).to.be.true
    })
    it("should ensure that afterMoveWithVariation works", function () {
        expect(reader.afterMoveWithVariation(reader.findMove('Nf3'))).to.be.true
    })
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
        should.equal(reader.getMove(1).nag[0],"$4")
        reader.changeNag("!!", 0, true)
        should.equal(reader.getMove(0).nag[0],"$3")
    })

    it("should add selected NAG as last when already some", function () {
        reader.changeNag("??", 1, true)
        reader.changeNag("!!", 1, true)
        should.equal(reader.getMove(1).nag[1],"$3")
        should.equal(reader.getMove(1).nag[0],"$4")
    })

    it("should clear all NAGs", function () {
        reader.changeNag("??", 1, true)
        should.equal(reader.getMove(1).nag[0],"$4")
        reader.clearNags(1)
        should.equal(reader.getMove(1).nag.length,0)
    })

    it("should ignore clear when no NAGs", function () {
        reader.clearNags(1)
        should.equal(reader.getMove(1).nag.length,0)
        reader.clearNags(1)
        should.equal(reader.getMove(1).nag.length,0)
    })
})

describe("When having a game and wanting to add arrows and circles", function () {
    let reader: PgnReader = new PgnReader({pgn: 'e4'})
    let move = reader.getMove(0)
    let arrows:Shape[] = [{ brush: 'g', orig: 'g1', dest: 'f3'}, { brush: 'Y', orig: 'e2', dest: 'e4'}]
    let circles:Shape[] = [{ brush: 'r', orig: 'f1'}]
    it("should understand how to set arrows", function (){
        should.equal(reader.san(move),'e4')
        reader.setShapes(move, arrows)
        expect(move.commentDiag.colorArrows).to.deep.equal( ['Gg1f3', 'Ye2e4'])
    })
    it("should understand how to set circles", function (){
        reader.setShapes(move, circles)
        expect(move.commentDiag.colorFields).to.deep.equal(['Rf1'])
    })
    it("should understand how to set arrows andcircles", function (){
        reader = new PgnReader({pgn: 'e4'})
        move = reader.getMove(0)
        reader.setShapes(move, arrows.concat(circles))
        expect(move.commentDiag.colorFields).to.deep.equal(['Rf1'])
        expect(move.commentDiag.colorArrows).to.deep.equal(['Gg1f3', 'Ye2e4'])
    })
})

describe("Working with games with special characters", function () {
    it("should ignore 1 space at beginning and end", function () {
        let reader = new PgnReader({pgn: " 1. d4 e5  "})
        should.equal(reader.getMoves().length,2)
    })

    it("should ignore more spaces at beginning and end", function () {
        let reader = new PgnReader({pgn: "     1. d4 e5   "})
        should.equal(reader.getMoves().length,2)
    })
})

describe("When pgn notation has errors", function () {
    it("should read wrong chess moves in PGN by matching", function () {
        expect(function () { new PgnReader({pgn: 'd5'}).loadPgn() } ).to.throw('No legal move: d5')
    })
    it("should read syntactically wrong PGN by throwing SyntaxError", function () {
        expect(function() {new PgnReader({pgn: 'ddd3'}).loadPgn()}).to.throw('Expected [1-8] but "d" found.')
    })
})

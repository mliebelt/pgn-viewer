import {Chess} from 'chess.js'
import {describe} from "mocha"
const should = require('chai').should()

describe("Should handle the API of chess.js", function (){
    let chess = Chess()
    it("when evaluating a move (with sloppy)", function () {
        chess.load("r1bqkbnr/ppp1pppp/2P5/8/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3")
        let move = chess.move("bxc6", { sloppy: true})
        should.equal(move, null)
        //TODO: This should not be valid. This is a legal notation, and works without sloppy.
    })
    it("when evaluating a move (without sloppy)", function () {
        chess.load("r1bqkbnr/ppp1pppp/2P5/8/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3")
        let move = chess.move("bxc6")
        should.equal(move.san, 'bxc6')
    })
})
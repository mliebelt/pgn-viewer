import * as should from "should"
import {readFile} from "../src/fetch"
import {describe} from "mocha"

describe("Base functionality readPgnFromFile", function () {
    it("should be able to read an existing file", function () {
        let content = readFile('test/2games.pgn')
        should.exist(content)
    })
    it("should throw an error if file does not exist", function (){
        (function () { readFile('2games-missing.pgn') } )
            .should.throw('File not found or could not read: 2games-missing.pgn')
    })
    it("should read game from the internet", function () {
        let content = readFile('https://gist.githubusercontent.com/mliebelt/d8f2fd9228916df4de0f09a22be4ed46/raw/d9479e1c35aa926e363504971bb96890d4abf648/2-games.pgn')
        should.exist(content)
    })
})
//const should = require('chai').should()
//import { should } from 'chai'
import pkg from "chai"
const should = pkg.should()
import { expect } from 'chai'
import Timer from "../src/timer"
import {describe} from "mocha"
import { performance } from "perf_hooks"

describe("When testing Timer functionality", function () {
    it("should create a Timer and use it", async function (done){
        let t = new Timer(10)
        should()
        should.exist(t)
        should.equal(t.running(), false)
        let end
        t.bind(3000, function (){
            end = performance.now()
            t.stop()
            expect(end-start).to.be.above(3000)
            expect(end-start).to.be.below(3100)
        })
        let start = performance.now()
        t.start()
        done()
    })
})

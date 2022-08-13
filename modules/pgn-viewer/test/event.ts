import {Reactor} from '../src/event'
import * as should from "should"
import {describe} from "mocha"

describe("When testing Reactor functionality", function () {
    it("should create a Reactor and use it", async function (done){
        let reactor = new Reactor()
        reactor.registerEvent("test")
        reactor.addEventListener("test", function(eventArgs){
            should.equal(eventArgs, "test")
            done()
        })
        reactor.dispatchEvent("test", "test")
    } )
})
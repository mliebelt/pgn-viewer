import "mocha"
import * as should from "should"
let i18n = require('roddeh-i18n')
import {i18next} from "../src/i18n"
import { pgnBase } from "../src/pgnv"
import {pgnView} from "../src";

describe("When testing i18n functionality", function () {
    it("should create an i18n function", function (){
        let fn = i18n.create({ values: { a: 'A', b: 'B'}})
        should.exist(fn)
        let str = fn('a')
        should.equal(str, 'A')
    })
    it("should be able to read standard locale and strings", function () {
        // @ts-ignore
        let fn = i18next('de')
        should.exist(fn)
        let str = fn('buttons:flipper')
        should.exist(str)
        should.equal(str,"Tausche die Seiten")
        str = fn('chess:n')
        should.equal(str,"S") // German: Springer
    })
    it("should return the key if the key does not match anything", function () {
        let fn = i18next('de')
        let str = fn('foo')
        should.exist(str)
        should.equal(str,'foo')
    })
})

describe("When working on pgnBase", function () {
    let pb = pgnView("dummy", { locale: "de"})
    it("should be able to work with internationalized strings", function () {
        let base = pb.base
        should.exist(base)
    })
})

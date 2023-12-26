//const should = require('chai').should()
//import { should } from 'chai'
import pkg from "chai"
const should = pkg.should()
//let i18n = require('roddeh-i18n')
import pkg2 from "roddeh-i18n"
const { i18n } = pkg2
import { i18next } from "../src/i18n"
import {describe} from "mocha"
// import { pgnBase } from "../lib/pgnv"

describe("When testing i18n functionality", function () {
    it("should create an i18n function", function (){
        let fn = i18n.create({ values: { a: 'A', b: 'B'}})
        fn.should.exist
        // should.exist(fn)
        let str = fn('a')
        str.should.equal('A')
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
    // Unable to load pgnv in the test context, don't know why. So not able to test pgnBase functionality ...
    // it("should have defaults working for function t", function (){
    //     let base = pgnBase('id', { locale: 'de' })
    //     let str = base.t('dummy')
    //     should(str).equal('dummy')
    // })
})

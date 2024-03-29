//const should = require('chai').should()
//import { should } from 'chai'
// import pkg from "chai"
// const should = pkg.should()
import i18n from "roddeh-i18n"
import {i18next} from "../src/i18n";
import { test, suite } from "uvu"
import * as assert from "uvu/assert"
// import {describe} from "mocha"
// import { pgnBase } from "../lib/pgnv"

const i18nSuite = suite('Testing i18n directly')
i18nSuite("When testing i18n functionality", function () {
    let fn = i18n.create({ values: { a: 'A', b: 'B'}})
    assert.type(fn, 'function')
    let str = fn('a')
    assert.is(str, 'A')
})
i18nSuite.run()

// const i18NextSuite = suite('Testing i18n with i18next')
// i18NextSuite("should be able to read standard locale and strings", () => {
//     let fn = i18next('de')
//     assert.type(fn, 'function')
//     let str = fn('buttons:flipper')
//     assert.type(str, 'string')
//     assert.is(str, "Tausche die Seiten")
//     str = fn('chess:n')
//     assert.is(str, "S") // German: Springer
// })
// i18NextSuite("should return the key if the key does not match anything", () => {
//     let fn = i18next('de')
//     let str = fn('foo')
//     assert.type(str, 'string')
//     assert.is(str, 'foo')
// })
// i18NextSuite.run()


import {i18n} from "typesafe-i18n"
import {initFormatters} from "../src/i18n/formatters";
import {i18next} from "../src/i18n"
import { suite } from "uvu"
import * as assert from "uvu/assert"

const localeTranslations = {
    en: {Test: "An english test"},
    de: {Test: "Ein deutscher Test"},
}

// const i18nSuite = suite('Testing i18n directly')
// i18nSuite("When testing i18n functionality", function () {
//     console.log("i18n", i18n)
//     console.log("i18n(): ", i18n(localeTranslations, {
//         en: initFormatters('en'), de: initFormatters('de')} ))
//     let translation = i18n(localeTranslations, { en: null, de: null})['en'].Test
//     assert.is(translation, 'An english test')
// })
// i18nSuite.run()

const i18NextSuite = suite('Testing i18n with i18next')
i18NextSuite("should be able to read standard locale and strings", () => {
    let translations = i18next('de')
    let str = translations.buttons.flipper
    // @ts-ignore
    assert.is(str(), "Tausche die Seiten")
    str = translations.chess.n
    // @ts-ignore
    assert.is(str(), "S") // German: Springer
})
i18NextSuite("should return the key if the key does not match anything", () => {
    let translations = i18next('de')
    // @ts-ignore
    let str = translations.foo()
    // assert.type(str, 'string')
    assert.is(str, 'foo')
})
i18NextSuite.run()


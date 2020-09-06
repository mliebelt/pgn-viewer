let fs = require('fs')
console.log("Env Locales: " + process.env.npm_config_locales)

const gen_i18n = function(locales) {
    console.log("Will generate i18n with a set of locales")
    let result = ""
    result += "const { I18n } = require('roddeh-i18n')\n"
    for (const locale of locales){
        result += "import " + locale + " from \"./locales/" + locale + ".js\"\n"
    }
    result += "let jsons = {}\n"
    for (const locale of locales){
        result += "jsons." + locale + " = " + locale + "\n"
    }
    result += "const i18next = function (loc) { return i18n.create(jsons[loc]) }\n" +
        "export default i18next\n"
    fs.writeFileSync('src/i18n.js', result)

}

gen_i18n(process.env.npm_config_locales.split(","))

module.exports = {
    gen_i18n
};

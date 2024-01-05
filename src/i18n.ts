// import pkg from "roddeh-i18n"
// const { i18n } = pkg
import i18n from "roddeh-i18n"
import en from "./locales/en"
import de from "./locales/de"
import fr from "./locales/fr"
import es from "./locales/es"
import cs from "./locales/cs"
import da from "./locales/da"
import et from "./locales/et"
import fi from "./locales/fi"
import hu from "./locales/hu"
import is from "./locales/is"
import it from "./locales/it"
import nb from "./locales/nb"
import nl from "./locales/nl"
import pt from "./locales/pt"
import ro from "./locales/ro"
import sv from "./locales/sv"
import {SupportedLocales} from "./types";
let jsons: { [key in SupportedLocales]?: any } = {}
jsons.en = en
jsons.de = de
jsons.fr = fr
jsons.es = es
jsons.cs = cs
jsons.da = da
jsons.et = et
jsons.fi = fi
jsons.hu = hu
jsons.is = is
jsons.it = it
jsons.nb = nb
jsons.nl = nl
jsons.pt = pt
jsons.ro = ro
jsons.sv = sv
function matchLoc(loc:string): SupportedLocales {
    let m = loc.match(/(.{2})_(.{2})/)
    if (m) { return m[1] as SupportedLocales }
    return loc as SupportedLocales
}
const i18next = function (loc:string) {
    return i18n.create(jsons[matchLoc(loc)])
}

export { i18next}
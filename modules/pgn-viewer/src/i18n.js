const { I18n } = require('roddeh-i18n')
import en from "./locales/en.js"
import de from "./locales/de.js"
import fr from "./locales/fr.js"
import es from "./locales/es.js"
import cs from "./locales/cs.js"
import da from "./locales/da.js"
import et from "./locales/et.js"
import fi from "./locales/fi.js"
import hu from "./locales/hu.js"
import is from "./locales/is.js"
import it from "./locales/it.js"
import nb from "./locales/nb.js"
import nl from "./locales/nl.js"
import pt from "./locales/pt.js"
import ro from "./locales/ro.js"
import sv from "./locales/sv.js"
let jsons = {}
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
const i18next = function (loc) { return i18n.create(jsons[loc]) }
export default i18next

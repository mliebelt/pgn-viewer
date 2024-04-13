import { i18n, loadedLocales } from "./i18n/i18n-util"
import { loadAllLocales } from "./i18n/i18n-util.sync"
import {SupportedLocales} from "./types";

loadAllLocales()

function matchLoc(loc:string): SupportedLocales {
    let m = loc.match(/(.{2})_(.{2})/)
    if (m) { return m[1] as SupportedLocales }
    return loc as SupportedLocales
}

const i18next = function (loc:string) {
    const matchLocale = matchLoc(loc)
    return i18n()[matchLocale]
}

export { i18next }
const fetch = require('sync-fetch')
import { readFileSync } from "fs"
import path, {dirname, resolve} from "path"

export function readFile(url: string) {
    let data
    try {
        data = readFileSync(url, 'utf8')
        return data
    } catch (err) {
        try {
            let fname = resolve(__dirname, '..', url)
            data = readFileSync('file://' + path.resolve('../' + url))
            return data
        } catch (err2) {
            try {
                data = fetch(url).text()
                return data
            } catch (err3) {
                throw new Error("File not found or could not read: " + url)
            }
        }
    }

}

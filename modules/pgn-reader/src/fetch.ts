const fetch = require('sync-fetch')
const fs = require("fs")
const path = require("path")

export function readFile(url: string) {
    let data
    try {
        data = fs.readFileSync(url, 'utf8')
        return data
    } catch (err) {
        try {
            data = fs.readFileSync('file://' + path.resolve(url))
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

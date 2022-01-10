export class StringBuilder {
    strings: Array<string> = new Array("")
    constructor(value: string) {
        this.append(value)
    }
    // Appends the given value to the end of this instance.
    append(value): void {
        if (value) {
            this.strings.push(value)
        }
    }
    isEmpty(): boolean {
        for (let i = 0; i < this.strings.length; i++) {
            if (this.strings[i].length > 0) {
                return false
            }
        }
        return true
    }
    lastChar(): string {
        if (this.strings.length === 0) {
            return null
        }
        return this.strings[this.strings.length - 1].slice(-1)
    }
    toString(): string{
        return this.strings.join("")
    }

}


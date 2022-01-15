export const NAGs = new Array(256);
NAGs[1]=    "!";    // 1
NAGs[2]=    "?";    // 2
NAGs[3]=    "‼";   // 3
NAGs[4]=    "⁇";   // 4
NAGs[5]=    "⁉";   // 5
NAGs[6]=    "⁈";   // 6
NAGs[7]=    "□";    // 7
NAGs[10]=    "=";    // 10
NAGs[13]=    "∞";    // 13
NAGs[14]=    "⩲";    // 14➢0x2a72
NAGs[15]=    "⩱";    // 15 0x2a71
NAGs[16]=    "±";    // 16
NAGs[17]=    "∓";    // 17
NAGs[18]=    "+−";   // 18
NAGs[19]=    "-+";    // 19
NAGs[22]=    "⨀";
NAGs[23]=    "⨀";
NAGs[26]=    "○";
NAGs[27]=    "○";
NAGs[32]=    "⟳";
NAGs[33]=    "⟳";
NAGs[36]=    "↑";
NAGs[37]=    "↑";
NAGs[40]=    "→";
NAGs[41]=    "→";
NAGs[44]=    "=∞";
NAGs[45]=    "=∞";
NAGs[132]=   "⇆";
NAGs[133]=   "⇆";
NAGs[138]=   "⊕";
NAGs[139]=   "⊕";
NAGs[140]=   "∆";
NAGs[141]=   "∇";
NAGs[142]=   "⌓";
NAGs[143]=   "<=";
NAGs[144]=   "==";
NAGs[145]=   "RR";
NAGs[146]=   "N";
NAGs[220]=   "⬒";
NAGs[221]=   "⬓";
NAGs[238]=   "○";
NAGs[239]=   "⇔";
NAGs[240]=   "⇗";
NAGs[241]=   "⊞";
NAGs[242]=   "⟫";
NAGs[243]=   "⟪";
NAGs[244]=   "✕";
NAGs[245]=   "⊥";

export const PGN_NAGS = {};

// build the reverse index
for (let i = 0; i < NAGs.length; i++) {
    PGN_NAGS[NAGs[i]] = i;
}
// Special case for duplicate NAGs
PGN_NAGS['!!'] = 3;
PGN_NAGS['??'] = 4;
PGN_NAGS['!?'] = 5;
PGN_NAGS['?!'] = 6;

/**
 * Returns the NAG notation from the array of symbols
 * @param array the NAG symbols like $1, $3, ...
 * @returns {string} the result string like !, !!
 */
export function nagToSymbol (array): string {
    let ret_string = "";
    if (array === null || array === undefined) {
        return ret_string;
    }
    for (let i = 0; i < array.length; i++) {
        const number = parseInt(array[i].substring(1))
        if ((number !== 220) && (number !== 221)) { // Don't add diagrams to notation
            const ret = NAGs[number]
            ret_string += (typeof ret != 'undefined') ? ret : "$"+number
        }
    }
    return ret_string
}

/**
 * Returns the SYM notation for a single NAG (like !!, ?!, ...)
 * @param string the NAG in the chess notation
 * @returns {*} the symbold like $0, $3, ...
 */
export function symbolToNag (string): string {
    const nag = PGN_NAGS[string]
    if (nag === undefined) {
        return null
    } else {
        return "$" + nag
    }
}

export function hasDiagramNag (move): boolean {
    if (typeof move.nag == "undefined") return false
    if (move.nag == null) return false
    return (move.nag.indexOf('$220') > -1) || (move.nag.indexOf('$221') > -1)
}


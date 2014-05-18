/*
 * Classic example grammar, which recognizes simple arithmetic expressions like
 * "2*(3+4)". The parser generated from this grammar then computes their value.
 */

{
    function makeInteger(o) {
        return parseInt(o.join(""), 10);
    }
}

start
    = pgn

pgn
    = (move)+ (mn:moveNumber whiteSpace halfMove)?

moveNumber
    = num:integer"." { return num; }

integer "integer"
    = digits:[0-9]+ { return makeInteger(digits); }

whiteSpace
    = " "+ { return '';}

move
    = mn:moveNumber whiteSpace hm:halfMove whiteSpace hmt:halfMove whiteSpace { return mn + " " + hm + " " + hmt; }
/ moveEllipse whiteSpace halfMove whiteSpace

halfMove
    = fig:figure? str:strike? col:column row:row {return (fig ? fig : '') + (str ? str : '') + col + row; }
/ 'O-O-O'
/ 'O-O'

moveEllipse
    = integer"..."

figure
    = [RNBQK]

column
    = [a-h]

row
    = [1-8]

strike
    = 'x'
    / column'x'
    / row'x'



/*
Examples
========

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 Be7 8. Qd2 Qc7 9. O-O-O

Output
------

 [
 [
 "1 e4 c5",
 "2 Nf3 d6",
 "3 d4 c,xd4",
 "4 Nxd4 Nf6",
 "5 Nc3 a6",
 "6 Be3 e6",
 "7 f3 Be7",
 "8 Qd2 Qc7"
 ],
 [
 9,
 "",
 "O-O-O"
 ]
 ]
*/

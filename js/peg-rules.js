{
    function makeInteger(o) {
        return parseInt(o.join(""), 10);
    }
}

start
    = pgn

pgn
    = moves:(move)+ (mn:moveNumber whiteSpace? hm:halfMove)?

    moveNumber
        = num:integer"." { return num; }

integer "integer"
    = digits:[0-9]+ { return makeInteger(digits); }

whiteSpace
    = " "+ { return '';}

move
    = whiteSpace? mn:moveNumber whiteSpace? hm:halfMove whiteSpace hmt:halfMove whiteSpace? { white = {}; black = {}; white.moveNumber = mn, white.notation = hm; white.turn = 'w'; black.moveNumber = mn; black.notation = hmt; black.turn = 'b'; return [white, black]; }
/ whiteSpace? me:moveEllipse whiteSpace? hm:halfMove whiteSpace? { return me + " " + hm; }

halfMove
    = fig:figure? str:strike? col:column row:row {return (fig ? fig : '') + (str ? str : '') + col + row; }
/ 'O-O-O'
/ 'O-O'

discriminator
  = column
  / row

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
  / column 'x'
  / row 'x'



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

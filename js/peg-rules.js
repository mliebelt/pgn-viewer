{
    function makeInteger(o) {
        return parseInt(o.join(""), 10);
    }
}

pgn
    = pw:pgnStartWhite all:pgnBlack? { arr = (all ? all : []); arr.push(pw); arr.reverse(); return arr; }
/ pb:pgnStartBlack all:pgnWhite? { arr = (all ? all : []); arr.push(pb); arr.reverse(); return arr; }
/ whiteSpace? { return []; }

pgnStartWhite = whiteSpace? pw:pgnWhite { return pw; }

pgnStartBlack = whiteSpace? me:moveEllipse all:pgnBlack { last = all[all.length - 1]; last.moveNumber = me; return all; }

pgnWhite = whiteSpace? mn:moveNumber whiteSpace? hm:halfMove  whiteSpace? all:pgnBlack? { arr = (all ? all : []); move = {}; move.turn = 'w'; move.moveNumber = mn; move.notation = hm; arr.push(move); return arr; }

pgnBlack = whiteSpace? hm:halfMove whiteSpace? all:pgnWhite? { arr = (all ? all : []); move = {}; move.turn = 'b', move.notation = hm; arr.push(move); return arr; }

moveNumber
    = num:integer"." { return num; }

integer "integer"
    = digits:[0-9]+ { return makeInteger(digits); }

whiteSpace
    = " "+ { return '';}

halfMove
    = fig:figure? & checkdisc disc:discriminator str:strike? col:column row:row ch:check? {return (fig ? fig : '') + (disc ? disc : '') + (str ? str : '') + col + row + (ch ? ch : ''); }
/ fig:figure? str:strike? col:column row:row ch:check? {return (fig ? fig : '') + (str ? str : '') + col + row + (ch ? ch : ''); }
/ 'O-O-O'
/ 'O-O'

check = '+'

discriminator
    = column
    / row

checkdisc
    = discriminator strike? column row

moveEllipse
    = num:integer"..." { return num; }

figure
    = [RNBQK]

column
    = [a-h]

row
    = [1-8]

strike
    = 'x'

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

import * as should from "should"
import {PgnReader} from "../lib/pgn";

describe("ambiguator or variations of formats", function() {
    let my_pgn

    it("should use disambiguator on output", function () {
        my_pgn = new PgnReader({
            pgn: "4. dxe5",
            position: "rnbqkbnr/ppp3pp/8/3ppp2/3PPP2/8/PPP3PP/RNBQKBNR w KQkq - 0 4"
        })
        should(my_pgn.sanWithNags(my_pgn.getMove(0))).equal('dxe5')
    })
})

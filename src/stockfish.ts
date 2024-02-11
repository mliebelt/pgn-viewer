/* Stockfish must be already loaded in the HTML file, so each function used here in has to check
    if Stockfish is up and running. If yes, it is bound to the global variable sf. */

// @ts-ignore
import {FEN} from "chessground/types";

let PgnStockfish = null

// @ts-ignore
function initStockfish() {
    if (! PgnStockfish) {
        // @ts-ignore
        PgnStockfish = window.sf
        PgnStockfish.addMessageListener(function (message) {
            let data = message.data ? message.data : message
            console.log(data)
        })
    }
}

export function sfSetPosition(fen:FEN): void {
    if (! PgnStockfish) initStockfish()
    if (PgnStockfish) {
        PgnStockfish.postMessage(`position fen ${fen}`);
        PgnStockfish.postMessage("go depth 15");
    }
}

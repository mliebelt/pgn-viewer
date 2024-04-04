import {FEN} from "chessground/types";

export interface Api {
    // Here should be following all functions that are given as return to the callers, that want to
    // drive the viewer / editor (no reason to do that for board / print) then later.
    // First ideas are taken from
    // [wiki](https://github.com/mliebelt/pgn-viewer/wiki/API-and-Callbacks-for-reader-and-viewer)

    //state:Pgn
    /**
     * Sets the position of the board given the FEN (Forsyth-Edwards Notation).
     *
     * @param {string} fen - The FEN representation of the position.
     * @return {void}
     */
    setPosition(fen:FEN): void
    makeMove(san:string): void
}
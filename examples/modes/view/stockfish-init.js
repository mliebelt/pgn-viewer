// import { Stockfish } from "./lib-manual/stockfish.js";
export default async function initStockfish() {
    const stockfish = await Stockfish();
    if (!stockfish) throw new Error("Unable to initialize Stockfish");

    stockfish.postMessage('uci');
    // Add any other initial configurations here as necessary

    return stockfish;
}

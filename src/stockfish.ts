
declare global {
    interface Window { myStockfishEngine: any; }
}

export function initStockfish() {
    let engine = window.myStockfishEngine;
    engine.postMessage('uci');
    engine.postMessage('ucinewgame');
    engine.postMessage('position startpos');
    engine.postMessage('go depth 8');
    engine.onmessage = function(event) {
        console.log(event.data);}
    return engine
}
export function updateStockfish(engine, fen:string) {
    engine.postMessage('position '+fen)
}

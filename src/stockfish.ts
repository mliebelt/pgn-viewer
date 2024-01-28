import Stockfish from 'stockfish-nnue.wasm/stockfish.js'

console.log(Stockfish)

declare global {
    interface Window { myStockfishEngine: any; }
}

let isReady = false;
const stockfish = {
    postMessage: () => { throw 'Not ready'; },
    terminate: () => { throw 'Not ready'; },
};

export const startStockfish = () => {
    let scriptUrl:string = '/node_modules/stockfish-nnue.wasm/stockfish.wasm'
    const wasmMemory = new WebAssembly.Memory({initial: 256, maximum: 256});
    const importObject = {
        'env': {
            'memory': wasmMemory,
            'table': new WebAssembly.Table({initial: 0, maximum: 0, element: 'anyfunc'})
            //... (rest of required imports)
        }
    };

    const onRuntimeInitialized = (instance) => {
        isReady = true;
        stockfish.postMessage = instance.exports.postMessage;
        stockfish.terminate = instance.exports.terminate;
    };

    fetch(scriptUrl)
        .then(response => response.arrayBuffer())
        .then(binary => WebAssembly.compile(binary))
        .then(module => WebAssembly.instantiate(module, importObject))
        .then(instance => {
            onRuntimeInitialized(instance);
            window.myStockfishEngine = instance
            console.log('Stockfish is ready!');
        })
        .catch(error => console.error('Error starting Stockfish:', error));
};
const downloadStockfish = async () => {
    startStockfish();
    while (isReady === false) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
};
downloadStockfish();

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

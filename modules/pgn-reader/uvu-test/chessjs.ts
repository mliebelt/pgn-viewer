import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { Chess } from 'chess.js';

const chessjs = suite('chess.js');

chessjs('evaluates move with sloppy', () => {
    const chess = new Chess();
    chess.load('r1bqkbnr/ppp1pppp/2P5/8/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3');

    const move = chess.move('bxc6', { sloppy: true });

    assert.is(move, null);
});

chessjs('evaluates move without sloppy', () => {
    const chess = new Chess();
    chess.load('r1bqkbnr/ppp1pppp/2P5/8/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3');

    const move = chess.move('bxc6');

    assert.is(move.san, 'bxc6');
});

chessjs.run();

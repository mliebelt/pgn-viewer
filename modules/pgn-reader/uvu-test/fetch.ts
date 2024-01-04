import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { readFile } from '../src/fetch';

const fetch = suite('readFile');

fetch('reads existing file', () => {
    const content = readFile('test/2games.pgn');
    assert.ok(content);
});

fetch('throws on missing file', () => {
    assert.throws(() => {
        readFile('2games-missing.pgn');
    }, { name: 'FileNotFound', message: 'File not found or could not read: 2games-missing.pgn' });
});

fetch('reads from internet', () => {
    const url = 'https://gist.githubusercontent.com/mliebelt/d8f2fd9228916df4de0f09a22be4ed46/raw/d9479e1c35aa926e363504971bb96890d4abf648/2-games.pgn';
    const content = readFile(url);
    assert.ok(content);
});

fetch.run();

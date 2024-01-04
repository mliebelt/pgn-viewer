import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { StringBuilder } from '../src/sb';

const sb = suite('StringBuilder');

sb('creates an empty StringBuilder', () => {
    const strBuilder = new StringBuilder('');
    assert.is(strBuilder.toString(), '');
});

sb('creates from a string', () => {
    const strBuilder = new StringBuilder('Hello world');
    assert.is(strBuilder.toString(), 'Hello world');
});

sb('appends strings', () => {
    const strBuilder = new StringBuilder('1');
    strBuilder.append('234');
    strBuilder.append('567');
    assert.is(strBuilder.toString(), '1234567');
});

sb('appends objects', () => {
    const strBuilder = new StringBuilder('hello');
    strBuilder.append("test").append('23').append('onemore').append(5);
    assert.is(strBuilder.toString(), 'hellotest23onemore5');
});

sb.run();

const edgeCases = suite('Edge cases');

edgeCases('handles null append', () => {
    const strBuilder = new StringBuilder('');
    strBuilder.append(null);
    assert.is(strBuilder.toString(), '');
});

edgeCases('handles undefined append', () => {
    const strBuilder = new StringBuilder('');
    strBuilder.append(undefined);
    assert.is(strBuilder.toString(), '');
});

edgeCases.run();

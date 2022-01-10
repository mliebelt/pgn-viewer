import * as parseTypes from '@mliebelt/pgn-parser'
import {PgnMove} from "@mliebelt/pgn-parser/lib/types";

export const PROMOTIONS = {
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight'
}

export const colors = ['white', 'black'] as const;
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type File = typeof files[number];
export type Rank = typeof ranks[number];
export type Field = 'a0' | `${File}${Rank}`;

export interface PgnReaderMove extends PgnMove {
    real_move: {};
    from?: Field,
    to?: Field,
    fen?: string,
    index?: number,
    prev?: number,
    next?: number,
    variationLevel?: number,
    turn: string
}


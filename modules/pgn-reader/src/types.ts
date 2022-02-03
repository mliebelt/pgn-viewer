export const PROMOTIONS = {
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight'
}

export const prom_short = ['q', 'r', 'b', 'n']
export type PROMOTIONS_SHORT = typeof prom_short[number]

export const colors = ['white', 'black'] as const;
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type File = typeof files[number];
export type Rank = typeof ranks[number];
export type Field = 'a0' | `${File}${Rank}`;

export type GameComment = { comment?: string, colorArrows?: string[], colorFields?: string[], clk?: string, eval?: string }
export type Color = 'w' | 'b'
export type Shape = { brush: string, orig: Field, dest?: Field }

export type PgnReaderMove = {
    drawOffer?: boolean;
    moveNumber?: number,
    notation: { fig?: string | null, strike?: 'x' | null, col?: string, row?: string, check?: string,
        promotion?: string | null, notation: string, disc?: string, drop?: boolean },
    variations: PgnReaderMove[],
    nag: string[],
    commentDiag?: GameComment,
    commentMove?: string,
    commentAfter?: string,
    turn?: Color
    from: Field,
    to: Field,
    fen?: string,
    index?: number,
    prev?: number,
    next?: number,
    variationLevel?: number
}

export type PrimitiveMove = {
    from: Field,
    to: Field,
    promotion?: PROMOTIONS_SHORT
}

export type PgnReaderConfiguration = {
    notation?: 'short' | 'long',
    position?: 'start' | string,
    locale?: string,
    lazyLoad?: boolean,
    manyGames?: boolean,
    pgn?: string,
    pgnFile?: string,
    startPlay?: number | string,
    hideMovesBefore?: boolean
}

export type Message = { key: string, value: string, message: string }

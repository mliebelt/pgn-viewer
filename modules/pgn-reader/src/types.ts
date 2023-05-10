import { Field, PROMOTIONS_SHORT } from "@mliebelt/pgn-types"

export type PrimitiveMove = {
    from: Field,
    to: Field,
    promotion?: PROMOTIONS_SHORT
}

export type PgnReaderConfiguration = {
    mode?: string,
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

export type Shape = { brush: string, orig: Field, dest?: Field }

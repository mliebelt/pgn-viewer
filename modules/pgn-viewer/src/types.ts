import {Api} from "chessground/api"
import {PgnReader, Field} from "../../pgn-reader/lib/"
import Mousetrap from "mousetrap-ts";
import {Config} from "chessground/config";

export type Base = {
    userConfiguration?: PgnViewerConfiguration,
    configuration?: PgnViewerConfiguration,
    mypgn: PgnReader,
    mousetrap: Mousetrap,
    board: Api,
    errorDiv?:any,
    currentMove?: number,
    boardConfig?: PgnBoardConfiguration,
    t?: Function
}

export type  SupportedLocales = 'en' |  'de' |  'fr' |  'es' |  'cs' |  'da' |  'et' |  'fi' |  'hu' |  'is' |  'it' |  'nb' |  'nl' |  'pt' |  'ro' |  'sv'
export type Layout = 'left'|'right'|'top'|'bottom'
export type TimeAnnotation = {
    class?: string,
    colorClass?: string
}
export type PgnBoardConfiguration = {
    resizable?: boolean,
    showCoords?: boolean,
    coordsInner?: boolean,
    coordsFactor?: number,
    position?: string,
    boardSize?: string,
    width?: string,
}
export type PgnViewerConfiguration = {
    mode?:string,
    IDs?:string[],
    pgn?:string,
    theme?:string,
    figurine?:string,
    layout?:Layout,
    resizable?:boolean,
    orientation?:boolean,
    headers?: boolean,
    timerTime?: number,
    pieceStyle?:string,
    notationLayout?:string,
    timeAnnotation?:TimeAnnotation,
    boardSize?:string,
    movesWidth?:string,
    movesHeight?:string,
    width?:string,
    startPlay?:number,
    hideMovesBefore?:boolean,
    showResult?: boolean,
    colorMarker?:string,
    showFen?:boolean,
    manyGames?:boolean,
    locale?:string,
    position?:string,
    i18n?:Function,
    defaultI18n?:Function,
    movable?:Config,
}

export type PrimitiveMove = {
    from: Field,
    to: Field,
    promotion?: 'q'|'r'|'b'|'n'
}

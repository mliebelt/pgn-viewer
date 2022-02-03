// @ts-ignore
import { PgnReader } from "../../pgn-reader/lib/index.umd"
import {Api} from "chessground/api"

export type PgnReader = PgnReader

export type Base = {
    userConfiguration?: PgnViewerConfiguration,
    configuration?: PgnViewerConfiguration,
    mypgn: PgnReader,
    board: Api,
    errorDiv?:any,
    currentMove?: number,
    boardConfig?: PgnBoardConfiguration
}
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
    locale:string,
    position:string,
    i18n:Function,
    defaultI18n:Function,

}
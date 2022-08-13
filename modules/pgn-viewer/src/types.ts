import {Api} from "chessground/api"
import {PgnReader} from "../../pgn-reader/lib"
import {Field} from "../../pgn-reader/lib/types"
import Mousetrap from "mousetrap-ts";
import {Config} from "chessground/config";
import {Reactor} from "./event";

export type Base = {
    userConfiguration?: PgnViewerConfiguration,
    configuration?: PgnViewerConfiguration,
    mypgn: PgnReader,
    mousetrap: Mousetrap,
    board: Api,
    errorDiv?:any,
    currentMove?: number,
    boardConfig?: PgnBoardConfiguration,
    t?: Function,
    reactor?: Reactor,
}

export type  SupportedLocales = 'en' |  'de' |  'fr' |  'es' |  'cs' |  'da' |  'et' |  'fi' |  'hu' |  'is' |  'it' |  'nb' |  'nl' |  'pt' |  'ro' |  'sv'
export type Layout = 'left'|'right'|'top'|'bottom'
export type Color = 'white' | 'black'
export type ShortColor = 'w' | 'b'
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
    drawable?: boolean
}

export type PgnViewerMode = 'board' | 'view' | 'edit' | 'print'

export type PgnViewerConfiguration = {
    modalClicked?: (value: ("q" | "r" | "b" | "n")) => void;
    modal?: any;
    mode?:PgnViewerMode,
    IDs?:{ [key in PgnViewerID]?: string },
    pgn?:string,
    theme?:string,
    figurine?:string,
    layout?:Layout,
    resizable?:boolean,
    orientation?:Color,
    headers?: boolean,
    timerTime?: number,
    pieceStyle?:string,
    notationLayout?:'inline' | 'list' | 'allList',
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
    locale?:SupportedLocales,
    position?:string,
    i18n?:Function,
    defaultI18n?:Function,
    movable?:Config["movable"],
    highlight?:Config["highlight"],
    viewOnly?:Config["viewOnly"],
    lazyLoad?:boolean,
    showCoords?:boolean,
    coordsInner?:boolean,
    coordsFontSize?: string,
    coordsFactor?:number,
    coordinates?:boolean,   // TODO Should be part of Config (only). How to share configuration?
    notation?:'short'|'long',
    hooks?:{[key:string]:Function},
}

export type PgnViewerID = 'bottomHeaderId' | 'topHeaderId' | 'innerBoardId' | 'movesId' | 'buttonsId' | 'fenId' | 'colorMarkerId'

export type PrimitiveMove = {
    from: Field,
    to: Field,
    promotion?: 'q'|'r'|'b'|'n'
}

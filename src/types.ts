import {Api} from "chessground/api"
import {PgnReader, Field} from "@mliebelt/pgn-reader"
import Mousetrap from "mousetrap-ts";
import {Config} from "chessground/config";
import { Tags, TagKeys } from "@mliebelt/pgn-types"
export { Tags, TagKeys }

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
export enum Layout {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom',
}
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

export enum PgnViewerMode {
    Board = 'board',
    View = 'view',
    Edit = 'edit',
    Print = 'print',
    Puzzle = 'puzzle',
}

export type PgnViewerConfiguration = {
    modalClicked?: (value: ("q" | "r" | "b" | "n")) => void;
    modal?: any;
    mode?:PgnViewerMode,
    IDs?:{ [key in PgnViewerID]?: string },
    pgn?:string,
    theme?:Theme,
    figurine?:string,
    layout?:Layout,
    resizable?:boolean,
    orientation?:Color,
    headers?: boolean,
    timerTime?: number,
    pieceStyle?:PieceStyle,
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
    i18n?:any,
    defaultI18n?:any,
    movable?:Config["movable"],
    highlight?:Config["highlight"],
    viewOnly?:Config["viewOnly"],
    lazyLoad?:boolean,
    showCoords?:boolean,
    coordsInner?:boolean,
    coordsFontSize?: string,
    coordsFactor?:number,
    coordinates?:boolean,   // TODO Should be part of Config (only). How to share configuration?
    notation?:'short'|'long'
}

export type PgnViewerID = 'bottomHeaderId' | 'topHeaderId' | 'innerBoardId' | 'movesId' | 'buttonsId' | 'fenId' | 'colorMarkerId'

export type PrimitiveMove = {
    from: Field,
    to: Field,
    promotion?: 'q'|'r'|'b'|'n'
}

export enum PieceStyle {
    Wikipedia = 'wikipedia',
    Alpha = 'alpha',
    Uscf = 'uscf',
    Case = 'case',
    Condal = 'condal',
    Maya = 'maya',
    Merida = 'merida',
    Leipzig = 'leipzig',
    Beyer = 'beyer',
}

export enum Theme {
    Default = 'default',
    Zeit = 'zeit',
    Green = 'green',
    Blue = 'blue',
    Falken = 'falken',
    Beyer = 'beyer',
    Sportverlag = 'sportverlag',
    Informator = 'informator',
    Brown = 'brown',
}

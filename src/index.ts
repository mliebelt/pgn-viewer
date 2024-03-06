import { polyfill } from 'smoothscroll-polyfill'
import { pgnBase } from "./pgnv"
import './css/theme.css'
import './css/pgnvjs.css'
import {PgnViewerConfiguration} from "./types";

// kick off the polyfill!
polyfill()

// Users of pgn-viewer may redefine some defaults by defining globally the var `PgnBaseDefaults.
// This will be merged then with the defaults defined by the app itself.
declare global {
    var PgnBaseDefaults: PgnViewerConfiguration;
}

if (window && !window.PgnBaseDefaults) {
    window.PgnBaseDefaults = {}
}

/**
 * Defines the utility function just to display the board including the moves
 * read-only. It allows to play through the game, but not to change or adapt it.
 * @param boardId the unique ID per HTML page
 * @param configuration the configuration for chess, board and pgn.
 *      See the configuration of `pgnBoard` for the board configuration. Relevant for pgn is:
 *   pgn: the pgn as single string, or empty string (default)
 * @returns {{base}} base: all utility functions available, board: reference to Chessground
 */
let pgnView = function (boardId:string, configuration:PgnViewerConfiguration) {
    let base = pgnBase(boardId, Object.assign({mode: 'view'}, configuration))
    base.generateHTML()
    base.generateMoves()
    let board = base.generateBoard()
    return {base, board}
}

/**
 * Defines a utility function just to display a board (only). There are some similar
 * parameters to `pgnView`, but some are not necessary.
 * @param boardId needed for the inclusion of the board itself
 * @param configuration object with the attributes:
 *  position: 'start' or FEN string
 *  orientation: 'black' or 'white' (default)
 *  showCoords: false or true (default)
 *  pieceStyle: some of alpha, uscf, wikipedia (from chessboardjs) or
 *              merida (default), case, leipzip, maya, condal (from ChessTempo)
 *              or chesscom (from chess.com) (as string)
 *  pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 *          Normally not changed by clients
 *  theme: (only CSS related) some of zeit, blue, chesscom, ... (as string)
 */
let pgnBoard = function (boardId:string, configuration:PgnViewerConfiguration) {
    let base = pgnBase(boardId, Object.assign({headers: false, mode: 'board'}, configuration))
    base.generateHTML()
    base.resizeLayout()
    let board = base.generateBoard()
    return { base, board }
}

/**
 * Defines a utility function to get a full-fledged editor for PGN. Allows
 * to make moves, play forward and backward, try variations, ...
 * This functionality should sit on top of the normal pgnView functionality,
 * and should allow to "use" in some way the generated PGN at the end.
 * @param boardId the unique ID of the board (per HTML pagew)
 * @param configuration the configuration of everything. See pgnBoard and
 *      pgnView for some of the parameters. Additional parameters could be:
 *    allowVariants: false or true (default)
 *    allowComments: false or true (default)
 *    allowAnnotations: false or true (default)
 */
let pgnEdit = function (boardId:string, configuration:PgnViewerConfiguration) {
    let base = pgnBase(boardId, Object.assign(
        {
            showFen: true, mode: 'edit',
            movable: {
                free: false,
                events: {
                    after: function (orig: any, dest: any, meta: any) {
                        base.onSnapEnd(orig, dest, meta)
                    }
                }
            },
            viewOnly: false
        },
        configuration))
    base.generateHTML()
    base.generateMoves()
    let board = base.generateBoard()
    return {base, board}
}

/**
 * Defines a utility function to get a printable version of a game, enriched
 * by diagrams, comments, ... Does  not allow to replay the game (no buttons),
 * disables all editing functionality.
 * @param boardId the unique ID of the board (per HTML page)
 * @param configuration the configuration, mainly here the board style and position.
 * Rest will be ignored.
 */
let pgnPrint = function (boardId: string, configuration:PgnViewerConfiguration) {
    let base = pgnBase(boardId, Object.assign({showCoords: false, mode: 'print'}, configuration))
    base.generateHTML()
    base.generateMoves()
    return base
}

/**
 * Defines a utility function to get a puzzle version of a game, enriched
 * by diagrams, comments, ... Does  not allow to replay the game (no buttons),
 * disables all editing functionality.
 * @param boardId the unique ID of the board (per HTML page)
 * @param configuration the configuration, mainly here the board style and position.
 * Rest will be ignored.
 */
let pgnPuzzle = function (boardId:string, configuration:PgnViewerConfiguration) {
    let base = pgnBase(boardId, Object.assign(
        {
            showFen: true, mode: 'puzzle',
            movable: {
                free: false,
                events: {
                    after: function (orig: any, dest: any, meta: any) {
                        base.onSnapEnd(orig, dest, meta)
                    }
                }
            },
            viewOnly: false
        },
        configuration))
    base.generateHTML()
    base.generateMoves()
    let board = base.generateBoard()
    return {base, board}
}

export {pgnBoard, pgnEdit, pgnBase, pgnPrint, pgnView, pgnPuzzle}
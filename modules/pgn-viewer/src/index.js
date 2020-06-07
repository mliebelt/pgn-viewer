import i18next  from 'i18next';
import i18nextXHRBackend from 'i18next-xhr-backend';
import i18nextLocalStorageCache from 'i18next-localstorage-cache';
import smoothscroll from 'smoothscroll-polyfill';
import pgnBase from "./pgnvjs";

import './css/chessground.css';
import './css/theme.css';
import './css/pgnvjs.css';

let GLOB_SCHED = {};
// kick off the polyfill!
smoothscroll.polyfill();

/**
 * Schedules a call, ensures that the result of that call is given back.
 * @param loc the given local, or not defined (default: en)
 * @param func the function that should be called after having loaded the locale.
 * @returns the result of the function call
 */
GLOB_SCHED.schedule = function (loc, func) {
    let my_res = null;
    let myLoc = (typeof loc != 'undefined') ? loc : 'en';
    if (i18next.hasResourceBundle(myLoc)) {
        my_res = func.call(null);
    } else {
        i18next.loadLanguages(myLoc, (err, t) => {
            my_res = func.call(null);
        });
    }
    return my_res;
};

// Users of PgnViewerJS may redefine some defaults by defining globally the var `PgnBaseDefaults.
// This will be merged then with the defaults defined by the app itself.
if (!window.PgnBaseDefaults) {
    window.PgnBaseDefaults = {};
}
// Holds defined pgnBase objects to allow test specs
window.pgnTestRegistry = {};

// Anonymous function, has not to be visible from the outside
// Does all the initialization stuff only needed once, here mostly internationalization.
let initI18n = function () {
    let localPath = function () {
        if (window.PgnBaseDefaults.localPath) {
            return window.PgnBaseDefaults.localPath;
        }
        let jsFileLocation = document.querySelector('script[src*=pgnv]').src;  // the src file path
        let index = jsFileLocation.indexOf('pgnv');
        console.log("Local path: " + jsFileLocation.substring(0, index));
        return jsFileLocation.substring(0, index);   // the father of the src folder
    };
    let localesPattern = window.PgnBaseDefaults.localesPattern || 'locales/{{ns}}-{{lng}}.json';
    let loadPath = window.PgnBaseDefaults.loadPath || (localPath() + localesPattern);
    let i18n_option = {
        backend: {loadPath: loadPath},
        cache: {enabled: true},
        fallbackLng: 'en',
        ns: ['chess', 'nag', 'buttons'],
        defaultNS: 'chess',
        debug: false
    };
    i18next.use(i18nextXHRBackend).use(i18nextLocalStorageCache).init(i18n_option, (err, t) => {
    });
};
initI18n();


/**
 * Defines the utility function just to display the board including the moves
 * read-only. It allows to play through the game, but not to change or adapt it.
 * @param boardId the unique ID per HTML page
 * @param configuration the configuration for chess, board and pgn.
 *      See the configuration of `pgnBoard` for the board configuration. Relevant for pgn is:
 *   pgn: the pgn as single string, or empty string (default)
 * @returns {{base, board}} base: all utility functions available, board: reference to Chessground
 */
let pgnView = function (boardId, configuration) {
    return GLOB_SCHED.schedule(configuration.locale,
        () => {
            let base = pgnBase(boardId, Object.assign({mode: 'view'}, configuration));
            base.generateHTML();
            let b = base.generateBoard();
            base.generateMoves(b);
            return {
                base,
                board: b
            };
        });
};

/**
 * Defines a utility function just to display a board (only). There are some similar
 * parameters to `pgnView`, but some are not necessary.
 * @param boardId needed for the inclusion of the board itself
 * @param configuration object with the attributes:
 *  position: 'start' or FEN string
 *  orientation: 'black' or 'white' (default)
 *  showCoords: false or true (default)
 *  pieceStyle: some of alpha, uscf, wikipedia (from chessboardjs) or
 *              merida-svg (default), case, leipzip, maya, condal (from ChessTempo)
 *              or chesscom (from chess.com) (as string)
 *  pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 *          Normally not changed by clients
 *  theme: (only CSS related) some of zeit, blue, chesscom, ... (as string)
 */
let pgnBoard = function (boardId, configuration) {
    return GLOB_SCHED.schedule(
        configuration.locale,
        () => {
            let base = pgnBase(boardId, Object.assign({headers: false, mode: 'board'}, configuration));
            base.generateHTML();
            let board = base.generateBoard();
            return {
                base,
                board
            };
        });
};

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
let pgnEdit = function (boardId, configuration) {
    return GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign(
            {
                showFen: true, mode: 'edit',
                movable: {
                    free: false,
                    events: {
                        after: function (orig, dest, meta) {
                            base.onSnapEnd(orig, dest, meta);
                        }
                    }
                },
                viewOnly: false
            },
            configuration));
        base.generateHTML();
        let board = base.generateBoard();
        base.generateMoves(board);
        return { base, board };
    });
};

/**
 * Defines a utility function to get a printable version of a game, enriched
 * by diagrams, comments, ... Does  not allow to replay the game (no buttons),
 * disables all editing functionality.
 * @param boardId the unique ID of the board (per HTML page)
 * @param configuration the configuration, mainly here the board style and position.
 * Rest will be ignored.
 */
let pgnPrint = function (boardId, configuration) {
    return GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign({showCoords: false, mode: 'print'}, configuration));
        base.generateHTML();
        base.generateMoves(null);
        return base;
    });
};

export { pgnBoard, pgnEdit, pgnBase, pgnPrint, pgnView };
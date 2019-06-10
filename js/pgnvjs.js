'use strict';

// Users of PgnViewerJS may redefine some defaults by defining globally the var `PgnBaseDefaults.
// This will be merged then with the defaults defined by the app itself.
var PgnBaseDefaults = window.PgnBaseDefaults ? window.PgnBaseDefaults : {};
// Holds defined pgnBase objects to allow test specs
window.pgnTestRegistry = {};

/**
 * Utilities used outside from pgnBase.
 */
function PgnScheduler() {
    this.list = [];
}

var GLOB_SCHED = new PgnScheduler();
GLOB_SCHED.schedule = function (loc, func, res) {
    let myLoc = (typeof loc != 'undefined') ? loc : 'en';
    if (i18next.hasResourceBundle(myLoc)) {
        func.call(null);
    } else {
        i18next.loadLanguages(myLoc, (err, t) => {
            let myRes = func.call(null);
            if (typeof res != 'undefined') {
                res.call(null, myRes);
            }
        });
    }
};

// Anonymous function, has not to be visible from the outside
// Does all the initialization stuff only needed once, here mostly internationalization.
let initI18n = function () {
    let localPath = function () {
        if (window.PgnBaseDefaults.localPath) {
            return window.PgnBaseDefaults.localPath;
        }
        let jsFileLocation = document.querySelector('script[src*=pgnvjs]').src;  // the js file path
        var index = jsFileLocation.indexOf('pgnvjs');
        console.log("Local path: " + jsFileLocation.substring(0, index - 3));
        return jsFileLocation.substring(0, index - 3);   // the father of the js folder
    };
    let localesPattern = window.PgnBaseDefaults.localesPattern || 'locales/{{ns}}-{{lng}}.json';
    let loadPath = window.PgnBaseDefaults.loadPath || (localPath() + localesPattern);
    var i18n_option = {
        backend: {loadPath: loadPath},
        cache: {enabled: true},
        fallbackLng: 'en',
        ns: ['chess', 'nag', 'buttons'],
        defaultNS: 'chess',
        debug: false
    };
    i18next.use(window.i18nextXHRBackend).use(window.i18nextLocalStorageCache).init(i18n_option, (err, t) => {
    });
};
initI18n();

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */
var pgnBase = function (boardId, configuration) {
    // Section defines the variables needed everywhere.
    const VERSION = "0.9.7";
    let that = {};
    let utils = new Utils();
    // Sets the default parameters for all modes. See individual functions for individual overwrites
    let defaults = {
        width: '320px',
        showNotation: true,
        orientation: 'white',
        position: 'start',
        showFen: false,
        layout: 'top',
        headers: true,
        timerTime: 700,
        locale: 'en',
        movable: {free: false},
        highlight: {lastMove: true},
        viewOnly: true,
        hideMovesBefore: false,
        colorMarker: null,
        showResult: false
    };
    that.promMappings = {q: 'queen', r: 'rook', b: 'bishop', n: 'knight'};
    that.configuration = Object.assign(Object.assign(defaults, PgnBaseDefaults), configuration);
    let game = new Chess();
    that.mypgn = pgnReader(that.configuration, game); // Use the same instance from chess.js
    let theme = that.configuration.theme || 'default';
    that.configuration.markup = (typeof boardId) == "object";
    let hasMarkup = function () {
        return that.configuration.markup;
    };
    let hasMode = function (mode) {
        return that.configuration.mode === mode;
    };
    let possibleMoves = function () {
        return that.mypgn.possibleMoves(game);
    };
    let board;              // Will be set later, but has to be a known variable
    // IDs needed for styling and adressing the HTML elements, only used if no markup is done by the user
    if (!hasMarkup()) {
        var headersId = boardId + 'Headers';
        var innerBoardId = boardId + 'Inner';
        var movesId = boardId + 'Moves';
        var buttonsId = boardId + 'Button';
        var fenId = boardId + "Fen";
        var colorMarkerId = innerBoardId + 'ColorMarker';
    } else { // will be filled later
        var innerBoardId;
        var headersId;
        var movesId;
        var buttonsId;
        var fenId;
        var colorMarkerId;

    }

    if (that.configuration.locale) {
        that.configuration.locale = that.configuration.locale.replace(/_/g, "-");
        i18next.loadLanguages(that.configuration.locale, (err, t) => {
        });
    }

    if (that.configuration.position) { // Allow early correction
        if (that.configuration.position !== 'start') {
            let tokens = that.configuration.position.split(/\s+/);
            if (tokens.length == 4) {
                that.configuration.position += ' 1 1';
            }
        }
    }

    /**
     * Allow logging of error to HTML.
     */
    function logError(str) {
        var node = document.createElement("DIV");
        var textnode = document.createTextNode(str);
        node.appendChild(textnode);
        that.errorDiv.appendChild(node);
    }

    /**
     * Adds a class to an element.
     */
    function addClass(elementOrId, className) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (!ele) return;
        if (ele.classList) {
            ele.classList.add(className);
        } else {
            ele.className += ' ' + className;
        }
    }

    /**
     * Remove a class from an element.
     */
    function removeClass(elementOrId, className) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (ele === null) return;
        if (ele.classList) {
            ele.classList.remove(className);
        } else {
            ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    /**
     * Inserts an element after targetElement
     * @param {*} newElement the element to insert
     * @param {*} targetElement the element after to insert
     */
    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    /**
     * Adds an event listener to the DOM element.
     */
    function addEventListener(elementOrId, event, func) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (ele === null) return;
        ele.addEventListener(event, func);
    }

    function toggleColorMarker() {
        let ele = document.getElementById(colorMarkerId);
        if (!ele) return;
        if (ele.classList.contains('cm-black')) {
            ele.classList.remove('cm-black');
        } else {
            ele.classList.add('cm-black');
        }
    }

    /**
     * Scroll if element is not visible
     * @param element the element to show by scrolling
     */
    function scrollToView(element) {
        function scrollParentToChild(parent, child) {
            let parentRect = parent.getBoundingClientRect();
            // What can you see?
            let parentViewableArea = {
                height: parent.clientHeight,
                width: parent.clientWidth
            };

            // Where is the child
            let childRect = child.getBoundingClientRect();
            // Is the child viewable?
            let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

            // if you can't see the child try to scroll parent
            if (!isViewable) {
                // scroll by offset relative to parent
                parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top;
            }
        }

        var node = element;
        var movesNode = node.offsetParent;
        scrollParentToChild(movesNode, node);
    }

    /**
     * Called when the piece is released. Here should be the logic for calling all
     * pgn enhancement.
     * @param from the source
     * @param to the destination
     * @param meta additional parameters (not used at the moment)
     */
    var onSnapEnd = async function (from, to, meta) {
        //console.log("Move from: " + from + " To: " + to + " Meta: " + JSON.stringify(meta, null, 2));
        //board.set({fen: game.fen()});
        var cur = that.currentMove;
        let primMove = {from: from, to: to};
        if ((that.mypgn.game.get(from).type == 'p') && ((to.substring(1, 2) == '8') || (to.substring(1, 2) == '1'))) {
            let sel = await swal("Select the promotion figure", {
                buttons: {
                    queen: {text: "Queen", value: 'q'},
                    rook: {text: "Rook", value: 'r'},
                    bishop: {text: "Bishop", value: 'b'},
                    knight: {text: 'Knight', value: 'n'}
                }
            });
            primMove.promotion = sel;
            //primMove.promotion = 'q'    // Here a real selection should stand!!
        }
        that.currentMove = that.mypgn.addMove(primMove, cur);
        var move = that.mypgn.getMove(that.currentMove);
        if (primMove.promotion) {
            let pieces = {};
            pieces[to] = null;
            board.setPieces(pieces);
            pieces[to] = {color: (move.turn == 'w' ? 'white' : 'black'), role: that.promMappings[primMove.promotion]};
            board.setPieces(pieces);
        }
        if (move.notation.ep) {
            let ep_field = to[0] + from[1];
            let pieces = {};
            pieces[ep_field] = null;
            board.setPieces(pieces);
        }
        if (moveSpan(that.currentMove) === null) {
            generateMove(that.currentMove, null, move, move.prev, document.getElementById(movesId), []);
        }
        unmarkMark(that.currentMove);
        updateUI(that.currentMove);
        let col = move.turn == 'w' ? 'black' : 'white';
        board.set({
            movable: Object.assign({}, board.state.movable, {color: col, dests: possibleMoves(game)}),
            check: game.in_check()
        });
        //makeMove(null, that.currentMove, move.fen);
        let fenView = document.getElementById(fenId);
        if (fenView) {
            fenView.value = move.fen;
        }
        toggleColorMarker();
    };

    // Utility function for generating general HTML elements with id, class (with theme)
    function createEle(kind, id, clazz, my_theme, father) {
        var ele = document.createElement(kind);
        if (id) {
            ele.setAttribute("id", id);
        }
        if (clazz) {
            if (my_theme) {
                ele.setAttribute("class", my_theme + " " + clazz);
            } else {
                ele.setAttribute("class", clazz);
            }
        }
        if (father) {
            father.appendChild(ele);
        }
        return ele;
    }

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    var generateHTML = function () {
        // Utility function for generating buttons divs
        function addButton(pair, buttonDiv) {
            var l_theme = (['green', 'blue'].indexOf(theme) >= 0) ? theme : 'default';
            var button = createEle("i", buttonsId + pair[0], "button fa " + pair[1], l_theme, buttonDiv);
            var title = i18next.t("buttons:" + pair[0], {lng: that.configuration.locale});
            document.getElementById(buttonsId + pair[0]).setAttribute("title", title);
            return button;
        }

        // Generates the view buttons (only)
        var generateViewButtons = function (buttonDiv) {
            [["flipper", "fa-adjust"], ["first", "fa-fast-backward"], ["prev", "fa-step-backward"],
                ["next", "fa-step-forward"], ["play", "fa-play-circle"], ["last", "fa-fast-forward"]].forEach(function (entry) {
                addButton(entry, buttonDiv);
            });
        };
        // Generates the edit buttons (only)
        var generateEditButtons = function (buttonDiv) {
            [["promoteVar", "fa-hand-o-up"], ["deleteMoves", "fa-scissors"]].forEach(function (entry) {
                var but = addButton(entry, buttonDiv);
                //but.className = but.className + " gray"; // just a test, worked.
                // only gray out if not usable, check that later.
            });
            [["pgn", "fa-print"], ['nags', 'fa-cog']].forEach(function (entry) {
                var but = addButton(entry, buttonDiv);
            });
        };

        // Generate 3 rows, similar to lichess in studies
        let generateNagMenu = function (nagEle) {
            let generateRow = function (array, rowClass, nagEle) {
                let generateLink = function (link, nagDiv) {
                    let generateIcon = function (icon, myLink) {
                        let ele = createEle('i', null, null, theme, myLink);
                        let i = that.mypgn.NAGS[icon] || '';
                        ele.setAttribute("data-symbol", i);
                        ele.setAttribute("data-value", icon);
                        ele.textContent = i18next.t('nag:$' + icon + "_menu", {lng: that.configuration.locale});
                    };
                    let myLink = createEle('a', null, null, theme, myDiv);
                    generateIcon(link, myLink);
                    myLink.addEventListener("click", function () {
                        function updateMoveSAN(moveIndex) {
                            let move = that.mypgn.getMove(moveIndex);
                            document.querySelector("#" + movesId + moveIndex + " > a").textContent = that.mypgn.sanWithNags(move);
                        }

                        this.classList.toggle("active");
                        let iNode = this.firstChild;
                        that.mypgn.changeNag('$' + iNode.getAttribute('data-value'), that.currentMove, this.classList.contains('active'));
                        updateMoveSAN(that.currentMove);
                    });
                };
                let myDiv = createEle('div', null, rowClass, theme, nagEle);
                array.forEach(ele => generateLink(ele, myDiv));
            };
            generateRow([1, 2, 3, 4, 5, 6, 7, 146], 'nagMove', nagEle);
            generateRow([10, 13, 14, 15, 16, 17, 18, 19], 'nagPosition', nagEle);
            generateRow([22, 40, 36, 132, 136, 32, 44, 140], 'nagObservation', nagEle);
        };
        var generateCommentDiv = function (commentDiv) {
            var radio = createEle("div", null, "commentRadio", theme, commentDiv);
            var mc = createEle("input", null, "moveComment", theme, radio);
            mc.type = "radio";
            mc.value = "move";
            mc.name = "radio";
            createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"));
            var mb = createEle("input", null, "beforeComment", theme, radio);
            mb.type = "radio";
            mb.value = "before";
            mb.name = "radio";
            createEle("label", null, "labelBeforeComment", theme, radio).appendChild(document.createTextNode("Before"));
            var ma = createEle("input", null, "afterComment", theme, radio);
            ma.type = "radio";
            ma.value = "after";
            ma.name = "radio";
            createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"));
            createEle("textarea", null, "comment", theme, commentDiv);
        };
        if (hasMarkup()) {
            if (boardId.header) {
                headersId = boardId.header; // Real header will be built later
                addClass(headersId, 'headers');
            }
            if (boardId.inner) {
                innerBoardId = boardId.inner;
                addClass(innerBoardId, 'board');
            }
            if (boardId.button) {
                buttonsId = boardId.button;
                addClass(buttonsId, 'buttons');
                var buttonsDiv = document.getElementById(buttonsId);
                generateViewButtons(buttonsDiv);
            }
            if (boardId.moves) {
                movesId = boardId.moves;
                addClass(movesId, 'moves');
            }
            if (boardId.editButton) {
                var editButtonsBoardDiv = document.getElementById(boardId.editButton);
                generateEditButtons(editButtonsBoardDiv);
            }
        } else {
            var divBoard = document.getElementById(boardId);
            if (divBoard == null) {
                return;
            } else {
                // ensure that the board is empty before filling it
                while (divBoard.childNodes.length > 0) {
                    divBoard.removeChild(divBoard.childNodes[0]);
                }
            }
            divBoard.classList.add(theme);
            divBoard.classList.add('whole');
            divBoard.setAttribute('tabindex', '0');
            // Add layout for class if configured
            if (that.configuration.layout) {
                divBoard.classList.add('layout-' + that.configuration.layout);
            }
            // Add an error div to show errors
            that.errorDiv = createEle("div", boardId + "Error", 'error', null, divBoard);
            createEle("div", headersId, "headers", theme, divBoard);
            var outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
            let boardAndDiv = createEle('div', null, 'boardAnd', theme, outerInnerBoardDiv);
            if (that.configuration.boardSize) {
                outerInnerBoardDiv.style.width = that.configuration.boardSize;
            }
            if (that.configuration.width || that.configuration.boardSize) {
                let size = that.configuration.width ? that.configuration.width : that.configuration.boardSize;
                boardAndDiv.style.display = 'grid';
                boardAndDiv.style.gridTemplateColumns = size + ' 40px';
            }
            var innerBoardDiv = createEle("div", innerBoardId, "board", theme, boardAndDiv);
            if (that.configuration.colorMarker && (!hasMode('print'))) {
                createEle("div", colorMarkerId, 'colorMarker' + " " + that.configuration.colorMarker, theme, boardAndDiv);
            }
            if (hasMode('view') || hasMode('edit')) {
                var buttonsBoardDiv = createEle("div", buttonsId, "buttons", theme, outerInnerBoardDiv);
                generateViewButtons(buttonsBoardDiv);
            }
            if ((hasMode('edit') || hasMode('view')) && (that.configuration.showFen)) {
                var fenDiv = createEle("textarea", fenId, "fen", theme, outerInnerBoardDiv);
                addEventListener(fenId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    this.select();
                });
                if (hasMode('edit')) {
                    document.getElementById(fenId).onpaste = function (e) {
                        var pastedData = e.originalEvent.clipboardData.getData('text');
                        // console.log(pastedData);
                        that.configuration.position = pastedData;
                        that.configuration.pgn = '';
                        pgnEdit(boardId, that.configuration);
                    };
                } else {
                    document.getElementById(fenId).readonly = true;
                }
                let fenSize = that.configuration.width ? that.configuration.width : that.configuration.boardSize;
                document.getElementById(fenId).style.width = fenSize;
            }
            if (hasMode('print') || hasMode('view') || hasMode('edit')) {
                // Ensure that moves are scrollable (by styling CSS) when necessary
                // To be scrollable, the height of the element has to be set
                // TODO: Find a way to set the height, if all other parameters denote that it had to be set:
                // scrollable == true; layout == left|right
                var movesDiv = createEle("div", movesId, "moves", null, divBoard);

                if (that.configuration.movesWidth) {
                    movesDiv.style.width = that.configuration.movesWidth;
                }
                else if (that.configuration.width) {
                    movesDiv.style.width = that.configuration.width;
                }
                if (that.configuration.movesHeight) {
                    movesDiv.style.height = that.configuration.movesHeight;
                }
            }
            if (hasMode('edit')) {
                var editButtonsBoardDiv = createEle("div", "edit" + buttonsId, "edit", theme, divBoard);
                generateEditButtons(editButtonsBoardDiv);
//                var outerPgnDiv = createEle("div", "outerpgn" + buttonsId, "outerpgn", theme, outerInnerBoardDiv);
//                var pgnHideButton  = addButton(["hidePGN", "fa-times"], outerPgnDiv);
                let nagMenu = createEle('div', 'nagMenu' + buttonsId, 'nagMenu', theme, divBoard);
                generateNagMenu(nagMenu);
                var pgnDiv = createEle("textarea", "pgn" + buttonsId, "pgn", theme, divBoard);
                var commentBoardDiv = createEle("div", "comment" + buttonsId, "comment", theme, divBoard);
                generateCommentDiv(commentBoardDiv);
                // Bind the paste key ...
                addEventListener("pgn" + buttonsId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    e.target.select();
                });
                document.getElementById("pgn" + buttonsId).onpaste = function (e) {
                    var pastedData = e.originalEvent.clipboardData.getData('text');
                    that.configuration.pgn = pastedData;
                    pgnEdit(boardId, that.configuration);
                };
            }
            var endDiv = createEle("div", null, "endBoard", null, divBoard);
        }
    };

    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
     */
    var generateBoard = function () {
        function copyBoardConfiguration(source, target, keys) {
            //var pieceStyle = source.pieceStyle || 'wikipedia';
            utils.pvEach(keys, function (key) {
                if (typeof source[key] != "undefined") {
                    target[key] = source[key];
                }
            });
        }

        // Default values of the board, if not overwritten by the given configuration
        let boardConfiguration = {coordsInner: true, coordsFactor: 1.0, disableContextMenu: true,
            drawable: {
                onChange: (shapes) => {
                    let move = that.mypgn.getMove(that.currentMove)
                    that.mypgn.setShapes(move, shapes);
                }
            }};

        copyBoardConfiguration(that.configuration, boardConfiguration,
            ['position', 'orientation', 'showNotation', 'pieceTheme', 'draggable',
                'coordsInner', 'coordsFactor', 'width', 'movable', 'viewOnly', 'highlight', 'boardSize',
                'rankFontSize']);
        // board = new ChessBoard(innerBoardId, boardConfiguration);
        if (typeof boardConfiguration.showNotation != 'undefined') {
            boardConfiguration.coordinates = boardConfiguration.showNotation;
        }
        boardConfiguration.fen = boardConfiguration.position;
        var el = document.getElementById(innerBoardId);
        if (typeof that.configuration.pieceStyle != 'undefined') {
            el.className += " " + that.configuration.pieceStyle;
        }
        if (boardConfiguration.boardSize) {
            boardConfiguration.width = boardConfiguration.boardSize;
        }
        board = Chessground(el, boardConfiguration);
        //console.log("Board width: " + board.width);
        if (boardConfiguration.width) {
            el.style.width = boardConfiguration.width;
            el.style.height = boardConfiguration.width;
            let fontSize = null;
            if (boardConfiguration.rankFontSize) {
                fontSize = boardConfiguration.rankFontSize;
            } else {
                // Set the font size related to the board (factor 28), ensure at least 8px font
                fontSize = Math.max(8, Math.round(parseInt(boardConfiguration.width.slice(0, -2)) / 28 * boardConfiguration.coordsFactor));
            }
            el.style.fontSize = `${fontSize}px`;
            document.body.dispatchEvent(new Event('chessground.resize'));
        }
        if (boardConfiguration.coordsInner) {
            el.classList.add('coords-inner');
        }
        if (hasMode('edit')) {
            game.load(boardConfiguration.position);
            let toMove = (game.turn() == 'w') ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: toMove, dests: possibleMoves(game)}),
                turnColor: toMove, check: game.in_check()
            });
        }
        if (that.configuration.colorMarker) {
            if ( (that.configuration.position != 'start') &&
                (that.configuration.position.split(' ')[1] == 'b') ) {
                let ele = document.getElementById(colorMarkerId);
                if (ele) {
                    ele.classList.add('cm-black');
                }
            }
        }
        return board;
    };

    var moveSpan = function (i) {
        return document.getElementById(movesId + i);
    };

    /**
     * Generates one move from the current position.
     * @param currentCounter the current move counter (should be redundant, because
     *      the move itself should know its move counter)
     * @param game the chess game that helps find the position
     * @param move the current move  generated by reading the PGN (or playing on the board)
     * @param prevCounter the previous counter (have to check that)
     * @param movesDiv the div that contains the current moves
     * @param varStack if empty no current variation (main line), else contains the divs of the variations played currently
     * @return {*} the current counter which may the next prev counter
     */
    var generateMove = function (currentCounter, game, move, prevCounter, movesDiv, varStack) {
        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @param clazz class parameter appended to differentiate different comments
         * @returns {HTMLElement} the new created span with the comment as text
         */
        var generateCommentSpan = function (comment, clazz) {
            var span = createEle('span', null, "comment " + clazz);
            if (comment && (typeof comment == "string")) {
                span.appendChild(document.createTextNode(" " + comment + " "));
            }
            return span;
        };

        var append_to_current_div = function (index, span, movesDiv, varStack) {
            if (varStack.length == 0) {
                if (typeof index == "number") {
                    insertAfter(span, moveSpan(index));
                } else {
                    movesDiv.appendChild(span);
                }
            } else {
                varStack[varStack.length - 1].appendChild(span);
            }
        };
        // Ignore null moves
        if (move === null || (move === undefined)) {
            return prevCounter;
        }
        var clAttr = "move";
        if (move.variationLevel > 0) {
            clAttr = clAttr + " var var" + move.variationLevel;
        }
        if (move.turn == 'w') {
            clAttr = clAttr + " white";
        }
        var span = createEle("span", movesId + currentCounter, clAttr);
        if (that.mypgn.startVariation(move)) {
            var varDiv = createEle("div", null, "variation");
            if (varStack.length == 0) {
                // This is the head of the current variation
                var varHead = null;
                if (typeof move.prev == "number") {
                    varHead = that.mypgn.getMove(move.prev).next;
                } else {
                    varHead = 0;
                }
                moveSpan(varHead).appendChild(varDiv);
                // movesDiv.appendChild(varDiv);
            } else {
                varStack[varStack.length - 1].appendChild(varDiv);
            }
            varStack.push(varDiv);
            //span.appendChild(document.createTextNode(" ( "));
        }
        span.appendChild(generateCommentSpan(move.commentMove, "moveComment"));
        if ((move.turn == 'w') || (that.mypgn.startVariation(move)) || (that.mypgn.afterMoveWithVariation(move))) {
            var mn = move.moveNumber;
            var num = createEle('span', null, "moveNumber", null, span);
            num.appendChild(document.createTextNode("" + mn + ((move.turn == 'w') ? ". " : "... ")));
        }
        span.appendChild(generateCommentSpan(move.commentBefore, "beforeComment"));
        var link = createEle('a', null, null, null, span);
        var san = that.mypgn.sanWithNags(move);
        var text = document.createTextNode(san);
        link.appendChild(text);
        span.appendChild(document.createTextNode(" "));
        span.appendChild(generateCommentSpan(move.commentAfter, "afterComment"));
        append_to_current_div(move.prev, span, movesDiv, varStack);
        //movesDiv.appendChild(span);
        if (that.mypgn.endVariation(move)) {
            //span.appendChild(document.createTextNode(" ) "));
            varStack.pop();
        }
        addEventListener(moveSpan(currentCounter), 'click', function (event) {
            makeMove(that.currentMove, currentCounter, move.fen);
            event.stopPropagation();
        });
        if (that.mypgn.has_diagram_nag(move)) {
            var diaID = boardId + "dia" + currentCounter;
            var diaDiv = createEle('div', diaID);
            span.appendChild(diaDiv);
            that.configuration.position = move.fen;
            pgnBoard(diaID, that.configuration);
        }
        return currentCounter;
    };

    /**
     * Unmark all marked moves, mark the next one.
     * @param next the next move number
     */
    function unmarkMark(next) {
        var moveASpan = function (i) {
            return document.querySelector('#' + movesId + i + '> a');
        };

        removeClass(document.querySelector('#' + movesId + " a.yellow"), 'yellow');
        addClass(moveASpan(next), 'yellow');
    }

    /**
     * Check which buttons should be grayed out
     */
    var updateUI = function (next) {
        let elements = document.querySelectorAll("div.buttons .gray");
        utils.pvEach(elements, function (ele) {
            removeClass(ele, 'gray');
        });
        var move = that.mypgn.getMove(next);
        if (next === null) {
            ["prev", "first"].forEach(function (name) {
                addClass(document.querySelector("div.buttons ." + name), 'gray');
            });
        }
        if ((next !== null) && (typeof move.next != "number")) {
            ["next", "play", "last"].forEach(function (name) {
                addClass(document.querySelector("div.buttons ." + name), 'gray');
            });
        }
        // Update the drop-down for NAGs
        try {
            if (move === undefined) {
                return;
            }
            let nagMenu = document.querySelector('#nagMenu' + buttonsId);
            document.querySelectorAll('#nagMenu' + buttonsId + ' a.active').forEach(function (act) {
                act.classList.toggle('active');
            });
            let nags = move.nag || [];
            nags.forEach(function (eachNag) {
                document.querySelector('#nagMenu' + buttonsId + ' [data-value="' + eachNag.substring(1) + '"]')
                    .parentNode.classList.toggle('active');
            });
        } catch (err) {

        }

    };

    /**
     * Plays the move that is already in the notation on the board.
     * @param curr the current move number
     * @param next the move to take now
     * @param fen the fen of the move to make
     */
    var makeMove = function (curr, next, fen) {
        /**
         * Fills the comment field depending on which and if a comment is filled for that move.
         */
        function fillComment(moveNumber) {
            let myMove = that.mypgn.getMove(moveNumber);
            if (!~myMove) return;
            if (myMove.commentAfter) {
                document.querySelector('#' + boardId + " input.afterComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentAfter;
            } else if (myMove.commentBefore) {
                document.querySelector('#' + boardId + " input.beforeComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentBefore;
            } else if (myMove.commentMove) {
                document.querySelector('#' + boardId + " input.moveComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentMove;
            } else {
                document.querySelector('#' + boardId + " textarea.comment").value = "";
            }
        }

        function handlePromotion(aMove) {
            if (!aMove) return;
            if (aMove.notation.promotion) {
                let promPiece = aMove.notation.promotion.substring(1, 2).toLowerCase();
                let pieces = {};
                pieces[aMove.to] =
                    {
                        role: that.mypgn.PROMOTIONS[promPiece],
                        color: (aMove.turn == 'w' ? 'white' : 'black')
                    };
                board.setPieces(pieces);
            }
        }

        function getShapes(commentDiag) {
            function colOfDiag(color) {
                const colors = {Y: 'yellow', R: 'red', B: 'blue', G: 'green'};
                return colors[color];
            }

            let arr = [];
            if ((commentDiag !== undefined) && (commentDiag !== null)) {
                if (commentDiag.colorArrows) {
                    for (var i = 0; i < commentDiag.colorArrows.length; i++) {
                        let comm = commentDiag.colorArrows[i];
                        arr.push({
                            orig: comm.substring(1, 3),
                            dest: comm.substring(3, 5),
                            brush: colOfDiag(comm.substring(0, 1))
                        });
                    }
                }
                if (commentDiag.colorFields) {
                    for (let i = 0; i < commentDiag.colorFields.length; i++) {
                        let comm = commentDiag.colorFields[i];
                        arr.push({orig: comm.substring(1, 3), brush: colOfDiag(comm.substring(0, 1))});
                    }
                }
            }
            return arr;
        }

        //console.log("Marke move: Curr " + curr + " Next " + next + " FEN " + fen);
        //board.set({fen: fen});
        let myMove = that.mypgn.getMove(next);
        let myFen = myMove ? myMove.fen : fen;
        if (!myFen) { // fen not given, take start position
            myFen = that.configuration.position == 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : that.configuration.position;
        }
        if (myMove) {
            board.set({fen: myFen, lastMove: [myMove.from, myMove.to]});
        } else {
            board.set({fen: myFen, lastMove: []});
        }
        handlePromotion(myMove);
        if (myMove) {
            board.setShapes(getShapes(myMove.commentDiag));
        }
        game.load(myFen);
        unmarkMark(next);
        that.currentMove = next;
        if (next) {
            scrollToView(moveSpan(next));
        }
        if (hasMode('edit')) {
            let col = game.turn() == 'w' ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: col, dests: possibleMoves(game)}),
                turnColor: col, check: game.in_check()
            });
            if (next) {
                fillComment(next);
            }
        } else if (hasMode('view')) {
            let col = game.turn() == 'w' ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: col}),
                turnColor: col, check: game.in_check()
            });
        }
        let fenView = document.getElementById(fenId);
        if (fenView) {
            fenView.value = fen;
        }
        toggleColorMarker();
        updateUI(next);
    };

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function (board) {
        try {
            that.mypgn.load_pgn();
        } catch (err) {
            if (typeof err.location != "undefined") {
                var sta = err.location.start.offset;
                let pgnStr = that.configuration.pgn;
                logError("Offset: " + sta);
                logError("PGN: " + pgnStr);
                logError(err.message);
            } else {
                let pgnStr = that.configuration.pgn;
                logError("PGN: " + pgnStr);
                logError(err);
            }
        }
        var myMoves = that.mypgn.getMoves();
        if (that.configuration.position == 'start') {
            game.reset();
        } else {
            game.load(that.configuration.position);
        }
        if (board !== null) {
            board.set({fen: game.fen()});
        }
        let fenField = document.getElementById(fenId);
        if (utils.pvIsElement(fenField)) {
            fenField.value = game.fen();
        }

        /**
         * Generate a useful notation for the headers, allow for styling. First a version
         * that just works.
         */
        var generateHeaders = function () {
            var headers = that.mypgn.getHeaders();
            if (that.configuration.headers == false || (utils.pvIsEmpty(headers))) {
                let hd = document.getElementById(headersId);
                hd.parentNode.removeChild(hd);
                return;
            }
            var div_h = document.getElementById(headersId);
            var white = createEle('span', null, "whiteHeader", theme, div_h);
            if (headers.White) {
                white.appendChild(document.createTextNode(headers.White + " "));
            }
            //div_h.appendChild(document.createTextNode(" - "));
            var black = createEle('span', null, "blackHeader", theme, div_h);
            if (headers.Black) {
                black.appendChild(document.createTextNode(" " + headers.Black));
            }
            var rest = "";
            var appendHeader = function (result, header, separator) {
                if (header) {
                    if (result.length > 0) {
                        result += separator;
                    }
                    result += header;
                }
                return result;
            };
            [headers.Event, headers.Site, headers.Round, headers.Date,
                headers.ECO, headers.Result].forEach(function (header) {
                rest = appendHeader(rest, header, " | ");
            });
            var restSpan = createEle("span", null, "restHeader", theme, div_h);
            restSpan.appendChild(document.createTextNode(rest));

        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function () {
            var bind_key = function (key, to_call) {
                var key_ID;
                if (hasMarkup()) {
                    key_ID = "#" + boardId.moves;
                } else {
                    key_ID = "#" + boardId + ",#" + boardId + "Moves";
                }
                var form = document.querySelector(key_ID);
                Mousetrap(form).bind(key, function (evt) {
                    to_call();
                    evt.stopPropagation();
                });
            };
            var nextMove = function () {
                var fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove === null)) {
                    fen = that.mypgn.getMove(0).fen;
                    makeMove(null, 0, fen);
                } else {
                    var next = that.mypgn.getMove(that.currentMove).next;
                    fen = that.mypgn.getMove(next).fen;
                    makeMove(that.currentMove, next, fen);
                }
            };
            var prevMove = function () {
                var fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove == null)) {
                    /*fen = that.mypgn.getMove(0).fen;
                     makeMove(null, 0, fen);*/
                }
                else {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    if ((typeof prev === 'undefined') || (prev == null)) {
                        firstMove();
                    } else {
                        fen = that.mypgn.getMove(prev).fen;
                        makeMove(that.currentMove, prev, fen);
                    }
                }
            };
            var firstMove = function () {
                makeMove(null, null, null);
            };
            var timer = new Timer(10);
            timer.bind(that.configuration.timerTime, function () {
                nextMove();
            });
            addEventListener(buttonsId + 'flipper', 'click', function () {
                board.toggleOrientation();
            });
            addEventListener(buttonsId + 'next', 'click', function () {
                nextMove();
            });
            addEventListener(buttonsId + 'prev', 'click', function () {
                prevMove();
            });
            addEventListener(buttonsId + 'first', 'click', function () {
                // Goes to the position after the first move.
                // var fen = that.mypgn.getMove(0).fen;
                // makeMove(that.currentMove, 0, fen);
                firstMove();
            });
            addEventListener(buttonsId + 'last', 'click', function () {
                var fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            let togglePgn = function () {
                var pgnButton = document.getElementById(buttonsId + "pgn");
                var pgnText = document.getElementById(boardId + " .outerpgn");
                document.getElementById(buttonsId + "pgn").classList.toggle('selected');
                if (document.getElementById(buttonsId + "pgn").classList.contains('selected')) {
                    var str = computePgn();
                    showPgn(str);
                    document.querySelector("#" + boardId + " .pgn").style.display = 'block'; //slideDown(700, "linear");
                } else {
                    document.querySelector("#" + boardId + " .pgn").style.display = 'none';
                }
            };
            let toggleNagMenu = function () {
                let nagMenu = document.getElementById(buttonsId + 'nags').classList.toggle('selected');
                if (document.getElementById(buttonsId + 'nags').classList.contains('selected')) {
                    document.getElementById('nagMenu' + buttonsId).style.display = 'flex';
                } else {
                    document.getElementById('nagMenu' + buttonsId).style.display = 'none';
                }
            };
            if (hasMode('edit')) { // only relevant functions for edit mode
                addEventListener(buttonsId + "pgn", 'click', function () {
                    togglePgn();
                });
                addEventListener(buttonsId + 'nags', 'click', function () {
                    toggleNagMenu();
                });
                addEventListener(buttonsId + "deleteMoves", 'click', function () {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    var fen = that.mypgn.getMove(prev).fen;
                    that.mypgn.deleteMove(that.currentMove);
                    //document.getElementById(movesId).innerHtml = "";
                    let myNode = document.getElementById(movesId);
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    regenerateMoves(that.mypgn.getMoves());
                    makeMove(null, prev, fen);
                });
                addEventListener(buttonsId + "promoteVar", 'click', function () {
                    let curr = that.currentMove;
                    that.mypgn.promoteMove(that.currentMove);
                    //document.getElementById(movesId).html("");
                    let myNode = document.getElementById(movesId);
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    regenerateMoves(that.mypgn.getOrderedMoves());
                    let fen = that.mypgn.getMove(curr).fen;
                    makeMove(null, that.currentMove, fen);
                });
                document.querySelector('#' + boardId + ' .pgn').style.display = 'none';
                document.querySelector('#comment' + buttonsId + " textarea.comment").onchange = function () {
                    function commentText() {
                        return " " + document.querySelector('#' + 'comment' + buttonsId + " textarea.comment").value + " ";
                    }

                    let text = commentText();
                    let checked = document.querySelector('#' + "comment" + buttonsId + " :checked");
                    checked = checked ? checked.value : "after";
                    moveSpan(that.currentMove).querySelector("." + checked + "Comment").textContent = text;
                    if (checked === "after") {
                        that.mypgn.getMove(that.currentMove).commentAfter = text;
                    } else if (checked === "before") {
                        that.mypgn.getMove(that.currentMove).commentBefore = text;
                    } else if (checked === "move") {
                        that.mypgn.getMove(that.currentMove).commentMove = text;
                    }
                };
                var rad = ["moveComment", "beforeComment", "afterComment"];
                var prevComment = null;
                for (var i = 0; i < rad.length; i++) {
                    document.querySelector('#' + 'comment' + buttonsId + " ." + rad[i]).onclick = function () {
                        var checked = this.value;
                        var text;
                        if (checked === "after") {
                            text = that.mypgn.getMove(that.currentMove).commentAfter;
                        } else if (checked === "before") {
                            text = that.mypgn.getMove(that.currentMove).commentBefore;
                        } else if (checked === "move") {
                            text = that.mypgn.getMove(that.currentMove).commentMove;
                        }
                        document.querySelector('#' + boardId + " textarea.comment").value = text;
                    };
                }
            }

            function togglePlay() {
                timer.running() ? timer.stop() : timer.start();
                var playButton = document.getElementById(buttonsId + 'play');
                var clString = playButton.getAttribute('class');
                if (clString.indexOf('play') < 0) { // has the stop button
                    clString = clString.replace('stop', 'play');
                } else {
                    clString = clString.replace('play', 'stop');
                }
                playButton.setAttribute('class', clString);
            }

            bind_key("left", prevMove);
            bind_key("right", nextMove);
            //bind_key("space", togglePlay);
            addEventListener(buttonsId + 'play', 'click', function () {
                togglePlay();
            });

        };

        var computePgn = function () {
            return that.mypgn.write_pgn();
        };

        var showPgn = function (val) {
            document.getElementById('pgn' + buttonsId).textContent = val;
        };

        /**
         * Regenerate the moves div, may be used the first time (DIV is empty)
         * or later (moves have changed).
         */
        var regenerateMoves = function (myMoves) {
            var movesDiv = document.getElementById(movesId);
            var prev = null;
            var varStack = [];
            for (var i = 0; i < myMoves.length; i++) {
                if (!that.mypgn.isDeleted(i)) {
                    var move = myMoves[i];
                    prev = generateMove(move.index, game, move, prev, movesDiv, varStack);
                }
            }
        };
        regenerateMoves(myMoves);
        bindFunctions();
        generateHeaders();

        /**
         * Allows to add functions after having generated the moves. Used currently for setting start position.
         */
        function postGenerateMoves() {
            function findMoveForStart() {
                let startPlay = that.configuration.startPlay;
                if (!isNaN(startPlay)) {   // the following goes only over the main line, move number cannot denote a variation
                    startPlay = startPlay - 1;
                    let move = that.mypgn.getMove(0);
                    while (startPlay > 0) {
                        startPlay = startPlay - 1;
                        move = that.mypgn.getMove(move.next);
                    }
                    return move;
                }
                let moves = that.mypgn.getMoves();
                for (let move of moves) {
                    if (move.fen.startsWith(startPlay)) {
                        return move;
                    } else if (move.notation.notation == startPlay) {
                        return move;
                    }
                }
                return undefined;
            }

            if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
                let move = findMoveForStart();
                if (move === undefined) {
                    logError('Could not find startPlay: ' + that.configuration.startPlay);
                    return;
                }
                makeMove(move.prev, move.index, move.fen);
                unmarkMark(move.index);
            }

            if (that.configuration.showResult) {
                // find the result from the header
                let endGame = that.mypgn.getEndGame();
                // Insert it as new span
                let span = createEle("span", movesId + "Result", "move", theme,
                    document.getElementById(movesId));
                span.innerHTML = endGame ? endGame : "*";

            }
        }

        postGenerateMoves();
    };
    let ret = {
        // PUBLIC API
        chess: game,
        board: board,
        getPgn: function () {
            return that.mypgn;
        },
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        onSnapEnd: onSnapEnd
    };
    window.pgnTestRegistry[boardId] = ret;
    return ret;
};

/**
 * Defines the utility function just to display the board including the moves
 * read-only. It allows to play through the game, but not to change or adapt it.
 * @param boardId the unique ID per HTML page
 * @param configuration the configuration for chess, board and pgn.
 *      See the configuration of `pgnBoard` for the board configuration. Relevant for pgn is:
 *   pgn: the pgn as single string, or empty string (default)
 * @returns {{chess: chess, getPgn: getPgn}} all utility functions available
 */
var pgnView = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale,
        () => {
            var base = pgnBase(boardId, Object.assign({mode: 'view'}, configuration));
            base.generateHTML();
            var b = base.generateBoard();
            base.generateMoves(b);
        });
};

/**
 * Defines a utility function just to display a board (only). There are some similar
 * parameters to `pgnView`, but some are not necessary.
 * @param boardId needed for the inclusion of the board itself
 * @param configuration object with the attributes:
 *  position: 'start' or FEN string
 *  orientation: 'black' or 'white' (default)
 *  showNotation: false or true (default)
 *  pieceStyle: some of alpha, uscf, wikipedia (from chessboardjs) or
 *              merida (default), case, leipzip, maya, condal (from ChessTempo)
 *              or chesscom (from chess.com) (as string)
 *  pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 *          Normally not changed by clients
 *  theme: (only CSS related) some of zeit, blue, chesscom, ... (as string)
 */
var pgnBoard = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign({headers: false, mode: 'board'}, configuration));
        base.generateHTML();
        let b = base.generateBoard();
        return {
            chess: base.chess,
            board: b
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
var pgnEdit = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
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
var pgnPrint = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign({showNotation: false, mode: 'print'}, configuration));
        base.generateHTML();
        base.generateMoves(null);
    });
};

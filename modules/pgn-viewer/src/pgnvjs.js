import i18next  from 'i18next';
import { Utils, pgnReader } from '@mliebelt/pgn-reader';
import { Chessground } from 'chessground';
import Timer from './Timer';
import Mousetrap from 'mousetrap';
import swal from 'sweetalert';

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */
let pgnBase = function (boardId, configuration) {
    // Section defines the variables needed everywhere.
    let that = {};
    let utils = new Utils();
    // Sets the default parameters for all modes. See individual functions for individual overwrites
    let defaults = {
        theme: "blue",
        pieceStyle: 'merida',
        //width: '320px',
        //boardSize: '320px',
        showCoords: true,
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
        showResult: false,
        timeAnnotation: 'none',
        notation: 'short'
    };
    that.promMappings = {q: 'queen', r: 'rook', b: 'bishop', n: 'knight'};
    that.configuration = Object.assign(Object.assign(defaults, PgnBaseDefaults), configuration);
    that.mypgn = pgnReader(that.configuration);
    let game = that.mypgn.game;     // Use the same instance from chess.src
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
        var whiteHeaderId = boardId + 'WhiteHeader';
        var blackHeaderId = boardId + 'BlackHeader';
        var innerBoardId = boardId + 'Inner';
        var movesId = boardId + 'Moves';
        var buttonsId = boardId + 'Button';
        var fenId = boardId + "Fen";
        var colorMarkerId = innerBoardId + 'ColorMarker';
    } else { // will be filled later
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
        let node = document.createElement("DIV");
        const textnode = document.createTextNode(str);
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
        const parent = targetElement.parentNode;
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

        const node = element;
        const movesNode = node.parentElement;
        scrollParentToChild(movesNode, node);
    }

    /**
     * Called when the piece is released. Here should be the logic for calling all
     * pgn enhancement.
     * @param from the source
     * @param to the destination
     * @param meta additional parameters (not used at the moment)
     */
    const onSnapEnd = function (from, to, meta) {
        //console.log("Move from: " + from + " To: " + to + " Meta: " + JSON.stringify(meta, null, 2));
        //board.set({fen: game.fen()});
        const cur = that.currentMove;
        let primMove = {from: from, to: to};
        if ((that.mypgn.game.get(from).type == 'p') && ((to.substring(1, 2) == '8') || (to.substring(1, 2) == '1'))) {
            let sel = swal("Select the promotion figure", {
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
        const move = that.mypgn.getMove(that.currentMove);
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
        const ele = document.createElement(kind);
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

    // Internationionalize the figures in SAN
    function i18nSan(san) {
        function i18nFig(fig, locale) {
            return i18next.t("chess:" + fig, { lng: locale});
        }
        let locale = that.configuration.locale;
        if (! locale) return san;
        let new_san = san;
        if ( ! (san.match(/^[a-h]x/) || san.match(/^[a-h]\d/) ) ) {
            let move_fig = i18nFig(san[0], locale);
            new_san = san.replace(san[0], move_fig);
        }
        let m = new_san.match(/=([QRNB])/);
        if (m) {
            new_san = new_san.replace(m[1], i18nFig(m[1], locale));
        }
        return new_san;
    }

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    const generateHTML = function () {
        // Utility function for generating buttons divs
        function addButton(pair, buttonDiv) {
            const l_theme = (['green', 'blue'].indexOf(theme) >= 0) ? theme : 'default';
            const button = createEle("i", buttonsId + pair[0], "button fa " + pair[1], l_theme, buttonDiv);
            const title = i18next.t("buttons:" + pair[0], {lng: that.configuration.locale});
            document.getElementById(buttonsId + pair[0]).setAttribute("title", title);
            return button;
        }

        // Generates the view buttons (only)
        const generateViewButtons = function (buttonDiv) {
            [["flipper", "fa-adjust"], ["first", "fa-fast-backward"], ["prev", "fa-step-backward"],
                ["next", "fa-step-forward"], ["play", "fa-play-circle"], ["last", "fa-fast-forward"]].forEach(function (entry) {
                addButton(entry, buttonDiv);
            });
        };
        // Generates the edit buttons (only)
        const generateEditButtons = function (buttonDiv) {
            [["promoteVar", "fa-hand-o-up"], ["deleteMoves", "fa-scissors"]].forEach(function (entry) {
                addButton(entry, buttonDiv);
                //but.className = but.className + " gray"; // just a test, worked.
                // only gray out if not usable, check that later.
            });
            [["pgn", "fa-print"], ['nags', 'fa-cog']].forEach(function (entry) {
                addButton(entry, buttonDiv);
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
                            let san = i18nSan(that.mypgn.sanWithNags(move));
                            document.querySelector("#" + movesId + moveIndex + " > a").textContent = san;
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
        const generateCommentDiv = function (commentDiv) {
            const radio = createEle("div", null, "commentRadio", theme, commentDiv);
            const mc = createEle("input", null, "moveComment", theme, radio);
            mc.type = "radio";
            mc.value = "move";
            mc.name = "radio";
            createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"));
            const mb = createEle("input", null, "beforeComment", theme, radio);
            mb.type = "radio";
            mb.value = "before";
            mb.name = "radio";
            createEle("label", null, "labelBeforeComment", theme, radio).appendChild(document.createTextNode("Before"));
            const ma = createEle("input", null, "afterComment", theme, radio);
            ma.type = "radio";
            ma.value = "after";
            ma.name = "radio";
            createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"));
            createEle("textarea", null, "comment", theme, commentDiv);
        };

        const hasHeaders = function () {
            return that.configuration.headers && (Object.keys(that.mypgn.getTags()).length > 0)
        }
        // TODO: Remove hasMarkup all together
        if (hasMarkup()) {

        } else {
            const divBoard = document.getElementById(boardId);
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
            divBoard.classList.add(that.configuration.mode + 'Mode');
            divBoard.setAttribute('tabindex', '0');
            // Add layout for class if configured
            if (that.configuration.layout) {
                divBoard.classList.add('layout-' + that.configuration.layout);
            }
            /** Add an error div to show errors */
            that.errorDiv = createEle("div", boardId + "Error", 'error', null, divBoard);

            /** Header Div (as part of topInner ?? */
            //createEle("div", headersId, "headers", theme, divBoard);

            /** outerBoard */
            const outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
            let boardAndDiv = createEle('div', null, 'boardAnd', theme, outerInnerBoardDiv);
            // TODO Move the computation of grid layout sizes to one function (with parameters)
            if (that.configuration.boardSize) {
                outerInnerBoardDiv.style.width = that.configuration.boardSize;
            }
            /** topInner for headers / time of Black. TODO: Orientation should switch that then. **/
            let topInnerBoardDiv = createEle("div", null, "topInnerBoard", theme, boardAndDiv);
            let blackHeader = createEle('div', blackHeaderId, "blackHeader", theme, boardAndDiv);
            let topTime = createEle("span", null, "topTime", theme, topInnerBoardDiv);
            const innerBoardDiv = createEle("div", innerBoardId, "board", theme, boardAndDiv);
            /** bottomInner for headers / time of White. TODO: Orientation should switch that then. **/
            let bottomInnerBoardDiv = createEle("div", null, "bottomInnerBoard", theme, boardAndDiv);
            let whiteHeader = createEle('div', whiteHeaderId, "whiteHeader", theme, boardAndDiv);
            let bottomTime = createEle("div", null, "bottomTime", theme, bottomInnerBoardDiv);

            /** Buttons */
            if (hasMode('view') || hasMode('edit')) {
                const buttonsBoardDiv = createEle("div", buttonsId, "buttons", theme, divBoard);
                generateViewButtons(buttonsBoardDiv);
                if ( that.configuration.colorMarker ) {
                    createEle("div", colorMarkerId, 'colorMarker' + " " + that.configuration.colorMarker, theme, buttonsBoardDiv);
                }
            }
            if (hasMode('board')) {
                if ( that.configuration.colorMarker ) {
                    createEle("div", colorMarkerId, 'colorMarker' + " " + that.configuration.colorMarker, theme, topInnerBoardDiv);
                }
            }

            /** Fen */
            if ((hasMode('edit') || hasMode('view')) && (that.configuration.showFen)) {
                const fenDiv = createEle("textarea", fenId, "fen", theme, outerInnerBoardDiv);
                addEventListener(fenId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    this.select();
                });
                if (hasMode('edit')) {
                    document.getElementById(fenId).onpaste = function (e) {
                        const pastedData = e.originalEvent.clipboardData.getData('text');
                        // console.log(pastedData);
                        that.configuration.position = pastedData;
                        that.configuration.pgn = '';
                        pgnEdit(boardId, that.configuration);
                    };
                } else {
                    document.getElementById(fenId).readonly = true;
                }
            }

            /** Moves Div */
            if (hasMode('print') || hasMode('view') || hasMode('edit')) {
                const movesDiv = createEle("div", movesId, "moves", null, divBoard);
            }

            /** Edit Divs TODO Redo those */
            if (hasMode('edit')) {
                const editButtonsBoardDiv = createEle("div", "edit" + buttonsId, "edit", theme, divBoard);
                generateEditButtons(editButtonsBoardDiv);
                let nagMenu = createEle('div', 'nagMenu' + buttonsId, 'nagMenu', theme, divBoard);
                generateNagMenu(nagMenu);
                const pgnDiv = createEle("textarea", "pgn" + buttonsId, "pgn", theme, divBoard);
                const commentBoardDiv = createEle("div", "comment" + buttonsId, "comment", theme, divBoard);
                generateCommentDiv(commentBoardDiv);
                // Bind the paste key ...
                addEventListener("pgn" + buttonsId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    e.target.select();
                });
                document.getElementById("pgn" + buttonsId).onpaste = function (e) {
                    const pastedData = e.originalEvent.clipboardData.getData('text');
                    that.configuration.pgn = pastedData;
                    pgnEdit(boardId, that.configuration);
                };
            }
            let computeBoardSize = function() {
                let _boardSize = that.configuration.boardSize;
                let _width =  that.configuration.width || divBoard.style.width;
                if (that.configuration.layout === 'top' || that.configuration.layout === 'bottom') {
                    if (_boardSize) {
                        that.configuration.width = _boardSize;
                        divBoard.style.width = _boardSize;
                        return _boardSize;
                    } else {
                        _width = _width || '320px';
                        that.configuration.boardSize = _width;
                        that.configuration.width = _width;
                        divBoard.style.width = _width;
                        return _width;
                    }
                }
                // Layout left or right, more complex combinations possible
                if (_boardSize && _width) {
                    divBoard.style.width = _width;
                    that.configuration.width = _width;
                    return _boardSize;
                } else if (! _boardSize) {
                    divBoard.style.width = _width;
                    that.configuration.width = _width;
                    _width = "" + parseInt(_width) / 8 * 5 + "px";
                    that.configuration.boardSize = _width;
                    return _width;
                }
            }

            let _boardHeight = computeBoardSize();
            let _boardWidth = _boardHeight;
            let _buttonFontSize = `${parseInt(_boardHeight) / 18}px`;
            if (document.getElementById(buttonsId)) {
                document.getElementById(buttonsId).style.fontSize = _buttonFontSize;
            }

            window.addEventListener('load', (event) => { // same as window.addEventListener('load', (event) => {
                if (hasMode('board')) {
                    if (document.getElementById(colorMarkerId)) {
                        document.getElementById(colorMarkerId).style.marginLeft = 'auto';
                    }
                    return;
                }
                if (hasMode('print')) return;
                if (that.configuration.showFen) {
                    let _fenHeight = document.getElementById(fenId).offsetHeight;
                    _boardHeight = `${parseInt(_boardHeight) + _fenHeight}px`;
                }
                if (hasHeaders()) {
                    _boardHeight = `${parseInt(_boardHeight) + 40}px`;
                }
                let _buttonsHeight = document.getElementById(buttonsId).offsetHeight;
                if (that.configuration.layout === 'left' || that.configuration.layout === 'right') {
                    divBoard.style.gridTemplateRows = `auto minmax(auto, ${_boardHeight}) ${_buttonsHeight}px`;
                    let _movesWidth = `${parseInt(that.configuration.width) - parseInt(_boardWidth)}px`;
                    if (that.configuration.layout === 'left') {
                        divBoard.style.gridTemplateColumns = _boardWidth + " " + _movesWidth;
                    } else {
                        divBoard.style.gridTemplateColumns = _movesWidth + " " + _boardWidth;
                    }
                } else {
                    let _movesCount = that.mypgn.getMoves().length;
                    let _minMovesHeight = (_movesCount + 7) / 7 * 30;
                    let _movesHeight = parseInt(_boardHeight) / 5 * 3;
                    if (_minMovesHeight < _movesHeight) _movesHeight = _minMovesHeight;
                    if (that.configuration.layout === 'top') {
                        divBoard.style.gridTemplateRows = `auto minmax(auto, ${_boardHeight}) ${_buttonsHeight}px minmax(0, ${_movesHeight}px)`;
                    } else if (that.configuration.layout === 'bottom') {
                        divBoard.style.gridTemplateRows = `auto minmax(0,${_movesHeight}px) minmax(auto,${_boardHeight}) ${_buttonsHeight}px`;
                    }
                }
            })
        }
    };

    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
     */
    const generateBoard = function () {
        function copyBoardConfiguration(source, target, keys) {
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
            ['position', 'orientation', 'showCoords', 'pieceTheme', 'draggable',
                'coordsInner', 'coordsFactor', 'width', 'movable', 'viewOnly', 'highlight', 'boardSize',
                'rankFontSize']);
        // board = new ChessBoard(innerBoardId, boardConfiguration);
        // Allow Chessground to be resizable
        boardConfiguration.resizable = true;
        if (typeof boardConfiguration.showCoords != 'undefined') {
            boardConfiguration.coordinates = boardConfiguration.showCoords;
        }
        boardConfiguration.fen = boardConfiguration.position;
        const el = document.getElementById(innerBoardId);
        if (typeof that.configuration.pieceStyle != 'undefined') {
            el.className += " " + that.configuration.pieceStyle;
        }
        if (boardConfiguration.boardSize) {
            boardConfiguration.width = boardConfiguration.boardSize;
        }
        let currentWidth = parseInt(boardConfiguration.width);
        let moduloWidth = currentWidth % 8;
        let smallerWidth = currentWidth - moduloWidth;
        // Ensure that boardWidth is a multiply of 8
        boardConfiguration.width = "" + smallerWidth +"px";
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

    const moveSpan = function (i) {
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
    const generateMove = function (currentCounter, game, move, prevCounter, movesDiv, varStack) {
        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @param clazz class parameter appended to differentiate different comments
         * @returns {HTMLElement} the new created span with the comment as text
         */
        const generateCommentSpan = function (comment, clazz) {
            const span = createEle('span', null, "comment " + clazz);
            if (comment && (typeof comment == "string")) {
                span.appendChild(document.createTextNode(" " + comment + " "));
            }
            return span;
        };

        const append_to_current_div = function (index, span, movesDiv, varStack) {
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
        function localBoard(id, configuration) {
            let base = pgnBase(id, Object.assign({headers: false, mode: 'board', boardSize: '200px'}, configuration));
            base.generateHTML();
            base.generateBoard();
        }
        // Ignore null moves
        if (move === null || (move === undefined)) {
            return prevCounter;
        }
        let clAttr = "move";
        if (move.variationLevel > 0) {
            clAttr = clAttr + " var var" + move.variationLevel;
        }
        if (move.turn == 'w') {
            clAttr = clAttr + " white";
        }
        const span = createEle("span", movesId + currentCounter, clAttr);
        if (that.mypgn.startVariation(move)) {
            const varDiv = createEle("div", null, "variation");
            if (varStack.length == 0) {
                // This is the head of the current variation
                let varHead = null;
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
        if ((move.turn == 'w') || (that.mypgn.startMainLine(move)) || (that.mypgn.startVariation(move)) || (that.mypgn.afterMoveWithVariation(move))) {
            const mn = move.moveNumber;
            const num = createEle('span', null, "moveNumber", null, span);
            num.appendChild(document.createTextNode("" + mn + ((move.turn == 'w') ? ". " : "... ")));
        }
        span.appendChild(generateCommentSpan(move.commentBefore, "beforeComment"));
        const link = createEle('a', null, null, null, span);
        const san = i18nSan(that.mypgn.sanWithNags(move));
        const text = document.createTextNode(san);
        link.appendChild(text);
        span.appendChild(document.createTextNode(" "));
        if (that.configuration.timeAnnotation != 'none' && move.commentDiag && move.commentDiag.clock) {
            let cl_time = move.commentDiag.clock.value;
            let cl_class = that.configuration.timeAnnotation.class || 'timeNormal';
            let clock_span = generateCommentSpan(cl_time, cl_class);
            if (that.configuration.timeAnnotation.colorClass) {
                clock_span.style = "color: " + that.configuration.timeAnnotation.colorClass;
            }
            span.appendChild(clock_span);
        }
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
            const diaID = boardId + "dia" + currentCounter;
            const diaDiv = createEle('div', diaID);
            span.appendChild(diaDiv);
            that.configuration.position = move.fen;
            localBoard(diaID, that.configuration);
        }
        //console.log(`FEN size: ${move.fen.length}`)
        return currentCounter;
    };

    /**
     * Unmark all marked moves, mark the next one.
     * @param next the next move number
     */
    function unmarkMark(next) {
        const moveASpan = function (i) {
            return document.querySelector('#' + movesId + i + '> a');
        };

        removeClass(document.querySelector('#' + movesId + " a.yellow"), 'yellow');
        addClass(moveASpan(next), 'yellow');
    }

    /**
     * Check which buttons should be grayed out
     */
    const updateUI = function (next) {
        let elements = document.querySelectorAll("div.buttons .gray");
        utils.pvEach(elements, function (ele) {
            removeClass(ele, 'gray');
        });
        const move = that.mypgn.getMove(next);
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
    const makeMove = function (curr, next, fen) {
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
                    for (let i = 0; i < commentDiag.colorArrows.length; i++) {
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
    const generateMoves = function (board) {
        try {
            that.mypgn.load_pgn();
        } catch (err) {
            if (typeof err.location != "undefined") {
                const sta = err.location.start.offset;
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
        //TODO: Move the whole block to `pgn.src` and do the compuation there.
        // This should already be finished after load_pgn
        // if (that.configuration.startPlay && that.configuration.hideMovesBefore) {
        //     let new_fen = that.mypgn.deleteMovesBefore(that.configuration.startPlay);
        //     let new_pgn = that.mypgn.write_pgn();
        //     that.configuration.startPlay = null;
        //     that.configuration.hideMovesBefore = false;
        //     that.configuration.pgn = new_pgn;
        //     that.configuration.position = new_fen;
        //     that.mypgn.load_pgn();
        // }
        let myMoves = that.mypgn.getMoves();
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
        const generateHeaders = function () {
            let tags = that.mypgn.getTags();
            let whd = document.getElementById(whiteHeaderId);
            let bhd = document.getElementById(blackHeaderId);
            if (that.configuration.headers == false || (utils.pvIsEmpty(tags))) {
                whd.parentNode.removeChild(whd);
                bhd.parentNode.removeChild(bhd);
                return;
            }
            if (tags.White) {
                whd.appendChild(document.createTextNode(tags.White + " "));
            }
            //div_h.appendChild(document.createTextNode(" - "));
            if (tags.Black) {
                bhd.appendChild(document.createTextNode(" " + tags.Black));
            }
            // let rest = "";
            // const appendHeader = function (result, header, separator) {
            //     if (header) {
            //         if (result.length > 0) {
            //             result += separator;
            //         }
            //         result += header;
            //     }
            //     return result;
            // };
            // [tags.Event, tags.Site, tags.Round, tags.Date,
            //     tags.ECO, tags.Result].forEach(function (header) {
            //     rest = appendHeader(rest, header, " | ");
            // });
            // const restSpan = createEle("span", null, "restHeader", theme, div_h);
            // restSpan.appendChild(document.createTextNode(rest));

        };

        // Bind the necessary functions to move the pieces.
        const bindFunctions = function () {
            const bind_key = function (key, to_call) {
                let key_ID;
                if (hasMarkup()) {
                    key_ID = "#" + boardId.moves;
                } else {
                    key_ID = "#" + boardId + ",#" + boardId + "Moves";
                }
                const form = document.querySelector(key_ID);
                Mousetrap(form).bind(key, function (evt) {
                    to_call();
                    evt.stopPropagation();
                });
            };
            const nextMove = function () {
                let fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove === null)) {
                    fen = that.mypgn.getMove(0).fen;
                    makeMove(null, 0, fen);
                } else {
                    const next = that.mypgn.getMove(that.currentMove).next;
                    if (typeof next == 'undefined') return;
                    fen = that.mypgn.getMove(next).fen;
                    makeMove(that.currentMove, next, fen);
                }
            };
            const prevMove = function () {
                let fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove == null)) {
                    /*fen = that.mypgn.getMove(0).fen;
                     makeMove(null, 0, fen);*/
                }
                else {
                    const prev = that.mypgn.getMove(that.currentMove).prev;
                    if ((typeof prev === 'undefined') || (prev == null)) {
                        firstMove();
                    } else {
                        fen = that.mypgn.getMove(prev).fen;
                        makeMove(that.currentMove, prev, fen);
                    }
                }
            };
            const firstMove = function () {
                makeMove(null, null, null);
            };
            const timer = new Timer(10);
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
                firstMove();
            });
            addEventListener(buttonsId + 'last', 'click', function () {
                const fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            let togglePgn = function () {
                const pgnButton = document.getElementById(buttonsId + "pgn");
                const pgnText = document.getElementById(boardId + " .outerpgn");
                document.getElementById(buttonsId + "pgn").classList.toggle('selected');
                if (document.getElementById(buttonsId + "pgn").classList.contains('selected')) {
                    const str = computePgn();
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
                    const prev = that.mypgn.getMove(that.currentMove).prev;
                    const fen = that.mypgn.getMove(prev).fen;
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
                const rad = ["moveComment", "beforeComment", "afterComment"];
                const prevComment = null;
                for (let i = 0; i < rad.length; i++) {
                    document.querySelector('#' + 'comment' + buttonsId + " ." + rad[i]).onclick = function () {
                        const checked = this.value;
                        let text;
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
                const playButton = document.getElementById(buttonsId + 'play');
                let clString = playButton.getAttribute('class');
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

        const computePgn = function () {
            return that.mypgn.write_pgn();
        };

        const showPgn = function (val) {
            document.getElementById('pgn' + buttonsId).textContent = val;
        };

        /**
         * Regenerate the moves div, may be used the first time (DIV is empty)
         * or later (moves have changed).
         */
        const regenerateMoves = function (myMoves) {
            const movesDiv = document.getElementById(movesId);
            let prev = null;
            const varStack = [];
            let firstMove = 0;
            for (let i = firstMove; i < myMoves.length; i++) {
                if (!that.mypgn.isDeleted(i)) {
                    const move = myMoves[i];
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
            if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
                let move = that.mypgn.findMove(that.configuration.startPlay)
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
    return ret;
};

export default pgnBase;
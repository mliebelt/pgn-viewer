import i18next from './i18n'
import {pgnReader} from '@mliebelt/pgn-reader'
// import {pgnReader} from '../../pgn-reader/src/pgn'
import {Chessground} from 'chessground'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import Timer from './Timer'
import Mousetrap from 'mousetrap'
import swal from 'sweetalert'

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */
let pgnBase = function (boardId, configuration) {
    // Section defines the variables needed everywhere.
    let that = {}
    that.userConfiguration = configuration
    // Sets the default parameters for all modes. See individual functions for individual overwrites
    let defaults = {
        lazyLoad: true,
        theme: "blue",
        pieceStyle: 'merida',
        //width: '320px',
        //boardSize: '320px',
        manyGames: false,
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
        notation: 'short',
        notationLayout: 'inline',   // Possible: inline, list, allList
        IDs: {
            bottomHeaderId: boardId + 'BottomHeader',
            topHeaderId: boardId + 'TopHeader',
            innerBoardId: boardId + 'Inner',
            movesId: boardId + 'Moves',
            buttonsId: boardId + 'Button',
            fenId: boardId + "Fen",
            colorMarkerId: boardId + 'ColorMarker'
        }
    }
    that.promMappings = {q: 'queen', r: 'rook', b: 'bishop', n: 'knight'}
    that.configuration = Object.assign(Object.assign(defaults, PgnBaseDefaults), configuration)
    that.mypgn = pgnReader(that.configuration)
    let chess = that.mypgn.chess     // Use the same instance from chess.src
    let theme = that.configuration.theme || 'default'
    function hasMode (mode) {
        return that.configuration.mode === mode
    }
    function possibleMoves () {
        return new Map(Object.entries(that.mypgn.possibleMoves(chess)))
    }
    function id (id) {
        return that.configuration.IDs[id]
    }
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1)
    }
    that.board = null              // Will be set later, but has to be a known variable

    // Initialize locale
    let locale = that.configuration.locale || "en"
    that.configuration.i18n = i18next(locale)
    that.configuration.defaultI18n = i18next("en")

    function t(term) {
        if (that.configuration.i18n) {
            let ret = that.configuration.i18n(term)
            if (ret === term) {
                ret = that.configuration.defaultI18n(term)
            }
        return ret
        }
        return term.substring(term.indexOf(':') + 1)
    }

    if (that.configuration.position) { // Allow early correction
        if (that.configuration.position !== 'start') {
            let tokens = that.configuration.position.split(/\s+/)
            if (tokens.length === 4) {
                that.configuration.position += ' 1 1'
            }
        }
    }

    /**
     * Allow logging of error to HTML.
     */
    function logError(str) {
        let node = document.createElement("DIV")
        const textnode = document.createTextNode(str)
        node.appendChild(textnode)
        that.errorDiv.appendChild(node)
    }

    /**
     * Adds a class to an element.
     */
    function addClass(elementOrId, className) {
        let ele = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId)
        if (!ele) return
        if (ele.classList) {
            ele.classList.add(className)
        } else {
            ele.className += ' ' + className
        }
    }

    /**
     * Remove a class from an element.
     */
    function removeClass(elementOrId, className) {
        let ele = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId)
        if (ele === null) return
        if (ele.classList) {
            ele.classList.remove(className)
        } else {
            ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
        }
    }

    /**
     * Inserts an element after targetElement
     * @param {*} newElement the element to insert
     * @param {*} targetElement the element after to insert
     */
    function insertAfter(newElement, targetElement) {
        const parent = targetElement.parentNode
        if (parent.lastChild === targetElement) {
            parent.appendChild(newElement)
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling)
        }
    }

    /**
     * Adds an event listener to the DOM element.
     */
    function addEventListener(elementOrId, event, func) {
        let ele = isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId)
        if (ele === null) return
        ele.addEventListener(event, func)
    }

    function toggleColorMarker() {
        let ele = document.getElementById(id('colorMarkerId'))
        if (!ele) return
        if (ele.classList.contains('cm-black')) {
            ele.classList.remove('cm-black')
        } else {
            ele.classList.add('cm-black')
        }
    }

    /**
     * Scroll if element is not visible
     * @param element the element to show by scrolling
     */
    function scrollToView(element) {
        function scrollParentToChild(parent, child) {
            let parentRect = parent.getBoundingClientRect()
            // What can you see?
            let parentViewableArea = {
                height: parent.clientHeight,
                width: parent.clientWidth
            }

            // Where is the child
            let childRect = child.getBoundingClientRect()
            // Is the child viewable?
            let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height)

            // if you can't see the child try to scroll parent
            if (!isViewable) {
                // scroll by offset relative to parent
                parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top
            }
        }

        const node = element
        const movesNode = node.parentElement
        scrollParentToChild(movesNode, node)
    }

    /**
     * Allows for move to be made programmatically from external javascript
     * @param san the san formatted move to play
     */
    function manualMove(san) {
        const m = chess.move(san)
        if (m === null) return
        chess.undo()
        onSnapEnd(m.from, m.to)
        that.board.set({fen: chess.fen()})
    }

    /**
     * Called when the piece is released. Here should be the logic for calling all
     * pgn enhancement.
     * @param from the source
     * @param to the destination
     * @param meta additional parameters (not used at the moment)
     */
    function onSnapEnd(from, to, meta) {
        //console.log("Move from: " + from + " To: " + to + " Meta: " + JSON.stringify(meta, null, 2))
        //board.set({fen: game.fen()})
        const cur = that.currentMove
        let primMove = {from: from, to: to}
        if ((that.mypgn.chess.get(from).type === 'p') && ((to.substring(1, 2) === '8') || (to.substring(1, 2) === '1'))) {
            swal("Select the promotion figure", {
                buttons: {
                    queen: {text: "Queen", value: 'q'},
                    rook: {text: "Rook", value: 'r'},
                    bishop: {text: "Bishop", value: 'b'},
                    knight: {text: 'Knight', value: 'n'}
                }
            }).then((value) => {primMove.promotion = value}).then( () => { onSnapEndFinish() })
        } else {
            onSnapEndFinish()
        }

        function onSnapEndFinish() {
            that.currentMove = that.mypgn.addMove(primMove, cur)
            const move = that.mypgn.getMove(that.currentMove)
            if (primMove.promotion) {
                let pieces = new Map()
                that.board.setPieces(pieces)
                pieces.set(to,{
                    color: (move.turn == 'w' ? 'white' : 'black'),
                    role: that.promMappings[primMove.promotion],
                    promoted: true
                })
                that.board.setPieces(pieces)
            }
            if (move.notation.ep) {
                let ep_field = to[0] + from[1]
                let pieces = new Map()
                pieces.set(ep_field, null)
                that.board.setPieces(pieces)
            }
            if (moveSpan(that.currentMove) === null) {
                generateMove(that.currentMove, null, move, move.prev, document.getElementById(id('movesId')), [])
            }
            unmarkMark(that.currentMove)
            updateUI(that.currentMove)
            let col = move.turn == 'w' ? 'black' : 'white'
            that.board.set({
                movable: Object.assign({}, that.board.state.movable,
                    {color: col, dests: possibleMoves(chess), showDests: true}),
                check: chess.in_check()
            })
            //makeMove(null, that.currentMove, move.fen)
            let fenView = document.getElementById(id('fenId'))
            if (fenView) {
                fenView.value = move.fen
            }
            toggleColorMarker()
        }
    }

    // Utility function for generating general HTML elements with id, class (with theme)
    function createEle(kind, id, clazz, my_theme, father) {
        const ele = document.createElement(kind)
        if (id) {
            ele.setAttribute("id", id)
        }
        if (clazz) {
            if (my_theme) {
                ele.setAttribute("class", my_theme + " " + clazz)
            } else {
                ele.setAttribute("class", clazz)
            }
        }
        if (father) {
            father.appendChild(ele)
        }
        return ele
    }

    // Internationionalize the figures in SAN
    function i18nSan(san) {
        function i18nFig(fig, locale) {
            return t("chess:" + fig)
        }
        let locale = that.configuration.locale
        if (! locale) return san
        let new_san = san
        if ( ! (san.match(/^[a-h]?x/) || san.match(/^[a-h]\d/) || san.match(/^O/) ) ) {
            let move_fig = i18nFig(san[0], locale)
            new_san = san.replace(san[0], move_fig)
        }
        let m = new_san.match(/=([QRNB])/)
        if (m) {
            new_san = new_san.replace(m[1], i18nFig(m[1], locale))
        }
        return new_san
    }

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    function generateHTML() {
        // Utility function for generating buttons divs
        function addButton(pair, buttonDiv) {
            const l_theme = (['green', 'blue'].indexOf(theme) >= 0) ? theme : 'default'
            const button = createEle("span", id('buttonsId') + pair[0],
                "pgnvbutton", l_theme, buttonDiv)
            const faButton = createEle("i", null,
                "fa " + pair[0] + " " + pair[1], l_theme, button)
            const title = t("buttons:" + pair[0])
            document.getElementById(id('buttonsId') + pair[0]).setAttribute("title", title)
            return button
        }

        // Generates the view buttons (only)
        function generateViewButtons(buttonDiv) {
            [["flipper", "fa-adjust"], ["first", "fa-fast-backward"], ["prev", "fa-step-backward"],
                ["next", "fa-step-forward"], ["play", "fa-play-circle"], ["last", "fa-fast-forward"]].forEach(function (entry) {
                addButton(entry, buttonDiv)
            })
        }
        // Generates the edit buttons (only)
        function generateEditButtons (buttonDiv) {
            [["promoteVar", "fa-hand-point-up"], ["deleteMoves", "fa-cut"]].forEach(function (entry) {
                addButton(entry, buttonDiv)
                //but.className = but.className + " gray" // just a test, worked.
                // only gray out if not usable, check that later.
            });
            [["pgn", "fa-print"], ['nags', 'fa-cog']].forEach(function (entry) {
                addButton(entry, buttonDiv)
            })
        }

        // Generate 3 rows, similar to lichess in studies
        function generateNagMenu(nagEle) {
            function generateRow(array, rowClass, nagEle) {
                function generateLink(link, nagDiv) {
                    let generateIcon = function (icon, myLink) {
                        let ele = createEle('i', null, null, theme, myLink)
                        let i = that.mypgn.NAGS[icon] || ''
                        ele.setAttribute("data-symbol", i)
                        ele.setAttribute("data-value", icon)
                        ele.textContent = t('nag:$' + icon + "_menu")
                    }
                    let myLink = createEle('a', null, null, theme, myDiv)
                    generateIcon(link, myLink)
                    myLink.addEventListener("click", function () {
                        function updateMoveSAN(moveIndex) {
                            let move = that.mypgn.getMove(moveIndex)
                            let san = i18nSan(that.mypgn.sanWithNags(move))
                            document.querySelector("#" + id('movesId') + moveIndex + " > a").textContent = san
                        }

                        this.classList.toggle("active")
                        let iNode = this.firstChild
                        that.mypgn.changeNag('$' + iNode.getAttribute('data-value'), that.currentMove,
                            this.classList.contains('active'))
                        updateMoveSAN(that.currentMove)
                    })
                }
                let myDiv = createEle('div', null, rowClass, theme, nagEle)
                array.forEach(ele => generateLink(ele, myDiv))
            }
            generateRow([1, 2, 3, 4, 5, 6, 7, 146], 'nagMove', nagEle)
            generateRow([10, 13, 14, 15, 16, 17, 18, 19], 'nagPosition', nagEle)
            generateRow([22, 40, 36, 132, 136, 32, 44, 140], 'nagObservation', nagEle)
        }
        function generateCommentDiv(commentDiv) {
            const radio = createEle("div", null, "commentRadio", theme, commentDiv)
            const mc = createEle("input", null, "moveComment", theme, radio)
            mc.type = "radio"
            mc.value = "move"
            mc.name = "radio"
            createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"))
            const ma = createEle("input", null, "afterComment", theme, radio)
            ma.type = "radio"
            ma.value = "after"
            ma.name = "radio"
            createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"))
            createEle("textarea", null, "comment", theme, commentDiv)
        }

        const divBoard = document.getElementById(boardId)
        if (divBoard == null) {
            return
        } else {
            // ensure that the board is empty before filling it
            while (divBoard.childNodes.length > 0) {
                divBoard.removeChild(divBoard.childNodes[0])
            }
        }
        divBoard.classList.add(theme)
        divBoard.classList.add('pgnvjs')   // Is used as class for everything included.
        divBoard.classList.add(that.configuration.mode + 'Mode')
        divBoard.setAttribute('tabindex', '0')
        // Add layout for class if configured
        if (that.configuration.layout) {
            divBoard.classList.add('layout-' + that.configuration.layout)
        }

        /** Add a drop-down list for all games if necessary. */
        let gamesDropDown = createEle("select", boardId + "Games", 'games', null, divBoard)
        if (! that.configuration.manyGames) {
            gamesDropDown.style.display = 'none'
        }

        /** Add an error div to show errors */
        that.errorDiv = createEle("div", boardId + "Error", 'error', null, divBoard)

        /** outerBoard */
        const outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard)
        let boardAndDiv = createEle('div', null, 'boardAnd', theme, outerInnerBoardDiv)

        let topInnerBoardDiv = createEle("div", null, "topInnerBoard", theme, boardAndDiv)
        let blackHeader = createEle('div', id('topHeaderId'), "blackHeader", theme, boardAndDiv)
        let topTime = createEle("span", null, "topTime", theme, topInnerBoardDiv)
        const innerBoardDiv = createEle("div", id('innerBoardId'), "board", theme, boardAndDiv)
        let bottomInnerBoardDiv = createEle("div", null, "bottomInnerBoard", theme, boardAndDiv)
        let whiteHeader = createEle('div', id('bottomHeaderId'), "whiteHeader", theme, boardAndDiv)
        let bottomTime = createEle("div", null, "bottomTime", theme, bottomInnerBoardDiv)

        /** Buttons */
        if (hasMode('view') || hasMode('edit')) {
            const buttonsBoardDiv = createEle("div", id('buttonsId'), "buttons", theme, divBoard)
            generateViewButtons(buttonsBoardDiv)
            if ( that.configuration.colorMarker ) {
                createEle("div", id('colorMarkerId'), 'colorMarker' + " " + that.configuration.colorMarker,
                    theme, buttonsBoardDiv)
            }
        }
        if (hasMode('board')) {
            if ( that.configuration.colorMarker ) {
                createEle("div", id('colorMarkerId'), 'colorMarker' + " " + that.configuration.colorMarker,
                    theme, topInnerBoardDiv)
            }
        }
        updateUI(null)

        /** Fen */
        if ((hasMode('edit') || hasMode('view')) && (that.configuration.showFen)) {
            const fenDiv = createEle("textarea", id('fenId'), "fen", theme, outerInnerBoardDiv)
            addEventListener(id('fenId'), 'mousedown', function (e) {
                e = e || window.event
                e.preventDefault()
                this.select()
            })
            if (hasMode('edit')) {
                document.getElementById(id('fenId')).onpaste = function (e) {
                    const pastedData = e.originalEvent.clipboardData.getData('text')
                    // console.log(pastedData)
                    that.configuration.position = pastedData
                    that.configuration.pgn = ''
                    pgnEdit(boardId, that.configuration)
                }
            } else {
                document.getElementById(id('fenId')).readonly = true
            }
        }

        /** Moves Div */
        if (hasMode('print') || hasMode('view') || hasMode('edit')) {
            createEle("div", id('movesId'), "moves " + that.configuration.notationLayout,
                null, divBoard)
            if (hasMode('print')) {
                return
            }
        }

        /** Edit Divs TODO Redo those */
        if (hasMode('edit')) {
            const editButtonsDiv = createEle("div", "edit" + id('buttonsId'), "edit", theme, divBoard)
            generateEditButtons(editButtonsDiv)
            let nagMenu = createEle('div', 'nagMenu' + id('buttonsId'), 'nagMenu', theme, editButtonsDiv)
            generateNagMenu(nagMenu)
            const pgnDiv = createEle("textarea", "textpgn" + id('buttonsId'), "textpgn", theme, editButtonsDiv)
            const commentBoardDiv = createEle("div", "comment" + id('buttonsId'), "comment", theme, editButtonsDiv)
            generateCommentDiv(commentBoardDiv)
            // Bind the paste key ...
            addEventListener("pgn" + id('buttonsId'), 'mousedown', function (e) {
                e = e || window.event
                e.preventDefault()
                e.target.select()
            })
            document.getElementById("textpgn" + id('buttonsId')).onpaste = function (e) {
                const pastedData = e.originalEvent.clipboardData.getData('text')
                that.configuration.pgn = pastedData
                pgnEdit(boardId, that.configuration)
            }
        }

    }

    /**
     * Generate the board that uses the unique id('innerBoardId') and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
     */
    function generateBoard () {
        function copyBoardConfiguration(source, target, keys) {
            keys.forEach(function (key) {
                if (typeof source[key] != "undefined") {
                    target[key] = source[key]
                }
            })
        }

        function postGenerateBoard() {
            if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
                let move = that.mypgn.findMove(that.configuration.startPlay)
                if (move === undefined) {
                    logError('Could not find startPlay: ' + that.configuration.startPlay)
                    return
                }
                makeMove(move.prev, move.index, move.fen)
                unmarkMark(move.index)
            }
        }

        // Default values of the board, if not overwritten by the given configuration
        let boardConfig = {coordsInner: true, coordsFactor: 1.0, disableContextMenu: true,
            drawable: {
                onChange: (shapes) => {
                    let move = that.mypgn.getMove(that.currentMove)
                    that.mypgn.setShapes(move, shapes)
                }
            }}

        copyBoardConfiguration(that.configuration, boardConfig,
            ['position', 'orientation', 'showCoords', 'pieceTheme', 'draggable',
                'coordsInner', 'coordsFactor', 'width', 'movable', 'viewOnly', 'highlight', 'boardSize',
                'coordsFontSize'])
        boardConfig.resizable = true
        if (typeof boardConfig.showCoords != 'undefined') {
            boardConfig.coordinates = boardConfig.showCoords
        }
        boardConfig.fen = boardConfig.position
        const el = document.getElementById(id('innerBoardId'))
        if (typeof that.configuration.pieceStyle != 'undefined') {
            el.className += " " + that.configuration.pieceStyle
        }
        if (boardConfig.boardSize) {
            boardConfig.width = boardConfig.boardSize
        }
        let currentWidth = parseInt(boardConfig.width)
        let moduloWidth = currentWidth % 8
        let smallerWidth = currentWidth - moduloWidth
        // Ensure that boardWidth is a multiply of 8
        boardConfig.width = "" + smallerWidth +"px"
        that.board = Chessground(el, boardConfig)
        //console.log("Board width: " + board.width)
        if (boardConfig.width) {
            el.style.width = boardConfig.width
            el.style.height = boardConfig.width
            let fontSize = null
            if (boardConfig.coordsFontSize) {
                fontSize = boardConfig.coordsFontSize
            } else {
                // Set the font size related to the board (factor 28), ensure at least 8px font
                fontSize = Math.max(8, Math.round(parseInt(boardConfig.width.slice(0, -2)) / 28 * boardConfig.coordsFactor))
            }
            // Adjust the ranks right if necessary
            //el.style.fontSize = `${fontSize}px`
            el.querySelectorAll("coords").forEach(element => {
                element.style.fontSize = `${fontSize}px`
                })
            if (boardConfig.coordinates) {
                let right = (fontSize - 13) / 2.5 - 2
                if (! boardConfig.coordsInner) { right -= fontSize / 1.5 + 2 }
                el.querySelector("coords.ranks").style.right = `${right}px`
                let bottom = (fontSize - 13)
                if (! boardConfig.coordsInner) {
                    bottom -= fontSize + 2
                    let left = parseFloat(getComputedStyle(el.querySelector(".cg-wrap coords.files")).getPropertyValue("left"))
                    el.querySelector("coords.files").style.left = `${left - (fontSize / 1.5)}px`
                }
                el.querySelector("coords.files").style.bottom = `${bottom}px`
            }
            //document.body.dispatchEvent(new Event('chessground.resize'))
        }
        if (boardConfig.coordsInner) {
            el.classList.add('coords-inner')
        }
        if (hasMode('edit')) {
            setGameToPosition(configuration.position)
            let toMove = (chess.turn() == 'w') ? 'white' : 'black'
            that.board.set({
                movable: Object.assign({}, that.board.state.movable,
                    {color: toMove, dests: possibleMoves(chess), showDests: true}),
                turnColor: toMove, check: chess.in_check()
            })
        }
        if (that.configuration.colorMarker) {
            if ( (that.configuration.position != 'start') &&
                (that.configuration.position.split(' ')[1] === 'b') ) {
                let ele = document.getElementById(id('colorMarkerId'))
                if (ele) {
                    ele.classList.add('cm-black')
                }
            }
        }
        postGenerateBoard()
        return that.board
    }

    function moveSpan (i) {
        return document.getElementById(id('movesId') + i)
    }

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
    function generateMove (currentCounter, game, move, prevCounter, movesDiv, varStack) {
        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @param clazz class parameter appended to differentiate different comments
         * @returns {HTMLElement} the new created span with the comment as text, or null, if text is null
         */
        function generateCommentSpan (comment, clazz) {
            if (comment && (typeof comment == "string")) {
                const span =  createEle('span', null, "comment " + clazz)
                span.appendChild(document.createTextNode(" " + comment + " "))
                return span
            }
            return null
        }

        function createFiller(span) {
            const filler = createEle('span', null, "move filler")
            filler.appendChild(document.createTextNode("... "))
            span.appendChild(filler)
        }

        function appendCommentSpan (span, comment, clazz, fillNeeded) {
            let cSpan = generateCommentSpan(comment, clazz)
            if (cSpan) {
                if (fillNeeded) {
                    createFiller(span)
                }
                span.appendChild(cSpan)
                return fillNeeded
            }
            return false
        }

        function appendVariation(div, move) {
            if (! movesDiv.lastChild.classList.contains("variations")) {
                movesDiv.appendChild(createEle('div', null, "variations", null, movesDiv))
            } 
            if (move.variationLevel > 1) {
                insertAfter(div, moveSpan(move.prev))
            } else {
                movesDiv.lastChild.appendChild(div)
            }
        }

        function localBoard(id, configuration) {
            let base = pgnBase(id, Object.assign({boardSize: '200px'}, configuration, {headers: false, mode: 'board'}))
            base.generateHTML()
            base.generateBoard()
        }
        function createMoveNumberSpan(currentMove, spanOrDiv, additionalClass) {
            const mn = currentMove.moveNumber
            const clazz = additionalClass ? "moveNumber " + additionalClass : "moveNumber"
            const num = createEle('span', null, clazz, null, spanOrDiv)
            num.appendChild(document.createTextNode("" + mn + ((currentMove.turn == 'w' || additionalClass) ? ". " : "... ")))
        }
        function lastEntryFillerOrVariation(div) {
            const childs = div.children
            if (childs.length < 2) return false
            return childs[childs.length - 2].classList.contains("filler") || childs[childs.length - 1].classList.contains("variations")
        }

        function isVariant() { return varStack.length > 0 }
        function isMain() { return ! isVariant() }
        function currentFather() {
            return isMain() ? movesDiv : varStack[varStack.length - 1]
        }

        // Ignore null moves
        if (move === null || (move === undefined)) {
            return prevCounter
        }
        let clAttr = "move"
        if (move.variationLevel > 0) {
            clAttr = clAttr + " var var" + move.variationLevel
        }
        if (move.turn == 'w') {
            clAttr = clAttr + " white"
        }
        const span = createEle("span", id('movesId') + currentCounter, clAttr)
        if (that.mypgn.startVariation(move)) {
            /* if ( (move.turn == 'w') ) {
                createFiller(movesDiv)
            } */
            const varDiv = createEle("div", null, "variation")
            appendVariation(varDiv, move)
            varStack.push(varDiv)
        }
        appendCommentSpan(currentFather(), move.commentMove, "moveComment")


        if ((move.turn == 'w') || (that.mypgn.startMainLine(move)) ) {
            createMoveNumberSpan(move, currentFather())
        } else if ( (that.mypgn.startVariation(move)) ) {
            createMoveNumberSpan(move, varStack[varStack.length - 1])
        } else if ( (move.turn == 'b') && (varStack.length == 0) && lastEntryFillerOrVariation(movesDiv)) {
            createMoveNumberSpan(move, movesDiv, "filler")
            createFiller(movesDiv)
        }
        const link = createEle('a', null, null, null, span)
        const text = document.createTextNode(i18nSan(that.mypgn.sanWithNags(move)))
        link.appendChild(text)
        if (that.configuration.timeAnnotation != 'none' && move.commentDiag && move.commentDiag.clk) {
            let cl_time = move.commentDiag.clk
            let cl_class = that.configuration.timeAnnotation.class || 'timeNormal'
            let clock_span = generateCommentSpan(cl_time, cl_class)
            if (that.configuration.timeAnnotation.colorClass) {
                clock_span.style = "color: " + that.configuration.timeAnnotation.colorClass
            }
            span.appendChild(clock_span)
        }
        currentFather().appendChild(span)

        appendCommentSpan(currentFather(), move.commentAfter, "afterComment", move.turn == 'w')

        if (that.mypgn.endVariation(move)) {
            //span.appendChild(document.createTextNode(" ) "))
            varStack.pop()
        }
        addEventListener(moveSpan(currentCounter), 'click', function (event) {
            makeMove(that.currentMove, currentCounter, move.fen)
            event.stopPropagation()
        })
        if (that.mypgn.hasDiagramNag(move)) {
            const diaID = boardId + "dia" + currentCounter
            const diaDiv = createEle('div', diaID)
            span.appendChild(diaDiv)
            that.userConfiguration.position = move.fen
            localBoard(diaID, that.userConfiguration)
        }
        //console.log(`FEN size: ${move.fen.length}`)
        return currentCounter
    }

    /**
     * Unmark all marked moves, mark the next one.
     * @param next the next move number
     */
    function unmarkMark(next) {
        function moveASpan (i) {
            return document.querySelector('#' + id('movesId') + i + '> a')
        }

        removeClass(document.querySelector('#' + id('movesId') + " a.yellow"), 'yellow')
        addClass(moveASpan(next), 'yellow')
    }

    /**
     * Check which buttons should be grayed out
     */
    function updateUI(next) {
        const divBoard = document.getElementById(boardId)
        function pgnEmpty () {
            let pgn = that.mypgn.writePgn()
            return (typeof pgn === 'undefined') || (pgn === null) || (pgn.length === 0)
        }
        let elements = divBoard.querySelectorAll(".pgnvbutton > .gray")
        elements.forEach(function (ele) {
            removeClass(ele, 'gray')
        })
        const move = that.mypgn.getMove(next)
        if (next === null) {
            ["prev", "first"].forEach(function (name) {
                addClass(divBoard.querySelector("div.buttons ." + name), 'gray')
            })
        }
        if (((next !== null) && (typeof move.next != "number")) || (pgnEmpty())) {
            ["next", "play", "last"].forEach(function (name) {
                addClass(divBoard.querySelector("div.buttons ." + name), 'gray')
            })
        }
        // Update the drop-down for NAGs
        try {
            if (move === undefined) {
                return
            }
            let nagMenu = document.querySelector('#nagMenu' + id('buttonsId'))
            divBoard.querySelectorAll('#nagMenu' + id('buttonsId') + ' a.active').forEach(function (act) {
                act.classList.toggle('active')
            })
            let nags = move.nag || []
            nags.forEach(function (eachNag) {
                divBoard.querySelector('#nagMenu' + id('buttonsId') + ' [data-value="' + eachNag.substring(1) + '"]')
                    .parentNode.classList.toggle('active')
            })
        } catch (err) {

        }

    }

    /**
     * Plays the move that is already in the notation on the board.
     * @param curr the current move number
     * @param next the move to take now
     * @param fen the fen of the move to make
     */
    function makeMove (curr, next, fen) {
        /**
         * Fills the comment field depending on which and if a comment is filled for that move.
         */
        function fillComment(moveNumber) {
            let myMove = that.mypgn.getMove(moveNumber)
            if (!~myMove) return
            if (myMove.commentAfter) {
                document.querySelector('#' + boardId + " input.afterComment").checked = true
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentAfter
            } else if (myMove.commentMove) {
                document.querySelector('#' + boardId + " input.moveComment").checked = true
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentMove
            } else {
                document.querySelector('#' + boardId + " textarea.comment").value = ""
            }
        }

        function handlePromotion(aMove) {
            if (!aMove) return
            if (aMove.notation.promotion) {
                let promPiece = aMove.notation.promotion.substring(1, 2).toLowerCase()
                let pieces = new Map()
                pieces[aMove.to] =
                    {
                        role: that.mypgn.PROMOTIONS[promPiece],
                        color: (aMove.turn == 'w' ? 'white' : 'black')
                    }
                that.board.setPieces(pieces)
            }
        }

        function getShapes(commentDiag) {
            function colOfDiag(color) {
                const colors = {Y: 'yellow', R: 'red', B: 'blue', G: 'green'}
                return colors[color]
            }

            let arr = []
            if ((commentDiag !== undefined) && (commentDiag !== null)) {
                if (commentDiag.colorArrows) {
                    for (let i = 0; i < commentDiag.colorArrows.length; i++) {
                        let comm = commentDiag.colorArrows[i]
                        arr.push({
                            orig: comm.substring(1, 3),
                            dest: comm.substring(3, 5),
                            brush: colOfDiag(comm.substring(0, 1))
                        })
                    }
                }
                if (commentDiag.colorFields) {
                    for (let i = 0; i < commentDiag.colorFields.length; i++) {
                        let comm = commentDiag.colorFields[i]
                        arr.push({orig: comm.substring(1, 3), brush: colOfDiag(comm.substring(0, 1))})
                    }
                }
            }
            return arr
        }

        //console.log("Marke move: Curr " + curr + " Next " + next + " FEN " + fen)
        //board.set({fen: fen})
        let myMove = that.mypgn.getMove(next)
        let myFen = myMove ? myMove.fen : fen
        if (!myFen) { // fen not given, take start position
            myFen = that.configuration.position == 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : that.configuration.position
        }
        if (myMove) {
            that.board.set({fen: myFen, lastMove: [myMove.from, myMove.to]})
        } else {
            that.board.set({fen: myFen, lastMove: []})
        }
        handlePromotion(myMove)
        if (myMove) {
            that.board.setShapes(getShapes(myMove.commentDiag))
        }
        chess.load(myFen)
        unmarkMark(next)
        that.currentMove = next
        if (next) {
            scrollToView(moveSpan(next))
        }
        if (hasMode('edit')) {
            let col = chess.turn() == 'w' ? 'white' : 'black'
            that.board.set({
                movable: Object.assign({}, that.board.state.movable, {color: col, dests: possibleMoves(chess), showDests: true}),
                turnColor: col, check: chess.in_check()
            })
            if (next) {
                fillComment(next)
            }
        } else if (hasMode('view')) {
            let col = chess.turn() == 'w' ? 'white' : 'black'
            that.board.set({
                movable: Object.assign({}, that.board.state.movable, {color: col}),
                turnColor: col, check: chess.in_check()
            })
        }
        let fenView = document.getElementById(id('fenId'))
        if (fenView) {
            fenView.value = fen
        }
        toggleColorMarker()
        updateUI(next)
    }

    function setGameToPosition(pos) {
        if (pos == 'start' | typeof pos === 'undefined') {
            chess.reset()
        } else {
            chess.load(pos)
        }
    }

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    function generateMoves () {

        /** Create something printable from the tags for the list. */
        function printTags(game) {
            if (game.tags.size === 0) {
                return "Should print somehow the moves of the game" //TODO: What is the idea here? No clue ...
            }
            let _t = game.tags
            let _date = _t.Date ? _t.Date.value : "?"
            return `[${_t.Event}] ${_t.Round}: ${_t.White} - ${_t.Black} (${_date})`
        }
        /** Fill the drop down with loaded game. */
        function fillGamesDropDown() {
            let _games = that.mypgn.getGames()
            let _select = document.getElementById(boardId + 'Games')
            for (let i=0; i < _games.length; i++) {
                let _el = document.createElement('option')
                let _game = _games[i]
                _el.text = printTags(_game)
                _el.value = i
                _select.add(_el)
            }
            _select.addEventListener('change', function (ev) {
                that.mypgn.loadOne(parseInt(ev.currentTarget.value))
                regenerateMoves(that.mypgn.getMoves())
                // bindFunctions()
                generateHeaders()
                makeMove(null, null, null)
            })
        }
        try {
            that.mypgn.loadPgn()
            fillGamesDropDown()
        } catch (err) {
            if (typeof err.location != "undefined") {
                const sta = err.location.start.offset
                let pgnStr = that.configuration.pgn
                logError("Offset: " + sta)
                logError("PGN: " + pgnStr)
                logError(err.message)
            } else {
                let pgnStr = that.configuration.pgn
                logError("PGN: " + pgnStr)
                logError(err)
            }
        }
        let myMoves = that.mypgn.getMoves()
        // Due to possible change in that.mypgn.configuration ...
        that.configuration.position = that.mypgn.configuration.position
        setGameToPosition(that.configuration.position)
        if (that.board) {
            that.board.set({fen: chess.fen()})
        }
        let fenField = document.getElementById(id('fenId'))
        if (isElement(fenField)) {
            fenField.value = chess.fen()
        }

        /**
         * Generate a useful notation for the headers, allow for styling. First a version
         * that just works.
         */
        function generateHeaders () {
            let tags = that.mypgn.getTags()
            let whd = that.configuration.orientation === 'white' ? document.getElementById(id('bottomHeaderId')) :
                document.getElementById(id('topHeaderId'))
            let bhd = that.configuration.orientation === 'white' ? document.getElementById(id('topHeaderId')) :
                document.getElementById(id('bottomHeaderId'))
            if (that.configuration.headers == false || (tags.size === 0)) {
                whd.parentNode.removeChild(whd)
                bhd.parentNode.removeChild(bhd)
                return
            }
            if (tags.get("White")) {
                whd.innerHTML = ''
                whd.appendChild(document.createTextNode(tags.get("White") + " "))
            }
            //div_h.appendChild(document.createTextNode(" - "))
            if (tags.get("Black")) {
                bhd.innerHTML = ''
                bhd.appendChild(document.createTextNode(" " + tags.get("Black")))
            }
            // let rest = ""
            // function appendHeader (result, header, separator) {
            //     if (header) {
            //         if (result.length > 0) {
            //             result += separator
            //         }
            //         result += header
            //     }
            //     return result
            // }
            // [tags.Event, tags.Site, tags.Round, tags.Date,
            //     tags.ECO, tags.Result].forEach(function (header) {
            //     rest = appendHeader(rest, header, " | ")
            // })
            // const restSpan = createEle("span", null, "restHeader", theme, div_h)
            // restSpan.appendChild(document.createTextNode(rest))

        }

        // Bind the necessary functions to move the pieces.
        function bindFunctions () {
            function switchHeaderValues () {
                if (! document.getElementById(id('bottomHeaderId'))) return
                let bottomInner = document.getElementById(id('bottomHeaderId')).innerText
                let topInner = document.getElementById(id('topHeaderId')).innerText
                document.getElementById(id('bottomHeaderId')).innerText = topInner
                document.getElementById(id('topHeaderId')).innerText = bottomInner
            }
            function bind_key (key, to_call) {
                const form = document.querySelector("#" + boardId + ",#" + boardId + "Moves")
                Mousetrap(form).bind(key, function (evt) {
                    to_call()
                    evt.stopPropagation()
                })
            }
            function nextMove () {
                let fen = null
                if ((typeof that.currentMove == 'undefined') || (that.currentMove === null)) {
                    if (that.mypgn.getMoves().length === 0) return false   // no next move
                    fen = that.mypgn.getMove(0).fen
                    makeMove(null, 0, fen)
                } else {
                    const next = that.mypgn.getMove(that.currentMove).next
                    if (typeof next == 'undefined') return false
                    fen = that.mypgn.getMove(next).fen
                    makeMove(that.currentMove, next, fen)
                }
                return true
            }
            function prevMove () {
                let fen = null
                if ((typeof that.currentMove == 'undefined') || (that.currentMove == null)) {
                    /*fen = that.mypgn.getMove(0).fen
                     makeMove(null, 0, fen)*/
                }
                else {
                    const prev = that.mypgn.getMove(that.currentMove).prev
                    if ((typeof prev === 'undefined') || (prev == null)) {
                        firstMove()
                    } else {
                        fen = that.mypgn.getMove(prev).fen
                        makeMove(that.currentMove, prev, fen)
                    }
                }
            }
            function firstMove () {
                makeMove(null, null, null)
            }
            const timer = new Timer(10)
            timer.bind(that.configuration.timerTime, function () {
                nextMove()
            })
            addEventListener(id('buttonsId') + 'flipper', 'click', function () {
                that.board.toggleOrientation()
                switchHeaderValues()
            })
            addEventListener(id('buttonsId') + 'next', 'click', function () {
                nextMove()
            })
            addEventListener(id('buttonsId') + 'prev', 'click', function () {
                prevMove()
            })
            addEventListener(id('buttonsId') + 'first', 'click', function () {
                firstMove()
            })
            addEventListener(id('buttonsId') + 'last', 'click', function () {
                let moved = false
                do { moved = nextMove() } while (moved)
            })
            function togglePgn () {
                const pgnButton = document.getElementById(id('buttonsId') + "pgn")
                const pgnText = document.getElementById(boardId + " .textpgn")
                document.getElementById(id('buttonsId') + "pgn").classList.toggle('selected')
                if (document.getElementById(id('buttonsId') + "pgn").classList.contains('selected')) {
                    const str = computePgn()
                    showPgn(str)
                    document.querySelector("#" + boardId + " .textpgn").style.display = 'block' //slideDown(700, "linear")
                } else {
                    document.querySelector("#" + boardId + " .textpgn").style.display = 'none'
                }
            }
            function toggleNagMenu () {
                let nagMenu = document.getElementById(id('buttonsId') + 'nags').classList.toggle('selected')
                if (document.getElementById(id('buttonsId') + 'nags').classList.contains('selected')) {
                    document.getElementById('nagMenu' + id('buttonsId')).style.display = 'flex'
                } else {
                    document.getElementById('nagMenu' + id('buttonsId')).style.display = 'none'
                }
            }
            if (hasMode('edit')) { // only relevant functions for edit mode
                addEventListener(id('buttonsId') + "pgn", 'click', function () {
                    togglePgn()
                })
                addEventListener(id('buttonsId') + 'nags', 'click', function () {
                    toggleNagMenu()
                })
                addEventListener(id('buttonsId') + "deleteMoves", 'click', function () {
                    const prev = that.mypgn.getMove(that.currentMove).prev
                    const fen = that.mypgn.getMove(prev).fen
                    that.mypgn.deleteMove(that.currentMove)
                    //document.getElementById(id('movesId')).innerHtml = ""
                    let myNode = document.getElementById(id('movesId'))
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild)
                    }
                    regenerateMoves(that.mypgn.getMoves())
                    makeMove(null, prev, fen)
                })
                addEventListener(id('buttonsId') + "promoteVar", 'click', function () {
                    let curr = that.currentMove
                    that.mypgn.promoteMove(that.currentMove)
                    //document.getElementById(id('movesId')).html("")
                    let myNode = document.getElementById(id('movesId'))
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild)
                    }
                    regenerateMoves(that.mypgn.getOrderedMoves())
                    let fen = that.mypgn.getMove(curr).fen
                    makeMove(null, that.currentMove, fen)
                })
                document.querySelector('#' + boardId + ' .textpgn').style.display = 'none'
                document.querySelector('#comment' + id('buttonsId') + " textarea.comment").onchange = function () {
                    function commentText() {
                        return " " + document.querySelector('#' + 'comment' + id('buttonsId') + " textarea.comment").value + " "
                    }

                    let text = commentText()
                    let checked = document.querySelector('#' + "comment" + id('buttonsId') + " :checked")
                    checked = checked ? checked.value : "after"
                    let currentEle = moveSpan(that.currentMove)
                    let nextEle = currentEle.nextElementSibling
                    if (! nextEle) {
                        const span =  createEle('span', null, "comment " + checked)
                        span.appendChild(document.createTextNode(" " + text + " "))
                        currentEle.parentNode.appendChild(span)
                    } else if (nextEle.classList.length > 0 && nextEle.classList[0] == "comment") {
                        nextEle.textContent = text
                    } else {
                        const span =  createEle('span', null, "comment " + checked)
                        span.appendChild(document.createTextNode(" " + text + " "))
                        nextEle.parentNode.insertBefore(span, nextEle)
                    }
                    if (checked === "after") {
                        that.mypgn.getMove(that.currentMove).commentAfter = text
                    } else if (checked === "move") {
                        that.mypgn.getMove(that.currentMove).commentMove = text
                    }
                }
                const rad = ["moveComment", "afterComment"]
                const prevComment = null
                for (let i = 0; i < rad.length; i++) {
                    document.querySelector('#' + 'comment' + id('buttonsId') + " ." + rad[i]).onclick = function () {
                        const checked = this.value
                        let text
                        if (checked === "after") {
                            text = that.mypgn.getMove(that.currentMove).commentAfter
                        } else if (checked === "move") {
                            text = that.mypgn.getMove(that.currentMove).commentMove
                        }
                        document.querySelector('#' + boardId + " textarea.comment").value = text
                    }
                }
            }

            function togglePlay() {
                if (timer.running()) {
                    timer.stop()
                } else {
                    timer.start()
                }
                const playButton = document.getElementById(id('buttonsId') + 'play')
                let clString = playButton.childNodes[0].getAttribute('class')
                if (clString.indexOf('play') < 0) { // has the stop button
                    clString = clString.replaceAll('pause', 'play')
                } else {
                    clString = clString.replaceAll('play', 'pause')
                }
                playButton.childNodes[0].setAttribute('class', clString)
            }

            bind_key("left", prevMove)
            bind_key("right", nextMove)
            //bind_key("space", togglePlay)
            addEventListener(id('buttonsId') + 'play', 'click', function () {
                togglePlay()
            })

        }

        function computePgn () {
            return that.mypgn.writePgn()
        }

        function showPgn (val) {
            document.getElementById('textpgn' + id('buttonsId')).textContent = val
        }

        /**
         * Regenerate the moves div, may be used the first time (DIV is empty)
         * or later (moves have changed).
         */
        function regenerateMoves (myMoves) {
            const movesDiv = document.getElementById(id('movesId'))
            movesDiv.innerHTML = ''
            let prev = null
            const varStack = []
            let firstMove = 0
            for (let i = firstMove; i < myMoves.length; i++) {
                if (!that.mypgn.isDeleted(i)) {
                    const move = myMoves[i]
                    prev = generateMove(move.index, chess, move, prev, movesDiv, varStack)
                }
            }
            if (that.configuration.showResult) {
                // find the result from the header
                let endGame = that.mypgn.getEndGame()
                // Insert it as new span
                let span = createEle("span", id('movesId') + "Result", "move result", theme,
                    document.getElementById(id('movesId')))
                span.innerHTML = endGame ? endGame : "*"

            }
        }
        regenerateMoves(myMoves)
        bindFunctions()
        generateHeaders()

        /**
         * Allows to add functions after having generated the moves. Used currently for setting start position.
         */
        function postGenerateMoves() {
            updateUI(null)
        }
        postGenerateMoves()
        resizeLayout()
    }
    function resizeLayout () {
        const divBoard = document.getElementById(boardId)
        function hasHeaders () {
            return that.configuration.headers && (that.mypgn.getTags().size > 0)
        }


        function computeBoardSize () {
            function setBoardSizeAndWidth (boardSize, width) {
                that.configuration.boardSize = boardSize
                that.configuration.width = width
                divBoard.style.width = width
            }
            let _boardSize = that.configuration.boardSize
            let _width =  that.configuration.width || divBoard.style.width

            function getRoundedBoardSize(_boardSize) {
                return `${Math.round(parseInt(_boardSize) / 8) * 8}px`
            }

            if (that.configuration.layout === 'top' || that.configuration.layout === 'bottom') {
                if (_boardSize) {
                    let rounded = getRoundedBoardSize(_boardSize)
                    setBoardSizeAndWidth(rounded, rounded)
                    return _boardSize
                } else {
                    _width = _width || '320px'
                    _width = getRoundedBoardSize(_width)
                    setBoardSizeAndWidth(_width, _width)
                    return _width
                }
            }
            // Layout left or right, more complex combinations possible
            if (!_boardSize && !_width) {
                _boardSize = '320px'
            }
            if (_boardSize && _width) {
                _boardSize = getRoundedBoardSize(_boardSize)
                setBoardSizeAndWidth(_boardSize, _width)
                return _boardSize
            } else if (! _boardSize) {
                _boardSize = getRoundedBoardSize(parseInt(_width) / 8 * 5)
                setBoardSizeAndWidth(_boardSize, _width)
                return _boardSize
            } else {
                _width = `${parseInt(_boardSize) / 5 * 8}px`
                setBoardSizeAndWidth(_boardSize, _width)
                return _boardSize
            }
        }

        console.log("Start computing layout")
        let _boardHeight = computeBoardSize()
        let _boardWidth = _boardHeight

        if (hasMode('board')) {
            if (document.getElementById(id('colorMarkerId'))) {
                document.getElementById(id('colorMarkerId')).style.marginLeft = 'auto'
            }
            return
        }
        if (hasMode('print')) return

        // View and edit mode
        let _buttonFontSize = Math.max(10, parseInt(_boardHeight) / 24)
        let _buttonsHeight = document.getElementById(id('buttonsId')).offsetHeight
        if (_buttonsHeight < 20) { _buttonsHeight += _buttonFontSize }
        if (document.getElementById(id('buttonsId'))) {
            document.getElementById(id('buttonsId')).style.fontSize = `${_buttonFontSize}px`
        }
        if (that.configuration.showFen) {
            let _fenHeight = document.getElementById(id('fenId')).offsetHeight
            _boardHeight = `${parseInt(_boardHeight) + _fenHeight}px`
        }
        if (hasHeaders()) {
            _boardHeight = `${parseInt(_boardHeight) + 40}px`
        }
        let _gamesHeight = that.configuration.manyGames ? '40px' : '0'
        if (that.configuration.layout === 'left' || that.configuration.layout === 'right') {
            divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(auto, ${_boardHeight}) ${_buttonsHeight}px`
            let _movesWidth = 0
            if (that.configuration.movesWidth) {
                _movesWidth = that.configuration.movesWidth
            } else {
                _movesWidth = `${parseInt(that.configuration.width) - parseInt(_boardWidth)}px`
            }
            if (that.configuration.layout === 'left') {
                divBoard.style.gridTemplateColumns = _boardWidth + " " + _movesWidth
            } else {
                divBoard.style.gridTemplateColumns = _movesWidth + " " + _boardWidth
            }
        } else {
            let _movesHeight = 0
            if (that.configuration.movesHeight) {
                _movesHeight = parseInt(that.configuration.movesHeight)
            } else {
                let _movesCount = that.mypgn.getMoves().length
                let _minMovesHeight = (_movesCount + 20) / 7 * 15
                _movesHeight = parseInt(_boardHeight) / 5 * 3
                if (_movesHeight < _minMovesHeight) {
                    _movesHeight = _minMovesHeight
                }
            }

            if (that.configuration.layout === 'top') {
                divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(auto, ${_boardHeight}) auto minmax(0, ${_movesHeight}px) auto`
            } else if (that.configuration.layout === 'bottom') {
                divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(0,${_movesHeight}px) minmax(auto,${_boardHeight}) auto`
            }
            divBoard.style.gridTemplateColumns = _boardWidth
        }
    }

    return {
        // PUBLIC API
        chess: chess,
        board: that.board,
        getPgn: function () {
            return that.mypgn
        },
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        manualMove: manualMove,
        onSnapEnd: onSnapEnd,
        resizeLayout: resizeLayout
    }
}

export default pgnBase
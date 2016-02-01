'use strict';

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */

var pgnBase = function (boardId, configuration) {
    // Section defines the variables needed everywhere.
    var VERSION = "0.9.1";
    var that = {};
    that.configuration = configuration;
    var theme = configuration.theme || 'default';
    var game = new Chess();
    var board;              // Will be set later, but has to be a known variable
    // IDs needed for styling and adressing the HTML elements
    var headersId = boardId + 'Headers';
    var innerBoardId = boardId + 'Inner';
    var movesId = boardId + 'Moves';
    var buttonsId = boardId + 'Button';

    // Anonymous function, has not to be visible from the outside
    // Does all the initialization stuff only needed once, here mostly internationalization.
    (function(){
        var i18n_option = {
            getAsync: false,
            resGetPath: localPath() + 'locales/__ns__-__lng__.json',
            ns: {
                namespaces: ['chess', 'nag', 'buttons'],
                defaultNs: 'chess'
            }
        };
        $.i18n.init(i18n_option, function (err, t) {});
        if (configuration.locale) {
            $.i18n.setLng(configuration.locale);
        }
        // Ensure that position is set.
        if (!configuration.position) {
            configuration.position = 'start';
        }
    })();

    // Some Utility functions without context

    /**
     * Returns the local path (needed for addressing piece image files).
     * @returns {XML|string|void}
     */
    function localPath() {
        var jsFileLocation = $('script[src*=pgnvjs]').attr('src');  // the js file path
        var index = jsFileLocation.indexOf('pgnvjs');
        console.log("Local path: " + jsFileLocation.substring(0, index - 3));
        return jsFileLocation.substring(0, index - 3);   // the father of the js folder
    }


    /**
     * Allow to hide HTML by calling this function. It will prepend
     * the boardId, and search for an ID in the DOM.
     * @param eleName the element name added to the boardId
     * @param prefix the prefix used for the unique Id
     */
    var hideHTML = function(eleName, prefix) {
        var ele = "#" + (prefix ? prefix : "") + boardId + eleName;
        $(ele)[0].style.display = "none";
    };

    /**
     * Scroll if element is not visible
     * @param element the element to show by scrolling
     * @returns {boolean}
     */
    function scrollToView(element){
        var eleRect = element[0].getBoundingClientRect();
        var eleParent = $("#" + element[0].id).parent();
        var scrollerRect = eleParent.parent()[0].getBoundingClientRect();
        var movesRect = eleParent[0].getBoundingClientRect();
        var offsetTop = eleRect.top - movesRect.top;
        var offsetBottom = eleRect.bottom - movesRect.top;
        var visible_area_start = eleParent.parent().scrollTop();
        var visible_area_end = visible_area_start + eleParent.parent().innerHeight();
        if(offsetTop < visible_area_start || offsetBottom > visible_area_end){
            $("#" + element[0].id).parent().parent().animate(
                {scrollTop: visible_area_start + (eleRect.top - (scrollerRect.top + visible_area_end - visible_area_start)) + 30}, configuration.timerTime - 200);
            return false;
        }
        return true;
    }

    // Utility function for generating general HTML elements with id, class (with theme)
    function createEle(kind, id, clazz, my_theme, father) {
        var ele = document.createElement(kind);
        if (id) { ele.setAttribute("id", id); }
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

    function generateNAGMenu(buttonDiv) {
// create the NAG menu here ...
        var sel = createEle("select", buttonsId + "nag", "nag", theme, buttonDiv);
        sel.setAttribute("multiple", "multiple");
        $.each(that.mypgn.NAGS, function (index, value) {
            if (value != null) {
                var opt = createEle("option", null, null, theme, sel);
                opt.setAttribute("value", index);
                opt.text = value;
            }
        });
    }

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    var generateHTML = function() {
        // Utility function for generating buttons divs
        function addButton(name, buttonDiv) {
            var l_theme = (['green', 'blue'].indexOf(theme) >= 0) ? theme : 'default';
            var button = createEle("span", buttonsId + name, "button " + name, l_theme, buttonDiv);
            var title = i18n.t("buttons:" + name);
            $("#" + buttonsId + name).attr("title", title);
            return button;
        }
        // Generates the view buttons (only)
        var generateViewButtons = function(buttonDiv) {
            ["flipper", "first", "prev", "next", "play", "last"].forEach(function(entry) {
                addButton(entry, buttonDiv)});
        };
        // Generates the edit buttons (only)
        var generateEditButtons = function(buttonDiv) {
            ["deleteVar", "promoteVar", "deleteMoves"].forEach(function(entry) {
                var but = addButton(entry, buttonDiv);
                //but.className = but.className + " gray"; // just a test, worked.
                // only gray out if not usable, check that later.
            });
            ["pgn"].forEach(function(entry) {
                var but = addButton(entry, buttonDiv);
            });
        };

        var generateCommentDiv = function(commentDiv) {
            var radio = createEle("div", null, "commentRadio", theme, commentDiv);
            var mc = createEle("input", null, "moveComment", theme, radio);
            mc.type = "radio"; mc.value = "move"; mc.name = "radio";
            createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"));
            var mb = createEle("input", null, "beforeComment", theme, radio);
            mb.type = "radio"; mb.value = "before"; mb.name = "radio";
            createEle("label", null, "labelBeforeComment", theme, radio).appendChild(document.createTextNode("Before"));
            var ma = createEle("input", null, "afterComment", theme, radio);
            ma.type = "radio"; ma.value = "after"; ma.name = "radio";
            createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"));
            createEle("textarea", null, "comment", theme, commentDiv);
        };
        var divBoard = document.getElementById(boardId);
        if (divBoard == null) {
            return;
        } else {
            // ensure that the board is empty before filling it
            $('#'+boardId).find('div').remove();
        }
        if (configuration.size) {
            divBoard.style.width = configuration.size;
        }
        divBoard.setAttribute('class', theme + ' whole');
        createEle("div", headersId, "headers", theme, divBoard);
        var outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
        if (configuration.boardSize) {
            outerInnerBoardDiv.style.width = configuration.boardSize;
        }
        var innerBoardDiv = createEle("div", innerBoardId, "board", theme, outerInnerBoardDiv);
        var buttonsBoardDiv = createEle("div", buttonsId, "buttons", theme, outerInnerBoardDiv);
        generateViewButtons(buttonsBoardDiv);
        var editButtonsBoardDiv = createEle("div", "edit" + buttonsId, "edit", theme, outerInnerBoardDiv);
        generateEditButtons(editButtonsBoardDiv);
        var outerPgnDiv = createEle("div", "outerpgn" + buttonsId, "outerpgn", theme, outerInnerBoardDiv);
        var pgnHideButton  = addButton("hidePGN", outerPgnDiv);
        var pgnDiv  = createEle("div", "pgn" + buttonsId, "pgn", theme, outerPgnDiv);
        var commentBoardDiv = createEle("div", "comment" + buttonsId, "comment", theme, outerInnerBoardDiv);
        generateCommentDiv(commentBoardDiv);
        // Ensure that moves are scrollable (by styling CSS) when necessary
        var movesDiv;
        if (configuration.scrollable) {
            movesDiv = createEle("div", null, "movesOuterScroller", null, divBoard);
            var movesInnerDiv = createEle("div", null, "movesScroller", null, movesDiv);
            createEle("div", movesId, "moves", null, movesInnerDiv);
        } else {
            movesDiv = createEle("div", movesId, "moves", null, divBoard);
        }

        if (configuration.movesWidth) {
            movesDiv.style.width = configuration.movesWidth;
        }
        if (configuration.movesHeight) {
            movesDiv.style.height = configuration.movesHeight;
            movesDiv.firstChild.style.height = configuration.movesHeight;
        }
        var endDiv = createEle("div", null, "endBoard", null, divBoard);
    };
    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
     */
    var generateBoard = function() {
        function copyBoardConfiguration(source, target, keys) {
            var pieceStyle = source.pieceStyle || 'wikipedia';
            $.each(keys, function(i, key) {
                if (typeof source[key] != "undefined") {
                    target[key] = source[key];
                }
            });
            if (! target.pieceTheme) {
                target.pieceTheme = localPath() + 'img/chesspieces/' + pieceStyle + '/{piece}.png';
            }
        }
        var boardConfiguration = {};
        copyBoardConfiguration(configuration, boardConfiguration,
            ['position', 'orientation', 'showNotation', 'pieceTheme', 'draggable',
            'onDragStart', 'onDrop', 'onMouseoutSquare', 'onMouseoverSquare', 'onSnapEnd']);
        board = new ChessBoard(innerBoardId, boardConfiguration);
        return board;
    };

    var moveSpan = function(i) {
        return $('#' + movesId + i);
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
    var generateMove = function(currentCounter, game, move, prevCounter, movesDiv, varStack) {
        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @param clazz class parameter appended to differentiate different comments
         * @returns {HTMLElement} the new created span with the comment as text
         */
        var generateCommentSpan = function(comment, clazz) {
            var span = createEle('span', null, "comment " + clazz);
            if (comment && (typeof comment == "string")) {
                span.appendChild(document.createTextNode(" " + comment + " "));
            }
            return span;
        };

        var append_to_current_div = function(index, span, movesDiv, varStack) {
            if (varStack.length == 0) {
                if (typeof index == "number") {
                    $(span).insertAfter(moveSpan(index));
                } else {
                    movesDiv.appendChild(span);
                }
            } else {
                varStack[varStack.length - 1].appendChild(span);
            }
        };
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
                moveSpan(varHead)[0].appendChild(varDiv);
                // movesDiv.appendChild(varDiv);
            } else {
                varStack[varStack.length - 1].appendChild(varDiv);
            }
            varStack.push(varDiv);
            //span.appendChild(document.createTextNode(" ( "));
        }
        span.appendChild(generateCommentSpan(move.commentMove, "moveComment"));
        if (move.turn == 'w') {
            var mn = move.moveNumber;
            var num = createEle('span', null, "moveNumber", null, span);
            num.appendChild(document.createTextNode("" + mn + ". "));
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
        moveSpan(currentCounter).on('click', function() {
            makeMove(that.currentMove, currentCounter, move.fen);
            event.stopPropagation();
        });
        if (that.mypgn.has_diagram_nag(move)) {
            var diaID = boardId + "dia" + currentCounter;
            var diaDiv = createEle('div', diaID);
            span.appendChild(diaDiv);
            configuration.position = move.fen;
            pgnBoard(diaID, configuration);
        }
        return currentCounter;
    };

    /**
     * Unmark all marked moves, mark the next one.
     * @param next the next move number
     */
    function unmarkMark(next) {
        var moveASpan = function(i) {
            return $('#' + movesId + i + "> a");
        };

        $("div#" + movesId + " a.yellow").removeClass('yellow');
        moveASpan(next).addClass('yellow');
    }

    /**
     * Check which buttons should be grayed out
     */
    var updateUI = function (next) {
        $("div.buttons .gray").removeClass('gray');
        var move = that.mypgn.getMove(next);
        if (typeof move.prev != "number") {
            ["prev", "first"].forEach(function(name) {
                $("div.buttons ." + name).addClass('gray');
            });
        }
        if (typeof move.next != "number") {
            ["next", "play", "last"].forEach(function(name) {
                $("div.buttons ." + name).addClass('gray');
            });
        }
        // Update the drop-down for NAGs
        $("select#" + buttonsId + "nag").multiselect("uncheckAll");
    };

    /**
     * Plays the move that is already in the notation on the board.
     * @param curr the current move number
     * @param next the move to take now
     * @param fen the fen of the move to make
     */
    var makeMove = function(curr, next, fen) {
        /**
         * Fills the comment field depending on which and if a comment is filled for that move.
         */
        function fillComment(moveNumber) {
            var myMove = that.mypgn.getMove(moveNumber);
            if (myMove.commentAfter) {
                $("#" + boardId + " input.afterComment").prop('checked', true);
                $("#" + boardId + " textarea.comment").val(myMove.commentAfter);
            } else if (myMove.commentBefore) {
                $("#" + boardId + " input.beforeComment").prop('checked', true);
                $("#" + boardId + " textarea.comment").val(myMove.commentBefore);
            } else if (myMove.commentMove) {
                $("#" + boardId + " input.moveComment").prop('checked', true);
                $("#" + boardId + " textarea.comment").val(myMove.commentMove);
            } else {
                $("#" + boardId + " textarea.comment").val("");
            }
        }

        board.position(fen);
        game.load(fen);
        unmarkMark(next);
        that.currentMove = next;
        scrollToView(moveSpan(next));
        fillComment(next);
        updateUI(next);
    };

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function(board) {
        that.mypgn = pgnReader( that.configuration );
        var myMoves = that.mypgn.getMoves();
        if (that.configuration.position == 'start') {
            game.reset();
        } else {
            game.load(that.configuration.position);
        }

        /**
         * Generate a useful notation for the headers, allow for styling. First a version
         * that just works.
         */
        var generateHeaders = function() {
            if (configuration.headers == false) { return; }
            var div_h = $('#' + headersId)[0];
            var headers = that.mypgn.getHeaders();
            var allowed = ['White', 'Black', 'ECO', 'Result'];
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
            var appendHeader = function(result, header, separator) {
                if (header) {
                    if (result.length > 0) {
                        result += separator;
                    }
                    result += header;
                }
                return result;
            };
            [headers.Event, headers.Site, headers.Round, headers.Date,
                headers.ECO, headers.Result].forEach(function(header) {
                rest = appendHeader(rest, header, " | ");
            });
            var restSpan = createEle("span", null, "restHeader", theme, div_h);
            restSpan.appendChild(document.createTextNode(rest));

        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function() {
            var bind_key = function(key, to_call) {
//                jQuery("#" + boardId + "Moves").bind('keydown', key,function (evt){
                jQuery("#" + boardId + ",#" + boardId + "Moves").bind('keydown', key,function (evt){
                    to_call();
                    evt.stopPropagation();
                });
            };
            var nextMove = function () {
                var fen = null;
                if (typeof that.currentMove == 'undefined') {
                    fen = that.mypgn.getMove(0).fen;
                    makeMove(null, 0, fen);
                } else {
                    var next = that.mypgn.getMove(that.currentMove).next
                    fen = that.mypgn.getMove(next).fen;
                    makeMove(that.currentMove, next, fen);
                }
            };
            var prevMove = function () {
                var fen = null;
                if (typeof that.currentMove == 'undefined') {
                    /*fen = that.mypgn.getMove(0).fen;
                     makeMove(null, 0, fen);*/
                }
                else {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    fen = that.mypgn.getMove(prev).fen;
                    makeMove(that.currentMove, prev, fen);
                }
            };
            var timer = $.timer(function() {
                nextMove();
            });
            timer.set({ time : (configuration.timerTime ? configuration.timerTime : 700)});
            $('#' + buttonsId + 'flipper').on('click', function() {
                board.flip();
            });
            $('#' + buttonsId + 'next').on('click', function() {
                nextMove();
            });
            $('#' + buttonsId + 'prev').on('click', function() {
                prevMove();
            });
            $('#' + buttonsId + 'first').on('click', function() {
                var fen = that.mypgn.getMove(0).fen;
                makeMove(that.currentMove, 0, fen);
            });
            $('#' + buttonsId + 'last' ).on('click', function() {
                var fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            $('#' + buttonsId + "pgn").on('click', function() {
                $('#pgn' + buttonsId).hide(200);
                var str = computePgn();
                showPgn(str);
                $("#" + boardId + " .outerpgn").show();
            });
            $('#' + boardId + " .hidePGN").on("click", function () {
                $( "#" + boardId + " .outerpgn").hide( "fold");
            });
            $("#" + boardId + ' .outerpgn').hide();
            $('#comment' + buttonsId + " textarea.comment").change(function() {
                function commentText() {
                    return " " + $('#comment' + buttonsId + " textarea.comment").val() + " ";
                }
                var text = commentText();
                var checked = $("#comment" + buttonsId + " :checked").val() || "after";
                moveSpan(that.currentMove).find("." + checked + "Comment").text(text);
                if (checked === "after") {
                    that.mypgn.getMove(that.currentMove).commentAfter = text;
                } else if (checked === "before") {
                    that.mypgn.getMove(that.currentMove).commentBefore = text;
                } else if (checked === "move") {
                    that.mypgn.getMove(that.currentMove).commentMove = text;
                }
            });
            var rad = ["moveComment", "beforeComment", "afterComment"];
            var prevComment = null;
            for (var i = 0;i < rad.length; i++) {
                $('#comment' + buttonsId + " ." + rad[i]).click(function() {
                    var checked = this.value;
                    var text;
                    if (checked === "after") {
                        text = that.mypgn.getMove(that.currentMove).commentAfter;
                    } else if (checked === "before") {
                        text = that.mypgn.getMove(that.currentMove).commentBefore;
                    } else if (checked === "move") {
                        text = that.mypgn.getMove(that.currentMove).commentMove;
                    }
                    $("#" + boardId + " textarea.comment").val(text);
                });
            }
            function togglePlay() {
                timer.toggle();
                var playButton = $('#' + buttonsId + 'play')[0];
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
            bind_key("space", togglePlay);
            $('#' + buttonsId + 'play').on('click', function() {
                togglePlay();
            })
        };

        var computePgn = function() {
            return that.mypgn.write_pgn();
        };

        var showPgn = function (val) {
            $('#pgn' + buttonsId).text(val).show(1000);
        };


        // Start working with PGN, if available
//        if (! configuration.pgn) { return; }
        var movesDiv = document.getElementById(movesId);
        var prev = null;
        var varStack = [];
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            prev = generateMove(i, game, move, prev, movesDiv, varStack);
        }
        bindFunctions();
        generateNAGMenu($("#edit" + boardId + "Button")[0]);
        generateHeaders();
        //game.reset(); // TODO: Not needed any more??
        $(function(){
            $("select#" + buttonsId + "nag").multiselect({
                header: false,
                selectedList: 4,
                minWidth: 80,
                checkAllText: "",
                uncheckAllText: "Clean",
                noneSelectedText: "NAGs",
                click: function(event, ui) {
                    /**
                     * Add (or remote) a NAG from the current move. Ignore it, if there is
                     * no current move.
                     */
                    function changeNAG(value, checked) {
                        /**
                         * Updates the visual display of the move (only the notation, not the comments).
                         * @param moveIndex the index of the move to update
                         */
                        function updateMoveSAN(moveIndex) {
                            var move = that.mypgn.getMove(moveIndex);
                            $("#" + movesId + moveIndex + " > a").text(that.mypgn.sanWithNags(move));
                        }

                        console.log("clicked: " + value + " Checked? " + checked);
                        that.mypgn.changeNag("$" + value, that.currentMove, checked);
                        updateMoveSAN(that.currentMove);
                    }

                    //  event: the original event object
//                    ui.value: value of the checkbox
//                    ui.text: text of the checkbox
//                    ui.checked: whether or not the input was checked or unchecked (boolean)

                    changeNAG(ui.value, ui.checked);
                }
            });
        });
    };

    return {
        // PUBLIC API
        chess: game,
        board: board,
        getPgn: function() { return that.mypgn; },
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        hideHTML: hideHTML
    }

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
var pgnView = function(boardId, configuration) {
    var base = pgnBase(boardId, configuration);
    base.generateHTML();
    var b = base.generateBoard();
    base.generateMoves(b);
    base.hideHTML("Button", "edit");
    base.hideHTML("Button", "comment");
    return {
        chess: base.chess,
        getPgn: base.getPgn,
        version: base.VERSION
    }
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
var pgnBoard = function(boardId, configuration) {
    var base = pgnBase(boardId, configuration);
    base.generateHTML();
    base.hideHTML("Button");
    base.hideHTML("Button", "edit");
    base.hideHTML("Button", "comment");
    base.hideHTML("Button", "outerpgn");
    var b = base.generateBoard();
    return {
        chess: base.chess,
        board: b
    }

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
var pgnEdit = function(boardId, configuration) {
    var removePossibleSquares = function() {
        $('#' + boardId + ' .square-55d63').removeClass('possible');
    }
    var possibleSquare = function(square) {
        $('#' + boardId + ' .square-' + square).addClass('possible');
    };

    /**
     * Start the drag of piece only if possible
     * @param source not used here
     * @param piece the piece string
     * @returns {boolean}
     */
    var onDragStart = function(source, piece) {
        // do not pick up pieces if the game is over
        // or if it's not that side's turn
        if (base.chess.game_over() === true ||
            (base.chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (base.chess.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };
    /**
     * Called when a piece is dropped.
     * @param source the start square
     * @param target the end square
     * @returns {string} 'snapback' if illegal
     */
    var onDrop = function(source, target) {

        removePossibleSquares();
        // see if the move is legal
        var move = base.chess.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        // illegal move
        if (move === null) {
            return 'snapback';
        } else {
            base.currentMoveNotation = move.san;
        }
    };
    /**
     * Mark possible squares as "valid" for the player.
     * @param square the square to move from
     * @param piece the piece to move (not used here)
     */
    var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = base.chess.moves({
            square: square,
            verbose: true
        });
        // exit if there are no moves available for this square
        if (moves.length === 0) return;
        // highlight the square they moused over
        possibleSquare(square);
        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            possibleSquare(moves[i].to);
        }
    };
    /**
     * Called when ???
     * @param square
     * @param piece
     */
    var onMouseoutSquare = function(square, piece) {
        removePossibleSquares();
    };
    /**
     * Called when the piece is released. Here should be the logic for calling all
     * pgn enhancement.
     */
    var onSnapEnd = function() {
        board.position(base.chess.fen());
        var cur = base.currentMove;
        base.currentMove = base.mypgn.addMove(base.currentMoveNotation, cur);
        var move = base.mypgn.getMove(base.currentMove);
        if (moveSpan(base.currentMove).length == 0) {
            generateMove(base.currentMove, null, move, move.prev, document.getElementById(movesId), []);
        }
        unmarkMark(base.currentMove);
        updateUI(base.currentMove);
    };

    var base = pgnBase(boardId, configuration);
    configuration.draggable = true;
    configuration.onDragStart = onDragStart;
    configuration.onDrop = onDrop;
    configuration.onMouseoutSquare = onMouseoutSquare;
    configuration.onMouseoverSquare = onMouseoverSquare;
    configuration.onSnapEnd = onSnapEnd;
    base.generateHTML();
    var b = base.generateBoard();
    base.generateMoves(b);
};

/**
 * Defines a utiliy function to get a printable version of a game, enriched
 * by diagrams, comments, ... Does  not allow to replay the game (no buttons),
 * disables all editing functionality.
 * @param boardId the unique ID of the board (per HTML page)
 * @param configuration the configuration, mainly here the board style and position.
 * Rest will be ignored.
 */
var pgnPrint = function(boardId, configuration) {
    var base = pgnBase(boardId, configuration);
    base.generateHTML();
    base.hideHTML("Button");
    base.hideHTML("Inner");
    base.hideHTML("Button", "edit");
    base.hideHTML("Button", "comment");
    base.hideHTML("Button", "outerpgn");
    var board = base.generateBoard();
    base.generateMoves(b);
};
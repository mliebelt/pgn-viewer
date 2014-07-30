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
    var VERSION = "0.9.0";
    var that = {};
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
            resGetPath: localPath() + '../locales/__ns__-__lng__.json',
            ns: {
                namespaces: ['chess', 'nag'],
                defaultNs: 'chess'
            }
        };
        $.i18n.init(i18n_option);
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
     * Returns the local path (needed for adressing piece image files).
     * @returns {XML|string|void}
     */
    function localPath() {
        var jsFileLocation = $('script[src*=pgnviewerjs]').attr('src');  // the js file path
        return jsFileLocation.replace('pgnviewerjs.js', '');   // the js folder path
    }


    /**
     * Allow to hide HTML by calling this function. It will prepend
     * the boardId, and search for an ID in the DOM.
     * @param eleName
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
        var scrollerRect = $("#" + element[0].id).parent().parent()[0].getBoundingClientRect();
        var movesRect = $("#" + element[0].id).parent()[0].getBoundingClientRect();
        var offsetTop = eleRect.top - movesRect.top;
        var offsetBottom = eleRect.bottom - movesRect.top;
        var visible_area_start = $("#" + element[0].id).parent().parent().scrollTop();
        var visible_area_end = visible_area_start + $("#" + element[0].id).parent().parent().innerHeight();
        if(offsetTop < visible_area_start || offsetBottom > visible_area_end){
            $("#" + element[0].id).parent().parent().animate(
                {scrollTop: visible_area_start + (eleRect.top - (scrollerRect.top + visible_area_end - visible_area_start)) + 30}, configuration.timerTime - 200);
            return false;
        }
        return true;
    }

    /**
     * The function removes the background of the marked fields for moves.
     */
    var removePossibleSquares = function() {
        $('#' + boardId + ' .square-55d63').removeClass('possible');
    };

    /**
     * The function marks the fields 'possible' that are reachable by a move.
     * @param square the ID of the square
     */
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
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
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
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        // illegal move
        if (move === null) {
            return 'snapback';
        } else {
            that.currentMoveNotation = move.san;
        }
    };

    /**
     * Mark possible squares as "valid" for the player.
     * @param square the square to move from
     * @param piece the piece to move (not used here)
     */
    var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
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
        board.position(game.fen());
        that.currentMove = that.mypgn.addMove(that.currentMoveNotation, that.currentMove);
    };

    // Utility function for generating general HTML elements with id, class (with theme)
    function createEle(kind, id, clazz, my_theme, father) {
        var ele = document.createElement(kind);
        if (id) { ele.setAttribute("id", id); }
        if (clazz) {
            if (my_theme) {
                ele.setAttribute("class", theme + " " + clazz);
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
    var generateHTML = function() {
        // Utility function for generating buttons divs
        function addButton(name, buttonDiv) {
            createEle("button", buttonsId + name, name, theme, buttonDiv);
        }
        // Generates the view buttons (only)
        var generateViewButtons = function(buttonDiv) {
            ["flipper", "first", "prev", "next", "play", "last"].forEach(function(entry) {
                addButton(entry, buttonDiv)});
        };
        // Generates the edit buttons (only)
        var generateEditButtons = function(buttonDiv) {
            ["deleteVar", "promoteVar", "deleteMoves", "nags", "pgn"].forEach(function(entry) {
                addButton(entry, buttonDiv)});
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
            var text = createEle("textarea", null, "comment", theme, commentDiv);
        }
        var divBoard = document.getElementById(boardId);
        if (divBoard == null) {
            return;
        }
        if (configuration.size) {
            divBoard.style.width = configuration.size;
        }
        divBoard.setAttribute('class', theme + ' whole');
        var headersDiv = createEle("div", headersId, "headers", theme, divBoard);
        var outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
        if (configuration.boardSize) {
            outerInnerBoardDiv.style.width = configuration.boardSize;
        }
        var innerBoardDiv = createEle("div", innerBoardId, "board", theme, outerInnerBoardDiv);
        var buttonsBoardDiv = createEle("div", buttonsId, "buttons", theme, outerInnerBoardDiv);
        generateViewButtons(buttonsBoardDiv);
        var editButtonsBoardDiv = createEle("div", "edit" + buttonsId, "edit", theme, outerInnerBoardDiv);
        generateEditButtons(editButtonsBoardDiv);
        var pgnDiv  = createEle("div", "pgn" + buttonsId, "pgn", theme, outerInnerBoardDiv);
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
     * @returns {Window.ChessBoard} the board object that may play the moveslater
     */
    var generateBoard = function() {
        function copyBoardConfiguration(source, target, keys) {
            var pieceStyle = source.pieceStyle || 'wikipedia';
            $.each(keys, function(i, key) {
                if (typeof source[key] != "undefined") {
                    target[key] = source[key];
                }
            });
            var myPieceStyles = ['case', 'chesscom', 'condal', 'leipzig', 'maya', 'merida', 'beyer'];
            if (! target.pieceTheme) {
                target.pieceTheme = localPath() + '../img/chesspieces/' + pieceStyle + '/{piece}.png';
            }
        }
        var boardConfiguration = {};
        copyBoardConfiguration(configuration, boardConfiguration,
            ['position', 'orientation', 'showNotation', 'pieceTheme', 'draggable',
            'onDragStart', 'onDrop', 'onMouseoutSquare', 'onMouseoverSquare', 'onSnapEnd']);
        board = new ChessBoard(innerBoardId, boardConfiguration);
        return board;
    };

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

    function commentText() {
        return " " + $('#comment' + buttonsId + " textarea.comment").val() + " ";
    }

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function(board) {
        that.mypgn = pgnReader( { pgn: configuration.pgn ? configuration.pgn : ''} );
        var myMoves = that.mypgn.getMoves();
        game.reset();

        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @returns {HTMLElement} the new created span with the comment as text
         */
        var generateCommentSpan = function(comment, clazz) {
            var span = createEle('span', null, "comment " + clazz);
            if (comment && (typeof comment !== undefined)) {
                span.appendChild(document.createTextNode(" " + comment + " "));
            }
            return span;
        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function() {
            var bind_key = function(key, to_call) {
                jQuery("#" + boardId).bind('keydown', key,function (evt){
                    to_call();
                    return false;
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
            })
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
            });
            $('#comment' + buttonsId + " textarea.comment").change(function() {
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

        var moveSpan = function(i) {
            return $('#' + movesId + i);
        };
        var moveASpan = function(i) {
            return $('#' + movesId + i + " a");
        }

        /**
         * Fills the comment field depending on which and if a comment is filled for that move.
         */
        function fillComment(moveNumber) {
            var myMove = myMoves[moveNumber];
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

        var makeMove = function(curr, next, fen) {
            board.position(fen);
            game.load(fen);
            if (typeof curr != 'undefined') {
                moveASpan(curr).removeClass();
            }
            moveASpan(next).addClass('yellow');
            that.currentMove = next;
            scrollToView(moveSpan(next));
            fillComment(next);
        };

        var computePgn = function() {
            return that.mypgn.write_pgn();
        };

        var showPgn = function (val) {
            $('#pgn' + buttonsId).text(val).show(1000);
        };

        // Generates one move from the current position
        var generateMove = function(currentCounter, game, move, prevCounter, movesDiv, varStack) {

            var move_from_notation = function(move) {
                if (typeof move.row == 'undefined') {
                    return move.notation; // move like O-O and O-O-O
                }
                var fig = $.t(move.fig);
                var disc = move.disc ? move.disc : "";
                var check = move.check ? move.check : "";
                var prom = move.promotion ? move.promotion : "";
                return fig + disc + move.col + move.row + prom + check;
            };
            var append_to_current_div = function(span, movesDiv, varStack) {
                if (varStack.length == 0) {
                    movesDiv.appendChild(span);
                } else {
                    varStack[varStack.length - 1].appendChild(span);
                }
            };
            // In case of variant, the previous move is different to the current fen
            var isNextOfPrev = false;
            if (prevCounter != move.prev) {
                if (typeof move.prev === "number") {
                    game.load(myMoves[move.prev].fen);
                } else {
                    game.reset();
                }
                isNextOfPrev = true;
            }
            // TODO Error handling if move could not be done
//            var pgn_move = game.move(move.notation.notation);
//            if (pgn_move === null || (pgn_move === undefined)) {
//                window.alert("No pgn move found in: " + move);
//            }
//            var fen = game.fen();
//            move.fen = fen;
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
                    movesDiv.appendChild(varDiv);
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
            var san = move_from_notation(move.notation);
            if (move.nag) {
                san += that.mypgn.nag_to_symbol(move.nag);
            }
            var text = document.createTextNode(san);
            link.appendChild(text);
            span.appendChild(document.createTextNode(" "));
            span.appendChild(generateCommentSpan(move.commentAfter, "afterComment"));
            append_to_current_div(span, movesDiv, varStack);
            //movesDiv.appendChild(span);
            if (that.mypgn.endVariation(move)) {
                //span.appendChild(document.createTextNode(" ) "));
                varStack.pop();
            }
            moveSpan(currentCounter).on('click', function() {
                makeMove(that.currentMove, currentCounter, move.fen);
            });
            if (move.commentAfter && move.commentAfter == 'diagram') {
                var diaID = boardId + "dia" + currentCounter;
                var diaDiv = createEle('div', diaID);
                append_to_current_div(diaDiv, movesDiv, varStack);
                configuration.position = fen;
                pgnBoard(diaID, configuration);
            }
            return currentCounter;
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
        generateHeaders();
        game.reset();
    };

    return {
        // PUBLIC API
        chess: game,
        getPgn: function() { return that.mypgn; },
        pgn: that.mypgn,
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        hideHTML: hideHTML,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
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
        pgn: base.pgn,
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
    var base = pgnBase(boardId, configuration);
    configuration.draggable = true;
    configuration.onDragStart = base.onDragStart;
    configuration.onDrop = base.onDrop;
    configuration.onMouseoutSquare = base.onMouseoutSquare;
    configuration.onMouseoverSquare = base.onMouseoverSquare;
    configuration.onSnapEnd = base.onSnapEnd;
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
    var b = base.generateBoard();
    base.generateMoves(b);
};
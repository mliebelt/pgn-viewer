'use strict';

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */

var pgnBase = function (boardId, configuration) {
    var VERSION = "0.9.0";
    var that = {};
    function localPath() {
        var jsFileLocation = $('script[src*=pgnviewerjs]').attr('src');  // the js file path
        return jsFileLocation.replace('pgnviewerjs.js', '');   // the js folder path
    }

    var theme = configuration.theme || 'default';
    var game = new Chess();
    var headersId = boardId + 'Headers';
    var innerBoardId = boardId + 'Inner';
    var movesId = boardId + 'Moves';
    var buttonsId = boardId + 'Button';
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
    if (! configuration.position) {
        configuration.position = 'start';
    }
    /**
     * Allow to hide HTML by calling this function. It will prepend
     * the boardId, and search for an ID in the DOM.
     * @param eleName
     */
    var hideHTML = function(eleName) {
        var ele = "#" + boardId + eleName;
        $(ele)[0].style.display = "none";
    };
    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    var generateHTML = function() {
        var generateButtons = function() {
            var flipper = document.createElement("button");
            flipper.setAttribute('id', buttonsId + "Flipper");
            flipper.setAttribute("class", theme + " flipper");
            buttonsBoardDiv.appendChild(flipper);
            var first = document.createElement("button");
            first.setAttribute('id', buttonsId + 'First');
            first.setAttribute('class', theme + " first");
            buttonsBoardDiv.appendChild(first);
            var prev = document.createElement("button");
            prev.setAttribute('id', buttonsId + 'Prev');
            prev.setAttribute('class', theme + " prev");
            buttonsBoardDiv.appendChild(prev);
            var next = document.createElement("button");
            next.setAttribute('id', buttonsId + 'Next');
            next.setAttribute('class', theme + " next");
            buttonsBoardDiv.appendChild(next);
            var play = document.createElement("button");
            play.setAttribute('id', buttonsId + 'Play');
            play.setAttribute('class', theme + " play");
            buttonsBoardDiv.appendChild(play);
            var last = document.createElement("button");
            last.setAttribute('id', buttonsId + 'Last');
            last.setAttribute('class', theme + " last");
            buttonsBoardDiv.appendChild(last);
        };
        var divBoard = document.getElementById(boardId);
        if (divBoard == null) {
            return;
        }
        divBoard.setAttribute('class', theme + ' whole');
        var headersDiv = document.createElement("div");
        headersDiv.setAttribute('id', headersId);
        headersDiv.setAttribute("class", theme + " headers");
        var outerInnerBoardDiv = document.createElement("div");
        outerInnerBoardDiv.setAttribute("class", "outerBoard");
        var innerBoardDiv = document.createElement("div");
        innerBoardDiv.setAttribute('id', innerBoardId);
        innerBoardDiv.setAttribute('class', theme + " board");
        var buttonsBoardDiv = document.createElement("div");
        generateButtons();
        buttonsBoardDiv.setAttribute('id', buttonsId);
        buttonsBoardDiv.setAttribute('class', theme + " buttons");
        var movesDiv = document.createElement("div");
        movesDiv.setAttribute('id', movesId);
        movesDiv.setAttribute('class', "moves");
        outerInnerBoardDiv.appendChild(innerBoardDiv);
        outerInnerBoardDiv.appendChild(buttonsBoardDiv);
        divBoard.appendChild(headersDiv);
        divBoard.appendChild(outerInnerBoardDiv);
        divBoard.appendChild(movesDiv);
        var endDiv = document.createElement("div");
        endDiv.setAttribute('class', "endBoard");
        divBoard.appendChild(endDiv);
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
                if (source[key]) {
                    target[key] = source[key];
                }
            });
            var myPieceStyles = ['case', 'chesscom', 'condal', 'leipzig', 'maya', 'merida', 'beyer'];
            if (! target.pieceTheme) {
                target.pieceTheme = localPath() + '../img/chesspieces/' + pieceStyle + '/{piece}.png';
            }
        }
        var boardConfiguration = {};
        copyBoardConfiguration(configuration, boardConfiguration, ['position', 'orientation', 'showNotation', 'pieceTheme']);
        return new ChessBoard(innerBoardId, boardConfiguration);
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
        var white = document.createElement('span');
        white.setAttribute('class', theme + " whiteHeader");
        if (headers.White) {
            white.appendChild(document.createTextNode(headers.White));
        }
        div_h.appendChild(white);
        //div_h.appendChild(document.createTextNode(" - "));
        var black = document.createElement('span');
        black.setAttribute('class', theme + " blackHeader");
        if (headers.Black) {
            black.appendChild(document.createTextNode(headers.Black));
        }
        div_h.appendChild(black);
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
        var restSpan = document.createElement("span");
        restSpan.setAttribute("class", theme + " restHeader");
        restSpan.appendChild(document.createTextNode(rest));
        div_h.appendChild(restSpan);

    };
    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function(board) {
        that.mypgn = pgnReader( { pgn: configuration.pgn ? configuration.pgn : ''} );
        var myMoves = that.mypgn.getMoves();
        game.reset();
        var NAGs = [
            null,
            "!",
            "?",
            "!!",
            "??",
            "!?",
            "?!",
            "□",
            null,
            null,
            "=",
            null,
            null,
            "∞",
            "⩲",
            "⩱",
            "±",
            "∓",
            "+−",
            "-+"
        ];

        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @returns {HTMLElement} the new created span with the comment as text
         */
        var generateCommentSpan = function(comment) {
            var span = document.createElement('span');
            span.setAttribute("class", "comment");
            span.appendChild(document.createTextNode(" " + comment + " "));
            return span;
        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function() {
            var bind_key = function(key, to_call) {
                jQuery("#" + boardId).bind('keydown', key,function (evt){
                    to_call();
                    return false;
                });
            }
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
            $('#' + buttonsId + 'Flipper').on('click', function() {
                board.flip();
            })
            $('#' + buttonsId + 'Next').on('click', function() {
                nextMove();
            });
            $('#' + buttonsId + 'Prev').on('click', function() {
                prevMove();
            });
            $('#' + buttonsId + 'First').on('click', function() {
                var fen = that.mypgn.getMove(0).fen;
                makeMove(that.currentMove, 0, fen);
            });
            $('#' + buttonsId + 'Last' ).on('click', function() {
                var fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            function togglePlay() {
                timer.toggle();
                var playButton = $('#' + buttonsId + 'Play')[0];
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
            $('#' + buttonsId + 'Play').on('click', function() {
                togglePlay();
            })
        };

        var moveSpan = function(i) {
            return $('#' + movesId + i);
        };

        // Makes the move on the board from the current position to the next position.
        var makeMove = function(curr, next, fen) {
            board.position(fen);
            if (typeof curr != 'undefined') {
                moveSpan(curr).removeClass();
            }
            moveSpan(next).addClass('yellow');
            that.currentMove = next;
        };

        // Returns true, if the move is the start of a (new) variation
        var startVariation = function(move) {
            return  move.variationLevel > 0 && (myMoves[move.prev].next != move.index);
        }
        // Returns true, if the move is the end of a variation
        var endVariation = function(move) {
            return move.variationLevel > 0 && ! move.next;
        }
        // Generates one move from the current position
        var generateMove = function(currentCounter, game, move, prevCounter, movesDiv, varStack) {
            var nag_to_symbol = function(string) {
                var number = parseInt(string.substring(1));
                var ret = NAGs[number];
                return (typeof ret != 'undefined') ? ret : "";
            };
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
                game.load(myMoves[move.prev].fen);
                isNextOfPrev = true;
            }
            // TODO Error handling if move could not be done
            var pgn_move = game.move(move.notation.notation);
            var fen = game.fen();
            move.fen = fen;
            var span = document.createElement("span");
            var clAttr = "move";
            if (move.variationLevel > 0) {
                clAttr = clAttr + " var var" + move.variationLevel;
            }
            if (pgn_move.color == 'w') {
                clAttr = clAttr + " white";
            }
            span.setAttribute('class', clAttr);
            if (startVariation(move)) {
                var varDiv = document.createElement("div");
                varDiv.setAttribute('class', "variation");
                if (varStack.length == 0) {
                    movesDiv.appendChild(varDiv);
                } else {
                    varStack[varStack.length - 1].appendChild(varDiv);
                }
                varStack.push(varDiv);
                //span.appendChild(document.createTextNode(" ( "));
            }
            if (pgn_move.color == 'w') {
                var mn = move.moveNumber;
                var num = document.createElement('span');
                num.setAttribute('class', "moveNumber");
                num.appendChild(document.createTextNode("" + mn + ". "));
                span.appendChild(num);
            }
            if (move.commentBefore) { span.appendChild(generateCommentSpan(move.commentBefore))}
            var link = document.createElement('a');
            link.setAttribute('id', movesId + currentCounter);
//            var san = pgn_move.san;
//            var figure = $.t(pgn_move.piece);
            var san = move_from_notation(move.notation);
            if (move.nag) {
                san += nag_to_symbol(move.nag);
            }
            var text = document.createTextNode(san);
            link.appendChild(text);
            span.appendChild(link);
            span.appendChild(document.createTextNode(" "));
            if (move.commentAfter) { span.appendChild(generateCommentSpan(move.commentAfter))}
            append_to_current_div(span, movesDiv, varStack);
            //movesDiv.appendChild(span);
            if (endVariation(move)) {
                //span.appendChild(document.createTextNode(" ) "));
                varStack.pop();
            }
            var currMoveSpan = $('#' + movesId + currentCounter);
            currMoveSpan.on('click', function() {
                makeMove(that.currentMove, currentCounter, fen);
            });
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
    };

    return {
        // PUBLIC API
        chess: game,
        getPgn: function() { return that.mypgn; },
        pgn: that.mypgn,
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
    var board = base.generateBoard();
    base.generateMoves(board);
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
    var board = base.generateBoard();
    return {
        chess: base.chess,
        board: board
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
    configuration.draggable = true;
    var base = pgnBase(boardId, configuration);
    base.generateHTML();
    base.generateBoard();
};
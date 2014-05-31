'use strict';

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */

var pgnBase = function (boardId, configuration) {
    var that = {};
    var theme = configuration.theme || 'default';
    var game = new Chess();
    var innerBoardId = boardId + 'Inner';
    var movesId = boardId + 'Moves';
    var buttonsId = boardId + 'Button';

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
        var innerBoardDiv = document.createElement("div");
        innerBoardDiv.setAttribute('id', innerBoardId);
        innerBoardDiv.setAttribute('class', theme);
        var buttonsBoardDiv = document.createElement("div");
        generateButtons();
        buttonsBoardDiv.setAttribute('id', buttonsId);
        buttonsBoardDiv.setAttribute('class', theme + " buttons");
        var movesDiv = document.createElement("div");
        movesDiv.setAttribute('id', movesId);
        movesDiv.setAttribute('class', "moves");
        divBoard.appendChild(innerBoardDiv);
        divBoard.appendChild(buttonsBoardDiv);
        divBoard.appendChild(movesDiv);
    };
    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moveslater
     */
    var generateBoard = function() {
        function copyBoardConfiguration(source, target, keys) {
            function localPath() {
                var jsFileLocation = $('script[src*=pgnviewerjs]').attr('src');  // the js file path
                return jsFileLocation.replace('pgnviewerjs.js', '');   // the js folder path
            }
            var pieceStyle = source.pieceStyle || 'wikipedia';
            $.each(keys, function(i, key) {
                if (source[key]) {
                    target[key] = source[key];
                }
            });
            var myPieceStyles = ['case', 'chesscom', 'condal', 'leipzig', 'maya', 'merida', 'beyer'];
            if (! target.pieceTheme) {
                if (myPieceStyles.indexOf(pieceStyle) >= 0) {
                    target.pieceTheme = localPath() + '../img/chesspieces/' + pieceStyle + '/{piece}.png';
                } else {
                    target.pieceTheme = localPath() + '../chessboardjs/img/chesspieces/' + pieceStyle + '/{piece}.png';
                }
            }

        }
        var boardConfiguration = {};
        copyBoardConfiguration(configuration, boardConfiguration, ['position', 'orientation', 'showNotation', 'pieceTheme']);
        return new ChessBoard(innerBoardId, boardConfiguration);
    };

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
        var generateCommentSpan = function(comment) {
            var span = document.createElement('span');
            span.setAttribute("class", "comment");
            span.appendChild(document.createTextNode(" " + comment + " "));
            return span;
        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function() {
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
            var timer = $.timer(function() {
                nextMove();
            });
            timer.set({ time : 500});
            $('#' + buttonsId + 'Flipper').on('click', function() {
                board.flip();
            })
            $('#' + buttonsId + 'Next').on('click', function() {
                nextMove();
            });
            $('#' + buttonsId + 'Prev').on('click', function() {
                var fen = null;
                if (typeof that.currentMove == 'undefined') {
                    /*fen = that.mypgn.getMove(0).fen;
                    makeMove(null, 0, fen);*/
                } else {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    fen = that.mypgn.getMove(prev).fen;
                    makeMove(that.currentMove, prev, fen);
                }
            });
            $('#' + buttonsId + 'First').on('click', function() {
                var fen = that.mypgn.getMove(0).fen;
                makeMove(that.currentMove, 0, fen);
            });
            $('#' + buttonsId + 'Last' ).on('click', function() {
                var fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            $('#' + buttonsId + 'Play').on('click', function() {
                timer.toggle();
                var playButton = $('#' + buttonsId + 'Play')[0];
                var clString = playButton.getAttribute('class');
                if (clString.indexOf('play') < 0) { // has the stop button
                    clString = clString.replace('stop', 'play');
                } else {
                    clString = clString.replace('play', 'stop');
                }
                playButton.setAttribute('class', clString);
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

        // Generates one move from the current position
        var generateMove = function(currentCounter, game, move, prevCounter, movesDiv) {
            // TODO Error handling if move could not be done
            var pgn_move = game.move(move.notation);
            var fen = game.fen();
            move.fen = fen;
            var span = document.createElement("span");
            span.setAttribute('class', "move");
            if (pgn_move.color == 'w') {
                span.setAttribute('class', "move white");
                var mn = move.moveNumber;
                var num = document.createElement('span');
                num.setAttribute('class', "moveNumber");
                num.appendChild(document.createTextNode("" + mn + ". "));
                span.appendChild(num);
            }
            if (move.commentBefore) { span.appendChild(generateCommentSpan(move.commentBefore))}
            var link = document.createElement('a');
            link.setAttribute('id', movesId + currentCounter);
            var text = document.createTextNode(pgn_move.san);
            link.appendChild(text);
            span.appendChild(link);
            span.appendChild(document.createTextNode(" "));
            if (move.commentAfter) { span.appendChild(generateCommentSpan(move.commentAfter))}
            movesDiv.appendChild(span);
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
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            prev = generateMove(i, game, move, prev, movesDiv);
        }
        bindFunctions();
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
        pgn: base.pgn
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
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

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    var generateHTML = function() {
        var divBoard = document.getElementById(boardId);
        if (divBoard == null) {
            return;
        }
        var innerBoardDiv = document.createElement("div");
        innerBoardDiv.setAttribute('id', innerBoardId);
        innerBoardDiv.setAttribute('class', theme);
        var movesDiv = document.createElement("div");
        movesDiv.setAttribute('id', movesId);
        movesDiv.setAttribute('class', "moves");
        divBoard.appendChild(innerBoardDiv);
        divBoard.appendChild(movesDiv);
    };
    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
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

        var generateCommentSpan = function(comment) {
            var span = document.createElement('span');
            span.setAttribute("class", "comment");
            span.appendChild(document.createTextNode(" " + comment + " "));
            return span;
        };
        // Generates one move from the current position
        var generateMove = function(i, game, move, movesDiv) {
            var pgn_move = game.move(move.notation);
            var fen = game.fen();
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
            if (move.commentBefore) { span.appendChild(generateCommentSpan(move.commentBefore))};
            var link = document.createElement('a');
            link.setAttribute('id', "move" + i);
            var text = document.createTextNode(pgn_move.san);
            link.appendChild(text);
            span.appendChild(link);
            span.appendChild(document.createTextNode(" "));
            if (move.commentAfter) { span.appendChild(generateCommentSpan(move.commentAfter))};
            movesDiv.appendChild(span);
            var currMoveSpan = $('#move' + i);
            currMoveSpan.on('click', function() {
                board.position(fen);
                if (that.currentMove) {
                    that.currentMove.removeClass();
                }
                currMoveSpan.addClass('yellow');
                that.currentMove = currMoveSpan;
            });
            return this;
        };

        // Start working with PGN, if available
//        if (! configuration.pgn) { return; }
        that.mypgn = pgnReader( { pgn: configuration.pgn ? configuration.pgn : ''} );
        var myMoves = that.mypgn.getMoves();
        game.reset();
        var movesDiv = document.getElementById(movesId);
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            generateMove(i, game, move, movesDiv);
        }
    };

    return {
        // PUBLIC API
        chess: game,
        getPgn: function() { return that.mypgn; },
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        clearHTML: clearHTML

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
        getPgn: base.getPgn
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
    base.generateHTML()
    var board = base.generateBoard();
};
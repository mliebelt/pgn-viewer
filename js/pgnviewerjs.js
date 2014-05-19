'use strict';

/**
 * This implements the PgnViewerJS that uses chessboardjs and chess.js as libraries.
 *
 * Configuration object for the board:
 * * position: FEN position for the start, default is 'start' for start position
 * * orientation: 'black' or 'white', default is 'black'
 * * showNotation: true or false, default is true
 * * pieceStyle: defines the pieces to use. Depending on the choosen pieces, the pieceTheme is definied
 * * pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 *
 */

var pgnView = function (boardId, configuration) {
    var that = {};
    var boardConfiguration = {};

    function localPath() {
        var jsFileLocation = $('script[src*=pgnviewerjs]').attr('src');  // the js file path
        return jsFileLocation.replace('pgnviewerjs.js', '');   // the js folder path
    }
    function copyBoardConfiguration(source, target, keys) {
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

    };
    var theme = configuration.theme || 'default';
    var game = new Chess();
    copyBoardConfiguration(configuration, boardConfiguration, ['position', 'orientation', 'showNotation', 'pieceTheme']);

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
    }();
    var board = new ChessBoard(innerBoardId, boardConfiguration);

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function() {
        // Generates one move from the current position
        var generateMove = function(i, game, move, movesDiv) {
            var pgn_move = game.move(move.notation);
            var fen = game.fen();
            var span = document.createElement("span");
            span.setAttribute('class', "move");
            if (pgn_move.color == 'w') {
                var mn = move.moveNumber;
                var num = document.createElement('span');
                num.setAttribute('class', "moveNumber");
                num.appendChild(document.createTextNode("" + mn + ". "));
                span.appendChild(num);
            }
            var link = document.createElement('a');
            link.setAttribute('id', "move" + i);
            var text = document.createTextNode(pgn_move.san);
            link.appendChild(text);
            span.appendChild(link);
            span.appendChild(document.createTextNode(" "));
            movesDiv.appendChild(span);
            $('#move' + i).on('click', function() {
                board.position(fen);
                if (that.currentMove) {
                    that.currentMove.removeClass();
                }
                $('#move' + i).addClass('yellow');
                that.currentMove = $('#move' + i);
            });
            return this;
        };

        // Start working with PGN, if available
        if (! configuration.pgn) { return; }
        that.mypgn = pgnReader( { pgn: configuration.pgn } );
        var myMoves = that.mypgn.getMoves();
        game.reset();
        var movesDiv = document.getElementById(movesId);
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            generateMove(i, game, move, movesDiv);
        }
    }();

    return {
        // PUBLIC API
        chess: function () { return game; },
        getPgn: function () { return that.mypgn; }
    }

}

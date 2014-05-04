/**
 * Created by Markus on 03.05.2014.
 * This implements the PgnViewerJS that uses chessboardjs and chess.js as libraries.
 *
 * Configuration object for the board:
 * * position: FEN position for the start, default is 'start' for start position
 * * orientation: 'black' or 'white', default is 'black'
 * * showNotation: true or false, default is true
 * * pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 */

function PgnViewer (boardId, configuration) {
    var pieceStyle = configuration.pieceStyle;
    var game = new Chess();
    if (pieceStyle == null) {
        pieceStyle = "wikipedia";
    }
    var myPieceStyles = ['case', 'chesscom', 'condal', 'leipzig', 'maya', 'merida'];
    if (myPieceStyles.indexOf(pieceStyle) >= 0) {
        configuration.pieceTheme = 'img/chesspieces/' + pieceStyle + '/{piece}.png';
    } else {
        configuration.pieceTheme = 'chessboardjs/img/chesspieces/' + pieceStyle + '/{piece}.png';
    }

    var innerBoardId = boardId + 'Inner';
    var movesId = boardId + 'Moves';

    var generateHTML = function() {
        var divBoard = document.getElementById(boardId);
        var innerBoardDiv = document.createElement("div");
        innerBoardDiv.setAttribute('id', innerBoardId);
        var movesDiv = document.createElement("div");
        movesDiv.setAttribute('id', movesId);
        movesDiv.setAttribute('class', "moves");
        divBoard.appendChild(innerBoardDiv);
        divBoard.appendChild(movesDiv);

    }();
    var board = new ChessBoard(innerBoardId, configuration);

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function() {
        // Generates one move from the current position
        var generateMove = function(i, game, move) {
            var pgn_move = game.move(move);
            var fen = game.fen();
            var span = document.createElement("span");
            span.setAttribute('class', "move");
            if (pgn_move.color == 'w') {
                num = document.createElement('span');
                num.setAttribute('class', "moveNumber");
                num.appendChild(document.createTextNode("1. "));
                span.appendChild(num);
            }
            var link = document.createElement('a');
            link.setAttribute('id', "move" + i);
            var text = document.createTextNode(pgn_move.san);
            link.appendChild(text);
            span.appendChild(link);
            span.appendChild(document.createTextNode(" "));
            var func = function() {
                board.position(fen);
            };
            return [span, func];
        };

        // Start working with PGN
        game.load_pgn(configuration.pgn);
        var myMoves = game.history();
        game.reset();
        var movesDiv = document.getElementById(movesId);
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            ret = generateMove(i, game, move);
            var html = ret[0];
            var func = ret[1];
            movesDiv.appendChild(html);
            $('#move' + i).on('click', func);
        }

    }();

}

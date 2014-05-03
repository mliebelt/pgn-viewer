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
    if (pieceStyle == null) {
        pieceStyle = "wikipedia";
    }
    configuration.pieceTheme = 'chessboardjs/img/chesspieces/' + pieceStyle + '/{piece}.png';
    this.board = new ChessBoard(boardId, configuration);
}

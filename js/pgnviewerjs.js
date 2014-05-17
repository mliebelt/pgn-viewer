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
            var pgn_move = game.move(move);
            var fen = game.fen();
            var span = document.createElement("span");
            span.setAttribute('class', "move");
            if (pgn_move.color == 'w') {
                var num = document.createElement('span');
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
            movesDiv.appendChild(span);
            $('#move' + i).on('click', function() {
                board.position(fen);
            });
            return this;
        };

        // Start working with PGN, if available
        if (! configuration.pgn) { return; }
        game.load_pgn(configuration.pgn);
        var myMoves = game.history();
        game.reset();
        var movesDiv = document.getElementById(movesId);
        for (var i = 0; i < myMoves.length; i++) {
            var move = myMoves[i];
            generateMove(i, game, move, movesDiv);
        }
    }();

    /** Copy of the orignal version, try to improve by the following aspects:
     *  Allow comments
    /*  Allow variations */
    var loadPgn = function(pgn_string) {
        function mask(str) {
            return str.replace(/\\/g, '\\');
        }

        /* convert a move from Standard Algebraic Notation (SAN) to 0x88
         * coordinates
         */
        function move_from_san(move) {
            var moves = generate_moves();
            for (var i = 0, len = moves.length; i < len; i++) {
                /* strip off any trailing move decorations: e.g Nf3+?! */
                if (move.replace(/[+#?!=]+$/,'') ==
                    move_to_san(moves[i]).replace(/[+#?!=]+$/,'')) {
                    return moves[i];
                }
            }
            return null;
        }

        function get_move_obj(move) {
            return move_from_san(trim(move));
        }

        function has_keys(object) {
            var has_keys = false;
            for (var key in object) {
                has_keys = true;
            }
            return has_keys;
        }

        function parse_pgn_header(header, options) {
            var newline_char = (typeof options === 'object' &&
                typeof options.newline_char === 'string') ?
                options.newline_char : '\r?\n';
            var header_obj = {};
            var headers = header.split(new RegExp(mask(newline_char)));
            var key = '';
            var value = '';

            for (var i = 0; i < headers.length; i++) {
                key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
                value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
                if (trim(key).length > 0) {
                    header_obj[key] = value;
                }
            }

            return header_obj;
        }

        var newline_char = (typeof options === 'object' &&
            typeof options.newline_char === 'string') ?
            options.newline_char : '\r?\n';
        var regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
            '(' + mask(newline_char) + ')*' +
            '1.(' + mask(newline_char) + '|.)*$', 'g');

        /* get header part of the PGN file */
        var header_string = pgn.replace(regex, '$1');

        /* no info part given, begins with moves */
        if (header_string[0] !== '[') {
            header_string = '';
        }

        reset();

        /* parse PGN header */
        var headers = parse_pgn_header(header_string, options);
        for (var key in headers) {
            set_header([key, headers[key]]);
        }

        /* delete header to get the moves */
        var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

        /* delete comments */
        ms = ms.replace(/(\{[^}]+\})+?/g, '');

        /* delete move numbers */
        ms = ms.replace(/\d+\./g, '');


        /* trim and get array of moves */
        var moves = trim(ms).split(new RegExp(/\s+/));

        /* delete empty entries */
        moves = moves.join(',').replace(/,,+/g, ',').split(',');
        var move = '';

        for (var half_move = 0; half_move < moves.length - 1; half_move++) {
            move = get_move_obj(moves[half_move]);

            /* move not possible! (don't clear the board to examine to show the
             * latest valid position)
             */
            if (move == null) {
                return false;
            } else {
                make_move(move);
            }
        }

        /* examine last move */
        move = moves[moves.length - 1];
        if (POSSIBLE_RESULTS.indexOf(move) > -1) {
            if (has_keys(header) && typeof header.Result === 'undefined') {
                set_header(['Result', move]);
            }
        }
        else {
            move = get_move_obj(move);
            if (move == null) {
                return false;
            } else {
                make_move(move);
            }
        }
        return true;
    };

    return {
        // PUBLIC API
        chess: function () {
            return game;
        }
    }

}

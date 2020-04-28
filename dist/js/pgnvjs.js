/*
 * Copyright (c) 2017, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

/* minified license below  */

/* @license
 * Copyright (c) 2017, Jeff Hlywa (jhlywa@gmail.com)
 * Released under the BSD license
 * https://github.com/jhlywa/chess.js/blob/master/LICENSE
 */

var Chess = function(fen) {

    /* jshint indent: false */

    var BLACK = 'b';
    var WHITE = 'w';

    var EMPTY = -1;

    var PAWN = 'p';
    var KNIGHT = 'n';
    var BISHOP = 'b';
    var ROOK = 'r';
    var QUEEN = 'q';
    var KING = 'k';

    var SYMBOLS = 'pnbrqkPNBRQK';

    var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

    var PAWN_OFFSETS = {
        b: [16, 32, 17, 15],
        w: [-16, -32, -17, -15]
    };

    var PIECE_OFFSETS = {
        n: [-18, -33, -31, -14,  18, 33, 31,  14],
        b: [-17, -15,  17,  15],
        r: [-16,   1,  16,  -1],
        q: [-17, -16, -15,   1,  17, 16, 15,  -1],
        k: [-17, -16, -15,   1,  17, 16, 15,  -1]
    };

    var ATTACKS = [
        20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
        0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
        0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
        0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
        0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
        0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
        0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
        0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
        0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
        20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
    ];

    var RAYS = [
        17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
        0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
        0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
        0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
        0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
        1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
        0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
        0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
        0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
        0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
        -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
    ];

    var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

    var FLAGS = {
        NORMAL: 'n',
        CAPTURE: 'c',
        BIG_PAWN: 'b',
        EP_CAPTURE: 'e',
        PROMOTION: 'p',
        KSIDE_CASTLE: 'k',
        QSIDE_CASTLE: 'q'
    };

    var BITS = {
        NORMAL: 1,
        CAPTURE: 2,
        BIG_PAWN: 4,
        EP_CAPTURE: 8,
        PROMOTION: 16,
        KSIDE_CASTLE: 32,
        QSIDE_CASTLE: 64
    };

    var RANK_1 = 7;
    var RANK_2 = 6;
    var RANK_3 = 5;
    var RANK_4 = 4;
    var RANK_5 = 3;
    var RANK_6 = 2;
    var RANK_7 = 1;
    var RANK_8 = 0;

    var SQUARES = {
        a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
        a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
        a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
        a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
        a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
        a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
        a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
        a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
    };

    var board = new Array(128);
    var kings = {w: EMPTY, b: EMPTY};
    var rooks = {w: [], b: []};
    var turn = WHITE;
    var castling = {w: 0, b: 0};
    var ep_square = EMPTY;
    var half_moves = 0;
    var move_number = 1;
    var history = [];
    var header = {};

    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined') {
        load(DEFAULT_POSITION);
    } else {
        load(fen);
    }

    function clear(keep_headers) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false;
        }

        board = new Array(128);
        kings = {w: EMPTY, b: EMPTY};
        turn = WHITE;
        castling = {w: 0, b: 0};
        ep_square = EMPTY;
        half_moves = 0;
        move_number = 1;
        history = [];
        if (!keep_headers) header = {};
        update_setup(generate_fen());
    }

    function reset() {
        load(DEFAULT_POSITION);
    }

    function load(fen, keep_headers) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false;
        }

        var tokens = fen.split(/\s+/);
        var position = tokens[0];
        var square = 0;

        if (!validate_fen(fen).valid) {
            return false;
        }

        clear(keep_headers);

        for (var i = 0; i < position.length; i++) {
            var piece = position.charAt(i);

            if (piece === '/') {
                square += 8;
            } else if (is_digit(piece)) {
                square += parseInt(piece, 10);
            } else {
                var color = (piece < 'a') ? WHITE : BLACK;
                put({type: piece.toLowerCase(), color: color}, algebraic(square));
                square++;
            }
        }

        turn = tokens[1];

        rooks = {w: [], b: []};

        if (tokens[2].indexOf('K') > -1) {
            castling.w |= BITS.KSIDE_CASTLE;
            for (var sq = SQUARES.h1; sq >= SQUARES.c1; --sq) {
                if (is_rook(board[sq], WHITE)) {
                    rooks[WHITE].push({square: sq, flag: BITS.KSIDE_CASTLE});
                    break;
                }
            }
        }
        if (tokens[2].indexOf('Q') > -1) {
            castling.w |= BITS.QSIDE_CASTLE;
            for (var sq = SQUARES.a1; sq <= SQUARES.g1; ++sq) {
                if (is_rook(board[sq], WHITE)) {
                    rooks[WHITE].push({square: sq, flag: BITS.QSIDE_CASTLE});
                    break;
                }
            }
        }
        var white_frc_columns = tokens[2].match(/[A-H]/g);
        var i, flag;
        if (white_frc_columns !== null) {
            for (i = 0; i < white_frc_columns.length; ++i) {
                var sq = SQUARES.a1 + (white_frc_columns[0].charCodeAt(0) - "A".charCodeAt(0));
                flag = sq < kings[WHITE] ? BITS.QSIDE_CASTLE : BITS.KSIDE_CASTLE;
                castling.w |= flag;
                rooks[WHITE].push({square: sq, flag: flag});
            }
        }

        if (tokens[2].indexOf('k') > -1) {
            castling.b |= BITS.KSIDE_CASTLE;
            for (var sq = SQUARES.h8; sq >= SQUARES.c8; --sq) {
                if (is_rook(board[sq], BLACK)) {
                    rooks[BLACK].push({square: sq, flag: BITS.KSIDE_CASTLE});
                    break;
                }
            }
        }
        if (tokens[2].indexOf('q') > -1) {
            castling.b |= BITS.QSIDE_CASTLE;
            for (var sq = SQUARES.a8; sq <= SQUARES.g8; ++sq) {
                if (is_rook(board[sq], BLACK)) {
                    rooks[BLACK].push({square: sq, flag: BITS.QSIDE_CASTLE});
                    break;
                }
            }
        }
        var black_frc_columns = tokens[2].match(/[a-h]/g);
        if (black_frc_columns !== null) {
            for (i = 0; i < black_frc_columns.length; ++i) {
                var sq = SQUARES.a1 + (black_frc_columns[0].charCodeAt(0) - "A".charCodeAt(0));
                flag = sq < kings[BLACK] ? BITS.QSIDE_CASTLE : BITS.KSIDE_CASTLE;
                castling.b |= flag;
                rooks[BLACK].push({square: sq, flag: flag});
            }
        }

        ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
        half_moves = parseInt(tokens[4], 10);
        move_number = parseInt(tokens[5], 10);

        update_setup(generate_fen());

        return true;
    }

    /* TODO: this function is pretty much crap - it validates structure but
     * completely ignores content (e.g. doesn't verify that each side has a king)
     * ... we should rewrite this, and ditch the silly error_number field while
     * we're at it
     */
    function validate_fen(fen) {
        var errors = {
            0: 'No errors.',
            1: 'FEN string must contain six space-delimited fields.',
            2: '6th field (move number) must be a positive integer.',
            3: '5th field (half move counter) must be a non-negative integer.',
            4: '4th field (en-passant square) is invalid.',
            5: '3rd field (castling availability) is invalid.',
            6: '2nd field (side to move) is invalid.',
            7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
            8: '1st field (piece positions) is invalid [consecutive numbers].',
            9: '1st field (piece positions) is invalid [invalid piece].',
            10: '1st field (piece positions) is invalid [row too large].',
            11: 'Illegal en-passant square',
        };

        /* 1st criterion: 6 space-seperated fields? */
        var tokens = fen.split(/\s+/);
        if (tokens.length !== 6) {
            return {valid: false, error_number: 1, error: errors[1]};
        }

        /* 2nd criterion: move number field is a integer value > 0? */
        if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
            return {valid: false, error_number: 2, error: errors[2]};
        }

        /* 3rd criterion: half move counter is an integer >= 0? */
        if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
            return {valid: false, error_number: 3, error: errors[3]};
        }

        /* 4th criterion: 4th field is a valid e.p.-string? */
        if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
            return {valid: false, error_number: 4, error: errors[4]};
        }

        /* 5th criterion: 3th field is a valid castle-string? */
        if( !/^[C-HK]?[A-FQ]?[c-hk]?[a-fq]?$/.test(tokens[2]) &&
            tokens[2] !== '-') {
            return {valid: false, error_number: 5, error: errors[5]};
        }

        /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
        if (!/^(w|b)$/.test(tokens[1])) {
            return {valid: false, error_number: 6, error: errors[6]};
        }

        /* 7th criterion: 1st field contains 8 rows? */
        var rows = tokens[0].split('/');
        if (rows.length !== 8) {
            return {valid: false, error_number: 7, error: errors[7]};
        }

        /* 8th criterion: every row is valid? */
        for (var i = 0; i < rows.length; i++) {
            /* check for right sum of fields AND not two numbers in succession */
            var sum_fields = 0;
            var previous_was_number = false;

            for (var k = 0; k < rows[i].length; k++) {
                if (!isNaN(rows[i][k])) {
                    if (previous_was_number) {
                        return {valid: false, error_number: 8, error: errors[8]};
                    }
                    sum_fields += parseInt(rows[i][k], 10);
                    previous_was_number = true;
                } else {
                    if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
                        return {valid: false, error_number: 9, error: errors[9]};
                    }
                    sum_fields += 1;
                    previous_was_number = false;
                }
            }
            if (sum_fields !== 8) {
                return {valid: false, error_number: 10, error: errors[10]};
            }
        }

        if ((tokens[3][1] == '3' && tokens[1] == 'w') ||
            (tokens[3][1] == '6' && tokens[1] == 'b')) {
            return {valid: false, error_number: 11, error: errors[11]};
        }

        /* everything's okay! */
        return {valid: true, error_number: 0, error: errors[0]};
    }

    function generate_fen() {
        var empty = 0;
        var fen = '';

        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            if (board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                var color = board[i].color;
                var piece = board[i].type;

                fen += (color === WHITE) ?
                    piece.toUpperCase() : piece.toLowerCase();
            }

            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                }

                if (i !== SQUARES.h1) {
                    fen += '/';
                }

                empty = 0;
                i += 8;
            }
        }

        var cflags = '';
        var sq;
        if (castling[WHITE] & BITS.KSIDE_CASTLE) {
            sq = search_rook(board, WHITE, BITS.KSIDE_CASTLE);
            if (is_outermost_rook(board, WHITE, BITS.KSIDE_CASTLE, sq)) {
                cflags += 'K';
            } else {
                cflags += 'ABCDEFGH'.substring(file(sq), file(sq) + 1);
            }
        }
        if (castling[WHITE] & BITS.QSIDE_CASTLE) {
            sq = search_rook(board, WHITE, BITS.QSIDE_CASTLE);
            if (is_outermost_rook(board, WHITE, BITS.QSIDE_CASTLE, sq)) {
                cflags += 'Q';
            } else {
                cflags += 'ABCDEFGH'.substring(file(sq), file(sq) + 1);
            }
        }
        if (castling[BLACK] & BITS.KSIDE_CASTLE) {
            sq = search_rook(board, BLACK, BITS.KSIDE_CASTLE);
            if (is_outermost_rook(board, BLACK, BITS.KSIDE_CASTLE, sq)) {
                cflags += 'k';
            } else {
                cflags += 'abcdefgh'.substring(file(sq), file(sq) + 1);
            }
        }
        if (castling[BLACK] & BITS.QSIDE_CASTLE) {
            sq = search_rook(board, BLACK, BITS.QSIDE_CASTLE);
            if (is_outermost_rook(board, BLACK, BITS.QSIDE_CASTLE, sq)) {
                cflags += 'q';
            } else {
                cflags += 'abcdefgh'.substring(file(sq), file(sq) + 1);
            }
        }

        /* do we have an empty castling flag? */
        cflags = cflags || '-';
        var epflags = (ep_square === EMPTY) ? '-' : algebraic(ep_square);

        return [fen, turn, cflags, epflags, half_moves, move_number].join(' ');
    }

    function set_header(args) {
        for (var i = 0; i < args.length; i += 2) {
            if (typeof args[i] === 'string' &&
                typeof args[i + 1] === 'string') {
                header[args[i]] = args[i + 1];
            }
        }
        return header;
    }

    /* called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object.  if the FEN is
     * equal to the default position, the SetUp and FEN are deleted
     * the setup is only updated if history.length is zero, ie moves haven't been
     * made.
     */
    function update_setup(fen) {
        if (history.length > 0) return;

        if (fen !== DEFAULT_POSITION) {
            header['SetUp'] = '1';
            header['FEN'] = fen;
        } else {
            delete header['SetUp'];
            delete header['FEN'];
        }
    }

    function get(square) {
        var piece = board[SQUARES[square]];
        return (piece) ? {type: piece.type, color: piece.color} : null;
    }

    function put(piece, square) {
        /* check for valid piece object */
        if (!('type' in piece && 'color' in piece)) {
            return false;
        }

        /* check for piece */
        if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            return false;
        }

        /* check for valid square */
        if (!(square in SQUARES)) {
            return false;
        }

        var sq = SQUARES[square];

        /* don't let the user place more than one king */
        if (piece.type == KING &&
            !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
            return false;
        }

        board[sq] = {type: piece.type, color: piece.color};
        if (piece.type === KING) {
            kings[piece.color] = sq;
        }

        update_setup(generate_fen());

        return true;
    }

    function remove(square) {
        var piece = get(square);
        board[SQUARES[square]] = null;
        if (piece && piece.type === KING) {
            kings[piece.color] = EMPTY;
        }

        update_setup(generate_fen());

        return piece;
    }

    function build_move(board, from, to, flags, promotion, rook_sq) {
        var move = {
            color: turn,
            from: from,
            to: to,
            flags: flags,
            piece: board[from].type
        };

        if (promotion) {
            move.flags |= BITS.PROMOTION;
            move.promotion = promotion;
        }

        if (flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            move.rook_sq = rook_sq;   // remember the position of the rook
        } else if (board[to]) {
            move.captured = board[to].type;
        } else if (flags & BITS.EP_CAPTURE) {
            move.captured = PAWN;
        }
        return move;
    }

    function generate_moves(options) {
        function add_move(board, moves, from, to, flags, rook_sq) {
            /* if pawn promotion */
            if (board[from].type === PAWN &&
                (rank(to) === RANK_8 || rank(to) === RANK_1)) {
                var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
                for (var i = 0, len = pieces.length; i < len; i++) {
                    moves.push(build_move(board, from, to, flags, pieces[i]));
                }
            } else {
                moves.push(build_move(board, from, to, flags, undefined, rook_sq));
            }
        }

        function check_castle(board, king_from, king_to, rook_from, rook_to, them) {
            var sq;

            // Check that no pieces are standing between the king and its destination
            // square, and also between the rook and its destination square.
            var king_left = Math.min(king_from, king_to);
            var king_right = Math.max(king_from, king_to);
            var left = Math.min(king_left, Math.min(rook_from, rook_to));
            var right = Math.max(king_right, Math.max(rook_from, rook_to));
            for (sq = left; sq <= right; ++sq) {
                if (sq != king_from && sq != rook_from && board[sq]) {
                    return false;
                }
            }

            // Check that none of the squares on the king's way are under attack.
            for (sq = king_left; sq <= king_right; ++sq) {
                if (attacked(them, sq)) {
                    return false;
                }
            }

            return true;
        }

        var moves = [];
        var us = turn;
        var them = swap_color(us);
        var second_rank = {b: RANK_7, w: RANK_2};

        var first_sq = SQUARES.a8;
        var last_sq = SQUARES.h1;
        var single_square = false;

        /* do we want legal moves? */
        var legal = (typeof options !== 'undefined' && 'legal' in options) ?
            options.legal : true;

        /* are we generating moves for a single square? */
        if (typeof options !== 'undefined' && 'square' in options) {
            if (options.square in SQUARES) {
                first_sq = last_sq = SQUARES[options.square];
                single_square = true;
            } else {
                /* invalid square */
                return [];
            }
        }

        for (var i = first_sq; i <= last_sq; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) { i += 7; continue; }

            var piece = board[i];
            if (piece == null || piece.color !== us) {
                continue;
            }

            if (piece.type === PAWN) {
                /* single square, non-capturing */
                var square = i + PAWN_OFFSETS[us][0];
                if (board[square] == null) {
                    add_move(board, moves, i, square, BITS.NORMAL);

                    /* double square */
                    var square = i + PAWN_OFFSETS[us][1];
                    if (second_rank[us] === rank(i) && board[square] == null) {
                        add_move(board, moves, i, square, BITS.BIG_PAWN);
                    }
                }

                /* pawn captures */
                for (j = 2; j < 4; j++) {
                    var square = i + PAWN_OFFSETS[us][j];
                    if (square & 0x88) continue;

                    if (board[square] != null &&
                        board[square].color === them) {
                        add_move(board, moves, i, square, BITS.CAPTURE);
                    } else if (square === ep_square) {
                        add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
                    }
                }
            } else {
                for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
                    var offset = PIECE_OFFSETS[piece.type][j];
                    var square = i;

                    while (true) {
                        square += offset;
                        if (square & 0x88) break;

                        if (board[square] == null) {
                            add_move(board, moves, i, square, BITS.NORMAL);
                        } else {
                            if (board[square].color === us) break;
                            add_move(board, moves, i, square, BITS.CAPTURE);
                            break;
                        }

                        /* break, if knight or king */
                        if (piece.type === 'n' || piece.type === 'k') break;
                    }
                }
            }
        }

        /* check for castling if: a) we're generating all moves, or b) we're doing
         * single square move generation on the king's square
         */
        if ((!single_square) || last_sq === kings[us]) {
            /* king-side castling */
            if (castling[us] & BITS.KSIDE_CASTLE) {
                var king_from = kings[us];
                var king_to = us === WHITE ? SQUARES.g1 : SQUARES.g8;
                var rook_from = search_rook(board, us, BITS.KSIDE_CASTLE);
                var rook_to = king_to - 1;

                if (check_castle(board, king_from, king_to, rook_from, rook_to, them)) {
                    add_move(board, moves, king_from, king_to, BITS.KSIDE_CASTLE, rook_from);
                }
            }

            /* queen-side castling */
            if (castling[us] & BITS.QSIDE_CASTLE) {
                var king_from = kings[us];
                var king_to = us === WHITE ? SQUARES.c1 : SQUARES.c8;
                var rook_from = search_rook(board, us, BITS.QSIDE_CASTLE);
                var rook_to = king_to + 1;

                if (check_castle(board, king_from, king_to, rook_from, rook_to, them)) {
                    add_move(board, moves, king_from, king_to, BITS.QSIDE_CASTLE, rook_from);
                }
            }
        }

        /* return all pseudo-legal moves (this includes moves that allow the king
         * to be captured)
         */
        if (!legal) {
            return moves;
        }

        /* filter out illegal moves */
        var legal_moves = [];
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            if (!king_attacked(us)) {
                legal_moves.push(moves[i]);
            }
            undo_move();
        }

        return legal_moves;
    }

    function is_rook(piece, color) {
        return (typeof piece !== 'undefined' && piece !== null &&
            piece.type === ROOK && piece.color == color);
    }

    function search_rook(board, us, flag) {
        for (var i = 0, len = rooks[us].length; i < len; i++) {
            if (flag & rooks[us][i].flag) {
                return rooks[us][i].square;
            }
        }
        return null;
    }

    function is_outermost_rook(board, us, flag, sq) {
        var end_sq;
        if (flag == BITS.KSIDE_CASTLE) {
            var end_sq = (us == WHITE) ? SQUARES.h1 : SQUARES.h8;
            while (++sq <= end_sq) {
                if (is_rook(board[sq], us)) {
                    return false;
                }
            }
        } else {
            var end_sq = (us == WHITE) ? SQUARES.a1 : SQUARES.a8;
            while (--sq >= end_sq) {
                if (is_rook(board[sq], us)) {
                    return false;
                }
            }
        }
        return true;
    }

    /* convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} sloppy Use the sloppy SAN generator to work around over
     * disambiguation bugs in Fritz and Chessbase.  See below:
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    function move_to_san(move, sloppy) {

        var output = '';

        if (move.flags & BITS.KSIDE_CASTLE) {
            output = 'O-O';
        } else if (move.flags & BITS.QSIDE_CASTLE) {
            output = 'O-O-O';
        } else {
            var disambiguator = get_disambiguator(move, sloppy);

            if (move.piece !== PAWN) {
                output += move.piece.toUpperCase() + disambiguator;
            }

            if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
                if (move.piece === PAWN) {
                    output += algebraic(move.from)[0];
                }
                output += 'x';
            }

            output += algebraic(move.to);

            if (move.flags & BITS.PROMOTION) {
                output += '=' + move.promotion.toUpperCase();
            }
        }

        make_move(move);
        if (in_check()) {
            if (in_checkmate()) {
                output += '#';
            } else {
                output += '+';
            }
        }
        undo_move();

        return output;
    }

    // parses all of the decorators out of a SAN string
    function stripped_san(move) {
        return move.replace(/=/,'').replace(/[+#]?[?!]*$/,'');
    }

    function attacked(color, square) {
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) { i += 7; continue; }

            /* if empty square or wrong color */
            if (board[i] == null || board[i].color !== color) continue;

            var piece = board[i];
            var difference = i - square;
            var index = difference + 119;

            if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
                if (piece.type === PAWN) {
                    if (difference > 0) {
                        if (piece.color === WHITE) return true;
                    } else {
                        if (piece.color === BLACK) return true;
                    }
                    continue;
                }

                /* if the piece is a knight or a king */
                if (piece.type === 'n' || piece.type === 'k') return true;

                var offset = RAYS[index];
                var j = i + offset;

                var blocked = false;
                while (j !== square) {
                    if (board[j] != null) { blocked = true; break; }
                    j += offset;
                }

                if (!blocked) return true;
            }
        }

        return false;
    }

    function king_attacked(color) {
        return attacked(swap_color(color), kings[color]);
    }

    function in_check() {
        return king_attacked(turn);
    }

    function in_checkmate() {
        return in_check() && generate_moves().length === 0;
    }

    function in_stalemate() {
        return !in_check() && generate_moves().length === 0;
    }

    function insufficient_material() {
        var pieces = {};
        var bishops = [];
        var num_pieces = 0;
        var sq_color = 0;

        for (var i = SQUARES.a8; i<= SQUARES.h1; i++) {
            sq_color = (sq_color + 1) % 2;
            if (i & 0x88) { i += 7; continue; }

            var piece = board[i];
            if (piece) {
                pieces[piece.type] = (piece.type in pieces) ?
                    pieces[piece.type] + 1 : 1;
                if (piece.type === BISHOP) {
                    bishops.push(sq_color);
                }
                num_pieces++;
            }
        }

        /* k vs. k */
        if (num_pieces === 2) { return true; }

        /* k vs. kn .... or .... k vs. kb */
        else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
            pieces[KNIGHT] === 1)) { return true; }

        /* kb vs. kb where any number of bishops are all on the same color */
        else if (num_pieces === pieces[BISHOP] + 2) {
            var sum = 0;
            var len = bishops.length;
            for (var i = 0; i < len; i++) {
                sum += bishops[i];
            }
            if (sum === 0 || sum === len) { return true; }
        }

        return false;
    }

    function in_threefold_repetition() {
        /* TODO: while this function is fine for casual use, a better
         * implementation would use a Zobrist key (instead of FEN). the
         * Zobrist key would be maintained in the make_move/undo_move functions,
         * avoiding the costly that we do below.
         */
        var moves = [];
        var positions = {};
        var repetition = false;

        while (true) {
            var move = undo_move();
            if (!move) break;
            moves.push(move);
        }

        while (true) {
            /* remove the last two fields in the FEN string, they're not needed
             * when checking for draw by rep */
            var fen = generate_fen().split(' ').slice(0,4).join(' ');

            /* has the position occurred three or move times */
            positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
            if (positions[fen] >= 3) {
                repetition = true;
            }

            if (!moves.length) {
                break;
            }
            make_move(moves.pop());
        }

        return repetition;
    }

    function push(move) {
        history.push({
            move: move,
            kings: {b: kings.b, w: kings.w},
            turn: turn,
            castling: {b: castling.b, w: castling.w},
            ep_square: ep_square,
            half_moves: half_moves,
            move_number: move_number
        });
    }

    function make_move(move) {
        var us = turn;
        var them = swap_color(us);
        var old_to = board[move.to];
        push(move);

        board[move.to] = board[move.from];
        board[move.from] = null;

        /* if ep capture, remove the captured pawn */
        if (move.flags & BITS.EP_CAPTURE) {
            if (turn === BLACK) {
                board[move.to - 16] = null;
            } else {
                board[move.to + 16] = null;
            }
        }

        /* if pawn promotion, replace with new piece */
        if (move.flags & BITS.PROMOTION) {
            board[move.to] = {type: move.promotion, color: us};
        }

        /* if we moved the king */
        if (board[move.to].type === KING) {
            kings[board[move.to].color] = move.to;

            /* if we castled, move the rook next to the king */
            if (move.flags & BITS.KSIDE_CASTLE) {
                var castling_to = move.to - 1;
                var castling_from = move.rook_sq;
                board[castling_to] = old_to===null ? board[castling_from] : old_to;
                if(castling_from !== move.to)
                    board[castling_from] = null;
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                var castling_to = move.to + 1;
                var castling_from = move.rook_sq;
                board[castling_to] = old_to===null ? board[castling_from] : old_to;
                if(castling_from !== move.to)
                    board[castling_from] = null;
            }

            /* turn off castling */
            castling[us] = '';
        }

        /* turn off castling if we move a rook */
        if (castling[us]) {
            for (var i = 0, len = rooks[us].length; i < len; i++) {
                if (move.from === rooks[us][i].square &&
                    castling[us] & rooks[us][i].flag) {
                    castling[us] ^= rooks[us][i].flag;
                    break;
                }
            }
        }

        /* turn off castling if we capture a rook */
        if (castling[them]) {
            for (var i = 0, len = rooks[them].length; i < len; i++) {
                if (move.to === rooks[them][i].square &&
                    castling[them] & rooks[them][i].flag) {
                    castling[them] ^= rooks[them][i].flag;
                    break;
                }
            }
        }

        /* if big pawn move, update the en passant square */
        if (move.flags & BITS.BIG_PAWN) {
            if (turn === 'b') {
                ep_square = move.to - 16;
            } else {
                ep_square = move.to + 16;
            }
        } else {
            ep_square = EMPTY;
        }

        /* reset the 50 move counter if a pawn is moved or a piece is captured */
        if (move.piece === PAWN) {
            half_moves = 0;
        } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            half_moves = 0;
        } else {
            half_moves++;
        }

        if (turn === BLACK) {
            move_number++;
        }
        turn = swap_color(turn);
    }

    function undo_move() {
        var old = history.pop();
        if (old == null) { return null; }

        var move = old.move;
        kings = old.kings;
        turn = old.turn;
        castling = old.castling;
        ep_square = old.ep_square;
        half_moves = old.half_moves;
        move_number = old.move_number;

        var us = turn;
        var them = swap_color(turn);

        var old_from = board[move.from];

        board[move.from] = board[move.to];
        board[move.from].type = move.piece;  // to undo any promotions
        board[move.to] = null;

        if (move.flags & BITS.CAPTURE) {
            board[move.to] = {type: move.captured, color: them};
        } else if (move.flags & BITS.EP_CAPTURE) {
            var index;
            if (us === BLACK) {
                index = move.to - 16;
            } else {
                index = move.to + 16;
            }
            board[index] = {type: PAWN, color: them};
        }


        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            var castling_to, castling_from;
            if (move.flags & BITS.KSIDE_CASTLE) {
                castling_to = move.rook_sq;
                castling_from = move.to - 1;
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                castling_to = move.rook_sq;
                castling_from = move.to + 1;
            }

            board[castling_to] = old_from===null ? board[castling_from] : old_from;
            if(castling_from !== move.from)
                board[castling_from] = null;
        }

        return move;
    }

    /* this function is used to uniquely identify ambiguous moves */
    function get_disambiguator(move, sloppy) {
        var moves = generate_moves({legal: !sloppy});

        var from = move.from;
        var to = move.to;
        var piece = move.piece;

        var ambiguities = 0;
        var same_rank = 0;
        var same_file = 0;

        for (var i = 0, len = moves.length; i < len; i++) {
            var ambig_from = moves[i].from;
            var ambig_to = moves[i].to;
            var ambig_piece = moves[i].piece;

            /* if a move of the same piece type ends on the same to square, we'll
             * need to add a disambiguator to the algebraic notation
             */
            if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
                ambiguities++;

                if (rank(from) === rank(ambig_from)) {
                    same_rank++;
                }

                if (file(from) === file(ambig_from)) {
                    same_file++;
                }
            }
        }

        if (ambiguities > 0) {
            /* if there exists a similar moving piece on the same rank and file as
             * the move in question, use the square as the disambiguator
             */
            if (same_rank > 0 && same_file > 0) {
                return algebraic(from);
            }
            /* if the moving piece rests on the same file, use the rank symbol as the
             * disambiguator
             */
            else if (same_file > 0) {
                return algebraic(from).charAt(1);
            }
            /* else use the file symbol */
            else {
                return algebraic(from).charAt(0);
            }
        }

        return '';
    }

    function ascii() {
        var s = '   +------------------------+\n';
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            /* display the rank */
            if (file(i) === 0) {
                s += ' ' + '87654321'[rank(i)] + ' |';
            }

            /* empty piece */
            if (board[i] == null) {
                s += ' . ';
            } else {
                var piece = board[i].type;
                var color = board[i].color;
                var symbol = (color === WHITE) ?
                    piece.toUpperCase() : piece.toLowerCase();
                s += ' ' + symbol + ' ';
            }

            if ((i + 1) & 0x88) {
                s += '|\n';
                i += 8;
            }
        }
        s += '   +------------------------+\n';
        s += '     a  b  c  d  e  f  g  h\n';

        return s;
    }

    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    function move_from_san(move, sloppy) {
        // strip off any move decorations: e.g Nf3+?!
        var clean_move = stripped_san(move);

        // if we're using the sloppy parser run a regex to grab piece, to, and from
        // this should parse invalid SAN like: Pe2-e4, Rc1c4, Qf3xf7
        if (sloppy) {
            var matches = clean_move.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
            if (matches) {
                var piece = matches[1];
                var from = matches[2];
                var to = matches[3];
                var promotion = matches[4];
            }
        }

        var moves = generate_moves();
        for (var i = 0, len = moves.length; i < len; i++) {
            // try the strict parser first, then the sloppy parser if requested
            // by the user
            if ((clean_move === stripped_san(move_to_san(moves[i]))) ||
                (sloppy && clean_move === stripped_san(move_to_san(moves[i], true)))) {
                return moves[i];
            } else {
                if (matches &&
                    (!piece || piece.toLowerCase() == moves[i].piece) &&
                    SQUARES[from] == moves[i].from &&
                    SQUARES[to] == moves[i].to &&
                    (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
                    return moves[i];
                }
            }
        }

        return null;
    }


    /*****************************************************************************
     * UTILITY FUNCTIONS
     ****************************************************************************/
    function rank(i) {
        return i >> 4;
    }

    function file(i) {
        return i & 15;
    }

    function algebraic(i){
        var f = file(i), r = rank(i);
        return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
    }

    function swap_color(c) {
        return c === WHITE ? BLACK : WHITE;
    }

    function is_digit(c) {
        return '0123456789'.indexOf(c) !== -1;
    }

    /* pretty = external move object */
    function make_pretty(ugly_move) {
        var move = clone(ugly_move);
        move.san = move_to_san(move, false);
        move.to = algebraic(move.to);
        move.from = algebraic(move.from);

        var flags = '';

        for (var flag in BITS) {
            if (BITS[flag] & move.flags) {
                flags += FLAGS[flag];
            }
        }
        move.flags = flags;

        return move;
    }

    function clone(obj) {
        var dupe = (obj instanceof Array) ? [] : {};

        for (var property in obj) {
            if (typeof property === 'object') {
                dupe[property] = clone(obj[property]);
            } else {
                dupe[property] = obj[property];
            }
        }

        return dupe;
    }

    function trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    /*****************************************************************************
     * DEBUGGING UTILITIES
     ****************************************************************************/
    function perft(depth) {
        var moves = generate_moves({legal: false});
        var nodes = 0;
        var color = turn;

        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            if (!king_attacked(color)) {
                if (depth - 1 > 0) {
                    var child_nodes = perft(depth - 1);
                    nodes += child_nodes;
                } else {
                    nodes++;
                }
            }
            undo_move();
        }

        return nodes;
    }

    return {
        /***************************************************************************
         * PUBLIC CONSTANTS (is there a better way to do this?)
         **************************************************************************/
        WHITE: WHITE,
        BLACK: BLACK,
        PAWN: PAWN,
        KNIGHT: KNIGHT,
        BISHOP: BISHOP,
        ROOK: ROOK,
        QUEEN: QUEEN,
        KING: KING,
        SQUARES: (function() {
            /* from the ECMA-262 spec (section 12.6.4):
             * "The mechanics of enumerating the properties ... is
             * implementation dependent"
             * so: for (var sq in SQUARES) { keys.push(sq); } might not be
             * ordered correctly
             */
            var keys = [];
            for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                if (i & 0x88) { i += 7; continue; }
                keys.push(algebraic(i));
            }
            return keys;
        })(),
        FLAGS: FLAGS,

        /***************************************************************************
         * PUBLIC API
         **************************************************************************/
        load: function(fen) {
            return load(fen);
        },

        reset: function() {
            return reset();
        },

        moves: function(options) {
            /* The internal representation of a chess move is in 0x88 format, and
             * not meant to be human-readable.  The code below converts the 0x88
             * square coordinates to algebraic coordinates.  It also prunes an
             * unnecessary move keys resulting from a verbose call.
             */

            var ugly_moves = generate_moves(options);
            var moves = [];

            for (var i = 0, len = ugly_moves.length; i < len; i++) {

                /* does the user want a full move object (most likely not), or just
                 * SAN
                 */
                if (typeof options !== 'undefined' && 'verbose' in options &&
                    options.verbose) {
                    moves.push(make_pretty(ugly_moves[i]));
                } else {
                    moves.push(move_to_san(ugly_moves[i], false));
                }
            }

            return moves;
        },

        in_check: function() {
            return in_check();
        },

        in_checkmate: function() {
            return in_checkmate();
        },

        in_stalemate: function() {
            return in_stalemate();
        },

        in_draw: function() {
            return half_moves >= 100 ||
                in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition();
        },

        insufficient_material: function() {
            return insufficient_material();
        },

        in_threefold_repetition: function() {
            return in_threefold_repetition();
        },

        game_over: function() {
            return half_moves >= 100 ||
                in_checkmate() ||
                in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition();
        },

        validate_fen: function(fen) {
            return validate_fen(fen);
        },

        fen: function() {
            return generate_fen();
        },

        board: function() {
            var output = [],
                row    = [];

            for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                if (board[i] == null) {
                    row.push(null)
                } else {
                    row.push({type: board[i].type, color: board[i].color})
                }
                if ((i + 1) & 0x88) {
                    output.push(row);
                    row = []
                    i += 8;
                }
            }

            return output;
        },

        pgn: function(options) {
            /* using the specification from http://www.chessclub.com/help/PGN-spec
             * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
             */
            var newline = (typeof options === 'object' &&
                typeof options.newline_char === 'string') ?
                options.newline_char : '\n';
            var max_width = (typeof options === 'object' &&
                typeof options.max_width === 'number') ?
                options.max_width : 0;
            var result = [];
            var header_exists = false;

            /* add the PGN header headerrmation */
            for (var i in header) {
                /* TODO: order of enumerated properties in header object is not
                 * guaranteed, see ECMA-262 spec (section 12.6.4)
                 */
                result.push('[' + i + ' \"' + header[i] + '\"]' + newline);
                header_exists = true;
            }

            if (header_exists && history.length) {
                result.push(newline);
            }

            /* pop all of history onto reversed_history */
            var reversed_history = [];
            while (history.length > 0) {
                reversed_history.push(undo_move());
            }

            var moves = [];
            var move_string = '';

            /* build the list of moves.  a move_string looks like: "3. e3 e6" */
            while (reversed_history.length > 0) {
                var move = reversed_history.pop();

                /* if the position started with black to move, start PGN with 1. ... */
                if (!history.length && move.color === 'b') {
                    move_string = move_number + '. ...';
                } else if (move.color === 'w') {
                    /* store the previous generated move_string if we have one */
                    if (move_string.length) {
                        moves.push(move_string);
                    }
                    move_string = move_number + '.';
                }

                move_string = move_string + ' ' + move_to_san(move, false);
                make_move(move);
            }

            /* are there any other leftover moves? */
            if (move_string.length) {
                moves.push(move_string);
            }

            /* is there a result? */
            if (typeof header.Result !== 'undefined') {
                moves.push(header.Result);
            }

            /* history should be back to what is was before we started generating PGN,
             * so join together moves
             */
            if (max_width === 0) {
                return result.join('') + moves.join(' ');
            }

            /* wrap the PGN output at max_width */
            var current_width = 0;
            for (var i = 0; i < moves.length; i++) {
                /* if the current move will push past max_width */
                if (current_width + moves[i].length > max_width && i !== 0) {

                    /* don't end the line with whitespace */
                    if (result[result.length - 1] === ' ') {
                        result.pop();
                    }

                    result.push(newline);
                    current_width = 0;
                } else if (i !== 0) {
                    result.push(' ');
                    current_width++;
                }
                result.push(moves[i]);
                current_width += moves[i].length;
            }

            return result.join('');
        },

        load_pgn: function(pgn, options) {
            // allow the user to specify the sloppy move parser to work around over
            // disambiguation bugs in Fritz and Chessbase
            var sloppy = (typeof options !== 'undefined' && 'sloppy' in options) ?
                options.sloppy : false;

            function mask(str) {
                return str.replace(/\\/g, '\\');
            }

            function has_keys(object) {
                for (var key in object) {
                    return true;
                }
                return false;
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

            /* load the starting position indicated by [Setup '1'] and
            * [FEN position] */
            if (headers['SetUp'] === '1') {
                if (!(('FEN' in headers) && load(headers['FEN'], true ))) { // second argument to load: don't clear the headers
                    return false;
                }
            }

            /* delete header to get the moves */
            var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

            /* delete comments */
            ms = ms.replace(/(\{[^}]+\})+?/g, '');

            /* delete recursive annotation variations */
            var rav_regex = /(\([^\(\)]+\))+?/g
            while (rav_regex.test(ms)) {
                ms = ms.replace(rav_regex, '');
            }

            /* delete move numbers */
            ms = ms.replace(/\d+\.(\.\.)?/g, '');

            /* delete ... indicating black to move */
            ms = ms.replace(/\.\.\./g, '');

            /* delete numeric annotation glyphs */
            ms = ms.replace(/\$\d+/g, '');

            /* trim and get array of moves */
            var moves = trim(ms).split(new RegExp(/\s+/));

            /* delete empty entries */
            moves = moves.join(',').replace(/,,+/g, ',').split(',');
            var move = '';

            for (var half_move = 0; half_move < moves.length - 1; half_move++) {
                move = move_from_san(moves[half_move], sloppy);

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
                move = move_from_san(move, sloppy);
                if (move == null) {
                    return false;
                } else {
                    make_move(move);
                }
            }
            return true;
        },

        header: function() {
            return set_header(arguments);
        },

        ascii: function() {
            return ascii();
        },

        turn: function() {
            return turn;
        },

        move: function(move, options) {
            /* The move function can be called with in the following parameters:
             *
             * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
             *
             * .move({ from: 'h7', <- where the 'move' is a move object (additional
             *         to :'h8',      fields are ignored)
             *         promotion: 'q',
             *      })
             */

            // allow the user to specify the sloppy move parser to work around over
            // disambiguation bugs in Fritz and Chessbase
            var sloppy = (typeof options !== 'undefined' && 'sloppy' in options) ?
                options.sloppy : false;

            var move_obj = null;

            if (typeof move === 'string') {
                move_obj = move_from_san(move, sloppy);
            } else if (typeof move === 'object') {
                var moves = generate_moves();

                /* convert the pretty move object to an ugly move object */
                for (var i = 0, len = moves.length; i < len; i++) {
                    if (move.from === algebraic(moves[i].from) &&
                        move.to === algebraic(moves[i].to) &&
                        (!('promotion' in moves[i]) ||
                            move.promotion === moves[i].promotion)) {
                        move_obj = moves[i];
                        break;
                    }
                }
            }

            /* failed to find move */
            if (!move_obj) {
                return null;
            }

            /* need to make a copy of move because we can't generate SAN after the
             * move is made
             */
            var pretty_move = make_pretty(move_obj);

            make_move(move_obj);

            return pretty_move;
        },

        undo: function() {
            var move = undo_move();
            return (move) ? make_pretty(move) : null;
        },

        clear: function() {
            return clear();
        },

        put: function(piece, square) {
            return put(piece, square);
        },

        get: function(square) {
            return get(square);
        },

        remove: function(square) {
            return remove(square);
        },

        perft: function(depth) {
            return perft(depth);
        },

        square_color: function(square) {
            if (square in SQUARES) {
                var sq_0x88 = SQUARES[square];
                return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
            }

            return null;
        },

        history: function(options) {
            var reversed_history = [];
            var move_history = [];
            var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                options.verbose);

            while (history.length > 0) {
                reversed_history.push(undo_move());
            }

            while (reversed_history.length > 0) {
                var move = reversed_history.pop();
                if (verbose) {
                    move_history.push(make_pretty(move));
                } else {
                    move_history.push(move_to_san(move));
                }
                make_move(move);
            }

            return move_history;
        }

    };
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return Chess;  });
(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.Chessground = f()
    }
})(function () {
    var define, module, exports;
    return (function () {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {exports: {}};
                    e[i][0].call(p.exports, function (r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }

            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }

        return r
    })()({
        1: [function (require, module, exports) {
            "use strict";
            var __assign = (this && this.__assign) || function () {
                __assign = Object.assign || function (t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                        s = arguments[i];
                        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
                    }
                    return t;
                };
                return __assign.apply(this, arguments);
            };
            Object.defineProperty(exports, "__esModule", {value: true});
            var util = require("./util");

            function anim(mutation, state) {
                return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
            }

            exports.anim = anim;

            function render(mutation, state) {
                var result = mutation(state);
                state.dom.redraw();
                return result;
            }

            exports.render = render;

            function makePiece(key, piece) {
                return {
                    key: key,
                    pos: util.key2pos(key),
                    piece: piece
                };
            }

            function closer(piece, pieces) {
                return pieces.sort(function (p1, p2) {
                    return util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos);
                })[0];
            }

            function computePlan(prevPieces, current) {
                var anims = {}, animedOrigs = [], fadings = {}, missings = [], news = [], prePieces = {};
                var curP, preP, i, vector;
                for (i in prevPieces) {
                    prePieces[i] = makePiece(i, prevPieces[i]);
                }
                for (var _i = 0, _a = util.allKeys; _i < _a.length; _i++) {
                    var key = _a[_i];
                    curP = current.pieces[key];
                    preP = prePieces[key];
                    if (curP) {
                        if (preP) {
                            if (!util.samePiece(curP, preP.piece)) {
                                missings.push(preP);
                                news.push(makePiece(key, curP));
                            }
                        } else
                            news.push(makePiece(key, curP));
                    } else if (preP)
                        missings.push(preP);
                }
                news.forEach(function (newP) {
                    preP = closer(newP, missings.filter(function (p) {
                        return util.samePiece(newP.piece, p.piece);
                    }));
                    if (preP) {
                        vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
                        anims[newP.key] = vector.concat(vector);
                        animedOrigs.push(preP.key);
                    }
                });
                missings.forEach(function (p) {
                    if (!util.containsX(animedOrigs, p.key))
                        fadings[p.key] = p.piece;
                });
                return {
                    anims: anims,
                    fadings: fadings
                };
            }

            var perf = window.performance !== undefined ? window.performance : Date;

            function step(state, now) {
                var cur = state.animation.current;
                if (cur === undefined) {
                    if (!state.dom.destroyed)
                        state.dom.redrawNow();
                    return;
                }
                var rest = 1 - (now - cur.start) * cur.frequency;
                if (rest <= 0) {
                    state.animation.current = undefined;
                    state.dom.redrawNow();
                } else {
                    var ease = easing(rest);
                    for (var i in cur.plan.anims) {
                        var cfg = cur.plan.anims[i];
                        cfg[2] = cfg[0] * ease;
                        cfg[3] = cfg[1] * ease;
                    }
                    state.dom.redrawNow(true);
                    util.raf(function (now) {
                        if (now === void 0) {
                            now = perf.now();
                        }
                        return step(state, now);
                    });
                }
            }

            function animate(mutation, state) {
                var prevPieces = __assign({}, state.pieces);
                var result = mutation(state);
                var plan = computePlan(prevPieces, state);
                if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
                    var alreadyRunning = state.animation.current && state.animation.current.start;
                    state.animation.current = {
                        start: perf.now(),
                        frequency: 1 / state.animation.duration,
                        plan: plan
                    };
                    if (!alreadyRunning)
                        step(state, perf.now());
                } else {
                    state.dom.redraw();
                }
                return result;
            }

            function isObjectEmpty(o) {
                for (var _ in o)
                    return false;
                return true;
            }

            function easing(t) {
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            }

        }, {"./util": 17}],
        2: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var board = require("./board");
            var fen_1 = require("./fen");
            var config_1 = require("./config");
            var anim_1 = require("./anim");
            var drag_1 = require("./drag");
            var explosion_1 = require("./explosion");

            function start(state, redrawAll) {
                function toggleOrientation() {
                    board.toggleOrientation(state);
                    redrawAll();
                }
                ;
                return {
                    set: function (config) {
                        if (config.orientation && config.orientation !== state.orientation)
                            toggleOrientation();
                        (config.fen ? anim_1.anim : anim_1.render)(function (state) {
                            return config_1.configure(state, config);
                        }, state);
                    },
                    state: state,
                    getFen: function () {
                        return fen_1.write(state.pieces);
                    },
                    toggleOrientation: toggleOrientation,
                    setPieces: function (pieces) {
                        anim_1.anim(function (state) {
                            return board.setPieces(state, pieces);
                        }, state);
                    },
                    selectSquare: function (key, force) {
                        if (key)
                            anim_1.anim(function (state) {
                                return board.selectSquare(state, key, force);
                            }, state);
                        else if (state.selected) {
                            board.unselect(state);
                            state.dom.redraw();
                        }
                    },
                    move: function (orig, dest) {
                        anim_1.anim(function (state) {
                            return board.baseMove(state, orig, dest);
                        }, state);
                    },
                    newPiece: function (piece, key) {
                        anim_1.anim(function (state) {
                            return board.baseNewPiece(state, piece, key);
                        }, state);
                    },
                    playPremove: function () {
                        if (state.premovable.current) {
                            if (anim_1.anim(board.playPremove, state))
                                return true;
                            state.dom.redraw();
                        }
                        return false;
                    },
                    playPredrop: function (validate) {
                        if (state.predroppable.current) {
                            var result = board.playPredrop(state, validate);
                            state.dom.redraw();
                            return result;
                        }
                        return false;
                    },
                    cancelPremove: function () {
                        anim_1.render(board.unsetPremove, state);
                    },
                    cancelPredrop: function () {
                        anim_1.render(board.unsetPredrop, state);
                    },
                    cancelMove: function () {
                        anim_1.render(function (state) {
                            board.cancelMove(state);
                            drag_1.cancel(state);
                        }, state);
                    },
                    stop: function () {
                        anim_1.render(function (state) {
                            board.stop(state);
                            drag_1.cancel(state);
                        }, state);
                    },
                    explode: function (keys) {
                        explosion_1.default(state, keys);
                    },
                    setAutoShapes: function (shapes) {
                        anim_1.render(function (state) {
                            return state.drawable.autoShapes = shapes;
                        }, state);
                    },
                    setShapes: function (shapes) {
                        anim_1.render(function (state) {
                            return state.drawable.shapes = shapes;
                        }, state);
                    },
                    getKeyAtDomPos: function (pos) {
                        return board.getKeyAtDomPos(pos, state.orientation === 'white', state.dom.bounds());
                    },
                    redrawAll: redrawAll,
                    dragNewPiece: function (piece, event, force) {
                        drag_1.dragNewPiece(state, piece, event, force);
                    },
                    destroy: function () {
                        board.stop(state);
                        state.dom.unbind && state.dom.unbind();
                        state.dom.destroyed = true;
                    }
                };
            }

            exports.start = start;

        }, {"./anim": 1, "./board": 3, "./config": 5, "./drag": 6, "./explosion": 9, "./fen": 10}],
        3: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util_1 = require("./util");
            var premove_1 = require("./premove");

            function callUserFunction(f) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (f)
                    setTimeout(function () {
                        return f.apply(void 0, args);
                    }, 1);
            }

            exports.callUserFunction = callUserFunction;

            function toggleOrientation(state) {
                state.orientation = util_1.opposite(state.orientation);
                state.animation.current =
                    state.draggable.current =
                        state.selected = undefined;
            }

            exports.toggleOrientation = toggleOrientation;

            function reset(state) {
                state.lastMove = undefined;
                unselect(state);
                unsetPremove(state);
                unsetPredrop(state);
            }

            exports.reset = reset;

            function setPieces(state, pieces) {
                for (var key in pieces) {
                    var piece = pieces[key];
                    if (piece)
                        state.pieces[key] = piece;
                    else
                        delete state.pieces[key];
                }
            }

            exports.setPieces = setPieces;

            function setCheck(state, color) {
                state.check = undefined;
                if (color === true)
                    color = state.turnColor;
                if (color)
                    for (var k in state.pieces) {
                        if (state.pieces[k].role === 'king' && state.pieces[k].color === color) {
                            state.check = k;
                        }
                    }
            }

            exports.setCheck = setCheck;

            function setPremove(state, orig, dest, meta) {
                unsetPredrop(state);
                state.premovable.current = [orig, dest];
                callUserFunction(state.premovable.events.set, orig, dest, meta);
            }

            function unsetPremove(state) {
                if (state.premovable.current) {
                    state.premovable.current = undefined;
                    callUserFunction(state.premovable.events.unset);
                }
            }

            exports.unsetPremove = unsetPremove;

            function setPredrop(state, role, key) {
                unsetPremove(state);
                state.predroppable.current = {
                    role: role,
                    key: key
                };
                callUserFunction(state.predroppable.events.set, role, key);
            }

            function unsetPredrop(state) {
                var pd = state.predroppable;
                if (pd.current) {
                    pd.current = undefined;
                    callUserFunction(pd.events.unset);
                }
            }

            exports.unsetPredrop = unsetPredrop;

            function tryAutoCastle(state, orig, dest) {
                if (!state.autoCastle)
                    return false;
                var king = state.pieces[orig];
                if (!king || king.role !== 'king')
                    return false;
                var origPos = util_1.key2pos(orig);
                if (origPos[0] !== 5)
                    return false;
                if (origPos[1] !== 1 && origPos[1] !== 8)
                    return false;
                var destPos = util_1.key2pos(dest);
                var oldRookPos, newRookPos, newKingPos;
                if (destPos[0] === 7 || destPos[0] === 8) {
                    oldRookPos = util_1.pos2key([8, origPos[1]]);
                    newRookPos = util_1.pos2key([6, origPos[1]]);
                    newKingPos = util_1.pos2key([7, origPos[1]]);
                } else if (destPos[0] === 3 || destPos[0] === 1) {
                    oldRookPos = util_1.pos2key([1, origPos[1]]);
                    newRookPos = util_1.pos2key([4, origPos[1]]);
                    newKingPos = util_1.pos2key([3, origPos[1]]);
                } else
                    return false;
                var rook = state.pieces[oldRookPos];
                if (!rook || rook.role !== 'rook')
                    return false;
                delete state.pieces[orig];
                delete state.pieces[oldRookPos];
                state.pieces[newKingPos] = king;
                state.pieces[newRookPos] = rook;
                return true;
            }

            function baseMove(state, orig, dest) {
                var origPiece = state.pieces[orig], destPiece = state.pieces[dest];
                if (orig === dest || !origPiece)
                    return false;
                var captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
                if (dest == state.selected)
                    unselect(state);
                callUserFunction(state.events.move, orig, dest, captured);
                if (!tryAutoCastle(state, orig, dest)) {
                    state.pieces[dest] = origPiece;
                    delete state.pieces[orig];
                }
                state.lastMove = [orig, dest];
                state.check = undefined;
                callUserFunction(state.events.change);
                return captured || true;
            }

            exports.baseMove = baseMove;

            function baseNewPiece(state, piece, key, force) {
                if (state.pieces[key]) {
                    if (force)
                        delete state.pieces[key];
                    else
                        return false;
                }
                callUserFunction(state.events.dropNewPiece, piece, key);
                state.pieces[key] = piece;
                state.lastMove = [key];
                state.check = undefined;
                callUserFunction(state.events.change);
                state.movable.dests = undefined;
                state.turnColor = util_1.opposite(state.turnColor);
                return true;
            }

            exports.baseNewPiece = baseNewPiece;

            function baseUserMove(state, orig, dest) {
                var result = baseMove(state, orig, dest);
                if (result) {
                    state.movable.dests = undefined;
                    state.turnColor = util_1.opposite(state.turnColor);
                    state.animation.current = undefined;
                }
                return result;
            }

            function userMove(state, orig, dest) {
                if (canMove(state, orig, dest)) {
                    var result = baseUserMove(state, orig, dest);
                    if (result) {
                        var holdTime = state.hold.stop();
                        unselect(state);
                        var metadata = {
                            premove: false,
                            ctrlKey: state.stats.ctrlKey,
                            holdTime: holdTime
                        };
                        if (result !== true)
                            metadata.captured = result;
                        callUserFunction(state.movable.events.after, orig, dest, metadata);
                        return true;
                    }
                } else if (canPremove(state, orig, dest)) {
                    setPremove(state, orig, dest, {
                        ctrlKey: state.stats.ctrlKey
                    });
                    unselect(state);
                } else if (isMovable(state, dest) || isPremovable(state, dest)) {
                    setSelected(state, dest);
                    state.hold.start();
                } else
                    unselect(state);
                return false;
            }

            exports.userMove = userMove;

            function dropNewPiece(state, orig, dest, force) {
                if (canDrop(state, orig, dest) || force) {
                    var piece = state.pieces[orig];
                    delete state.pieces[orig];
                    baseNewPiece(state, piece, dest, force);
                    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
                        predrop: false
                    });
                } else if (canPredrop(state, orig, dest)) {
                    setPredrop(state, state.pieces[orig].role, dest);
                } else {
                    unsetPremove(state);
                    unsetPredrop(state);
                }
                delete state.pieces[orig];
                unselect(state);
            }

            exports.dropNewPiece = dropNewPiece;

            function selectSquare(state, key, force) {
                if (state.selected) {
                    if (state.selected === key && !state.draggable.enabled) {
                        unselect(state);
                        state.hold.cancel();
                    } else if ((state.selectable.enabled || force) && state.selected !== key) {
                        if (userMove(state, state.selected, key))
                            state.stats.dragged = false;
                    } else
                        state.hold.start();
                } else if (isMovable(state, key) || isPremovable(state, key)) {
                    setSelected(state, key);
                    state.hold.start();
                }
                callUserFunction(state.events.select, key);
            }

            exports.selectSquare = selectSquare;

            function setSelected(state, key) {
                state.selected = key;
                if (isPremovable(state, key)) {
                    state.premovable.dests = premove_1.default(state.pieces, key, state.premovable.castle);
                } else
                    state.premovable.dests = undefined;
            }

            exports.setSelected = setSelected;

            function unselect(state) {
                state.selected = undefined;
                state.premovable.dests = undefined;
                state.hold.cancel();
            }

            exports.unselect = unselect;

            function isMovable(state, orig) {
                var piece = state.pieces[orig];
                return !!piece && (state.movable.color === 'both' || (state.movable.color === piece.color &&
                    state.turnColor === piece.color));
            }

            function canMove(state, orig, dest) {
                return orig !== dest && isMovable(state, orig) && (state.movable.free || (!!state.movable.dests && util_1.containsX(state.movable.dests[orig], dest)));
            }

            exports.canMove = canMove;

            function canDrop(state, orig, dest) {
                var piece = state.pieces[orig];
                return !!piece && dest && (orig === dest || !state.pieces[dest]) && (state.movable.color === 'both' || (state.movable.color === piece.color &&
                    state.turnColor === piece.color));
            }

            function isPremovable(state, orig) {
                var piece = state.pieces[orig];
                return !!piece && state.premovable.enabled &&
                    state.movable.color === piece.color &&
                    state.turnColor !== piece.color;
            }

            function canPremove(state, orig, dest) {
                return orig !== dest &&
                    isPremovable(state, orig) &&
                    util_1.containsX(premove_1.default(state.pieces, orig, state.premovable.castle), dest);
            }

            function canPredrop(state, orig, dest) {
                var piece = state.pieces[orig];
                var destPiece = state.pieces[dest];
                return !!piece && dest &&
                    (!destPiece || destPiece.color !== state.movable.color) &&
                    state.predroppable.enabled &&
                    (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
                    state.movable.color === piece.color &&
                    state.turnColor !== piece.color;
            }

            function isDraggable(state, orig) {
                var piece = state.pieces[orig];
                return !!piece && state.draggable.enabled && (state.movable.color === 'both' || (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)));
            }

            exports.isDraggable = isDraggable;

            function playPremove(state) {
                var move = state.premovable.current;
                if (!move)
                    return false;
                var orig = move[0], dest = move[1];
                var success = false;
                if (canMove(state, orig, dest)) {
                    var result = baseUserMove(state, orig, dest);
                    if (result) {
                        var metadata = {premove: true};
                        if (result !== true)
                            metadata.captured = result;
                        callUserFunction(state.movable.events.after, orig, dest, metadata);
                        success = true;
                    }
                }
                unsetPremove(state);
                return success;
            }

            exports.playPremove = playPremove;

            function playPredrop(state, validate) {
                var drop = state.predroppable.current, success = false;
                if (!drop)
                    return false;
                if (validate(drop)) {
                    var piece = {
                        role: drop.role,
                        color: state.movable.color
                    };
                    if (baseNewPiece(state, piece, drop.key)) {
                        callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
                            predrop: true
                        });
                        success = true;
                    }
                }
                unsetPredrop(state);
                return success;
            }

            exports.playPredrop = playPredrop;

            function cancelMove(state) {
                unsetPremove(state);
                unsetPredrop(state);
                unselect(state);
            }

            exports.cancelMove = cancelMove;

            function stop(state) {
                state.movable.color =
                    state.movable.dests =
                        state.animation.current = undefined;
                cancelMove(state);
            }

            exports.stop = stop;

            function getKeyAtDomPos(pos, asWhite, bounds) {
                var file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
                if (!asWhite)
                    file = 9 - file;
                var rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
                if (!asWhite)
                    rank = 9 - rank;
                return (file > 0 && file < 9 && rank > 0 && rank < 9) ? util_1.pos2key([file, rank]) : undefined;
            }

            exports.getKeyAtDomPos = getKeyAtDomPos;

        }, {"./premove": 12, "./util": 17}],
        4: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var api_1 = require("./api");
            var config_1 = require("./config");
            var state_1 = require("./state");
            var wrap_1 = require("./wrap");
            var events = require("./events");
            var render_1 = require("./render");
            var svg = require("./svg");
            var util = require("./util");

            function Chessground(element, config) {
                var state = state_1.defaults();
                config_1.configure(state, config || {});

                function redrawAll() {
                    var prevUnbind = state.dom && state.dom.unbind;
                    element.classList.add('cg-wrap');
                    var relative = state.viewOnly && !state.drawable.visible;
                    var elements = wrap_1.default(element, state, relative);
                    var bounds = util.memo(function () {
                        return elements.board.getBoundingClientRect();
                    });
                    var redrawNow = function (skipSvg) {
                        render_1.default(state);
                        if (!skipSvg && elements.svg)
                            svg.renderSvg(state, elements.svg);
                    };
                    state.dom = {
                        elements: elements,
                        bounds: bounds,
                        redraw: debounceRedraw(redrawNow),
                        redrawNow: redrawNow,
                        unbind: prevUnbind,
                        relative: relative
                    };
                    state.drawable.prevSvgHash = '';
                    redrawNow(false);
                    events.bindBoard(state);
                    if (!prevUnbind)
                        state.dom.unbind = events.bindDocument(state, redrawAll);
                    state.events.insert && state.events.insert(elements);
                }

                redrawAll();
                var api = api_1.start(state, redrawAll);
                return api;
            }

            exports.Chessground = Chessground;
            ;

            function debounceRedraw(redrawNow) {
                var redrawing = false;
                return function () {
                    if (redrawing)
                        return;
                    redrawing = true;
                    util.raf(function () {
                        redrawNow();
                        redrawing = false;
                    });
                };
            }

        }, {
            "./api": 2,
            "./config": 5,
            "./events": 8,
            "./render": 13,
            "./state": 14,
            "./svg": 15,
            "./util": 17,
            "./wrap": 18
        }],
        5: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var board_1 = require("./board");
            var fen_1 = require("./fen");

            function configure(state, config) {
                if (config.movable && config.movable.dests)
                    state.movable.dests = undefined;
                merge(state, config);
                if (config.fen) {
                    state.pieces = fen_1.read(config.fen);
                    state.drawable.shapes = [];
                }
                if (config.hasOwnProperty('check'))
                    board_1.setCheck(state, config.check || false);
                if (config.hasOwnProperty('lastMove') && !config.lastMove)
                    state.lastMove = undefined;
                else if (config.lastMove)
                    state.lastMove = config.lastMove;
                if (state.selected)
                    board_1.setSelected(state, state.selected);
                if (!state.animation.duration || state.animation.duration < 100)
                    state.animation.enabled = false;
                if (!state.movable.rookCastle && state.movable.dests) {
                    var rank_1 = state.movable.color === 'white' ? 1 : 8;
                    var kingStartPos = 'e' + rank_1;
                    var dests_1 = state.movable.dests[kingStartPos];
                    var king = state.pieces[kingStartPos];
                    if (!dests_1 || !king || king.role !== 'king')
                        return;
                    state.movable.dests[kingStartPos] = dests_1.filter(function (d) {
                        return !((d === 'a' + rank_1) && dests_1.indexOf('c' + rank_1) !== -1) &&
                            !((d === 'h' + rank_1) && dests_1.indexOf('g' + rank_1) !== -1);
                    });
                }
            }

            exports.configure = configure;
            ;

            function merge(base, extend) {
                for (var key in extend) {
                    if (isObject(base[key]) && isObject(extend[key]))
                        merge(base[key], extend[key]);
                    else
                        base[key] = extend[key];
                }
            }

            function isObject(o) {
                return typeof o === 'object';
            }

        }, {"./board": 3, "./fen": 10}],
        6: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var board = require("./board");
            var util = require("./util");
            var draw_1 = require("./draw");
            var anim_1 = require("./anim");

            function start(s, e) {
                if (e.button !== undefined && e.button !== 0)
                    return;
                if (e.touches && e.touches.length > 1)
                    return;
                if (e.type === 'touchstart')
                    s.stats.touched = true;
                else if (e.type === 'mousedown' && s.stats.touched)
                    return;
                var asWhite = s.orientation === 'white', bounds = s.dom.bounds(), position = util.eventPosition(e),
                    orig = board.getKeyAtDomPos(position, asWhite, bounds);
                if (!orig)
                    return;
                var piece = s.pieces[orig];
                var previouslySelected = s.selected;
                if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || (!piece || piece.color !== s.turnColor)))
                    draw_1.clear(s);
                if (!e.touches || piece || previouslySelected || pieceCloseTo(s, position))
                    e.preventDefault();
                var hadPremove = !!s.premovable.current;
                var hadPredrop = !!s.predroppable.current;
                s.stats.ctrlKey = e.ctrlKey;
                if (s.selected && board.canMove(s, s.selected, orig)) {
                    anim_1.anim(function (state) {
                        return board.selectSquare(state, orig);
                    }, s);
                } else {
                    board.selectSquare(s, orig);
                }
                var stillSelected = s.selected === orig;
                var element = pieceElementByKey(s, orig);
                if (piece && element && stillSelected && board.isDraggable(s, orig)) {
                    var squareBounds = computeSquareBounds(orig, asWhite, bounds);
                    s.draggable.current = {
                        orig: orig,
                        origPos: util.key2pos(orig),
                        piece: piece,
                        rel: position,
                        epos: position,
                        pos: [0, 0],
                        dec: s.draggable.centerPiece ? [
                            position[0] - (squareBounds.left + squareBounds.width / 2),
                            position[1] - (squareBounds.top + squareBounds.height / 2)
                        ] : [0, 0],
                        started: s.draggable.autoDistance && s.stats.dragged,
                        element: element,
                        previouslySelected: previouslySelected,
                        originTarget: e.target
                    };
                    element.cgDragging = true;
                    element.classList.add('dragging');
                    var ghost = s.dom.elements.ghost;
                    if (ghost) {
                        ghost.className = "ghost " + piece.color + " " + piece.role;
                        util.translateAbs(ghost, util.posToTranslateAbs(bounds)(util.key2pos(orig), asWhite));
                        util.setVisible(ghost, true);
                    }
                    processDrag(s);
                } else {
                    if (hadPremove)
                        board.unsetPremove(s);
                    if (hadPredrop)
                        board.unsetPredrop(s);
                }
                s.dom.redraw();
            }

            exports.start = start;

            function pieceCloseTo(s, pos) {
                var asWhite = s.orientation === 'white', bounds = s.dom.bounds(),
                    radiusSq = Math.pow(bounds.width / 8, 2);
                for (var key in s.pieces) {
                    var squareBounds = computeSquareBounds(key, asWhite, bounds), center = [
                        squareBounds.left + squareBounds.width / 2,
                        squareBounds.top + squareBounds.height / 2
                    ];
                    if (util.distanceSq(center, pos) <= radiusSq)
                        return true;
                }
                return false;
            }

            exports.pieceCloseTo = pieceCloseTo;

            function dragNewPiece(s, piece, e, force) {
                var key = 'a0';
                s.pieces[key] = piece;
                s.dom.redraw();
                var position = util.eventPosition(e), asWhite = s.orientation === 'white', bounds = s.dom.bounds(),
                    squareBounds = computeSquareBounds(key, asWhite, bounds);
                var rel = [
                    (asWhite ? 0 : 7) * squareBounds.width + bounds.left,
                    (asWhite ? 8 : -1) * squareBounds.height + bounds.top
                ];
                s.draggable.current = {
                    orig: key,
                    origPos: util.key2pos(key),
                    piece: piece,
                    rel: rel,
                    epos: position,
                    pos: [position[0] - rel[0], position[1] - rel[1]],
                    dec: [-squareBounds.width / 2, -squareBounds.height / 2],
                    started: true,
                    element: function () {
                        return pieceElementByKey(s, key);
                    },
                    originTarget: e.target,
                    newPiece: true,
                    force: force || false
                };
                processDrag(s);
            }

            exports.dragNewPiece = dragNewPiece;

            function processDrag(s) {
                util.raf(function () {
                    var cur = s.draggable.current;
                    if (!cur)
                        return;
                    if (s.animation.current && s.animation.current.plan.anims[cur.orig])
                        s.animation.current = undefined;
                    var origPiece = s.pieces[cur.orig];
                    if (!origPiece || !util.samePiece(origPiece, cur.piece))
                        cancel(s);
                    else {
                        if (!cur.started && util.distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2))
                            cur.started = true;
                        if (cur.started) {
                            if (typeof cur.element === 'function') {
                                var found = cur.element();
                                if (!found)
                                    return;
                                cur.element = found;
                                cur.element.cgDragging = true;
                                cur.element.classList.add('dragging');
                            }
                            var asWhite = s.orientation === 'white', bounds = s.dom.bounds();
                            cur.pos = [
                                cur.epos[0] - cur.rel[0],
                                cur.epos[1] - cur.rel[1]
                            ];
                            var translation = util.posToTranslateAbs(bounds)(cur.origPos, asWhite);
                            translation[0] += cur.pos[0] + cur.dec[0];
                            translation[1] += cur.pos[1] + cur.dec[1];
                            util.translateAbs(cur.element, translation);
                        }
                    }
                    processDrag(s);
                });
            }

            function move(s, e) {
                if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
                    s.draggable.current.epos = util.eventPosition(e);
                }
            }

            exports.move = move;

            function end(s, e) {
                var cur = s.draggable.current;
                if (!cur)
                    return;
                if (e.type === 'touchend' && cur && cur.originTarget !== e.target && !cur.newPiece) {
                    s.draggable.current = undefined;
                    return;
                }
                board.unsetPremove(s);
                board.unsetPredrop(s);
                var eventPos = util.eventPosition(e) || cur.epos;
                var dest = board.getKeyAtDomPos(eventPos, s.orientation === 'white', s.dom.bounds());
                if (dest && cur.started) {
                    if (cur.newPiece)
                        board.dropNewPiece(s, cur.orig, dest, cur.force);
                    else {
                        s.stats.ctrlKey = e.ctrlKey;
                        if (board.userMove(s, cur.orig, dest))
                            s.stats.dragged = true;
                    }
                } else if (cur.newPiece) {
                    delete s.pieces[cur.orig];
                } else if (s.draggable.deleteOnDropOff) {
                    delete s.pieces[cur.orig];
                    board.callUserFunction(s.events.change);
                }
                if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
                    board.unselect(s);
                else if (!s.selectable.enabled)
                    board.unselect(s);
                removeDragElements(s);
                s.draggable.current = undefined;
                s.dom.redraw();
            }

            exports.end = end;

            function cancel(s) {
                var cur = s.draggable.current;
                if (cur) {
                    if (cur.newPiece)
                        delete s.pieces[cur.orig];
                    s.draggable.current = undefined;
                    board.unselect(s);
                    removeDragElements(s);
                    s.dom.redraw();
                }
            }

            exports.cancel = cancel;

            function removeDragElements(s) {
                var e = s.dom.elements;
                if (e.ghost)
                    util.setVisible(e.ghost, false);
            }

            function computeSquareBounds(key, asWhite, bounds) {
                var pos = util.key2pos(key);
                if (!asWhite) {
                    pos[0] = 9 - pos[0];
                    pos[1] = 9 - pos[1];
                }
                return {
                    left: bounds.left + bounds.width * (pos[0] - 1) / 8,
                    top: bounds.top + bounds.height * (8 - pos[1]) / 8,
                    width: bounds.width / 8,
                    height: bounds.height / 8
                };
            }

            function pieceElementByKey(s, key) {
                var el = s.dom.elements.board.firstChild;
                while (el) {
                    if (el.cgKey === key && el.tagName === 'PIECE')
                        return el;
                    el = el.nextSibling;
                }
                return undefined;
            }

        }, {"./anim": 1, "./board": 3, "./draw": 7, "./util": 17}],
        7: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var board_1 = require("./board");
            var util_1 = require("./util");
            var brushes = ['green', 'red', 'blue', 'yellow'];

            function start(state, e) {
                if (e.touches && e.touches.length > 1)
                    return;
                e.stopPropagation();
                e.preventDefault();
                e.ctrlKey ? board_1.unselect(state) : board_1.cancelMove(state);
                var position = util_1.eventPosition(e);
                var orig = board_1.getKeyAtDomPos(position, state.orientation === 'white', state.dom.bounds());
                if (!orig)
                    return;
                state.drawable.current = {
                    orig: orig,
                    pos: position,
                    brush: eventBrush(e)
                };
                processDraw(state);
            }

            exports.start = start;

            function processDraw(state) {
                util_1.raf(function () {
                    var cur = state.drawable.current;
                    if (cur) {
                        var mouseSq = board_1.getKeyAtDomPos(cur.pos, state.orientation === 'white', state.dom.bounds());
                        if (mouseSq !== cur.mouseSq) {
                            cur.mouseSq = mouseSq;
                            cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
                            state.dom.redrawNow();
                        }
                        processDraw(state);
                    }
                });
            }

            exports.processDraw = processDraw;

            function move(state, e) {
                if (state.drawable.current)
                    state.drawable.current.pos = util_1.eventPosition(e);
            }

            exports.move = move;

            function end(state) {
                var cur = state.drawable.current;
                if (cur) {
                    if (cur.mouseSq)
                        addShape(state.drawable, cur);
                    cancel(state);
                }
            }

            exports.end = end;

            function cancel(state) {
                if (state.drawable.current) {
                    state.drawable.current = undefined;
                    state.dom.redraw();
                }
            }

            exports.cancel = cancel;

            function clear(state) {
                if (state.drawable.shapes.length) {
                    state.drawable.shapes = [];
                    state.dom.redraw();
                    onChange(state.drawable);
                }
            }

            exports.clear = clear;

            function eventBrush(e) {
                var a = e.shiftKey && util_1.isRightButton(e) ? 1 : 0;
                var b = e.altKey ? 2 : 0;
                return brushes[a + b];
            }

            function not(f) {
                return function (x) {
                    return !f(x);
                };
            }

            function addShape(drawable, cur) {
                var sameShape = function (s) {
                    return s.orig === cur.orig && s.dest === cur.dest;
                };
                var similar = drawable.shapes.filter(sameShape)[0];
                if (similar)
                    drawable.shapes = drawable.shapes.filter(not(sameShape));
                if (!similar || similar.brush !== cur.brush)
                    drawable.shapes.push(cur);
                onChange(drawable);
            }

            function onChange(drawable) {
                if (drawable.onChange)
                    drawable.onChange(drawable.shapes);
            }

        }, {"./board": 3, "./util": 17}],
        8: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var drag = require("./drag");
            var draw = require("./draw");
            var util_1 = require("./util");

            function bindBoard(s) {
                if (s.viewOnly)
                    return;
                var boardEl = s.dom.elements.board, onStart = startDragOrDraw(s);
                boardEl.addEventListener('touchstart', onStart);
                boardEl.addEventListener('mousedown', onStart);
                if (s.disableContextMenu || s.drawable.enabled) {
                    boardEl.addEventListener('contextmenu', function (e) {
                        return e.preventDefault();
                    });
                }
            }

            exports.bindBoard = bindBoard;

            function bindDocument(s, redrawAll) {
                var unbinds = [];
                if (!s.dom.relative && s.resizable) {
                    var onResize = function () {
                        s.dom.bounds.clear();
                        util_1.raf(redrawAll);
                    };
                    unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
                }
                if (!s.viewOnly) {
                    var onmove_1 = dragOrDraw(s, drag.move, draw.move);
                    var onend_1 = dragOrDraw(s, drag.end, draw.end);
                    ['touchmove', 'mousemove'].forEach(function (ev) {
                        return unbinds.push(unbindable(document, ev, onmove_1));
                    });
                    ['touchend', 'mouseup'].forEach(function (ev) {
                        return unbinds.push(unbindable(document, ev, onend_1));
                    });
                    var onScroll = function () {
                        return s.dom.bounds.clear();
                    };
                    unbinds.push(unbindable(window, 'scroll', onScroll, {passive: true}));
                    unbinds.push(unbindable(window, 'resize', onScroll, {passive: true}));
                }
                return function () {
                    return unbinds.forEach(function (f) {
                        return f();
                    });
                };
            }

            exports.bindDocument = bindDocument;

            function unbindable(el, eventName, callback, options) {
                el.addEventListener(eventName, callback, options);
                return function () {
                    return el.removeEventListener(eventName, callback);
                };
            }

            function startDragOrDraw(s) {
                return function (e) {
                    if (s.draggable.current)
                        drag.cancel(s);
                    else if (s.drawable.current)
                        draw.cancel(s);
                    else if (e.shiftKey || util_1.isRightButton(e)) {
                        if (s.drawable.enabled)
                            draw.start(s, e);
                    } else if (!s.viewOnly)
                        drag.start(s, e);
                };
            }

            function dragOrDraw(s, withDrag, withDraw) {
                return function (e) {
                    if (e.shiftKey || util_1.isRightButton(e)) {
                        if (s.drawable.enabled)
                            withDraw(s, e);
                    } else if (!s.viewOnly)
                        withDrag(s, e);
                };
            }

        }, {"./drag": 6, "./draw": 7, "./util": 17}],
        9: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});

            function explosion(state, keys) {
                state.exploding = {
                    stage: 1,
                    keys: keys
                };
                state.dom.redraw();
                setTimeout(function () {
                    setStage(state, 2);
                    setTimeout(function () {
                        return setStage(state, undefined);
                    }, 120);
                }, 120);
            }

            exports.default = explosion;

            function setStage(state, stage) {
                if (state.exploding) {
                    if (stage)
                        state.exploding.stage = stage;
                    else
                        state.exploding = undefined;
                    state.dom.redraw();
                }
            }

        }, {}],
        10: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util_1 = require("./util");
            var cg = require("./types");
            exports.initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
            var roles = {p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king'};
            var letters = {pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k'};

            function read(fen) {
                if (fen === 'start')
                    fen = exports.initial;
                var pieces = {};
                var row = 8;
                var col = 0;
                for (var _i = 0, fen_1 = fen; _i < fen_1.length; _i++) {
                    var c = fen_1[_i];
                    switch (c) {
                        case ' ':
                            return pieces;
                        case '/':
                            --row;
                            if (row === 0)
                                return pieces;
                            col = 0;
                            break;
                        case '~':
                            var piece = pieces[util_1.pos2key([col, row])];
                            if (piece)
                                piece.promoted = true;
                            break;
                        default:
                            var nb = c.charCodeAt(0);
                            if (nb < 57)
                                col += nb - 48;
                            else {
                                ++col;
                                var role = c.toLowerCase();
                                pieces[util_1.pos2key([col, row])] = {
                                    role: roles[role],
                                    color: (c === role ? 'black' : 'white')
                                };
                            }
                    }
                }
                return pieces;
            }

            exports.read = read;

            function write(pieces) {
                return util_1.invRanks.map(function (y) {
                    return cg.ranks.map(function (x) {
                        var piece = pieces[util_1.pos2key([x, y])];
                        if (piece) {
                            var letter = letters[piece.role];
                            return piece.color === 'white' ? letter.toUpperCase() : letter;
                        } else
                            return '1';
                    }).join('');
                }).join('/').replace(/1{2,}/g, function (s) {
                    return s.length.toString();
                });
            }

            exports.write = write;

        }, {"./types": 16, "./util": 17}],
        11: [function (require, module, exports) {
            module.exports = require("./chessground").Chessground;

        }, {"./chessground": 4}],
        12: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util = require("./util");

            function diff(a, b) {
                return Math.abs(a - b);
            }

            function pawn(color) {
                return function (x1, y1, x2, y2) {
                    return diff(x1, x2) < 2 && (color === 'white' ? (y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)) : (y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)));
                };
            }

            var knight = function (x1, y1, x2, y2) {
                var xd = diff(x1, x2);
                var yd = diff(y1, y2);
                return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
            };
            var bishop = function (x1, y1, x2, y2) {
                return diff(x1, x2) === diff(y1, y2);
            };
            var rook = function (x1, y1, x2, y2) {
                return x1 === x2 || y1 === y2;
            };
            var queen = function (x1, y1, x2, y2) {
                return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
            };

            function king(color, rookFiles, canCastle) {
                return function (x1, y1, x2, y2) {
                    return (diff(x1, x2) < 2 && diff(y1, y2) < 2) || (canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && ((x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2)));
                };
            }

            function rookFilesOf(pieces, color) {
                return Object.keys(pieces).filter(function (key) {
                    var piece = pieces[key];
                    return piece && piece.color === color && piece.role === 'rook';
                }).map(function (key) {
                    return util.key2pos(key)[0];
                });
            }

            function premove(pieces, key, canCastle) {
                var piece = pieces[key], pos = util.key2pos(key);
                var mobility;
                switch (piece.role) {
                    case 'pawn':
                        mobility = pawn(piece.color);
                        break;
                    case 'knight':
                        mobility = knight;
                        break;
                    case 'bishop':
                        mobility = bishop;
                        break;
                    case 'rook':
                        mobility = rook;
                        break;
                    case 'queen':
                        mobility = queen;
                        break;
                    case 'king':
                        mobility = king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
                        break;
                }
                return util.allKeys.map(util.key2pos).filter(function (pos2) {
                    return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
                }).map(util.pos2key);
            }

            exports.default = premove;
            ;

        }, {"./util": 17}],
        13: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util_1 = require("./util");
            var util = require("./util");

            function render(s) {
                var asWhite = s.orientation === 'white',
                    posToTranslate = s.dom.relative ? util.posToTranslateRel : util.posToTranslateAbs(s.dom.bounds()),
                    translate = s.dom.relative ? util.translateRel : util.translateAbs, boardEl = s.dom.elements.board,
                    pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : {},
                    fadings = curAnim ? curAnim.plan.fadings : {}, curDrag = s.draggable.current,
                    squares = computeSquareClasses(s), samePieces = {}, sameSquares = {}, movedPieces = {},
                    movedSquares = {}, piecesKeys = Object.keys(pieces);
                var k, p, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
                el = boardEl.firstChild;
                while (el) {
                    k = el.cgKey;
                    if (isPieceNode(el)) {
                        pieceAtKey = pieces[k];
                        anim = anims[k];
                        fading = fadings[k];
                        elPieceName = el.cgPiece;
                        if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
                            el.classList.remove('dragging');
                            translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                            el.cgDragging = false;
                        }
                        if (!fading && el.cgFading) {
                            el.cgFading = false;
                            el.classList.remove('fading');
                        }
                        if (pieceAtKey) {
                            if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                                var pos = util_1.key2pos(k);
                                pos[0] += anim[2];
                                pos[1] += anim[3];
                                el.classList.add('anim');
                                translate(el, posToTranslate(pos, asWhite));
                            } else if (el.cgAnimating) {
                                el.cgAnimating = false;
                                el.classList.remove('anim');
                                translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                                if (s.addPieceZIndex)
                                    el.style.zIndex = posZIndex(util_1.key2pos(k), asWhite);
                            }
                            if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
                                samePieces[k] = true;
                            } else {
                                if (fading && elPieceName === pieceNameOf(fading)) {
                                    el.classList.add('fading');
                                    el.cgFading = true;
                                } else {
                                    if (movedPieces[elPieceName])
                                        movedPieces[elPieceName].push(el);
                                    else
                                        movedPieces[elPieceName] = [el];
                                }
                            }
                        } else {
                            if (movedPieces[elPieceName])
                                movedPieces[elPieceName].push(el);
                            else
                                movedPieces[elPieceName] = [el];
                        }
                    } else if (isSquareNode(el)) {
                        var cn = el.className;
                        if (squares[k] === cn)
                            sameSquares[k] = true;
                        else if (movedSquares[cn])
                            movedSquares[cn].push(el);
                        else
                            movedSquares[cn] = [el];
                    }
                    el = el.nextSibling;
                }
                for (var sk in squares) {
                    if (!sameSquares[sk]) {
                        sMvdset = movedSquares[squares[sk]];
                        sMvd = sMvdset && sMvdset.pop();
                        var translation = posToTranslate(util_1.key2pos(sk), asWhite);
                        if (sMvd) {
                            sMvd.cgKey = sk;
                            translate(sMvd, translation);
                        } else {
                            var squareNode = util_1.createEl('square', squares[sk]);
                            squareNode.cgKey = sk;
                            translate(squareNode, translation);
                            boardEl.insertBefore(squareNode, boardEl.firstChild);
                        }
                    }
                }
                for (var j in piecesKeys) {
                    k = piecesKeys[j];
                    p = pieces[k];
                    anim = anims[k];
                    if (!samePieces[k]) {
                        pMvdset = movedPieces[pieceNameOf(p)];
                        pMvd = pMvdset && pMvdset.pop();
                        if (pMvd) {
                            pMvd.cgKey = k;
                            if (pMvd.cgFading) {
                                pMvd.classList.remove('fading');
                                pMvd.cgFading = false;
                            }
                            var pos = util_1.key2pos(k);
                            if (s.addPieceZIndex)
                                pMvd.style.zIndex = posZIndex(pos, asWhite);
                            if (anim) {
                                pMvd.cgAnimating = true;
                                pMvd.classList.add('anim');
                                pos[0] += anim[2];
                                pos[1] += anim[3];
                            }
                            translate(pMvd, posToTranslate(pos, asWhite));
                        } else {
                            var pieceName = pieceNameOf(p), pieceNode = util_1.createEl('piece', pieceName),
                                pos = util_1.key2pos(k);
                            pieceNode.cgPiece = pieceName;
                            pieceNode.cgKey = k;
                            if (anim) {
                                pieceNode.cgAnimating = true;
                                pos[0] += anim[2];
                                pos[1] += anim[3];
                            }
                            translate(pieceNode, posToTranslate(pos, asWhite));
                            if (s.addPieceZIndex)
                                pieceNode.style.zIndex = posZIndex(pos, asWhite);
                            boardEl.appendChild(pieceNode);
                        }
                    }
                }
                for (var i in movedPieces)
                    removeNodes(s, movedPieces[i]);
                for (var i in movedSquares)
                    removeNodes(s, movedSquares[i]);
            }

            exports.default = render;

            function isPieceNode(el) {
                return el.tagName === 'PIECE';
            }

            function isSquareNode(el) {
                return el.tagName === 'SQUARE';
            }

            function removeNodes(s, nodes) {
                for (var i in nodes)
                    s.dom.elements.board.removeChild(nodes[i]);
            }

            function posZIndex(pos, asWhite) {
                var z = 2 + (pos[1] - 1) * 8 + (8 - pos[0]);
                if (asWhite)
                    z = 67 - z;
                return z + '';
            }

            function pieceNameOf(piece) {
                return piece.color + " " + piece.role;
            }

            function computeSquareClasses(s) {
                var squares = {};
                var i, k;
                if (s.lastMove && s.highlight.lastMove)
                    for (i in s.lastMove) {
                        addSquare(squares, s.lastMove[i], 'last-move');
                    }
                if (s.check && s.highlight.check)
                    addSquare(squares, s.check, 'check');
                if (s.selected) {
                    addSquare(squares, s.selected, 'selected');
                    if (s.movable.showDests) {
                        var dests = s.movable.dests && s.movable.dests[s.selected];
                        if (dests)
                            for (i in dests) {
                                k = dests[i];
                                addSquare(squares, k, 'move-dest' + (s.pieces[k] ? ' oc' : ''));
                            }
                        var pDests = s.premovable.dests;
                        if (pDests)
                            for (i in pDests) {
                                k = pDests[i];
                                addSquare(squares, k, 'premove-dest' + (s.pieces[k] ? ' oc' : ''));
                            }
                    }
                }
                var premove = s.premovable.current;
                if (premove)
                    for (i in premove)
                        addSquare(squares, premove[i], 'current-premove');
                else if (s.predroppable.current)
                    addSquare(squares, s.predroppable.current.key, 'current-premove');
                var o = s.exploding;
                if (o)
                    for (i in o.keys)
                        addSquare(squares, o.keys[i], 'exploding' + o.stage);
                return squares;
            }

            function addSquare(squares, key, klass) {
                if (squares[key])
                    squares[key] += ' ' + klass;
                else
                    squares[key] = klass;
            }

        }, {"./util": 17}],
        14: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var fen = require("./fen");
            var util_1 = require("./util");

            function defaults() {
                return {
                    pieces: fen.read(fen.initial),
                    orientation: 'white',
                    turnColor: 'white',
                    coordinates: true,
                    autoCastle: true,
                    viewOnly: false,
                    disableContextMenu: false,
                    resizable: true,
                    addPieceZIndex: false,
                    pieceKey: false,
                    highlight: {
                        lastMove: true,
                        check: true
                    },
                    animation: {
                        enabled: true,
                        duration: 200
                    },
                    movable: {
                        free: true,
                        color: 'both',
                        showDests: true,
                        events: {},
                        rookCastle: true
                    },
                    premovable: {
                        enabled: true,
                        showDests: true,
                        castle: true,
                        events: {}
                    },
                    predroppable: {
                        enabled: false,
                        events: {}
                    },
                    draggable: {
                        enabled: true,
                        distance: 3,
                        autoDistance: true,
                        centerPiece: true,
                        showGhost: true,
                        deleteOnDropOff: false
                    },
                    selectable: {
                        enabled: true
                    },
                    stats: {
                        dragged: !('ontouchstart' in window),
                        touched: false
                    },
                    events: {},
                    drawable: {
                        enabled: true,
                        visible: true,
                        eraseOnClick: true,
                        shapes: [],
                        autoShapes: [],
                        brushes: {
                            green: {key: 'g', color: '#15781B', opacity: 1, lineWidth: 10},
                            red: {key: 'r', color: '#882020', opacity: 1, lineWidth: 10},
                            blue: {key: 'b', color: '#003088', opacity: 1, lineWidth: 10},
                            yellow: {key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10},
                            paleBlue: {key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15},
                            paleGreen: {key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15},
                            paleRed: {key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15},
                            paleGrey: {key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15}
                        },
                        pieces: {
                            baseUrl: 'https://lichess1.org/assets/piece/cburnett/'
                        },
                        prevSvgHash: ''
                    },
                    hold: util_1.timer()
                };
            }

            exports.defaults = defaults;

        }, {"./fen": 10, "./util": 17}],
        15: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util_1 = require("./util");

            function createElement(tagName) {
                return document.createElementNS('http://www.w3.org/2000/svg', tagName);
            }

            exports.createElement = createElement;

            function renderSvg(state, root) {
                var d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined,
                    arrowDests = {};
                d.shapes.concat(d.autoShapes).concat(cur ? [cur] : []).forEach(function (s) {
                    if (s.dest)
                        arrowDests[s.dest] = (arrowDests[s.dest] || 0) + 1;
                });
                var shapes = d.shapes.concat(d.autoShapes).map(function (s) {
                    return {
                        shape: s,
                        current: false,
                        hash: shapeHash(s, arrowDests, false)
                    };
                });
                if (cur)
                    shapes.push({
                        shape: cur,
                        current: true,
                        hash: shapeHash(cur, arrowDests, true)
                    });
                var fullHash = shapes.map(function (sc) {
                    return sc.hash;
                }).join('');
                if (fullHash === state.drawable.prevSvgHash)
                    return;
                state.drawable.prevSvgHash = fullHash;
                var defsEl = root.firstChild;
                syncDefs(d, shapes, defsEl);
                syncShapes(state, shapes, d.brushes, arrowDests, root, defsEl);
            }

            exports.renderSvg = renderSvg;

            function syncDefs(d, shapes, defsEl) {
                var brushes = {};
                var brush;
                shapes.forEach(function (s) {
                    if (s.shape.dest) {
                        brush = d.brushes[s.shape.brush];
                        if (s.shape.modifiers)
                            brush = makeCustomBrush(brush, s.shape.modifiers);
                        brushes[brush.key] = brush;
                    }
                });
                var keysInDom = {};
                var el = defsEl.firstChild;
                while (el) {
                    keysInDom[el.getAttribute('cgKey')] = true;
                    el = el.nextSibling;
                }
                for (var key in brushes) {
                    if (!keysInDom[key])
                        defsEl.appendChild(renderMarker(brushes[key]));
                }
            }

            function syncShapes(state, shapes, brushes, arrowDests, root, defsEl) {
                var bounds = state.dom.bounds(), hashesInDom = {}, toRemove = [];
                shapes.forEach(function (sc) {
                    hashesInDom[sc.hash] = false;
                });
                var el = defsEl.nextSibling, elHash;
                while (el) {
                    elHash = el.getAttribute('cgHash');
                    if (hashesInDom.hasOwnProperty(elHash))
                        hashesInDom[elHash] = true;
                    else
                        toRemove.push(el);
                    el = el.nextSibling;
                }
                toRemove.forEach(function (el) {
                    return root.removeChild(el);
                });
                shapes.forEach(function (sc) {
                    if (!hashesInDom[sc.hash])
                        root.appendChild(renderShape(state, sc, brushes, arrowDests, bounds));
                });
            }

            function shapeHash(_a, arrowDests, current) {
                var orig = _a.orig, dest = _a.dest, brush = _a.brush, piece = _a.piece, modifiers = _a.modifiers;
                return [current, orig, dest, brush, dest && arrowDests[dest] > 1,
                    piece && pieceHash(piece),
                    modifiers && modifiersHash(modifiers)
                ].filter(function (x) {
                    return x;
                }).join('');
            }

            function pieceHash(piece) {
                return [piece.color, piece.role, piece.scale].filter(function (x) {
                    return x;
                }).join('');
            }

            function modifiersHash(m) {
                return '' + (m.lineWidth || '');
            }

            function renderShape(state, _a, brushes, arrowDests, bounds) {
                var shape = _a.shape, current = _a.current, hash = _a.hash;
                var el;
                if (shape.piece)
                    el = renderPiece(state.drawable.pieces.baseUrl, orient(util_1.key2pos(shape.orig), state.orientation), shape.piece, bounds);
                else {
                    var orig = orient(util_1.key2pos(shape.orig), state.orientation);
                    if (shape.orig && shape.dest) {
                        var brush = brushes[shape.brush];
                        if (shape.modifiers)
                            brush = makeCustomBrush(brush, shape.modifiers);
                        el = renderArrow(brush, orig, orient(util_1.key2pos(shape.dest), state.orientation), current, arrowDests[shape.dest] > 1, bounds);
                    } else
                        el = renderCircle(brushes[shape.brush], orig, current, bounds);
                }
                el.setAttribute('cgHash', hash);
                return el;
            }

            function renderCircle(brush, pos, current, bounds) {
                var o = pos2px(pos, bounds), widths = circleWidth(bounds), radius = (bounds.width + bounds.height) / 32;
                return setAttributes(createElement('circle'), {
                    stroke: brush.color,
                    'stroke-width': widths[current ? 0 : 1],
                    fill: 'none',
                    opacity: opacity(brush, current),
                    cx: o[0],
                    cy: o[1],
                    r: radius - widths[1] / 2
                });
            }

            function renderArrow(brush, orig, dest, current, shorten, bounds) {
                var m = arrowMargin(bounds, shorten && !current), a = pos2px(orig, bounds), b = pos2px(dest, bounds),
                    dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m,
                    yo = Math.sin(angle) * m;
                return setAttributes(createElement('line'), {
                    stroke: brush.color,
                    'stroke-width': lineWidth(brush, current, bounds),
                    'stroke-linecap': 'round',
                    'marker-end': 'url(#arrowhead-' + brush.key + ')',
                    opacity: opacity(brush, current),
                    x1: a[0],
                    y1: a[1],
                    x2: b[0] - xo,
                    y2: b[1] - yo
                });
            }

            function renderPiece(baseUrl, pos, piece, bounds) {
                var o = pos2px(pos, bounds), size = bounds.width / 8 * (piece.scale || 1),
                    name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
                return setAttributes(createElement('image'), {
                    className: piece.role + " " + piece.color,
                    x: o[0] - size / 2,
                    y: o[1] - size / 2,
                    width: size,
                    height: size,
                    href: baseUrl + name + '.svg'
                });
            }

            function renderMarker(brush) {
                var marker = setAttributes(createElement('marker'), {
                    id: 'arrowhead-' + brush.key,
                    orient: 'auto',
                    markerWidth: 4,
                    markerHeight: 8,
                    refX: 2.05,
                    refY: 2.01
                });
                marker.appendChild(setAttributes(createElement('path'), {
                    d: 'M0,0 V4 L3,2 Z',
                    fill: brush.color
                }));
                marker.setAttribute('cgKey', brush.key);
                return marker;
            }

            function setAttributes(el, attrs) {
                for (var key in attrs)
                    el.setAttribute(key, attrs[key]);
                return el;
            }

            function orient(pos, color) {
                return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
            }

            function makeCustomBrush(base, modifiers) {
                var brush = {
                    color: base.color,
                    opacity: Math.round(base.opacity * 10) / 10,
                    lineWidth: Math.round(modifiers.lineWidth || base.lineWidth)
                };
                brush.key = [base.key, modifiers.lineWidth].filter(function (x) {
                    return x;
                }).join('');
                return brush;
            }

            function circleWidth(bounds) {
                var base = bounds.width / 512;
                return [3 * base, 4 * base];
            }

            function lineWidth(brush, current, bounds) {
                return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
            }

            function opacity(brush, current) {
                return (brush.opacity || 1) * (current ? 0.9 : 1);
            }

            function arrowMargin(bounds, shorten) {
                return (shorten ? 20 : 10) / 512 * bounds.width;
            }

            function pos2px(pos, bounds) {
                return [(pos[0] - 0.5) * bounds.width / 8, (8.5 - pos[1]) * bounds.height / 8];
            }

        }, {"./util": 17}],
        16: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];

        }, {}],
        17: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var _a;
            var cg = require("./types");
            exports.colors = ['white', 'black'];
            exports.invRanks = [8, 7, 6, 5, 4, 3, 2, 1];
            exports.allKeys = (_a = Array.prototype).concat.apply(_a, cg.files.map(function (c) {
                return cg.ranks.map(function (r) {
                    return c + r;
                });
            }));
            exports.pos2key = function (pos) {
                return exports.allKeys[8 * pos[0] + pos[1] - 9];
            };
            exports.key2pos = function (k) {
                return [k.charCodeAt(0) - 96, k.charCodeAt(1) - 48];
            };

            function memo(f) {
                var v;
                var ret = function () {
                    if (v === undefined)
                        v = f();
                    return v;
                };
                ret.clear = function () {
                    v = undefined;
                };
                return ret;
            }

            exports.memo = memo;
            exports.timer = function () {
                var startAt;
                return {
                    start: function () {
                        startAt = Date.now();
                    },
                    cancel: function () {
                        startAt = undefined;
                    },
                    stop: function () {
                        if (!startAt)
                            return 0;
                        var time = Date.now() - startAt;
                        startAt = undefined;
                        return time;
                    }
                };
            };
            exports.opposite = function (c) {
                return c === 'white' ? 'black' : 'white';
            };

            function containsX(xs, x) {
                return xs !== undefined && xs.indexOf(x) !== -1;
            }

            exports.containsX = containsX;
            exports.distanceSq = function (pos1, pos2) {
                return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
            };
            exports.samePiece = function (p1, p2) {
                return p1.role === p2.role && p1.color === p2.color;
            };
            var posToTranslateBase = function (pos, asWhite, xFactor, yFactor) {
                return [
                    (asWhite ? pos[0] - 1 : 8 - pos[0]) * xFactor,
                    (asWhite ? 8 - pos[1] : pos[1] - 1) * yFactor
                ];
            };
            exports.posToTranslateAbs = function (bounds) {
                var xFactor = bounds.width / 8, yFactor = bounds.height / 8;
                return function (pos, asWhite) {
                    return posToTranslateBase(pos, asWhite, xFactor, yFactor);
                };
            };
            exports.posToTranslateRel = function (pos, asWhite) {
                return posToTranslateBase(pos, asWhite, 12.5, 12.5);
            };
            exports.translateAbs = function (el, pos) {
                el.style.transform = "translate(" + pos[0] + "px," + pos[1] + "px)";
            };
            exports.translateRel = function (el, percents) {
                el.style.left = percents[0] + '%';
                el.style.top = percents[1] + '%';
            };
            exports.setVisible = function (el, v) {
                el.style.visibility = v ? 'visible' : 'hidden';
            };
            exports.eventPosition = function (e) {
                if (e.clientX || e.clientX === 0)
                    return [e.clientX, e.clientY];
                if (e.touches && e.targetTouches[0])
                    return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
                return undefined;
            };
            exports.isRightButton = function (e) {
                return e.buttons === 2 || e.button === 2;
            };
            exports.createEl = function (tagName, className) {
                var el = document.createElement(tagName);
                if (className)
                    el.className = className;
                return el;
            };
            exports.raf = (window.requestAnimationFrame || window.setTimeout).bind(window);

        }, {"./types": 16}],
        18: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {value: true});
            var util_1 = require("./util");
            var types_1 = require("./types");
            var svg_1 = require("./svg");

            function wrap(element, s, relative) {
                element.innerHTML = '';
                element.classList.add('cg-wrap');
                util_1.colors.forEach(function (c) {
                    element.classList.toggle('orientation-' + c, s.orientation === c);
                });
                element.classList.toggle('manipulable', !s.viewOnly);
                var helper = util_1.createEl('cg-helper');
                element.appendChild(helper);
                var container = util_1.createEl('cg-container');
                helper.appendChild(container);
                var board = util_1.createEl('cg-board');
                container.appendChild(board);
                var svg;
                if (s.drawable.visible && !relative) {
                    svg = svg_1.createElement('svg');
                    svg.appendChild(svg_1.createElement('defs'));
                    container.appendChild(svg);
                }
                if (s.coordinates) {
                    var orientClass = s.orientation === 'black' ? ' black' : '';
                    container.appendChild(renderCoords(types_1.ranks, 'ranks' + orientClass));
                    container.appendChild(renderCoords(types_1.files, 'files' + orientClass));
                }
                var ghost;
                if (s.draggable.showGhost && !relative) {
                    ghost = util_1.createEl('piece', 'ghost');
                    util_1.setVisible(ghost, false);
                    container.appendChild(ghost);
                }
                return {
                    board: board,
                    container: container,
                    ghost: ghost,
                    svg: svg
                };
            }

            exports.default = wrap;

            function renderCoords(elems, className) {
                var el = util_1.createEl('coords', className);
                var f;
                for (var i in elems) {
                    f = util_1.createEl('coord');
                    f.textContent = elems[i];
                    el.appendChild(f);
                }
                return el;
            }

        }, {"./svg": 15, "./types": 16, "./util": 17}]
    }, {}, [11])(11)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYW5pbS50cyIsInNyYy9hcGkudHMiLCJzcmMvYm9hcmQudHMiLCJzcmMvY2hlc3Nncm91bmQudHMiLCJzcmMvY29uZmlnLnRzIiwic3JjL2RyYWcudHMiLCJzcmMvZHJhdy50cyIsInNyYy9ldmVudHMudHMiLCJzcmMvZXhwbG9zaW9uLnRzIiwic3JjL2Zlbi50cyIsInNyYy9pbmRleC5qcyIsInNyYy9wcmVtb3ZlLnRzIiwic3JjL3JlbmRlci50cyIsInNyYy9zdGF0ZS50cyIsInNyYy9zdmcudHMiLCJzcmMvdHlwZXMudHMiLCJzcmMvdXRpbC50cyIsInNyYy93cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztBQ0NBLDZCQUE4QjtBQTRCOUIsU0FBZ0IsSUFBSSxDQUFJLFFBQXFCLEVBQUUsS0FBWTtJQUN6RCxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RGLENBQUM7QUFGRCxvQkFFQztBQUVELFNBQWdCLE1BQU0sQ0FBSSxRQUFxQixFQUFFLEtBQVk7SUFDM0QsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbkIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUpELHdCQUlDO0FBV0QsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLEtBQWU7SUFDN0MsT0FBTztRQUNMLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3RCLEtBQUssRUFBRSxLQUFLO0tBQ2IsQ0FBQztBQUNKLENB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QTtLQUNKLENBQUM7QUFDSixDQUFDO0FBckRELHVCQXFEQztBQUVELFNBQVMsWUFBWSxDQUFDLEtBQVksRUFBRSxTQUFpQjtJQUNuRCxJQUFNLEVBQUUsR0FBRyxlQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBYyxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ25CLENBQUMsR0FBRyxlQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuQjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IHR5cGUgTXV0YXRpb248QT4gPSAoc3RhdGU6IFN0YXRlKSA9PiBBO1xuXG4vLyAwLDEgYW5pbWF0aW9uIGdvYWxcbi8vIDIsMyBhbmltYXRpb24gY3VycmVudCBzdGF0dXNcbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3IgPSBjZy5OdW1iZXJRdWFkXG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVZlY3RvcnMge1xuICBba2V5OiBzdHJpbmddOiBBbmltVmVjdG9yXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUZhZGluZ3Mge1xuICBba2V5OiBzdHJpbmddOiBjZy5QaWVjZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltQ3VycmVudCB7XG4gIHN0YXJ0OiBjZy5UaW1lc3RhbXA7XG4gIGZyZXF1ZW5jeTogY2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk6IGNnLktleTtcbiAgcG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbn1cbmludGVyZmFjZSBBbmltUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVBpZWNlXG59XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IGNnLktleSwgcGllY2U6IGNnLlBpZWNlKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogY2cuUGllY2VzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0ge30sXG4gIGFuaW1lZE9yaWdzOiBjZy5LZXlbXSA9IFtdLFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IHt9LFxuICBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXSxcbiAgbmV3czogQW5pbVBpZWNlW10gPSBbXSxcbiAgcHJlUGllY2VzOiBBbmltUGllY2VzID0ge307XG4gIGxldCBjdXJQOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCwgcHJlUDogQW5pbVBpZWNlIHwgdW5kZWZpbmVkLCBpOiBhbnksIHZlY3RvcjogY2cuTnVtYmVyUGFpcjtcbiAgZm9yIChpIGluIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXNbaV0gPSBtYWtlUGllY2UoaSBhcyBjZy5LZXksIHByZXZQaWVjZXNbaV0hKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLmFsbEtleXMpIHtcbiAgICBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICBwcmVQID0gcHJlUGllY2VzW2tleV07XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBuZXdzLmZvckVhY2gobmV3UCA9PiB7XG4gICAgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIocCA9PiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltc1tuZXdQLmtleV0gPSB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3RvcjtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKCF1dGlsLmNvbnRhaW5zWChhbmltZWRPcmlncywgcC5rZXkpKSBmYWRpbmdzW3Aua2V5XSA9IHAucGllY2U7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuY29uc3QgcGVyZiA9IHdpbmRvdy5wZXJmb3JtYW5jZSAhPT0gdW5kZWZpbmVkID8gd2luZG93LnBlcmZvcm1hbmNlIDogRGF0ZTtcblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogY2cuVGltZXN0YW1wKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICBpZiAoY3VyID09PSB1bmRlZmluZWQpIHsgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZCA6KFxuICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZCkgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgaWYgKHJlc3QgPD0gMCkge1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgIGZvciAobGV0IGkgaW4gY3VyLnBsYW4uYW5pbXMpIHtcbiAgICAgIGNvbnN0IGNmZyA9IGN1ci5wbGFuLmFuaW1zW2ldO1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgdXRpbC5yYWYoKG5vdyA9IHBlcmYubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IGNnLlBpZWNlcyA9IHsuLi5zdGF0ZS5waWVjZXN9O1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgY29uc3QgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHN0YXRlKTtcbiAgaWYgKCFpc09iamVjdEVtcHR5KHBsYW4uYW5pbXMpIHx8ICFpc09iamVjdEVtcHR5KHBsYW4uZmFkaW5ncykpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ICYmIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0O1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmYubm93KCksXG4gICAgICBmcmVxdWVuY3k6IDEgLyBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sXG4gICAgICBwbGFuOiBwbGFuXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmLm5vdygpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0RW1wdHkobzogYW55KTogYm9vbGVhbiB7XG4gIGZvciAobGV0IF8gaW4gbykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG5mdW5jdGlvbiBlYXNpbmcodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHQgPCAwLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHdyaXRlIGFzIGZlbldyaXRlIH0gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBDb25maWcsIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgYW5pbSwgcmVuZGVyIH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdTaGFwZSB9IGZyb20gJy4vZHJhdydcbmltcG9ydCBleHBsb3Npb24gZnJvbSAnLi9leHBsb3Npb24nXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9ucywgZXhjZXB0IGZvciB2aWV3T25seSAmIGRyYXdhYmxlLnZpc2libGUuXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWQuXG4gIHNldChjb25maWc6IENvbmZpZyk6IHZvaWQ7XG5cbiAgLy8gcmVhZCBjaGVzc2dyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3MuXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGFzIGEgRkVOIHN0cmluZyAob25seSBjb250YWlucyBwaWVjZXMsIG5vIGZsYWdzKVxuICAvLyBlLmcuIHJuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlJcbiAgZ2V0RmVuKCk6IGNnLkZFTjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IGNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogY2cuS2V5IHwgbnVsbCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwdXQgYSBuZXcgcGllY2Ugb24gdGhlIGJvYXJkXG4gIG5ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AodmFsaWRhdGU6IChkcm9wOiBjZy5Ecm9wKSA9PiBib29sZWFuKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBiZWluZyBtYWRlXG4gIGNhbmNlbE1vdmUoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gbWFrZSBzcXVhcmVzIGV4cGxvZGUgKGF0b21pYyBjaGVzcylcbiAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBzcXVhcmUgbmFtZSBhdCB0aGlzIERPTSBwb3NpdGlvbiAobGlrZSBcImU0XCIpXG4gIGdldEtleUF0RG9tUG9zKHBvczogY2cuTnVtYmVyUGFpcik6IGNnLktleSB8IHVuZGVmaW5lZDtcblxuICAvLyBvbmx5IHVzZWZ1bCB3aGVuIENTUyBjaGFuZ2VzIHRoZSBib2FyZCB3aWR0aC9oZWlnaHQgcmF0aW8gKGZvciAzRClcbiAgcmVkcmF3QWxsOiBjZy5SZWRyYXc7XG5cbiAgLy8gZm9yIGNyYXp5aG91c2UgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwgZXZlbnQ6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IGNnLlVuYmluZFxufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBkdHMvYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogQXBpIHtcblxuICBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgcmVkcmF3QWxsKCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcblxuICAgIHNldChjb25maWcpIHtcbiAgICAgIGlmIChjb25maWcub3JpZW50YXRpb24gJiYgY29uZmlnLm9yaWVudGF0aW9uICE9PSBzdGF0ZS5vcmllbnRhdGlvbikgdG9nZ2xlT3JpZW50YXRpb24oKTtcbiAgICAgIChjb25maWcuZmVuID8gYW5pbSA6IHJlbmRlcikoc3RhdGUgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0RmVuOiAoKSA9PiBmZW5Xcml0ZShzdGF0ZS5waWVjZXMpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBmb3JjZSkge1xuICAgICAgaWYgKGtleSkgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBuZXdQaWVjZShwaWVjZSwga2V5KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGtleSksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKSB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKHZhbGlkYXRlKSB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYm9hcmQucGxheVByZWRyb3Aoc3RhdGUsIHZhbGlkYXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlbW92ZSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVkcm9wKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlZHJvcCwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxNb3ZlKCkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHsgYm9hcmQuY2FuY2VsTW92ZShzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5zdG9wKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSkge1xuICAgICAgZXhwbG9zaW9uKHN0YXRlLCBrZXlzKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBnZXRLZXlBdERvbVBvcyhwb3MpIHtcbiAgICAgIHJldHVybiBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3MsIHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgIH0sXG5cbiAgICByZWRyYXdBbGwsXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBmb3JjZSkge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIGZvcmNlKVxuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kICYmIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHBvczJrZXksIGtleTJwb3MsIG9wcG9zaXRlLCBjb250YWluc1ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgcHJlbW92ZSBmcm9tICcuL3ByZW1vdmUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogU3RhdGUsIHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gICAgZWxzZSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IGNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbG9yID09PSB0cnVlKSBjb2xvciA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgaWYgKGNvbG9yKSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10hLnJvbGUgPT09ICdraW5nJyAmJiBzdGF0ZS5waWVjZXNba10hLmNvbG9yID09PSBjb2xvcikge1xuICAgICAgc3RhdGUuY2hlY2sgPSBrIGFzIGNnLktleTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhOiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpOiB2b2lkIHtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gW29yaWcsIGRlc3RdO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgbWV0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUsIHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0ge1xuICAgIHJvbGU6IHJvbGUsXG4gICAga2V5OiBrZXlcbiAgfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcm9sZSwga2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcGQgPSBzdGF0ZS5wcmVkcm9wcGFibGU7XG4gIGlmIChwZC5jdXJyZW50KSB7XG4gICAgcGQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHBkLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmICghc3RhdGUuYXV0b0Nhc3RsZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBraW5nID0gc3RhdGUucGllY2VzW29yaWddO1xuICBpZiAoIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZ1BvcyA9IGtleTJwb3Mob3JpZyk7XG4gIGlmIChvcmlnUG9zWzBdICE9PSA1KSByZXR1cm4gZmFsc2U7XG4gIGlmIChvcmlnUG9zWzFdICE9PSAxICYmIG9yaWdQb3NbMV0gIT09IDgpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZGVzdFBvcyA9IGtleTJwb3MoZGVzdCk7XG4gIGxldCBvbGRSb29rUG9zLCBuZXdSb29rUG9zLCBuZXdLaW5nUG9zO1xuICBpZiAoZGVzdFBvc1swXSA9PT0gNyB8fCBkZXN0UG9zWzBdID09PSA4KSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzgsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNiwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFs3LCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSBpZiAoZGVzdFBvc1swXSA9PT0gMyB8fCBkZXN0UG9zWzBdID09PSAxKSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzEsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFszLCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgcm9vayA9IHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcbiAgaWYgKCFyb29rIHx8IHJvb2sucm9sZSAhPT0gJ3Jvb2snKSByZXR1cm4gZmFsc2U7XG5cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcblxuICBzdGF0ZS5waWVjZXNbbmV3S2luZ1Bvc10gPSBraW5nXG4gIHN0YXRlLnBpZWNlc1tuZXdSb29rUG9zXSA9IHJvb2s7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXSwgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gKGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvcikgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gIGlmIChkZXN0ID09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIGNhcHR1cmVkKTtcbiAgaWYgKCF0cnlBdXRvQ2FzdGxlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHN0YXRlLnBpZWNlc1tkZXN0XSA9IG9yaWdQaWVjZTtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB9XG4gIHN0YXRlLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLnBpZWNlc1trZXldKSB7XG4gICAgaWYgKGZvcmNlKSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcE5ld1BpZWNlLCBwaWVjZSwga2V5KTtcbiAgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgc3RhdGUubGFzdE1vdmUgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGhvbGRUaW1lID0gc3RhdGUuaG9sZC5zdG9wKCk7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0ge1xuICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleSxcbiAgICAgICAgaG9sZFRpbWU6IGhvbGRUaW1lXG4gICAgICB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCB7XG4gICAgICBjdHJsS2V5OiBzdGF0ZS5zdGF0cy5jdHJsS2V5XG4gICAgfSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICB9IGVsc2UgaWYgKGlzTW92YWJsZShzdGF0ZSwgZGVzdCkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBkZXN0KSkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBkZXN0KTtcbiAgICBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH0gZWxzZSB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3BOZXdQaWVjZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIG9yaWcsIGRlc3QpIHx8IGZvcmNlKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ10hO1xuICAgIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gICAgYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZGVzdCwgZm9yY2UpO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXJOZXdQaWVjZSwgcGllY2Uucm9sZSwgZGVzdCwge1xuICAgICAgcHJlZHJvcDogZmFsc2VcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChjYW5QcmVkcm9wKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZWRyb3Aoc3RhdGUsIHN0YXRlLnBpZWNlc1tvcmlnXSEucm9sZSwgZGVzdCk7XG4gIH0gZWxzZSB7XG4gICAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB9XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFNxdWFyZShzdGF0ZTogU3RhdGUsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkID09PSBrZXkgJiYgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkKSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiYgc3RhdGUuc2VsZWN0ZWQgIT09IGtleSkge1xuICAgICAgaWYgKHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5KSkgc3RhdGUuc3RhdHMuZHJhZ2dlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH0gZWxzZSBpZiAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBrZXkpO1xuICAgIHN0YXRlLmhvbGQuc3RhcnQoKTtcbiAgfVxuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogU3RhdGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBpZiAoaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHByZW1vdmUoc3RhdGUucGllY2VzLCBrZXksIHN0YXRlLnByZW1vdmFibGUuY2FzdGxlKTtcbiAgfVxuICBlbHNlIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvbGQuY2FuY2VsKCk7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yXG4gICAgKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiYgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5mcmVlIHx8ICghIXN0YXRlLm1vdmFibGUuZGVzdHMgJiYgY29udGFpbnNYKHN0YXRlLm1vdmFibGUuZGVzdHNbb3JpZ10sIGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIGRlc3QgJiYgKG9yaWcgPT09IGRlc3QgfHwgIXN0YXRlLnBpZWNlc1tkZXN0XSkgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yXG4gICAgKSk7XG59XG5cblxuZnVuY3Rpb24gaXNQcmVtb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiZcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yO1xufVxuXG5mdW5jdGlvbiBjYW5QcmVtb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiZcbiAgaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICBjb250YWluc1gocHJlbW92ZShzdGF0ZS5waWVjZXMsIG9yaWcsIHN0YXRlLnByZW1vdmFibGUuY2FzdGxlKSwgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICByZXR1cm4gISFwaWVjZSAmJiBkZXN0ICYmXG4gICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUubW92YWJsZS5jb2xvcikgJiZcbiAgc3RhdGUucHJlZHJvcHBhYmxlLmVuYWJsZWQgJiZcbiAgKHBpZWNlLnJvbGUgIT09ICdwYXduJyB8fCAoZGVzdFsxXSAhPT0gJzEnICYmIGRlc3RbMV0gIT09ICc4JykpICYmXG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmIChcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fCBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWRcbiAgICAgIClcbiAgICApXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlbW92ZShzdGF0ZTogU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlWzBdLCBkZXN0ID0gbW92ZVsxXTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0geyBwcmVtb3ZlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBTdGF0ZSwgdmFsaWRhdGU6IChkcm9wOiBjZy5Ecm9wKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGxldCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQsXG4gIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKCFkcm9wKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZGF0ZShkcm9wKSkge1xuICAgIGNvbnN0IHBpZWNlID0ge1xuICAgICAgcm9sZTogZHJvcC5yb2xlLFxuICAgICAgY29sb3I6IHN0YXRlLm1vdmFibGUuY29sb3JcbiAgICB9IGFzIGNnLlBpZWNlO1xuICAgIGlmIChiYXNlTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBkcm9wLmtleSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXJOZXdQaWVjZSwgZHJvcC5yb2xlLCBkcm9wLmtleSwge1xuICAgICAgICBwcmVkcm9wOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbE1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPVxuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGNhbmNlbE1vdmUoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5QXREb21Qb3MocG9zOiBjZy5OdW1iZXJQYWlyLCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBjZy5LZXkgfCB1bmRlZmluZWQge1xuICBsZXQgZmlsZSA9IE1hdGguY2VpbCg4ICogKChwb3NbMF0gLSBib3VuZHMubGVmdCkgLyBib3VuZHMud2lkdGgpKTtcbiAgaWYgKCFhc1doaXRlKSBmaWxlID0gOSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5jZWlsKDggLSAoOCAqICgocG9zWzFdIC0gYm91bmRzLnRvcCkgLyBib3VuZHMuaGVpZ2h0KSkpO1xuICBpZiAoIWFzV2hpdGUpIHJhbmsgPSA5IC0gcmFuaztcbiAgcmV0dXJuIChmaWxlID4gMCAmJiBmaWxlIDwgOSAmJiByYW5rID4gMCAmJiByYW5rIDwgOSkgPyBwb3Mya2V5KFtmaWxlLCByYW5rXSkgOiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBBcGksIHN0YXJ0IH0gZnJvbSAnLi9hcGknXG5pbXBvcnQgeyBDb25maWcsIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgU3RhdGUsIGRlZmF1bHRzIH0gZnJvbSAnLi9zdGF0ZSdcblxuaW1wb3J0IHJlbmRlcldyYXAgZnJvbSAnLi93cmFwJztcbmltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICcuL2V2ZW50cydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0ICogYXMgc3ZnIGZyb20gJy4vc3ZnJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIENoZXNzZ3JvdW5kKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBDb25maWcpOiBBcGkge1xuXG4gIGNvbnN0IHN0YXRlID0gZGVmYXVsdHMoKSBhcyBTdGF0ZTtcblxuICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyB8fCB7fSk7XG5cbiAgZnVuY3Rpb24gcmVkcmF3QWxsKCkge1xuICAgIGxldCBwcmV2VW5iaW5kID0gc3RhdGUuZG9tICYmIHN0YXRlLmRvbS51bmJpbmQ7XG4gICAgLy8gZmlyc3QgZW5zdXJlIHRoZSBjZy13cmFwIGNsYXNzIGlzIHNldFxuICAgIC8vIHNvIGJvdW5kcyBjYWxjdWxhdGlvbiBjYW4gdXNlIHRoZSBDU1Mgd2lkdGgvaGVpZ2h0IHZhbHVlc1xuICAgIC8vIGFkZCB0aGF0IGNsYXNzIHlvdXJzZWxmIHRvIHRoZSBlbGVtZW50IGJlZm9yZSBjYWxsaW5nIGNoZXNzZ3JvdW5kXG4gICAgLy8gZm9yIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50ISAoYXZvaWRzIHJlY29tcHV0aW5nIHN0eWxlKVxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2ctd3JhcCcpO1xuICAgIC8vIGNvbXB1dGUgYm91bmRzIGZyb20gZXhpc3RpbmcgYm9hcmQgZWxlbWVudCBpZiBwb3NzaWJsZVxuICAgIC8vIHRoaXMgYWxsb3dzIG5vbi1zcXVhcmUgYm9hcmRzIGZyb20gQ1NTIHRvIGJlIGhhbmRsZWQgKGZvciAzRClcbiAgICBjb25zdCByZWxhdGl2ZSA9IHN0YXRlLnZpZXdPbmx5ICYmICFzdGF0ZS5kcmF3YWJsZS52aXNpYmxlO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gcmVuZGVyV3JhcChlbGVtZW50LCBzdGF0ZSwgcmVsYXRpdmUpO1xuICAgIGNvbnN0IGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50cy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG4gICAgY29uc3QgcmVkcmF3Tm93ID0gKHNraXBTdmc/OiBib29sZWFuKSA9PiB7XG4gICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2Zykgc3ZnLnJlbmRlclN2ZyhzdGF0ZSwgZWxlbWVudHMuc3ZnKTtcbiAgICB9O1xuICAgIHN0YXRlLmRvbSA9IHtcbiAgICAgIGVsZW1lbnRzOiBlbGVtZW50cyxcbiAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3cpLFxuICAgICAgcmVkcmF3Tm93OiByZWRyYXdOb3csXG4gICAgICB1bmJpbmQ6IHByZXZVbmJpbmQsXG4gICAgICByZWxhdGl2ZVxuICAgIH07XG4gICAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgICByZWRyYXdOb3coZmFsc2UpO1xuICAgIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUpO1xuICAgIGlmICghcHJldlVuYmluZCkgc3RhdGUuZG9tLnVuYmluZCA9IGV2ZW50cy5iaW5kRG9jdW1lbnQoc3RhdGUsIHJlZHJhd0FsbCk7XG4gICAgc3RhdGUuZXZlbnRzLmluc2VydCAmJiBzdGF0ZS5ldmVudHMuaW5zZXJ0KGVsZW1lbnRzKTtcbiAgfVxuICByZWRyYXdBbGwoKTtcblxuICBjb25zdCBhcGkgPSBzdGFydChzdGF0ZSwgcmVkcmF3QWxsKTtcblxuICByZXR1cm4gYXBpO1xufTtcblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHV0aWwucmFmKCgpID0+IHtcbiAgICAgIHJlZHJhd05vdygpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBzZXRDaGVjaywgc2V0U2VsZWN0ZWQgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgcmVhZCBhcyBmZW5SZWFkIH0gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBEcmF3U2hhcGUsIERyYXdCcnVzaCB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgZmVuPzogY2cuRkVOOyAvLyBjaGVzcyBwb3NpdGlvbiBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIG9yaWVudGF0aW9uPzogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcj86IGNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHdoaXRlIHwgYmxhY2tcbiAgY2hlY2s/OiBjZy5Db2xvciB8IGJvb2xlYW47IC8vIHRydWUgZm9yIGN1cnJlbnQgY29sb3IsIGZhbHNlIHRvIHVuc2V0XG4gIGxhc3RNb3ZlPzogY2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIFtcImMzXCIsIFwiYzRcIl1cbiAgc2VsZWN0ZWQ/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJhMVwiXG4gIGNvb3JkaW5hdGVzPzogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICBhdXRvQ2FzdGxlPzogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5PzogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgZGlzYWJsZUNvbnRleHRNZW51PzogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBjaGVzc2JvYXJkXG4gIHJlc2l6YWJsZT86IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4PzogYm9vbGVhbjsgLy8gYWRkcyB6LWluZGV4IHZhbHVlcyB0byBwaWVjZXMgKGZvciAzRClcbiAgLy8gcGllY2VLZXk6IGJvb2xlYW47IC8vIGFkZCBhIGRhdGEta2V5IGF0dHJpYnV0ZSB0byBwaWVjZSBlbGVtZW50c1xuICBoaWdobGlnaHQ/OiB7XG4gICAgbGFzdE1vdmU/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjaz86IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbj86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBkdXJhdGlvbj86IG51bWJlcjtcbiAgfTtcbiAgbW92YWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGNvbG9yPzogY2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUuIHdoaXRlIHwgYmxhY2sgfCBib3RoIHwgdW5kZWZpbmVkXG4gICAgZGVzdHM/OiB7XG4gICAgICBba2V5OiBzdHJpbmddOiBjZy5LZXlbXVxuICAgIH07IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgICBhZnRlck5ld1BpZWNlPzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgYSBuZXcgcGllY2UgaXMgZHJvcHBlZCBvbiB0aGUgYm9hcmRcbiAgICB9O1xuICAgIHJvb2tDYXN0bGU/OiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhbGxvdyBraW5nIGNhc3RsZSBwcmVtb3Zlc1xuICAgIGRlc3RzPzogY2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgZHJhZ2dhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlPzogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlPzogYm9vbGVhbjsgLy8gbGV0cyBjaGVzc2dyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgY2VudGVyUGllY2U/OiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0PzogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgZGVsZXRlT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgfTtcbiAgc2VsZWN0YWJsZT86IHtcbiAgICAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZW5hYmxlZD86IGJvb2xlYW5cbiAgfTtcbiAgZXZlbnRzPzoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgLy8gY2FwdHVyZWRQaWVjZSBpcyB1bmRlZmluZWQgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZSc7ICdyb2xlJzogJ3F1ZWVuJ31cbiAgICBtb3ZlPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZFBpZWNlPzogY2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcE5ld1BpZWNlPzogKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIGluc2VydD86IChlbGVtZW50czogY2cuRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gICAgdmlzaWJsZT86IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gICAgZXJhc2VPbkNsaWNrPzogYm9vbGVhbjtcbiAgICBzaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBhdXRvU2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYnJ1c2hlcz86IERyYXdCcnVzaFtdO1xuICAgIHBpZWNlcz86IHtcbiAgICAgIGJhc2VVcmw/OiBzdHJpbmc7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IFN0YXRlLCBjb25maWc6IENvbmZpZykge1xuXG4gIC8vIGRvbid0IG1lcmdlIGRlc3RpbmF0aW9ucy4gSnVzdCBvdmVycmlkZS5cbiAgaWYgKGNvbmZpZy5tb3ZhYmxlICYmIGNvbmZpZy5tb3ZhYmxlLmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIG1lcmdlKHN0YXRlLCBjb25maWcpO1xuXG4gIC8vIGlmIGEgZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzXG4gIGlmIChjb25maWcuZmVuKSB7XG4gICAgc3RhdGUucGllY2VzID0gZmVuUmVhZChjb25maWcuZmVuKTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnY2hlY2snKSkgc2V0Q2hlY2soc3RhdGUsIGNvbmZpZy5jaGVjayB8fCBmYWxzZSk7XG4gIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoJ2xhc3RNb3ZlJykgJiYgIWNvbmZpZy5sYXN0TW92ZSkgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIC8vIGluIGNhc2Ugb2YgWkggZHJvcCBsYXN0IG1vdmUsIHRoZXJlJ3MgYSBzaW5nbGUgc3F1YXJlLlxuICAvLyBpZiB0aGUgcHJldmlvdXMgbGFzdCBtb3ZlIGhhZCB0d28gc3F1YXJlcyxcbiAgLy8gdGhlIG1lcmdlIGFsZ29yaXRobSB3aWxsIGluY29ycmVjdGx5IGtlZXAgdGhlIHNlY29uZCBzcXVhcmUuXG4gIGVsc2UgaWYgKGNvbmZpZy5sYXN0TW92ZSkgc3RhdGUubGFzdE1vdmUgPSBjb25maWcubGFzdE1vdmU7XG5cbiAgLy8gZml4IG1vdmUvcHJlbW92ZSBkZXN0c1xuICBpZiAoc3RhdGUuc2VsZWN0ZWQpIHNldFNlbGVjdGVkKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCk7XG5cbiAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gIGlmICghc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIHx8IHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiA8IDEwMCkgc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcblxuICBpZiAoIXN0YXRlLm1vdmFibGUucm9va0Nhc3RsZSAmJiBzdGF0ZS5tb3ZhYmxlLmRlc3RzKSB7XG4gICAgY29uc3QgcmFuayA9IHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICd3aGl0ZScgPyAxIDogODtcbiAgICBjb25zdCBraW5nU3RhcnRQb3MgPSAnZScgKyByYW5rO1xuICAgIGNvbnN0IGRlc3RzID0gc3RhdGUubW92YWJsZS5kZXN0c1traW5nU3RhcnRQb3NdO1xuICAgIGNvbnN0IGtpbmcgPSBzdGF0ZS5waWVjZXNba2luZ1N0YXJ0UG9zXTtcbiAgICBpZiAoIWRlc3RzIHx8ICFraW5nIHx8IGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm47XG4gICAgc3RhdGUubW92YWJsZS5kZXN0c1traW5nU3RhcnRQb3NdID0gZGVzdHMuZmlsdGVyKGQgPT5cbiAgICAgICEoKGQgPT09ICdhJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2MnICsgcmFuayBhcyBjZy5LZXkpICE9PSAtMSkgJiZcbiAgICAgICAgISgoZCA9PT0gJ2gnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignZycgKyByYW5rIGFzIGNnLktleSkgIT09IC0xKVxuICAgICk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpIHtcbiAgZm9yIChsZXQga2V5IGluIGV4dGVuZCkge1xuICAgIGlmIChpc09iamVjdChiYXNlW2tleV0pICYmIGlzT2JqZWN0KGV4dGVuZFtrZXldKSkgbWVyZ2UoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XG4gICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc09iamVjdChvOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0Jztcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdDdXJyZW50IHtcbiAgb3JpZzogY2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICBvcmlnUG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbiAgcmVsOiBjZy5OdW1iZXJQYWlyOyAvLyB4OyB5IG9mIHRoZSBwaWVjZSBhdCBvcmlnaW5hbCBwb3NpdGlvblxuICBlcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyBpbml0aWFsIGV2ZW50IHBvc2l0aW9uXG4gIHBvczogY2cuTnVtYmVyUGFpcjsgLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICBkZWM6IGNnLk51bWJlclBhaXI7IC8vIHBpZWNlIGNlbnRlciBkZWNheVxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgZWxlbWVudDogY2cuUGllY2VOb2RlIHwgKCgpID0+IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCk7XG4gIG5ld1BpZWNlPzogYm9vbGVhbjsgLy8gaXQgaXQgYSBuZXcgcGllY2UgZnJvbSBvdXRzaWRlIHRoZSBib2FyZFxuICBmb3JjZT86IGJvb2xlYW47IC8vIGNhbiB0aGUgbmV3IHBpZWNlIHJlcGxhY2UgYW4gZXhpc3Rpbmcgb25lIChlZGl0b3IpXG4gIHByZXZpb3VzbHlTZWxlY3RlZD86IGNnLktleTtcbiAgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuOyAvLyBvbmx5IHRvdWNoIG9yIGxlZnQgY2xpY2tcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAoZS50eXBlID09PSAndG91Y2hzdGFydCcpIHMuc3RhdHMudG91Y2hlZCA9IHRydWU7XG4gIGVsc2UgaWYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgcy5zdGF0cy50b3VjaGVkKSByZXR1cm47XG4gIGNvbnN0IGFzV2hpdGUgPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBhc1doaXRlLCBib3VuZHMpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWQgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIChcbiAgICBzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKSkgZHJhd0NsZWFyKHMpO1xuICBpZiAoIWUudG91Y2hlcyB8fCBwaWVjZSB8fCBwcmV2aW91c2x5U2VsZWN0ZWQgfHwgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICBpZiAocy5zZWxlY3RlZCAmJiBib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgfSBlbHNlIHtcbiAgICBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gIH1cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGVsZW1lbnQgPSBwaWVjZUVsZW1lbnRCeUtleShzLCBvcmlnKTtcbiAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMob3JpZywgYXNXaGl0ZSwgYm91bmRzKTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgb3JpZzogb3JpZyxcbiAgICAgIG9yaWdQb3M6IHV0aWwua2V5MnBvcyhvcmlnKSxcbiAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzLmRyYWdnYWJsZS5jZW50ZXJQaWVjZSA/IFtcbiAgICAgICAgcG9zaXRpb25bMF0gLSAoc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyKSxcbiAgICAgICAgcG9zaXRpb25bMV0gLSAoc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyKVxuICAgICAgXSA6IFswLCAwXSxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBzLnN0YXRzLmRyYWdnZWQsXG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkOiBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0XG4gICAgfTtcbiAgICBlbGVtZW50LmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAvLyBwbGFjZSBnaG9zdFxuICAgIGNvbnN0IGdob3N0ID0gcy5kb20uZWxlbWVudHMuZ2hvc3Q7XG4gICAgaWYgKGdob3N0KSB7XG4gICAgICBnaG9zdC5jbGFzc05hbWUgPSBgZ2hvc3QgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG4gICAgICB1dGlsLnRyYW5zbGF0ZUFicyhnaG9zdCwgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhib3VuZHMpKHV0aWwua2V5MnBvcyhvcmlnKSwgYXNXaGl0ZSkpO1xuICAgICAgdXRpbC5zZXRWaXNpYmxlKGdob3N0LCB0cnVlKTtcbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VDbG9zZVRvKHM6IFN0YXRlLCBwb3M6IGNnLlBvcyk6IGJvb2xlYW4ge1xuICBjb25zdCBhc1doaXRlID0gcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyxcbiAgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHJhZGl1c1NxID0gTWF0aC5wb3coYm91bmRzLndpZHRoIC8gOCwgMik7XG4gIGZvciAobGV0IGtleSBpbiBzLnBpZWNlcykge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5IGFzIGNnLktleSwgYXNXaGl0ZSwgYm91bmRzKSxcbiAgICBjZW50ZXI6IGNnLlBvcyA9IFtcbiAgICAgIHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMixcbiAgICAgIHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMlxuICAgIF07XG4gICAgaWYgKHV0aWwuZGlzdGFuY2VTcShjZW50ZXIsIHBvcykgPD0gcmFkaXVzU3EpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYWdOZXdQaWVjZShzOiBTdGF0ZSwgcGllY2U6IGNnLlBpZWNlLCBlOiBjZy5Nb3VjaEV2ZW50LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcblxuICBjb25zdCBrZXk6IGNnLktleSA9ICdhMCc7XG5cbiAgcy5waWVjZXNba2V5XSA9IHBpZWNlO1xuXG4gIHMuZG9tLnJlZHJhdygpO1xuXG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIGFzV2hpdGUgPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXksIGFzV2hpdGUsIGJvdW5kcyk7XG5cbiAgY29uc3QgcmVsOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgIChhc1doaXRlID8gMCA6IDcpICogc3F1YXJlQm91bmRzLndpZHRoICsgYm91bmRzLmxlZnQsXG4gICAgKGFzV2hpdGUgPyA4IDogLTEpICogc3F1YXJlQm91bmRzLmhlaWdodCArIGJvdW5kcy50b3BcbiAgXTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IGtleSxcbiAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZTogcGllY2UsXG4gICAgcmVsOiByZWwsXG4gICAgZXBvczogcG9zaXRpb24sXG4gICAgcG9zOiBbcG9zaXRpb25bMF0gLSByZWxbMF0sIHBvc2l0aW9uWzFdIC0gcmVsWzFdXSxcbiAgICBkZWM6IFstc3F1YXJlQm91bmRzLndpZHRoIC8gMiwgLXNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXSxcbiAgICBzdGFydGVkOiB0cnVlLFxuICAgIGVsZW1lbnQ6ICgpID0+IHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSksXG4gICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICBuZXdQaWVjZTogdHJ1ZSxcbiAgICBmb3JjZTogZm9yY2UgfHwgZmFsc2VcbiAgfTtcbiAgcHJvY2Vzc0RyYWcocyk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmFnKHM6IFN0YXRlKTogdm9pZCB7XG4gIHV0aWwucmFmKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGlmICghY3VyKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAocy5hbmltYXRpb24uY3VycmVudCAmJiBzLmFuaW1hdGlvbi5jdXJyZW50LnBsYW4uYW5pbXNbY3VyLm9yaWddKSBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EoY3VyLmVwb3MsIGN1ci5yZWwpID49IE1hdGgucG93KHMuZHJhZ2dhYmxlLmRpc3RhbmNlLCAyKSkgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBsYXp5IGVsZW1lbnRzXG4gICAgICAgIGlmICh0eXBlb2YgY3VyLmVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGN1ci5lbGVtZW50KCk7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgICAgIGN1ci5lbGVtZW50ID0gZm91bmQ7XG4gICAgICAgICAgY3VyLmVsZW1lbnQuY2dEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgY3VyLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFzV2hpdGUgPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICAgICAgICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKTtcbiAgICAgICAgY3VyLnBvcyA9IFtcbiAgICAgICAgICBjdXIuZXBvc1swXSAtIGN1ci5yZWxbMF0sXG4gICAgICAgICAgY3VyLmVwb3NbMV0gLSBjdXIucmVsWzFdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gbW92ZSBwaWVjZVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHV0aWwucG9zVG9UcmFuc2xhdGVBYnMoYm91bmRzKShjdXIub3JpZ1BvcywgYXNXaGl0ZSk7XG4gICAgICAgIHRyYW5zbGF0aW9uWzBdICs9IGN1ci5wb3NbMF0gKyBjdXIuZGVjWzBdO1xuICAgICAgICB0cmFuc2xhdGlvblsxXSArPSBjdXIucG9zWzFdICsgY3VyLmRlY1sxXTtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoY3VyLmVsZW1lbnQsIHRyYW5zbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50LmVwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIgJiYgY3VyLm9yaWdpblRhcmdldCAhPT0gZS50YXJnZXQgJiYgIWN1ci5uZXdQaWVjZSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvczogY2cuTnVtYmVyUGFpciA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIuZXBvcztcbiAgY29uc3QgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzLmRvbS5ib3VuZHMoKSk7XG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkKSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsIGN1ci5vcmlnLCBkZXN0LCBjdXIuZm9yY2UpO1xuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSkgcy5zdGF0cy5kcmFnZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VyLm5ld1BpZWNlKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGJvYXJkLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gIGVsc2UgaWYgKCFzLnNlbGVjdGFibGUuZW5hYmxlZCkgYm9hcmQudW5zZWxlY3Qocyk7XG5cbiAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURyYWdFbGVtZW50cyhzOiBTdGF0ZSkge1xuICBjb25zdCBlID0gcy5kb20uZWxlbWVudHM7XG4gIGlmIChlLmdob3N0KSB1dGlsLnNldFZpc2libGUoZS5naG9zdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQm91bmRzKGtleTogY2cuS2V5LCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGlmICghYXNXaGl0ZSkge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHM6IFN0YXRlLCBrZXk6IGNnLktleSk6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoZWwuY2dLZXkgPT09IGtleSAmJiBlbC50YWdOYW1lID09PSAnUElFQ0UnKSByZXR1cm4gZWw7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcyB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyBldmVudFBvc2l0aW9uLCByYWYsIGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IGNnLktleTtcbiAgZGVzdD86IGNnLktleTtcbiAgYnJ1c2g6IHN0cmluZztcbiAgbW9kaWZpZXJzPzogRHJhd01vZGlmaWVycztcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IGNnLlJvbGU7XG4gIGNvbG9yOiBjZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0JydXNoIHtcbiAga2V5OiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG9wYWNpdHk6IG51bWJlcjtcbiAgbGluZVdpZHRoOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2hlcyB7XG4gIFtuYW1lOiBzdHJpbmddOiBEcmF3QnJ1c2g7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd01vZGlmaWVycyB7XG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3YWJsZSB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gIHZpc2libGU6IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIGJydXNoZXM6IERyYXdCcnVzaGVzO1xuICAvLyBkcmF3YWJsZSBTVkcgcGllY2VzOyB1c2VkIGZvciBjcmF6eWhvdXNlIGRyb3BcbiAgcGllY2VzOiB7XG4gICAgYmFzZVVybDogc3RyaW5nXG4gIH0sXG4gIHByZXZTdmdIYXNoOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3Q3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhd2luZ1xuICBkZXN0PzogY2cuS2V5OyAvLyBzaGFwZSBkZXN0LCBvciB1bmRlZmluZWQgZm9yIGNpcmNsZVxuICBtb3VzZVNxPzogY2cuS2V5OyAvLyBzcXVhcmUgYmVpbmcgbW91c2VkIG92ZXJcbiAgcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ2dyZWVuJywgJ3JlZCcsICdibHVlJywgJ3llbGxvdyddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBlLmN0cmxLZXkgPyB1bnNlbGVjdChzdGF0ZSkgOiBjYW5jZWxNb3ZlKHN0YXRlKTtcbiAgY29uc3QgcG9zaXRpb24gPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG4gIGNvbnN0IG9yaWcgPSBnZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgc3RhdGUub3JpZW50YXRpb24gPT09ICd3aGl0ZScsIHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IG9yaWcsXG4gICAgcG9zOiBwb3NpdGlvbixcbiAgICBicnVzaDogZXZlbnRCcnVzaChlKVxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmFmKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgIGlmIChjdXIpIHtcbiAgICAgIGNvbnN0IG1vdXNlU3EgPSBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCBzdGF0ZS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJywgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICAgIGlmIChtb3VzZVNxICE9PSBjdXIubW91c2VTcSkge1xuICAgICAgICBjdXIubW91c2VTcSA9IG1vdXNlU3E7XG4gICAgICAgIGN1ci5kZXN0ID0gbW91c2VTcSAhPT0gY3VyLm9yaWcgPyBtb3VzZVNxIDogdW5kZWZpbmVkO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LnBvcyA9IGV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGlmIChjdXIubW91c2VTcSkgYWRkU2hhcGUoc3RhdGUuZHJhd2FibGUsIGN1cik7XG4gICAgY2FuY2VsKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGgpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgb25DaGFuZ2Uoc3RhdGUuZHJhd2FibGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogY2cuTW91Y2hFdmVudCk6IHN0cmluZyB7XG4gIGNvbnN0IGE6IG51bWJlciA9IGUuc2hpZnRLZXkgJiYgaXNSaWdodEJ1dHRvbihlKSA/IDEgOiAwO1xuICBjb25zdCBiOiBudW1iZXIgPSBlLmFsdEtleSA/IDIgOiAwO1xuICByZXR1cm4gYnJ1c2hlc1thICsgYl07XG59XG5cbmZ1bmN0aW9uIG5vdDxBPihmOiAoYTogQSkgPT4gYm9vbGVhbik6IChhOiBBKSA9PiBib29sZWFuIHtcbiAgcmV0dXJuICh4OiBBKSA9PiAhZih4KTtcbn1cblxuZnVuY3Rpb24gYWRkU2hhcGUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50KTogdm9pZCB7XG4gIGNvbnN0IHNhbWVTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4gcy5vcmlnID09PSBjdXIub3JpZyAmJiBzLmRlc3QgPT09IGN1ci5kZXN0O1xuICB9O1xuICBjb25zdCBzaW1pbGFyID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihzYW1lU2hhcGUpWzBdO1xuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihub3Qoc2FtZVNoYXBlKSk7XG4gIGlmICghc2ltaWxhciB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1cik7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyBpc1JpZ2h0QnV0dG9uLCByYWYgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSk6IHZvaWQge1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuXG4gIC8vIG11c3QgTk9UIGJlIGEgcGFzc2l2ZSBldmVudCFcblxuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIpO1xuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlLCByZWRyYXdBbGw6IGNnLlJlZHJhdyk6IGNnLlVuYmluZCB7XG5cbiAgY29uc3QgdW5iaW5kczogY2cuVW5iaW5kW10gPSBbXTtcblxuICBpZiAoIXMuZG9tLnJlbGF0aXZlICYmIHMucmVzaXphYmxlKSB7XG4gICAgY29uc3Qgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICBzLmRvbS5ib3VuZHMuY2xlYXIoKTtcbiAgICAgIHJhZihyZWRyYXdBbGwpO1xuICAgIH07XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScsIG9uUmVzaXplKSk7XG4gIH1cblxuICBpZiAoIXMudmlld09ubHkpIHtcblxuICAgIGNvbnN0IG9ubW92ZTogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLm1vdmUsIGRyYXcubW92ZSk7XG4gICAgY29uc3Qgb25lbmQ6IE1vdWNoQmluZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcblxuICAgIFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddLmZvckVhY2goZXYgPT4gdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbm1vdmUpKSk7XG4gICAgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kKSkpO1xuXG4gICAgY29uc3Qgb25TY3JvbGwgPSAoKSA9PiBzLmRvbS5ib3VuZHMuY2xlYXIoKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB1bmJpbmRzLmZvckVhY2goZiA9PiBmKCkpO1xufVxuXG5mdW5jdGlvbiB1bmJpbmRhYmxlKGVsOiBFdmVudFRhcmdldCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBNb3VjaEJpbmQsIG9wdGlvbnM/OiBhbnkpOiBjZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2sgYXMgRXZlbnRMaXN0ZW5lciwgb3B0aW9ucyk7XG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2sgYXMgRXZlbnRMaXN0ZW5lcik7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydChzLCBlKTsgfVxuICAgIGVsc2UgaWYgKCFzLnZpZXdPbmx5KSBkcmFnLnN0YXJ0KHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7IGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXhwbG9zaW9uKHN0YXRlOiBTdGF0ZSwga2V5czogS2V5W10pOiB2b2lkIHtcbiAgc3RhdGUuZXhwbG9kaW5nID0ge1xuICAgIHN0YWdlOiAxLFxuICAgIGtleXM6IGtleXNcbiAgfTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBzZXRTdGFnZShzdGF0ZSwgMik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRTdGFnZShzdGF0ZSwgdW5kZWZpbmVkKSwgMTIwKTtcbiAgfSwgMTIwKTtcbn1cblxuZnVuY3Rpb24gc2V0U3RhZ2Uoc3RhdGU6IFN0YXRlLCBzdGFnZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5leHBsb2RpbmcpIHtcbiAgICBpZiAoc3RhZ2UpIHN0YXRlLmV4cGxvZGluZy5zdGFnZSA9IHN0YWdlO1xuICAgIGVsc2Ugc3RhdGUuZXhwbG9kaW5nID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcG9zMmtleSwgaW52UmFua3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbDogY2cuRkVOID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlInO1xuXG5jb25zdCByb2xlczogeyBbbGV0dGVyOiBzdHJpbmddOiBjZy5Sb2xlIH0gPSB7IHA6ICdwYXduJywgcjogJ3Jvb2snLCBuOiAna25pZ2h0JywgYjogJ2Jpc2hvcCcsIHE6ICdxdWVlbicsIGs6ICdraW5nJyB9O1xuXG5jb25zdCBsZXR0ZXJzID0geyBwYXduOiAncCcsIHJvb2s6ICdyJywga25pZ2h0OiAnbicsIGJpc2hvcDogJ2InLCBxdWVlbjogJ3EnLCBraW5nOiAnaycgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWQoZmVuOiBjZy5GRU4pOiBjZy5QaWVjZXMge1xuICBpZiAoZmVuID09PSAnc3RhcnQnKSBmZW4gPSBpbml0aWFsO1xuICBjb25zdCBwaWVjZXM6IGNnLlBpZWNlcyA9IHt9O1xuICBsZXQgcm93OiBudW1iZXIgPSA4O1xuICBsZXQgY29sOiBudW1iZXIgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmVuKSB7XG4gICAgc3dpdGNoIChjKSB7XG4gICAgICBjYXNlICcgJzogcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICAtLXJvdztcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgY29sID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd+JzpcbiAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV07XG4gICAgICAgIGlmIChwaWVjZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIgPCA1NykgY29sICs9IG5iIC0gNDg7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsrY29sO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldID0ge1xuICAgICAgICAgICAgcm9sZTogcm9sZXNbcm9sZV0sXG4gICAgICAgICAgICBjb2xvcjogKGMgPT09IHJvbGUgPyAnYmxhY2snIDogJ3doaXRlJykgYXMgY2cuQ29sb3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXM6IGNnLlBpZWNlcyk6IGNnLkZFTiB7XG4gIHJldHVybiBpbnZSYW5rcy5tYXAoeSA9PiBjZy5yYW5rcy5tYXAoeCA9PiB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1twb3Mya2V5KFt4LCB5XSldO1xuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIGNvbnN0IGxldHRlciA9IGxldHRlcnNbcGllY2Uucm9sZV07XG4gICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3doaXRlJyA/IGxldHRlci50b1VwcGVyQ2FzZSgpIDogbGV0dGVyO1xuICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgfSkuam9pbignJylcbiAgKS5qb2luKCcvJykucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vY2hlc3Nncm91bmRcIikuQ2hlc3Nncm91bmQ7XG4iLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbnR5cGUgTW9iaWxpdHkgPSAoeDE6bnVtYmVyLCB5MTpudW1iZXIsIHgyOm51bWJlciwgeTI6bnVtYmVyKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBkaWZmKGE6IG51bWJlciwgYjpudW1iZXIpOm51bWJlciB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYik7XG59XG5cbmZ1bmN0aW9uIHBhd24oY29sb3I6IGNnLkNvbG9yKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB5MSwgeDIsIHkyKSA9PiBkaWZmKHgxLCB4MikgPCAyICYmIChcbiAgICBjb2xvciA9PT0gJ3doaXRlJyA/IChcbiAgICAgIC8vIGFsbG93IDIgc3F1YXJlcyBmcm9tIDEgYW5kIDgsIGZvciBob3JkZVxuICAgICAgeTIgPT09IHkxICsgMSB8fCAoeTEgPD0gMiAmJiB5MiA9PT0gKHkxICsgMikgJiYgeDEgPT09IHgyKVxuICAgICkgOiAoXG4gICAgICB5MiA9PT0geTEgLSAxIHx8ICh5MSA+PSA3ICYmIHkyID09PSAoeTEgLSAyKSAmJiB4MSA9PT0geDIpXG4gICAgKVxuICApO1xufVxuXG5jb25zdCBrbmlnaHQ6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIGNvbnN0IHhkID0gZGlmZih4MSwgeDIpO1xuICBjb25zdCB5ZCA9IGRpZmYoeTEsIHkyKTtcbiAgcmV0dXJuICh4ZCA9PT0gMSAmJiB5ZCA9PT0gMikgfHwgKHhkID09PSAyICYmIHlkID09PSAxKTtcbn1cblxuY29uc3QgYmlzaG9wOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4gZGlmZih4MSwgeDIpID09PSBkaWZmKHkxLCB5Mik7XG59XG5cbmNvbnN0IHJvb2s6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiB4MSA9PT0geDIgfHwgeTEgPT09IHkyO1xufVxuXG5jb25zdCBxdWVlbjogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIGJpc2hvcCh4MSwgeTEsIHgyLCB5MikgfHwgcm9vayh4MSwgeTEsIHgyLCB5Mik7XG59XG5cbmZ1bmN0aW9uIGtpbmcoY29sb3I6IGNnLkNvbG9yLCByb29rRmlsZXM6IG51bWJlcltdLCBjYW5DYXN0bGU6IGJvb2xlYW4pOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpICA9PiAoXG4gICAgZGlmZih4MSwgeDIpIDwgMiAmJiBkaWZmKHkxLCB5MikgPCAyXG4gICkgfHwgKFxuICAgIGNhbkNhc3RsZSAmJiB5MSA9PT0geTIgJiYgeTEgPT09IChjb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4KSAmJiAoXG4gICAgICAoeDEgPT09IDUgJiYgKHgyID09PSAzIHx8IHgyID09PSA3KSkgfHwgdXRpbC5jb250YWluc1gocm9va0ZpbGVzLCB4MilcbiAgICApXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJvb2tGaWxlc09mKHBpZWNlczogY2cuUGllY2VzLCBjb2xvcjogY2cuQ29sb3IpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHBpZWNlcykuZmlsdGVyKGtleSA9PiB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IGNvbG9yICYmIHBpZWNlLnJvbGUgPT09ICdyb29rJztcbiAgfSkubWFwKChrZXk6IHN0cmluZyApID0+IHV0aWwua2V5MnBvcyhrZXkgYXMgY2cuS2V5KVswXSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByZW1vdmUocGllY2VzOiBjZy5QaWVjZXMsIGtleTogY2cuS2V5LCBjYW5DYXN0bGU6IGJvb2xlYW4pOiBjZy5LZXlbXSB7XG4gIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV0hLFxuICBwb3MgPSB1dGlsLmtleTJwb3Moa2V5KTtcbiAgbGV0IG1vYmlsaXR5OiBNb2JpbGl0eTtcbiAgc3dpdGNoIChwaWVjZS5yb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICBtb2JpbGl0eSA9IHBhd24ocGllY2UuY29sb3IpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAna25pZ2h0JzpcbiAgICAgIG1vYmlsaXR5ID0ga25pZ2h0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmlzaG9wJzpcbiAgICAgIG1vYmlsaXR5ID0gYmlzaG9wO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncm9vayc6XG4gICAgICBtb2JpbGl0eSA9IHJvb2s7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdxdWVlbic6XG4gICAgICBtb2JpbGl0eSA9IHF1ZWVuO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAna2luZyc6XG4gICAgICBtb2JpbGl0eSA9IGtpbmcocGllY2UuY29sb3IsIHJvb2tGaWxlc09mKHBpZWNlcywgcGllY2UuY29sb3IpLCBjYW5DYXN0bGUpO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHV0aWwuYWxsS2V5cy5tYXAodXRpbC5rZXkycG9zKS5maWx0ZXIocG9zMiA9PiB7XG4gICAgcmV0dXJuIChwb3NbMF0gIT09IHBvczJbMF0gfHwgcG9zWzFdICE9PSBwb3MyWzFdKSAmJiBtb2JpbGl0eShwb3NbMF0sIHBvc1sxXSwgcG9zMlswXSwgcG9zMlsxXSk7XG4gIH0pLm1hcCh1dGlsLnBvczJrZXkpO1xufTtcbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGtleTJwb3MsIGNyZWF0ZUVsIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBBbmltQ3VycmVudCwgQW5pbVZlY3RvcnMsIEFuaW1WZWN0b3IsIEFuaW1GYWRpbmdzIH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG4vLyBgJGNvbG9yICRyb2xlYFxudHlwZSBQaWVjZU5hbWUgPSBzdHJpbmc7XG5cbmludGVyZmFjZSBTYW1lUGllY2VzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgU2FtZVNxdWFyZXMgeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH1cbmludGVyZmFjZSBNb3ZlZFBpZWNlcyB7IFtwaWVjZU5hbWU6IHN0cmluZ106IGNnLlBpZWNlTm9kZVtdIH1cbmludGVyZmFjZSBNb3ZlZFNxdWFyZXMgeyBbY2xhc3NOYW1lOiBzdHJpbmddOiBjZy5TcXVhcmVOb2RlW10gfVxuaW50ZXJmYWNlIFNxdWFyZUNsYXNzZXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfVxuXG4vLyBwb3J0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdmVsb2NlL2xpY2hvYmlsZS9ibG9iL21hc3Rlci9zcmMvanMvY2hlc3Nncm91bmQvdmlldy5qc1xuLy8gaW4gY2FzZSBvZiBidWdzLCBibGFtZSBAdmVsb2NlXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgYXNXaGl0ZTogYm9vbGVhbiA9IHMub3JpZW50YXRpb24gPT09ICd3aGl0ZScsXG4gIHBvc1RvVHJhbnNsYXRlID0gcy5kb20ucmVsYXRpdmUgPyB1dGlsLnBvc1RvVHJhbnNsYXRlUmVsIDogdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRvbS5ib3VuZHMoKSksXG4gIHRyYW5zbGF0ZSA9IHMuZG9tLnJlbGF0aXZlID8gdXRpbC50cmFuc2xhdGVSZWwgOiB1dGlsLnRyYW5zbGF0ZUFicyxcbiAgYm9hcmRFbDogSFRNTEVsZW1lbnQgPSBzLmRvbS5lbGVtZW50cy5ib2FyZCxcbiAgcGllY2VzOiBjZy5QaWVjZXMgPSBzLnBpZWNlcyxcbiAgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50LFxuICBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDoge30sXG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5mYWRpbmdzIDoge30sXG4gIGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudCxcbiAgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IGNvbXB1dGVTcXVhcmVDbGFzc2VzKHMpLFxuICBzYW1lUGllY2VzOiBTYW1lUGllY2VzID0ge30sXG4gIHNhbWVTcXVhcmVzOiBTYW1lU3F1YXJlcyA9IHt9LFxuICBtb3ZlZFBpZWNlczogTW92ZWRQaWVjZXMgPSB7fSxcbiAgbW92ZWRTcXVhcmVzOiBNb3ZlZFNxdWFyZXMgPSB7fSxcbiAgcGllY2VzS2V5czogY2cuS2V5W10gPSBPYmplY3Qua2V5cyhwaWVjZXMpIGFzIGNnLktleVtdO1xuICBsZXQgazogY2cuS2V5LFxuICBwOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUsXG4gIHBpZWNlQXRLZXk6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbFBpZWNlTmFtZTogUGllY2VOYW1lLFxuICBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkLFxuICBmYWRpbmc6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBwTXZkc2V0OiBjZy5QaWVjZU5vZGVbXSxcbiAgcE12ZDogY2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkLFxuICBzTXZkc2V0OiBjZy5TcXVhcmVOb2RlW10sXG4gIHNNdmQ6IGNnLlNxdWFyZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gYm9hcmRFbC5maXJzdENoaWxkIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIHdoaWxlIChlbCkge1xuICAgIGsgPSBlbC5jZ0tleTtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzW2tdO1xuICAgICAgYW5pbSA9IGFuaW1zW2tdO1xuICAgICAgZmFkaW5nID0gZmFkaW5nc1trXTtcbiAgICAgIGVsUGllY2VOYW1lID0gZWwuY2dQaWVjZTtcbiAgICAgIC8vIGlmIHBpZWNlIG5vdCBiZWluZyBkcmFnZ2VkIGFueW1vcmUsIHJlbW92ZSBkcmFnZ2luZyBzdHlsZVxuICAgICAgaWYgKGVsLmNnRHJhZ2dpbmcgJiYgKCFjdXJEcmFnIHx8IGN1ckRyYWcub3JpZyAhPT0gaykpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dpbmcnKTtcbiAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgIGVsLmNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuY2dGYWRpbmcpIHtcbiAgICAgICAgZWwuY2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKGFuaW0gJiYgZWwuY2dBbmltYXRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5jZ0FuaW1hdGluZykge1xuICAgICAgICAgIGVsLmNnQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbScpO1xuICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNXaGl0ZSkpO1xuICAgICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBlbC5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgoa2V5MnBvcyhrKSwgYXNXaGl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2FtZSBwaWVjZTogZmxhZyBhcyBzYW1lXG4gICAgICAgIGlmIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgJiYgKCFmYWRpbmcgfHwgIWVsLmNnRmFkaW5nKSkge1xuICAgICAgICAgIHNhbWVQaWVjZXNba10gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRpZmZlcmVudCBwaWVjZTogZmxhZyBhcyBtb3ZlZCB1bmxlc3MgaXQgaXMgYSBmYWRpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgICBlbC5jZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0pIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXS5wdXNoKGVsKTtcbiAgICAgICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlOiBmbGFnIGFzIG1vdmVkXG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICBlbHNlIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSA9IFtlbF07XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3F1YXJlTm9kZShlbCkpIHtcbiAgICAgIGNvbnN0IGNuID0gZWwuY2xhc3NOYW1lO1xuICAgICAgaWYgKHNxdWFyZXNba10gPT09IGNuKSBzYW1lU3F1YXJlc1trXSA9IHRydWU7XG4gICAgICBlbHNlIGlmIChtb3ZlZFNxdWFyZXNbY25dKSBtb3ZlZFNxdWFyZXNbY25dLnB1c2goZWwpO1xuICAgICAgZWxzZSBtb3ZlZFNxdWFyZXNbY25dID0gW2VsXTtcbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBzcXVhcmVzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBzcXVhcmVzXG4gIC8vIG9yIGFwcGVuZCBuZXcgc3F1YXJlc1xuICBmb3IgKGNvbnN0IHNrIGluIHNxdWFyZXMpIHtcbiAgICBpZiAoIXNhbWVTcXVhcmVzW3NrXSkge1xuICAgICAgc012ZHNldCA9IG1vdmVkU3F1YXJlc1tzcXVhcmVzW3NrXV07XG4gICAgICBzTXZkID0gc012ZHNldCAmJiBzTXZkc2V0LnBvcCgpO1xuICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKHNrIGFzIGNnLktleSksIGFzV2hpdGUpO1xuICAgICAgaWYgKHNNdmQpIHtcbiAgICAgICAgc012ZC5jZ0tleSA9IHNrIGFzIGNnLktleTtcbiAgICAgICAgdHJhbnNsYXRlKHNNdmQsIHRyYW5zbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBzcXVhcmVOb2RlID0gY3JlYXRlRWwoJ3NxdWFyZScsIHNxdWFyZXNbc2tdKSBhcyBjZy5TcXVhcmVOb2RlO1xuICAgICAgICBzcXVhcmVOb2RlLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc3F1YXJlTm9kZSwgdHJhbnNsYXRpb24pO1xuICAgICAgICBib2FyZEVsLmluc2VydEJlZm9yZShzcXVhcmVOb2RlLCBib2FyZEVsLmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgcGllY2VzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBwaWVjZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBwaWVjZXNcbiAgZm9yIChjb25zdCBqIGluIHBpZWNlc0tleXMpIHtcbiAgICBrID0gcGllY2VzS2V5c1tqXTtcbiAgICBwID0gcGllY2VzW2tdITtcbiAgICBhbmltID0gYW5pbXNba107XG4gICAgaWYgKCFzYW1lUGllY2VzW2tdKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXNbcGllY2VOYW1lT2YocCldO1xuICAgICAgcE12ZCA9IHBNdmRzZXQgJiYgcE12ZHNldC5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuY2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5jZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICAgICAgcE12ZC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBwTXZkLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuY2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZShwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlIGluIG1vdmVkIG9iajogaW5zZXJ0IHRoZSBuZXcgcGllY2VcbiAgICAgIC8vIGFzc3VtZXMgdGhlIG5ldyBwaWVjZSBpcyBub3QgYmVpbmcgZHJhZ2dlZFxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgY29uc3QgcGllY2VOYW1lID0gcGllY2VOYW1lT2YocCksXG4gICAgICAgIHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZSkgYXMgY2cuUGllY2VOb2RlLFxuICAgICAgICBwb3MgPSBrZXkycG9zKGspO1xuXG4gICAgICAgIHBpZWNlTm9kZS5jZ1BpZWNlID0gcGllY2VOYW1lO1xuICAgICAgICBwaWVjZU5vZGUuY2dLZXkgPSBrO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBpZWNlTm9kZS5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlKHBpZWNlTm9kZSwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG5cbiAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIHBpZWNlTm9kZS5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgocG9zLCBhc1doaXRlKTtcblxuICAgICAgICBib2FyZEVsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVtb3ZlIGFueSBlbGVtZW50IHRoYXQgcmVtYWlucyBpbiB0aGUgbW92ZWQgc2V0c1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRQaWVjZXMpIHJlbW92ZU5vZGVzKHMsIG1vdmVkUGllY2VzW2ldKTtcbiAgZm9yIChjb25zdCBpIGluIG1vdmVkU3F1YXJlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRTcXVhcmVzW2ldKTtcbn1cblxuZnVuY3Rpb24gaXNQaWVjZU5vZGUoZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUpOiBlbCBpcyBjZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmZ1bmN0aW9uIGlzU3F1YXJlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlNxdWFyZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRVUFSRSc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzKHM6IFN0YXRlLCBub2RlczogSFRNTEVsZW1lbnRbXSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGkgaW4gbm9kZXMpIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnJlbW92ZUNoaWxkKG5vZGVzW2ldKTtcbn1cblxuZnVuY3Rpb24gcG9zWkluZGV4KHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgbGV0IHogPSAyICsgKHBvc1sxXSAtIDEpICogOCArICg4IC0gcG9zWzBdKTtcbiAgaWYgKGFzV2hpdGUpIHogPSA2NyAtIHo7XG4gIHJldHVybiB6ICsgJyc7XG59XG5cbmZ1bmN0aW9uIHBpZWNlTmFtZU9mKHBpZWNlOiBjZy5QaWVjZSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSB7fTtcbiAgbGV0IGk6IGFueSwgazogY2cuS2V5O1xuICBpZiAocy5sYXN0TW92ZSAmJiBzLmhpZ2hsaWdodC5sYXN0TW92ZSkgZm9yIChpIGluIHMubGFzdE1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5sYXN0TW92ZVtpXSwgJ2xhc3QtbW92ZScpO1xuICB9XG4gIGlmIChzLmNoZWNrICYmIHMuaGlnaGxpZ2h0LmNoZWNrKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5jaGVjaywgJ2NoZWNrJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cyAmJiBzLm1vdmFibGUuZGVzdHNbcy5zZWxlY3RlZF07XG4gICAgICBpZiAoZGVzdHMpIGZvciAoaSBpbiBkZXN0cykge1xuICAgICAgICBrID0gZGVzdHNbaV07XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbW92ZS1kZXN0JyArIChzLnBpZWNlc1trXSA/ICcgb2MnIDogJycpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlbW92YWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpIGZvciAoaSBpbiBwRGVzdHMpIHtcbiAgICAgICAgayA9IHBEZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmVtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBwcmVtb3ZlID0gcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmIChwcmVtb3ZlKSBmb3IgKGkgaW4gcHJlbW92ZSkgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmVbaV0sICdjdXJyZW50LXByZW1vdmUnKTtcbiAgZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LCAnY3VycmVudC1wcmVtb3ZlJyk7XG5cbiAgY29uc3QgbyA9IHMuZXhwbG9kaW5nO1xuICBpZiAobykgZm9yIChpIGluIG8ua2V5cykgYWRkU3F1YXJlKHNxdWFyZXMsIG8ua2V5c1tpXSwgJ2V4cGxvZGluZycgKyBvLnN0YWdlKTtcblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gYWRkU3F1YXJlKHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMsIGtleTogY2cuS2V5LCBrbGFzczogc3RyaW5nKTogdm9pZCB7XG4gIGlmIChzcXVhcmVzW2tleV0pIHNxdWFyZXNba2V5XSArPSAnICcgKyBrbGFzcztcbiAgZWxzZSBzcXVhcmVzW2tleV0gPSBrbGFzcztcbn1cbiIsImltcG9ydCAqIGFzIGZlbiBmcm9tICcuL2ZlbidcbmltcG9ydCB7IEFuaW1DdXJyZW50IH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgeyBEcmF3YWJsZSB9IGZyb20gJy4vZHJhdydcbmltcG9ydCB7IHRpbWVyIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGUge1xuICBwaWVjZXM6IGNnLlBpZWNlcztcbiAgb3JpZW50YXRpb246IGNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gd2hpdGUgfCBibGFja1xuICB0dXJuQ29sb3I6IGNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHdoaXRlIHwgYmxhY2tcbiAgY2hlY2s/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgaW4gY2hlY2sgXCJhMlwiXG4gIGxhc3RNb3ZlPzogY2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIFtcImMzXCI7IFwiYzRcIl1cbiAgc2VsZWN0ZWQ/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJhMVwiXG4gIGNvb3JkaW5hdGVzOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gIGF1dG9DYXN0bGU6IGJvb2xlYW47IC8vIGltbWVkaWF0ZWx5IGNvbXBsZXRlIHRoZSBjYXN0bGUgYnkgbW92aW5nIHRoZSByb29rIGFmdGVyIGtpbmcgbW92ZVxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGNoZXNzYm9hcmRcbiAgcmVzaXphYmxlOiBib29sZWFuOyAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICBhZGRQaWVjZVpJbmRleDogYm9vbGVhbjsgLy8gYWRkcyB6LWluZGV4IHZhbHVlcyB0byBwaWVjZXMgKGZvciAzRClcbiAgcGllY2VLZXk6IGJvb2xlYW47IC8vIGFkZCBhIGRhdGEta2V5IGF0dHJpYnV0ZSB0byBwaWVjZSBlbGVtZW50c1xuICBoaWdobGlnaHQ6IHtcbiAgICBsYXN0TW92ZTogYm9vbGVhbjsgLy8gYWRkIGxhc3QtbW92ZSBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s6IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbjoge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBjdXJyZW50PzogQW5pbUN1cnJlbnQ7XG4gIH07XG4gIG1vdmFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgY29sb3I/OiBjZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZS4gd2hpdGUgfCBibGFjayB8IGJvdGhcbiAgICBkZXN0cz86IGNnLkRlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICAgIGFmdGVyTmV3UGllY2U/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBhIG5ldyBwaWVjZSBpcyBkcm9wcGVkIG9uIHRoZSBib2FyZFxuICAgIH07XG4gICAgcm9va0Nhc3RsZTogYm9vbGVhbiAvLyBjYXN0bGUgYnkgbW92aW5nIHRoZSBraW5nIHRvIHRoZSByb29rXG4gIH07XG4gIHByZW1vdmFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmVtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGNhc3RsZTogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhbGxvdyBraW5nIGNhc3RsZSBwcmVtb3Zlc1xuICAgIGRlc3RzPzogY2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogY2cuS2V5UGFpcjsgLy8ga2V5cyBvZiB0aGUgY3VycmVudCBzYXZlZCBwcmVtb3ZlIFtcImUyXCIgXCJlNFwiXVxuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YT86IGNnLlNldFByZW1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBwcmVkcm9wcGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBjdXJyZW50PzogeyAvLyBjdXJyZW50IHNhdmVkIHByZWRyb3Age3JvbGU6ICdrbmlnaHQnOyBrZXk6ICdlNCd9XG4gICAgICByb2xlOiBjZy5Sb2xlO1xuICAgICAga2V5OiBjZy5LZXlcbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgZHJhZ2dhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZTogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlOiBib29sZWFuOyAvLyBsZXRzIGNoZXNzZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBjZW50ZXJQaWVjZTogYm9vbGVhbjsgLy8gY2VudGVyIHRoZSBwaWVjZSBvbiBjdXJzb3IgYXQgZHJhZyBzdGFydFxuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgZGVsZXRlT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICAgIGN1cnJlbnQ/OiBEcmFnQ3VycmVudDtcbiAgfTtcbiAgc2VsZWN0YWJsZToge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkOiBib29sZWFuXG4gIH07XG4gIHN0YXRzOiB7XG4gICAgLy8gd2FzIGxhc3QgcGllY2UgZHJhZ2dlZCBvciBjbGlja2VkP1xuICAgIC8vIG5lZWRzIGRlZmF1bHQgdG8gZmFsc2UgZm9yIHRvdWNoXG4gICAgZHJhZ2dlZDogYm9vbGVhbixcbiAgICB0b3VjaGVkOiBib29sZWFuLCAvLyBoYXMgdGhlIHNjcmVlbiBiZWVuIHRvdWNoZWQgeWV0P1xuICAgIGN0cmxLZXk/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50czoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgLy8gY2FwdHVyZWRQaWVjZSBpcyB1bmRlZmluZWQgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZSc7ICdyb2xlJzogJ3F1ZWVuJ31cbiAgICBtb3ZlPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZFBpZWNlPzogY2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcE5ld1BpZWNlPzogKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogY2cuS2V5KSA9PiB2b2lkIC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgaW5zZXJ0PzogKGVsZW1lbnRzOiBjZy5FbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZTogRHJhd2FibGUsXG4gIGV4cGxvZGluZz86IGNnLkV4cGxvZGluZztcbiAgZG9tOiBjZy5Eb20sXG4gIGhvbGQ6IGNnLlRpbWVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cygpOiBQYXJ0aWFsPFN0YXRlPiB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBmZW4ucmVhZChmZW4uaW5pdGlhbCksXG4gICAgb3JpZW50YXRpb246ICd3aGl0ZScsXG4gICAgdHVybkNvbG9yOiAnd2hpdGUnLFxuICAgIGNvb3JkaW5hdGVzOiB0cnVlLFxuICAgIGF1dG9DYXN0bGU6IHRydWUsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIGRpc2FibGVDb250ZXh0TWVudTogZmFsc2UsXG4gICAgcmVzaXphYmxlOiB0cnVlLFxuICAgIGFkZFBpZWNlWkluZGV4OiBmYWxzZSxcbiAgICBwaWVjZUtleTogZmFsc2UsXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0TW92ZTogdHJ1ZSxcbiAgICAgIGNoZWNrOiB0cnVlXG4gICAgfSxcbiAgICBhbmltYXRpb246IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkdXJhdGlvbjogMjAwXG4gICAgfSxcbiAgICBtb3ZhYmxlOiB7XG4gICAgICBmcmVlOiB0cnVlLFxuICAgICAgY29sb3I6ICdib3RoJyxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGV2ZW50czoge30sXG4gICAgICByb29rQ2FzdGxlOiB0cnVlXG4gICAgfSxcbiAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgY2FzdGxlOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fVxuICAgIH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgY2VudGVyUGllY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBkZWxldGVPbkRyb3BPZmY6IGZhbHNlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzdGF0czoge1xuICAgICAgLy8gb24gdG91Y2hzY3JlZW4sIGRlZmF1bHQgdG8gXCJ0YXAtdGFwXCIgbW92ZXNcbiAgICAgIC8vIGluc3RlYWQgb2YgZHJhZ1xuICAgICAgZHJhZ2dlZDogISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpLFxuICAgICAgdG91Y2hlZDogZmFsc2VcbiAgICB9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgYnJ1c2hlczoge1xuICAgICAgICBncmVlbjogeyBrZXk6ICdnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICByZWQ6IHsga2V5OiAncicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgYmx1ZTogeyBrZXk6ICdiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICB5ZWxsb3c6IHsga2V5OiAneScsIGNvbG9yOiAnI2U2OGYwMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcGFsZUJsdWU6IHsga2V5OiAncGInLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZWVuOiB7IGtleTogJ3BnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVSZWQ6IHsga2V5OiAncHInLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZXk6IHsga2V5OiAncGdyJywgY29sb3I6ICcjNGE0YTRhJywgb3BhY2l0eTogMC4zNSwgbGluZVdpZHRoOiAxNSB9XG4gICAgICB9LFxuICAgICAgcGllY2VzOiB7XG4gICAgICAgIGJhc2VVcmw6ICdodHRwczovL2xpY2hlc3MxLm9yZy9hc3NldHMvcGllY2UvY2J1cm5ldHQvJ1xuICAgICAgfSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJ1xuICAgIH0sXG4gICAgaG9sZDogdGltZXIoKVxuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsga2V5MnBvcyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IERyYXdhYmxlLCBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3QnJ1c2gsIERyYXdCcnVzaGVzLCBEcmF3TW9kaWZpZXJzIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGN1cnJlbnQ6IGJvb2xlYW47XG4gIGhhc2g6IEhhc2g7XG59XG5cbmludGVyZmFjZSBDdXN0b21CcnVzaGVzIHtcbiAgW2hhc2g6IHN0cmluZ106IERyYXdCcnVzaFxufVxuXG5pbnRlcmZhY2UgQXJyb3dEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlcjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcbn1cblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3ZnKHN0YXRlOiBTdGF0ZSwgcm9vdDogU1ZHRWxlbWVudCk6IHZvaWQge1xuXG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZSxcbiAgY3VyRCA9IGQuY3VycmVudCxcbiAgY3VyID0gY3VyRCAmJiBjdXJELm1vdXNlU3EgPyBjdXJEIGFzIERyYXdTaGFwZSA6IHVuZGVmaW5lZCxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IHt9O1xuXG4gIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKS5mb3JFYWNoKHMgPT4ge1xuICAgIGlmIChzLmRlc3QpIGFycm93RGVzdHNbcy5kZXN0XSA9IChhcnJvd0Rlc3RzW3MuZGVzdF0gfHwgMCkgKyAxO1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGN1cnJlbnQ6IGZhbHNlLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlKVxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKSBzaGFwZXMucHVzaCh7XG4gICAgc2hhcGU6IGN1cixcbiAgICBjdXJyZW50OiB0cnVlLFxuICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUpXG4gIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIGNvbnN0IGRlZnNFbCA9IHJvb3QuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKGQsIHNoYXBlcywgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhzdGF0ZSwgc2hhcGVzLCBkLmJydXNoZXMsIGFycm93RGVzdHMsIHJvb3QsIGRlZnNFbCk7XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKGQ6IERyYXdhYmxlLCBzaGFwZXM6IFNoYXBlW10sIGRlZnNFbDogU1ZHRWxlbWVudCkge1xuICBjb25zdCBicnVzaGVzOiBDdXN0b21CcnVzaGVzID0ge307XG4gIGxldCBicnVzaDogRHJhd0JydXNoO1xuICBzaGFwZXMuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5zaGFwZS5kZXN0KSB7XG4gICAgICBicnVzaCA9IGQuYnJ1c2hlc1tzLnNoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzLnNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHMuc2hhcGUubW9kaWZpZXJzKTtcbiAgICAgIGJydXNoZXNbYnJ1c2gua2V5XSA9IGJydXNoO1xuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGtleXNJbkRvbToge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGxldCBlbDogU1ZHRWxlbWVudCA9IGRlZnNFbC5maXJzdENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlKGVsKSB7XG4gICAga2V5c0luRG9tW2VsLmdldEF0dHJpYnV0ZSgnY2dLZXknKSBhcyBzdHJpbmddID0gdHJ1ZTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgZm9yIChsZXQga2V5IGluIGJydXNoZXMpIHtcbiAgICBpZiAoIWtleXNJbkRvbVtrZXldKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoZXNba2V5XSkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5mdW5jdGlvbiBzeW5jU2hhcGVzKHN0YXRlOiBTdGF0ZSwgc2hhcGVzOiBTaGFwZVtdLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgcm9vdDogU1ZHRWxlbWVudCwgZGVmc0VsOiBTVkdFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMoKSxcbiAgaGFzaGVzSW5Eb206IHtbaGFzaDogc3RyaW5nXTogYm9vbGVhbn0gPSB7fSxcbiAgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7IGhhc2hlc0luRG9tW3NjLmhhc2hdID0gZmFsc2U7IH0pO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudCwgZWxIYXNoOiBIYXNoO1xuICB3aGlsZShlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnY2dIYXNoJykgYXMgSGFzaDtcbiAgICAvLyBmb3VuZCBhIHNoYXBlIGVsZW1lbnQgdGhhdCdzIGhlcmUgdG8gc3RheVxuICAgIGlmIChoYXNoZXNJbkRvbS5oYXNPd25Qcm9wZXJ0eShlbEhhc2gpKSBoYXNoZXNJbkRvbVtlbEhhc2hdID0gdHJ1ZTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudDtcbiAgfVxuICAvLyByZW1vdmUgb2xkIHNoYXBlc1xuICB0b1JlbW92ZS5mb3JFYWNoKGVsID0+IHJvb3QucmVtb3ZlQ2hpbGQoZWwpKTtcbiAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7XG4gICAgaWYgKCFoYXNoZXNJbkRvbVtzYy5oYXNoXSkgcm9vdC5hcHBlbmRDaGlsZChyZW5kZXJTaGFwZShzdGF0ZSwgc2MsIGJydXNoZXMsIGFycm93RGVzdHMsIGJvdW5kcykpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2hhcGVIYXNoKHtvcmlnLCBkZXN0LCBicnVzaCwgcGllY2UsIG1vZGlmaWVyc306IERyYXdTaGFwZSwgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgY3VycmVudDogYm9vbGVhbik6IEhhc2gge1xuICByZXR1cm4gW2N1cnJlbnQsIG9yaWcsIGRlc3QsIGJydXNoLCBkZXN0ICYmIGFycm93RGVzdHNbZGVzdF0gPiAxLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgbW9kaWZpZXJzICYmIG1vZGlmaWVyc0hhc2gobW9kaWZpZXJzKVxuICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZpZXJzSGFzaChtOiBEcmF3TW9kaWZpZXJzKTogSGFzaCB7XG4gIHJldHVybiAnJyArIChtLmxpbmVXaWR0aCB8fCAnJyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNoYXBlKHN0YXRlOiBTdGF0ZSwge3NoYXBlLCBjdXJyZW50LCBoYXNofTogU2hhcGUsIGJydXNoZXM6IERyYXdCcnVzaGVzLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgbGV0IGVsOiBTVkdFbGVtZW50O1xuICBpZiAoc2hhcGUucGllY2UpIGVsID0gcmVuZGVyUGllY2UoXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2VzLmJhc2VVcmwsXG4gICAgb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICBzaGFwZS5waWVjZSxcbiAgICBib3VuZHMpO1xuICBlbHNlIHtcbiAgICBjb25zdCBvcmlnID0gb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICBpZiAoc2hhcGUub3JpZyAmJiBzaGFwZS5kZXN0KSB7XG4gICAgICBsZXQgYnJ1c2g6IERyYXdCcnVzaCA9IGJydXNoZXNbc2hhcGUuYnJ1c2hdO1xuICAgICAgaWYgKHNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBicnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgYXJyb3dEZXN0c1tzaGFwZS5kZXN0XSA+IDEsXG4gICAgICAgIGJvdW5kcyk7XG4gICAgfVxuICAgIGVsc2UgZWwgPSByZW5kZXJDaXJjbGUoYnJ1c2hlc1tzaGFwZS5icnVzaF0sIG9yaWcsIGN1cnJlbnQsIGJvdW5kcyk7XG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdjZ0hhc2gnLCBoYXNoKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDaXJjbGUoYnJ1c2g6IERyYXdCcnVzaCwgcG9zOiBjZy5Qb3MsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgd2lkdGhzID0gY2lyY2xlV2lkdGgoYm91bmRzKSxcbiAgcmFkaXVzID0gKGJvdW5kcy53aWR0aCArIGJvdW5kcy5oZWlnaHQpIC8gMzI7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2NpcmNsZScpLCB7XG4gICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAnc3Ryb2tlLXdpZHRoJzogd2lkdGhzW2N1cnJlbnQgPyAwIDogMV0sXG4gICAgZmlsbDogJ25vbmUnLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIGN4OiBvWzBdLFxuICAgIGN5OiBvWzFdLFxuICAgIHI6IHJhZGl1cyAtIHdpZHRoc1sxXSAvIDJcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KGJydXNoOiBEcmF3QnJ1c2gsIG9yaWc6IGNnLlBvcywgZGVzdDogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBzaG9ydGVuOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKGJvdW5kcywgc2hvcnRlbiAmJiAhY3VycmVudCksXG4gIGEgPSBwb3MycHgob3JpZywgYm91bmRzKSxcbiAgYiA9IHBvczJweChkZXN0LCBib3VuZHMpLFxuICBkeCA9IGJbMF0gLSBhWzBdLFxuICBkeSA9IGJbMV0gLSBhWzFdLFxuICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtLFxuICB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2xpbmUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChicnVzaCwgY3VycmVudCwgYm91bmRzKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyBicnVzaC5rZXkgKyAnKScsXG4gICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgeDE6IGFbMF0sXG4gICAgeTE6IGFbMV0sXG4gICAgeDI6IGJbMF0gLSB4byxcbiAgICB5MjogYlsxXSAtIHlvXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQaWVjZShiYXNlVXJsOiBzdHJpbmcsIHBvczogY2cuUG9zLCBwaWVjZTogRHJhd1NoYXBlUGllY2UsIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgc2l6ZSA9IGJvdW5kcy53aWR0aCAvIDggKiAocGllY2Uuc2NhbGUgfHwgMSksXG4gIG5hbWUgPSBwaWVjZS5jb2xvclswXSArIChwaWVjZS5yb2xlID09PSAna25pZ2h0JyA/ICduJyA6IHBpZWNlLnJvbGVbMF0pLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2ltYWdlJyksIHtcbiAgICBjbGFzc05hbWU6IGAke3BpZWNlLnJvbGV9ICR7cGllY2UuY29sb3J9YCxcbiAgICB4OiBvWzBdIC0gc2l6ZSAvIDIsXG4gICAgeTogb1sxXSAtIHNpemUgLyAyLFxuICAgIHdpZHRoOiBzaXplLFxuICAgIGhlaWdodDogc2l6ZSxcbiAgICBocmVmOiBiYXNlVXJsICsgbmFtZSArICcuc3ZnJ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBEcmF3QnJ1c2gpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaC5rZXksXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMVxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgncGF0aCcpLCB7XG4gICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICBmaWxsOiBicnVzaC5jb2xvclxuICB9KSk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ2NnS2V5JywgYnJ1c2gua2V5KTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChsZXQga2V5IGluIGF0dHJzKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBvcmllbnQocG9zOiBjZy5Qb3MsIGNvbG9yOiBjZy5Db2xvcik6IGNnLlBvcyB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3doaXRlJyA/IHBvcyA6IFs5IC0gcG9zWzBdLCA5IC0gcG9zWzFdXTtcbn1cblxuZnVuY3Rpb24gbWFrZUN1c3RvbUJydXNoKGJhc2U6IERyYXdCcnVzaCwgbW9kaWZpZXJzOiBEcmF3TW9kaWZpZXJzKTogRHJhd0JydXNoIHtcbiAgY29uc3QgYnJ1c2g6IFBhcnRpYWw8RHJhd0JydXNoPiA9IHtcbiAgICBjb2xvcjogYmFzZS5jb2xvcixcbiAgICBvcGFjaXR5OiBNYXRoLnJvdW5kKGJhc2Uub3BhY2l0eSAqIDEwKSAvIDEwLFxuICAgIGxpbmVXaWR0aDogTWF0aC5yb3VuZChtb2RpZmllcnMubGluZVdpZHRoIHx8IGJhc2UubGluZVdpZHRoKVxuICB9O1xuICBicnVzaC5rZXkgPSBbYmFzZS5rZXksIG1vZGlmaWVycy5saW5lV2lkdGhdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xuICByZXR1cm4gYnJ1c2ggYXMgRHJhd0JydXNoO1xufVxuXG5mdW5jdGlvbiBjaXJjbGVXaWR0aChib3VuZHM6IENsaWVudFJlY3QpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgY29uc3QgYmFzZSA9IGJvdW5kcy53aWR0aCAvIDUxMjtcbiAgcmV0dXJuIFszICogYmFzZSwgNCAqIGJhc2VdO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChicnVzaC5saW5lV2lkdGggfHwgMTApICogKGN1cnJlbnQgPyAwLjg1IDogMSkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gub3BhY2l0eSB8fCAxKSAqIChjdXJyZW50ID8gMC45IDogMSk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKGJvdW5kczogQ2xpZW50UmVjdCwgc2hvcnRlbjogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoc2hvcnRlbiA/IDIwIDogMTApIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zOiBjZy5Qb3MsIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLk51bWJlclBhaXIge1xuICByZXR1cm4gWyhwb3NbMF0gLSAwLjUpICogYm91bmRzLndpZHRoIC8gOCwgKDguNSAtIHBvc1sxXSkgKiBib3VuZHMuaGVpZ2h0IC8gOF07XG59XG4iLCJleHBvcnQgdHlwZSBDb2xvciA9ICd3aGl0ZScgfCAnYmxhY2snO1xuZXhwb3J0IHR5cGUgUm9sZSA9ICdraW5nJyB8ICdxdWVlbicgfCAncm9vaycgfCAnYmlzaG9wJyB8ICdrbmlnaHQnIHwgJ3Bhd24nO1xuZXhwb3J0IHR5cGUgS2V5ID0gJ2EwJyB8ICdhMScgfCAnYjEnIHwgJ2MxJyB8ICdkMScgfCAnZTEnIHwgJ2YxJyB8ICdnMScgfCAnaDEnIHwgJ2EyJyB8ICdiMicgfCAnYzInIHwgJ2QyJyB8ICdlMicgfCAnZjInIHwgJ2cyJyB8ICdoMicgfCAnYTMnIHwgJ2IzJyB8ICdjMycgfCAnZDMnIHwgJ2UzJyB8ICdmMycgfCAnZzMnIHwgJ2gzJyB8ICdhNCcgfCAnYjQnIHwgJ2M0JyB8ICdkNCcgfCAnZTQnIHwgJ2Y0JyB8ICdnNCcgfCAnaDQnIHwgJ2E1JyB8ICdiNScgfCAnYzUnIHwgJ2Q1JyB8ICdlNScgfCAnZjUnIHwgJ2c1JyB8ICdoNScgfCAnYTYnIHwgJ2I2JyB8ICdjNicgfCAnZDYnIHwgJ2U2JyB8ICdmNicgfCAnZzYnIHwgJ2g2JyB8ICdhNycgfCAnYjcnIHwgJ2M3JyB8ICdkNycgfCAnZTcnIHwgJ2Y3JyB8ICdnNycgfCAnaDcnIHwgJ2E4JyB8ICdiOCcgfCAnYzgnIHwgJ2Q4JyB8ICdlOCcgfCAnZjgnIHwgJ2c4JyB8ICdoOCc7XG5leHBvcnQgdHlwZSBGaWxlID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnO1xuZXhwb3J0IHR5cGUgUmFuayA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4O1xuZXhwb3J0IHR5cGUgRkVOID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUG9zID0gW251bWJlciwgbnVtYmVyXTtcbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICByb2xlOiBSb2xlO1xuICBjb2xvcjogQ29sb3I7XG4gIHByb21vdGVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcCB7XG4gIHJvbGU6IFJvbGU7XG4gIGtleTogS2V5O1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzRGlmZiB7XG4gIFtrZXk6IHN0cmluZ106IFBpZWNlIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgdHlwZSBLZXlQYWlyID0gW0tleSwgS2V5XTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyUGFpciA9IFtudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCB0eXBlIE51bWJlclF1YWQgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IGludGVyZmFjZSBEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IEtleVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudHMge1xuICBib2FyZDogSFRNTEVsZW1lbnQ7XG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIGdob3N0PzogSFRNTEVsZW1lbnQ7XG4gIHN2Zz86IFNWR0VsZW1lbnQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIERvbSB7XG4gIGVsZW1lbnRzOiBFbGVtZW50cyxcbiAgYm91bmRzOiBNZW1vPENsaWVudFJlY3Q+O1xuICByZWRyYXc6ICgpID0+IHZvaWQ7XG4gIHJlZHJhd05vdzogKHNraXBTdmc/OiBib29sZWFuKSA9PiB2b2lkO1xuICB1bmJpbmQ/OiBVbmJpbmQ7XG4gIGRlc3Ryb3llZD86IGJvb2xlYW47XG4gIHJlbGF0aXZlPzogYm9vbGVhbjsgLy8gZG9uJ3QgY29tcHV0ZSBib3VuZHMsIHVzZSByZWxhdGl2ZSAlIHRvIHBsYWNlIHBpZWNlc1xufVxuZXhwb3J0IGludGVyZmFjZSBFeHBsb2Rpbmcge1xuICBzdGFnZTogbnVtYmVyO1xuICBrZXlzOiBLZXlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlTWV0YWRhdGEge1xuICBwcmVtb3ZlOiBib29sZWFuO1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbiAgaG9sZFRpbWU/OiBudW1iZXI7XG4gIGNhcHR1cmVkPzogUGllY2U7XG4gIHByZWRyb3A/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTZXRQcmVtb3ZlTWV0YWRhdGEge1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgV2luZG93RXZlbnQgPSAnb25zY3JvbGwnIHwgJ29ucmVzaXplJztcblxuZXhwb3J0IHR5cGUgTW91Y2hFdmVudCA9IE1vdXNlRXZlbnQgJiBUb3VjaEV2ZW50O1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleWVkTm9kZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY2dLZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHtcbiAgY2dQaWVjZTogc3RyaW5nO1xuICBjZ0FuaW1hdGluZz86IGJvb2xlYW47XG4gIGNnRmFkaW5nPzogYm9vbGVhbjtcbiAgY2dEcmFnZ2luZz86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZU5vZGUgZXh0ZW5kcyBLZXllZE5vZGUgeyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtbzxBPiB7ICgpOiBBOyBjbGVhcjogKCkgPT4gdm9pZDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVyIHtcbiAgc3RhcnQ6ICgpID0+IHZvaWQ7XG4gIGNhbmNlbDogKCkgPT4gdm9pZDtcbiAgc3RvcDogKCkgPT4gbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBSZWRyYXcgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgVW5iaW5kID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFRpbWVzdGFtcCA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIE1pbGxpc2Vjb25kcyA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIEtIeiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCddO1xuZXhwb3J0IGNvbnN0IHJhbmtzOiBSYW5rW10gPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOF07XG4iLCJpbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9yczogY2cuQ29sb3JbXSA9IFsnd2hpdGUnLCAnYmxhY2snXTtcblxuZXhwb3J0IGNvbnN0IGludlJhbmtzOiBjZy5SYW5rW10gPSBbOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5cbmV4cG9ydCBjb25zdCBhbGxLZXlzOiBjZy5LZXlbXSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQoLi4uY2cuZmlsZXMubWFwKGMgPT4gY2cucmFua3MubWFwKHIgPT4gYytyKSkpO1xuXG5leHBvcnQgY29uc3QgcG9zMmtleSA9IChwb3M6IGNnLlBvcykgPT4gYWxsS2V5c1s4ICogcG9zWzBdICsgcG9zWzFdIC0gOV07XG5cbmV4cG9ydCBjb25zdCBrZXkycG9zID0gKGs6IGNnLktleSkgPT4gW2suY2hhckNvZGVBdCgwKSAtIDk2LCBrLmNoYXJDb2RlQXQoMSkgLSA0OF0gYXMgY2cuUG9zO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtbzxBPihmOiAoKSA9PiBBKTogY2cuTWVtbzxBPiB7XG4gIGxldCB2OiBBIHwgdW5kZWZpbmVkO1xuICBjb25zdCByZXQ6IGFueSA9ICgpID0+IHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSAoKSA9PiB7IHYgPSB1bmRlZmluZWQ7IH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lcjogKCkgPT4gY2cuVGltZXIgPSAoKSA9PiB7XG4gIGxldCBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc3RhcnQoKSB7IHN0YXJ0QXQgPSBEYXRlLm5vdygpOyB9LFxuICAgIGNhbmNlbCgpIHsgc3RhcnRBdCA9IHVuZGVmaW5lZDsgfSxcbiAgICBzdG9wKCkge1xuICAgICAgaWYgKCFzdGFydEF0KSByZXR1cm4gMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRBdDtcbiAgICAgIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvcHBvc2l0ZSA9IChjOiBjZy5Db2xvcikgPT4gYyA9PT0gJ3doaXRlJyA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNYPFg+KHhzOiBYW10gfCB1bmRlZmluZWQsIHg6IFgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHhzICE9PSB1bmRlZmluZWQgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5jb25zdCBwb3NUb1RyYW5zbGF0ZUJhc2U6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbiwgeEZhY3RvcjogbnVtYmVyLCB5RmFjdG9yOiBudW1iZXIpID0+IGNnLk51bWJlclBhaXIgPVxuKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3RvcikgPT4gW1xuICAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIHhGYWN0b3IsXG4gIChhc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogeUZhY3RvclxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKGJvdW5kczogQ2xpZW50UmVjdCkgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gOCxcbiAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyA4O1xuICByZXR1cm4gKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbDogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBjZy5OdW1iZXJQYWlyID1cbiAgKHBvcywgYXNXaGl0ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgMTIuNSwgMTIuNSk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IGNnLlBvcykgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cG9zWzBdfXB4LCR7cG9zWzFdfXB4KWA7XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoZWw6IEhUTUxFbGVtZW50LCBwZXJjZW50czogY2cuTnVtYmVyUGFpcikgPT4ge1xuICBlbC5zdHlsZS5sZWZ0ID0gcGVyY2VudHNbMF0gKyAnJSc7XG4gIGVsLnN0eWxlLnRvcCA9IHBlcmNlbnRzWzFdICsgJyUnO1xufVxuXG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pID0+IHtcbiAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyAndmlzaWJsZScgOiAnaGlkZGVuJztcbn1cblxuLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb246IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiBjZy5OdW1iZXJQYWlyIHwgdW5kZWZpbmVkID0gZSA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogTW91c2VFdmVudCkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IGNvbnN0IHJhZiA9ICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5zZXRUaW1lb3V0KS5iaW5kKHdpbmRvdyk7XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBjb2xvcnMsIHNldFZpc2libGUsIGNyZWF0ZUVsIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgZmlsZXMsIHJhbmtzIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgYXMgY3JlYXRlU1ZHIH0gZnJvbSAnLi9zdmcnXG5pbXBvcnQgeyBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdyYXAoZWxlbWVudDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlLCByZWxhdGl2ZTogYm9vbGVhbik6IEVsZW1lbnRzIHtcblxuICAvLyAuY2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gQ2hlc3Nncm91bmQpXG4gIC8vICAgY2ctaGVscGVyICgxMi41JSlcbiAgLy8gICAgIGNnLWNvbnRhaW5lciAoODAwJSlcbiAgLy8gICAgICAgY2ctYm9hcmRcbiAgLy8gICAgICAgc3ZnXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcbiAgLy8gICAgICAgcGllY2UuZ2hvc3RcblxuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuXG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2ctd3JhcCcpO1xuICBjb2xvcnMuZm9yRWFjaChjID0+IHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgfSk7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgY29uc3QgaGVscGVyID0gY3JlYXRlRWwoJ2NnLWhlbHBlcicpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGhlbHBlcik7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZUVsKCdjZy1jb250YWluZXInKTtcbiAgaGVscGVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnY2ctYm9hcmQnKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJvYXJkKTtcblxuICBsZXQgc3ZnOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlICYmICFyZWxhdGl2ZSkge1xuICAgIHN2ZyA9IGNyZWF0ZVNWRygnc3ZnJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWRygnZGVmcycpKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgfVxuXG4gIGlmIChzLmNvb3JkaW5hdGVzKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJyBibGFjaycgOiAnJztcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKHJhbmtzLCAncmFua3MnICsgb3JpZW50Q2xhc3MpKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCAnZmlsZXMnICsgb3JpZW50Q2xhc3MpKTtcbiAgfVxuXG4gIGxldCBnaG9zdDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYWdnYWJsZS5zaG93R2hvc3QgJiYgIXJlbGF0aXZlKSB7XG4gICAgZ2hvc3QgPSBjcmVhdGVFbCgncGllY2UnLCAnZ2hvc3QnKTtcbiAgICBzZXRWaXNpYmxlKGdob3N0LCBmYWxzZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdob3N0KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYm9hcmQsXG4gICAgY29udGFpbmVyLFxuICAgIGdob3N0LFxuICAgIHN2Z1xuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb29yZHMoZWxlbXM6IGFueVtdLCBjbGFzc05hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGxldCBpIGluIGVsZW1zKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtc1tpXTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG4iXX0=

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.i18next = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var consoleLogger = {
  type: 'logger',

  log: function log(args) {
    this.output('log', args);
  },
  warn: function warn(args) {
    this.output('warn', args);
  },
  error: function error(args) {
    this.output('error', args);
  },
  output: function output(type, args) {
    var _console;

    /* eslint no-console: 0 */
    if (console && console[type]) (_console = console)[type].apply(_console, toConsumableArray(args));
  }
};

var Logger = function () {
  function Logger(concreteLogger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Logger);

    this.init(concreteLogger, options);
  }

  Logger.prototype.init = function init(concreteLogger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    this.prefix = options.prefix || 'i18next:';
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug;
  };

  Logger.prototype.setDebug = function setDebug(bool) {
    this.debug = bool;
  };

  Logger.prototype.log = function log() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return this.forward(args, 'log', '', true);
  };

  Logger.prototype.warn = function warn() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return this.forward(args, 'warn', '', true);
  };

  Logger.prototype.error = function error() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return this.forward(args, 'error', '');
  };

  Logger.prototype.deprecate = function deprecate() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return this.forward(args, 'warn', 'WARNING DEPRECATED: ', true);
  };

  Logger.prototype.forward = function forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return null;
    if (typeof args[0] === 'string') args[0] = '' + prefix + this.prefix + ' ' + args[0];
    return this.logger[lvl](args);
  };

  Logger.prototype.create = function create(moduleName) {
    return new Logger(this.logger, _extends({ prefix: this.prefix + ':' + moduleName + ':' }, this.options));
  };

  return Logger;
}();

var baseLogger = new Logger();

var EventEmitter = function () {
  function EventEmitter() {
    classCallCheck(this, EventEmitter);

    this.observers = {};
  }

  EventEmitter.prototype.on = function on(events, listener) {
    var _this = this;

    events.split(' ').forEach(function (event) {
      _this.observers[event] = _this.observers[event] || [];
      _this.observers[event].push(listener);
    });
  };

  EventEmitter.prototype.off = function off(event, listener) {
    var _this2 = this;

    if (!this.observers[event]) {
      return;
    }

    this.observers[event].forEach(function () {
      if (!listener) {
        delete _this2.observers[event];
      } else {
        var index = _this2.observers[event].indexOf(listener);
        if (index > -1) {
          _this2.observers[event].splice(index, 1);
        }
      }
    });
  };

  EventEmitter.prototype.emit = function emit(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (this.observers[event]) {
      var cloned = [].concat(this.observers[event]);
      cloned.forEach(function (observer) {
        observer.apply(undefined, args);
      });
    }

    if (this.observers['*']) {
      var _cloned = [].concat(this.observers['*']);
      _cloned.forEach(function (observer) {
        var _ref;

        observer.apply(observer, (_ref = [event]).concat.apply(_ref, args));
      });
    }
  };

  return EventEmitter;
}();

function makeString(object) {
  if (object == null) return '';
  /* eslint prefer-template: 0 */
  return '' + object;
}

function copy(a, s, t) {
  a.forEach(function (m) {
    if (s[m]) t[m] = s[m];
  });
}

function getLastOfPath(object, path, Empty) {
  function cleanKey(key) {
    return key && key.indexOf('###') > -1 ? key.replace(/###/g, '.') : key;
  }

  function canNotTraverseDeeper() {
    return !object || typeof object === 'string';
  }

  var stack = typeof path !== 'string' ? [].concat(path) : path.split('.');
  while (stack.length > 1) {
    if (canNotTraverseDeeper()) return {};

    var key = cleanKey(stack.shift());
    if (!object[key] && Empty) object[key] = new Empty();
    object = object[key];
  }

  if (canNotTraverseDeeper()) return {};
  return {
    obj: object,
    k: cleanKey(stack.shift())
  };
}

function setPath(object, path, newValue) {
  var _getLastOfPath = getLastOfPath(object, path, Object),
      obj = _getLastOfPath.obj,
      k = _getLastOfPath.k;

  obj[k] = newValue;
}

function pushPath(object, path, newValue, concat) {
  var _getLastOfPath2 = getLastOfPath(object, path, Object),
      obj = _getLastOfPath2.obj,
      k = _getLastOfPath2.k;

  obj[k] = obj[k] || [];
  if (concat) obj[k] = obj[k].concat(newValue);
  if (!concat) obj[k].push(newValue);
}

function getPath(object, path) {
  var _getLastOfPath3 = getLastOfPath(object, path),
      obj = _getLastOfPath3.obj,
      k = _getLastOfPath3.k;

  if (!obj) return undefined;
  return obj[k];
}

function deepExtend(target, source, overwrite) {
  /* eslint no-restricted-syntax: 0 */
  for (var prop in source) {
    if (prop in target) {
      // If we reached a leaf string in target or source then replace with source or skip depending on the 'overwrite' switch
      if (typeof target[prop] === 'string' || target[prop] instanceof String || typeof source[prop] === 'string' || source[prop] instanceof String) {
        if (overwrite) target[prop] = source[prop];
      } else {
        deepExtend(target[prop], source[prop], overwrite);
      }
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
}

function regexEscape(str) {
  /* eslint no-useless-escape: 0 */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/* eslint-disable */
var _entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
/* eslint-enable */

function escape(data) {
  if (typeof data === 'string') {
    return data.replace(/[&<>"'\/]/g, function (s) {
      return _entityMap[s];
    });
  }

  return data;
}

var ResourceStore = function (_EventEmitter) {
  inherits(ResourceStore, _EventEmitter);

  function ResourceStore(data) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { ns: ['translation'], defaultNS: 'translation' };
    classCallCheck(this, ResourceStore);

    var _this = possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.data = data || {};
    _this.options = options;
    return _this;
  }

  ResourceStore.prototype.addNamespaces = function addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  };

  ResourceStore.prototype.removeNamespaces = function removeNamespaces(ns) {
    var index = this.options.ns.indexOf(ns);
    if (index > -1) {
      this.options.ns.splice(index, 1);
    }
  };

  ResourceStore.prototype.getResource = function getResource(lng, ns, key) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var keySeparator = options.keySeparator || this.options.keySeparator;
    if (keySeparator === undefined) keySeparator = '.';

    var path = [lng, ns];
    if (key && typeof key !== 'string') path = path.concat(key);
    if (key && typeof key === 'string') path = path.concat(keySeparator ? key.split(keySeparator) : key);

    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
    }

    return getPath(this.data, path);
  };

  ResourceStore.prototype.addResource = function addResource(lng, ns, key, value) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { silent: false };

    var keySeparator = this.options.keySeparator;
    if (keySeparator === undefined) keySeparator = '.';

    var path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);

    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
      value = ns;
      ns = path[1];
    }

    this.addNamespaces(ns);

    setPath(this.data, path, value);

    if (!options.silent) this.emit('added', lng, ns, key, value);
  };

  ResourceStore.prototype.addResources = function addResources(lng, ns, resources) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { silent: false };

    /* eslint no-restricted-syntax: 0 */
    for (var m in resources) {
      if (typeof resources[m] === 'string') this.addResource(lng, ns, m, resources[m], { silent: true });
    }
    if (!options.silent) this.emit('added', lng, ns, resources);
  };

  ResourceStore.prototype.addResourceBundle = function addResourceBundle(lng, ns, resources, deep, overwrite) {
    var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : { silent: false };

    var path = [lng, ns];
    if (lng.indexOf('.') > -1) {
      path = lng.split('.');
      deep = resources;
      resources = ns;
      ns = path[1];
    }

    this.addNamespaces(ns);

    var pack = getPath(this.data, path) || {};

    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = _extends({}, pack, resources);
    }

    setPath(this.data, path, pack);

    if (!options.silent) this.emit('added', lng, ns, resources);
  };

  ResourceStore.prototype.removeResourceBundle = function removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);

    this.emit('removed', lng, ns);
  };

  ResourceStore.prototype.hasResourceBundle = function hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== undefined;
  };

  ResourceStore.prototype.getResourceBundle = function getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS;

    // COMPATIBILITY: remove extend in v2.1.0
    if (this.options.compatibilityAPI === 'v1') return _extends({}, this.getResource(lng, ns));

    return this.getResource(lng, ns);
  };

  ResourceStore.prototype.toJSON = function toJSON() {
    return this.data;
  };

  return ResourceStore;
}(EventEmitter);

var postProcessor = {

  processors: {},

  addPostProcessor: function addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle: function handle(processors, value, key, options, translator) {
    var _this = this;

    processors.forEach(function (processor) {
      if (_this.processors[processor]) value = _this.processors[processor].process(value, key, options, translator);
    });

    return value;
  }
};

var Translator = function (_EventEmitter) {
  inherits(Translator, _EventEmitter);

  function Translator(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Translator);

    var _this = possibleConstructorReturn(this, _EventEmitter.call(this));

    copy(['resourceStore', 'languageUtils', 'pluralResolver', 'interpolator', 'backendConnector'], services, _this);

    _this.options = options;
    _this.logger = baseLogger.create('translator');
    return _this;
  }

  Translator.prototype.changeLanguage = function changeLanguage(lng) {
    if (lng) this.language = lng;
  };

  Translator.prototype.exists = function exists(key) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { interpolation: {} };

    var resolved = this.resolve(key, options);
    return resolved && resolved.res !== undefined;
  };

  Translator.prototype.extractFromKey = function extractFromKey(key, options) {
    var nsSeparator = options.nsSeparator || this.options.nsSeparator;
    if (nsSeparator === undefined) nsSeparator = ':';
    var keySeparator = options.keySeparator || this.options.keySeparator || '.';

    var namespaces = options.ns || this.options.defaultNS;
    if (nsSeparator && key.indexOf(nsSeparator) > -1) {
      var parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1) namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    if (typeof namespaces === 'string') namespaces = [namespaces];

    return {
      key: key,
      namespaces: namespaces
    };
  };

  Translator.prototype.translate = function translate(keys, options) {
    var _this2 = this;

    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' && this.options.overloadTranslationOptionHandler) {
      /* eslint prefer-rest-params: 0 */
      options = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (!options) options = {};

    // non valid keys handling
    if (keys === undefined || keys === null || keys === '') return '';
    if (typeof keys === 'number') keys = String(keys);
    if (typeof keys === 'string') keys = [keys];

    // separators
    var keySeparator = options.keySeparator || this.options.keySeparator || '.';

    // get namespace(s)

    var _extractFromKey = this.extractFromKey(keys[keys.length - 1], options),
        key = _extractFromKey.key,
        namespaces = _extractFromKey.namespaces;

    var namespace = namespaces[namespaces.length - 1];

    // return key on CIMode
    var lng = options.lng || this.language;
    var appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (lng && lng.toLowerCase() === 'cimode') {
      if (appendNamespaceToCIMode) {
        var nsSeparator = options.nsSeparator || this.options.nsSeparator;
        return namespace + nsSeparator + key;
      }

      return key;
    }

    // resolve from store
    var resolved = this.resolve(keys, options);
    var res = resolved && resolved.res;
    var resUsedKey = resolved && resolved.usedKey || key;

    var resType = Object.prototype.toString.apply(res);
    var noObject = ['[object Number]', '[object Function]', '[object RegExp]'];
    var joinArrays = options.joinArrays !== undefined ? options.joinArrays : this.options.joinArrays;

    // object
    var handleAsObject = typeof res !== 'string' && typeof res !== 'boolean' && typeof res !== 'number';
    if (res && handleAsObject && noObject.indexOf(resType) < 0 && !(joinArrays && resType === '[object Array]')) {
      if (!options.returnObjects && !this.options.returnObjects) {
        this.logger.warn('accessing an object - but returnObjects options is not enabled!');
        return this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, res, options) : 'key \'' + key + ' (' + this.language + ')\' returned an object instead of string.';
      }

      // if we got a separator we loop over children - else we just return object as is
      // as having it set to false means no hierarchy so no lookup for nested values
      if (options.keySeparator || this.options.keySeparator) {
        var copy$$1 = resType === '[object Array]' ? [] : {}; // apply child translation on a copy

        /* eslint no-restricted-syntax: 0 */
        for (var m in res) {
          if (Object.prototype.hasOwnProperty.call(res, m)) {
            var deepKey = '' + resUsedKey + keySeparator + m;
            copy$$1[m] = this.translate(deepKey, _extends({}, options, { joinArrays: false, ns: namespaces }));
            if (copy$$1[m] === deepKey) copy$$1[m] = res[m]; // if nothing found use orginal value as fallback
          }
        }
        res = copy$$1;
      }
    } else if (joinArrays && resType === '[object Array]') {
      // array special treatment
      res = res.join(joinArrays);
      if (res) res = this.extendTranslation(res, keys, options);
    } else {
      // string, empty or null
      var usedDefault = false;
      var usedKey = false;

      // fallback value
      if (!this.isValidLookup(res) && options.defaultValue !== undefined) {
        usedDefault = true;
        res = options.defaultValue;
      }
      if (!this.isValidLookup(res)) {
        usedKey = true;
        res = key;
      }

      // save missing
      var updateMissing = options.defaultValue && options.defaultValue !== res && this.options.updateMissing;
      if (usedKey || usedDefault || updateMissing) {
        this.logger.log(updateMissing ? 'updateKey' : 'missingKey', lng, namespace, key, updateMissing ? options.defaultValue : res);

        var lngs = [];
        var fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, options.lng || this.language);
        if (this.options.saveMissingTo === 'fallback' && fallbackLngs && fallbackLngs[0]) {
          for (var i = 0; i < fallbackLngs.length; i++) {
            lngs.push(fallbackLngs[i]);
          }
        } else if (this.options.saveMissingTo === 'all') {
          lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);
        } else {
          lngs.push(options.lng || this.language);
        }

        var send = function send(l, k) {
          if (_this2.options.missingKeyHandler) {
            _this2.options.missingKeyHandler(l, namespace, k, updateMissing ? options.defaultValue : res, updateMissing, options);
          } else if (_this2.backendConnector && _this2.backendConnector.saveMissing) {
            _this2.backendConnector.saveMissing(l, namespace, k, updateMissing ? options.defaultValue : res, updateMissing, options);
          }
          _this2.emit('missingKey', l, namespace, k, res);
        };

        if (this.options.saveMissing) {
          if (this.options.saveMissingPlurals && options.count) {
            lngs.forEach(function (l) {
              var plurals = _this2.pluralResolver.getPluralFormsOfKey(l, key);

              plurals.forEach(function (p) {
                return send([l], p);
              });
            });
          } else {
            send(lngs, key);
          }
        }
      }

      // extend
      res = this.extendTranslation(res, keys, options);

      // append namespace if still key
      if (usedKey && res === key && this.options.appendNamespaceToMissingKey) res = namespace + ':' + key;

      // parseMissingKeyHandler
      if (usedKey && this.options.parseMissingKeyHandler) res = this.options.parseMissingKeyHandler(res);
    }

    // return
    return res;
  };

  Translator.prototype.extendTranslation = function extendTranslation(res, key, options) {
    var _this3 = this;

    if (options.interpolation) this.interpolator.init(_extends({}, options, { interpolation: _extends({}, this.options.interpolation, options.interpolation) }));

    // interpolate
    var data = options.replace && typeof options.replace !== 'string' ? options.replace : options;
    if (this.options.interpolation.defaultVariables) data = _extends({}, this.options.interpolation.defaultVariables, data);
    res = this.interpolator.interpolate(res, data, options.lng || this.language);

    // nesting
    if (options.nest !== false) res = this.interpolator.nest(res, function () {
      return _this3.translate.apply(_this3, arguments);
    }, options);

    if (options.interpolation) this.interpolator.reset();

    // post process
    var postProcess = options.postProcess || this.options.postProcess;
    var postProcessorNames = typeof postProcess === 'string' ? [postProcess] : postProcess;

    if (res !== undefined && res !== null && postProcessorNames && postProcessorNames.length && options.applyPostProcessor !== false) {
      res = postProcessor.handle(postProcessorNames, res, key, options, this);
    }

    return res;
  };

  Translator.prototype.resolve = function resolve(keys) {
    var _this4 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var found = void 0;
    var usedKey = void 0;

    if (typeof keys === 'string') keys = [keys];

    // forEach possible key
    keys.forEach(function (k) {
      if (_this4.isValidLookup(found)) return;
      var extracted = _this4.extractFromKey(k, options);
      var key = extracted.key;
      usedKey = key;
      var namespaces = extracted.namespaces;
      if (_this4.options.fallbackNS) namespaces = namespaces.concat(_this4.options.fallbackNS);

      var needsPluralHandling = options.count !== undefined && typeof options.count !== 'string';
      var needsContextHandling = options.context !== undefined && typeof options.context === 'string' && options.context !== '';

      var codes = options.lngs ? options.lngs : _this4.languageUtils.toResolveHierarchy(options.lng || _this4.language);

      namespaces.forEach(function (ns) {
        if (_this4.isValidLookup(found)) return;

        codes.forEach(function (code) {
          if (_this4.isValidLookup(found)) return;

          var finalKey = key;
          var finalKeys = [finalKey];

          var pluralSuffix = void 0;
          if (needsPluralHandling) pluralSuffix = _this4.pluralResolver.getSuffix(code, options.count);

          // fallback for plural if context not found
          if (needsPluralHandling && needsContextHandling) finalKeys.push(finalKey + pluralSuffix);

          // get key for context if needed
          if (needsContextHandling) finalKeys.push(finalKey += '' + _this4.options.contextSeparator + options.context);

          // get key for plural if needed
          if (needsPluralHandling) finalKeys.push(finalKey += pluralSuffix);

          // iterate over finalKeys starting with most specific pluralkey (-> contextkey only) -> singularkey only
          var possibleKey = void 0;
          /* eslint no-cond-assign: 0 */
          while (possibleKey = finalKeys.pop()) {
            if (!_this4.isValidLookup(found)) {
              found = _this4.getResource(code, ns, possibleKey, options);
            }
          }
        });
      });
    });

    return { res: found, usedKey: usedKey };
  };

  Translator.prototype.isValidLookup = function isValidLookup(res) {
    return res !== undefined && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === '');
  };

  Translator.prototype.getResource = function getResource(code, ns, key) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    return this.resourceStore.getResource(code, ns, key, options);
  };

  return Translator;
}(EventEmitter);

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var LanguageUtil = function () {
  function LanguageUtil(options) {
    classCallCheck(this, LanguageUtil);

    this.options = options;

    this.whitelist = this.options.whitelist || false;
    this.logger = baseLogger.create('languageUtils');
  }

  LanguageUtil.prototype.getScriptPartFromCode = function getScriptPartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return null;

    var p = code.split('-');
    if (p.length === 2) return null;
    p.pop();
    return this.formatLanguageCode(p.join('-'));
  };

  LanguageUtil.prototype.getLanguagePartFromCode = function getLanguagePartFromCode(code) {
    if (!code || code.indexOf('-') < 0) return code;

    var p = code.split('-');
    return this.formatLanguageCode(p[0]);
  };

  LanguageUtil.prototype.formatLanguageCode = function formatLanguageCode(code) {
    // http://www.iana.org/assignments/language-tags/language-tags.xhtml
    if (typeof code === 'string' && code.indexOf('-') > -1) {
      var specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab'];
      var p = code.split('-');

      if (this.options.lowerCaseLng) {
        p = p.map(function (part) {
          return part.toLowerCase();
        });
      } else if (p.length === 2) {
        p[0] = p[0].toLowerCase();
        p[1] = p[1].toUpperCase();

        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
      } else if (p.length === 3) {
        p[0] = p[0].toLowerCase();

        // if lenght 2 guess it's a country
        if (p[1].length === 2) p[1] = p[1].toUpperCase();
        if (p[0] !== 'sgn' && p[2].length === 2) p[2] = p[2].toUpperCase();

        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
        if (specialCases.indexOf(p[2].toLowerCase()) > -1) p[2] = capitalize(p[2].toLowerCase());
      }

      return p.join('-');
    }

    return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
  };

  LanguageUtil.prototype.isWhitelisted = function isWhitelisted(code) {
    if (this.options.load === 'languageOnly' || this.options.nonExplicitWhitelist) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.whitelist || !this.whitelist.length || this.whitelist.indexOf(code) > -1;
  };

  LanguageUtil.prototype.getFallbackCodes = function getFallbackCodes(fallbacks, code) {
    if (!fallbacks) return [];
    if (typeof fallbacks === 'string') fallbacks = [fallbacks];
    if (Object.prototype.toString.apply(fallbacks) === '[object Array]') return fallbacks;

    if (!code) return fallbacks.default || [];

    // asume we have an object defining fallbacks
    var found = fallbacks[code];
    if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found) found = fallbacks[this.formatLanguageCode(code)];
    if (!found) found = fallbacks.default;

    return found || [];
  };

  LanguageUtil.prototype.toResolveHierarchy = function toResolveHierarchy(code, fallbackCode) {
    var _this = this;

    var fallbackCodes = this.getFallbackCodes(fallbackCode || this.options.fallbackLng || [], code);

    var codes = [];
    var addCode = function addCode(c) {
      if (!c) return;
      if (_this.isWhitelisted(c)) {
        codes.push(c);
      } else {
        _this.logger.warn('rejecting non-whitelisted language code: ' + c);
      }
    };

    if (typeof code === 'string' && code.indexOf('-') > -1) {
      if (this.options.load !== 'languageOnly') addCode(this.formatLanguageCode(code));
      if (this.options.load !== 'languageOnly' && this.options.load !== 'currentOnly') addCode(this.getScriptPartFromCode(code));
      if (this.options.load !== 'currentOnly') addCode(this.getLanguagePartFromCode(code));
    } else if (typeof code === 'string') {
      addCode(this.formatLanguageCode(code));
    }

    fallbackCodes.forEach(function (fc) {
      if (codes.indexOf(fc) < 0) addCode(_this.formatLanguageCode(fc));
    });

    return codes;
  };

  return LanguageUtil;
}();

// definition http://translate.sourceforge.net/wiki/l10n/pluralforms
/* eslint-disable */
var sets = [{ lngs: ['ach', 'ak', 'am', 'arn', 'br', 'fil', 'gun', 'ln', 'mfe', 'mg', 'mi', 'oc', 'pt', 'pt-BR', 'tg', 'ti', 'tr', 'uz', 'wa'], nr: [1, 2], fc: 1 }, { lngs: ['af', 'an', 'ast', 'az', 'bg', 'bn', 'ca', 'da', 'de', 'dev', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fi', 'fo', 'fur', 'fy', 'gl', 'gu', 'ha', 'he', 'hi', 'hu', 'hy', 'ia', 'it', 'kn', 'ku', 'lb', 'mai', 'ml', 'mn', 'mr', 'nah', 'nap', 'nb', 'ne', 'nl', 'nn', 'no', 'nso', 'pa', 'pap', 'pms', 'ps', 'pt-PT', 'rm', 'sco', 'se', 'si', 'so', 'son', 'sq', 'sv', 'sw', 'ta', 'te', 'tk', 'ur', 'yo'], nr: [1, 2], fc: 2 }, { lngs: ['ay', 'bo', 'cgg', 'fa', 'id', 'ja', 'jbo', 'ka', 'kk', 'km', 'ko', 'ky', 'lo', 'ms', 'sah', 'su', 'th', 'tt', 'ug', 'vi', 'wo', 'zh'], nr: [1], fc: 3 }, { lngs: ['be', 'bs', 'dz', 'hr', 'ru', 'sr', 'uk'], nr: [1, 2, 5], fc: 4 }, { lngs: ['ar'], nr: [0, 1, 2, 3, 11, 100], fc: 5 }, { lngs: ['cs', 'sk'], nr: [1, 2, 5], fc: 6 }, { lngs: ['csb', 'pl'], nr: [1, 2, 5], fc: 7 }, { lngs: ['cy'], nr: [1, 2, 3, 8], fc: 8 }, { lngs: ['fr'], nr: [1, 2], fc: 9 }, { lngs: ['ga'], nr: [1, 2, 3, 7, 11], fc: 10 }, { lngs: ['gd'], nr: [1, 2, 3, 20], fc: 11 }, { lngs: ['is'], nr: [1, 2], fc: 12 }, { lngs: ['jv'], nr: [0, 1], fc: 13 }, { lngs: ['kw'], nr: [1, 2, 3, 4], fc: 14 }, { lngs: ['lt'], nr: [1, 2, 10], fc: 15 }, { lngs: ['lv'], nr: [1, 2, 0], fc: 16 }, { lngs: ['mk'], nr: [1, 2], fc: 17 }, { lngs: ['mnk'], nr: [0, 1, 2], fc: 18 }, { lngs: ['mt'], nr: [1, 2, 11, 20], fc: 19 }, { lngs: ['or'], nr: [2, 1], fc: 2 }, { lngs: ['ro'], nr: [1, 2, 20], fc: 20 }, { lngs: ['sl'], nr: [5, 1, 2, 3], fc: 21 }];

var _rulesPluralsTypes = {
  1: function _(n) {
    return Number(n > 1);
  },
  2: function _(n) {
    return Number(n != 1);
  },
  3: function _(n) {
    return 0;
  },
  4: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  5: function _(n) {
    return Number(n === 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
  },
  6: function _(n) {
    return Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2);
  },
  7: function _(n) {
    return Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  8: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3);
  },
  9: function _(n) {
    return Number(n >= 2);
  },
  10: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
  },
  11: function _(n) {
    return Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3);
  },
  12: function _(n) {
    return Number(n % 10 != 1 || n % 100 == 11);
  },
  13: function _(n) {
    return Number(n !== 0);
  },
  14: function _(n) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3);
  },
  15: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
  },
  16: function _(n) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2);
  },
  17: function _(n) {
    return Number(n == 1 || n % 10 == 1 ? 0 : 1);
  },
  18: function _(n) {
    return Number(n == 0 ? 0 : n == 1 ? 1 : 2);
  },
  19: function _(n) {
    return Number(n == 1 ? 0 : n === 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3);
  },
  20: function _(n) {
    return Number(n == 1 ? 0 : n === 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2);
  },
  21: function _(n) {
    return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
  }
};
/* eslint-enable */

function createRules() {
  var rules = {};
  sets.forEach(function (set$$1) {
    set$$1.lngs.forEach(function (l) {
      rules[l] = {
        numbers: set$$1.nr,
        plurals: _rulesPluralsTypes[set$$1.fc]
      };
    });
  });
  return rules;
}

var PluralResolver = function () {
  function PluralResolver(languageUtils) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, PluralResolver);

    this.languageUtils = languageUtils;
    this.options = options;

    this.logger = baseLogger.create('pluralResolver');

    this.rules = createRules();
  }

  PluralResolver.prototype.addRule = function addRule(lng, obj) {
    this.rules[lng] = obj;
  };

  PluralResolver.prototype.getRule = function getRule(code) {
    return this.rules[code] || this.rules[this.languageUtils.getLanguagePartFromCode(code)];
  };

  PluralResolver.prototype.needsPlural = function needsPlural(code) {
    var rule = this.getRule(code);

    return rule && rule.numbers.length > 1;
  };

  PluralResolver.prototype.getPluralFormsOfKey = function getPluralFormsOfKey(code, key) {
    var _this = this;

    var ret = [];

    var rule = this.getRule(code);

    if (!rule) return ret;

    rule.numbers.forEach(function (n) {
      var suffix = _this.getSuffix(code, n);
      ret.push('' + key + suffix);
    });

    return ret;
  };

  PluralResolver.prototype.getSuffix = function getSuffix(code, count) {
    var _this2 = this;

    var rule = this.getRule(code);

    if (rule) {
      // if (rule.numbers.length === 1) return ''; // only singular

      var idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
      var suffix = rule.numbers[idx];

      // special treatment for lngs only having singular and plural
      if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
        if (suffix === 2) {
          suffix = 'plural';
        } else if (suffix === 1) {
          suffix = '';
        }
      }

      var returnSuffix = function returnSuffix() {
        return _this2.options.prepend && suffix.toString() ? _this2.options.prepend + suffix.toString() : suffix.toString();
      };

      // COMPATIBILITY JSON
      // v1
      if (this.options.compatibilityJSON === 'v1') {
        if (suffix === 1) return '';
        if (typeof suffix === 'number') return '_plural_' + suffix.toString();
        return returnSuffix();
      } else if ( /* v2 */this.options.compatibilityJSON === 'v2' || rule.numbers.length === 2 && rule.numbers[0] === 1) {
        return returnSuffix();
      } else if ( /* v3 - gettext index */rule.numbers.length === 2 && rule.numbers[0] === 1) {
        return returnSuffix();
      }
      return this.options.prepend && idx.toString() ? this.options.prepend + idx.toString() : idx.toString();
    }

    this.logger.warn('no plural rule found for: ' + code);
    return '';
  };

  return PluralResolver;
}();

var Interpolator = function () {
  function Interpolator() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Interpolator);

    this.logger = baseLogger.create('interpolator');

    this.init(options, true);
  }

  /* eslint no-param-reassign: 0 */


  Interpolator.prototype.init = function init() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var reset = arguments[1];

    if (reset) {
      this.options = options;
      this.format = options.interpolation && options.interpolation.format || function (value) {
        return value;
      };
      this.escape = options.interpolation && options.interpolation.escape || escape;
    }
    if (!options.interpolation) options.interpolation = { escapeValue: true };

    var iOpts = options.interpolation;

    this.escapeValue = iOpts.escapeValue !== undefined ? iOpts.escapeValue : true;

    this.prefix = iOpts.prefix ? regexEscape(iOpts.prefix) : iOpts.prefixEscaped || '{{';
    this.suffix = iOpts.suffix ? regexEscape(iOpts.suffix) : iOpts.suffixEscaped || '}}';

    this.formatSeparator = iOpts.formatSeparator ? iOpts.formatSeparator : iOpts.formatSeparator || ',';

    this.unescapePrefix = iOpts.unescapeSuffix ? '' : iOpts.unescapePrefix || '-';
    this.unescapeSuffix = this.unescapePrefix ? '' : iOpts.unescapeSuffix || '';

    this.nestingPrefix = iOpts.nestingPrefix ? regexEscape(iOpts.nestingPrefix) : iOpts.nestingPrefixEscaped || regexEscape('$t(');
    this.nestingSuffix = iOpts.nestingSuffix ? regexEscape(iOpts.nestingSuffix) : iOpts.nestingSuffixEscaped || regexEscape(')');

    this.maxReplaces = iOpts.maxReplaces ? iOpts.maxReplaces : 1000;

    // the regexp
    this.resetRegExp();
  };

  Interpolator.prototype.reset = function reset() {
    if (this.options) this.init(this.options);
  };

  Interpolator.prototype.resetRegExp = function resetRegExp() {
    // the regexp
    var regexpStr = this.prefix + '(.+?)' + this.suffix;
    this.regexp = new RegExp(regexpStr, 'g');

    var regexpUnescapeStr = '' + this.prefix + this.unescapePrefix + '(.+?)' + this.unescapeSuffix + this.suffix;
    this.regexpUnescape = new RegExp(regexpUnescapeStr, 'g');

    var nestingRegexpStr = this.nestingPrefix + '(.+?)' + this.nestingSuffix;
    this.nestingRegexp = new RegExp(nestingRegexpStr, 'g');
  };

  Interpolator.prototype.interpolate = function interpolate(str, data, lng) {
    var _this = this;

    var match = void 0;
    var value = void 0;
    var replaces = void 0;

    function regexSafe(val) {
      return val.replace(/\$/g, '$$$$');
    }

    var handleFormat = function handleFormat(key) {
      if (key.indexOf(_this.formatSeparator) < 0) return getPath(data, key);

      var p = key.split(_this.formatSeparator);
      var k = p.shift().trim();
      var f = p.join(_this.formatSeparator).trim();

      return _this.format(getPath(data, k), f, lng);
    };

    this.resetRegExp();

    replaces = 0;
    // unescape if has unescapePrefix/Suffix
    /* eslint no-cond-assign: 0 */
    while (match = this.regexpUnescape.exec(str)) {
      value = handleFormat(match[1].trim());
      str = str.replace(match[0], value);
      this.regexpUnescape.lastIndex = 0;
      replaces++;
      if (replaces >= this.maxReplaces) {
        break;
      }
    }

    replaces = 0;
    // regular escape on demand
    while (match = this.regexp.exec(str)) {
      value = handleFormat(match[1].trim());
      if (typeof value !== 'string') value = makeString(value);
      if (!value) {
        if (typeof this.options.missingInterpolationHandler === 'function') {
          var temp = this.options.missingInterpolationHandler(str, match);
          value = typeof temp === 'string' ? temp : '';
        } else {
          this.logger.warn('missed to pass in variable ' + match[1] + ' for interpolating ' + str);
          value = '';
        }
      }
      value = this.escapeValue ? regexSafe(this.escape(value)) : regexSafe(value);
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
      replaces++;
      if (replaces >= this.maxReplaces) {
        break;
      }
    }
    return str;
  };

  Interpolator.prototype.nest = function nest(str, fc) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var match = void 0;
    var value = void 0;

    var clonedOptions = _extends({}, options);
    clonedOptions.applyPostProcessor = false; // avoid post processing on nested lookup

    // if value is something like "myKey": "lorem $(anotherKey, { "count": {{aValueInOptions}} })"
    function handleHasOptions(key, inheritedOptions) {
      if (key.indexOf(',') < 0) return key;

      var p = key.split(',');
      key = p.shift();
      var optionsString = p.join(',');
      optionsString = this.interpolate(optionsString, clonedOptions);
      optionsString = optionsString.replace(/'/g, '"');

      try {
        clonedOptions = JSON.parse(optionsString);

        if (inheritedOptions) clonedOptions = _extends({}, inheritedOptions, clonedOptions);
      } catch (e) {
        this.logger.error('failed parsing options string in nesting for key ' + key, e);
      }

      return key;
    }

    // regular escape on demand
    while (match = this.nestingRegexp.exec(str)) {
      value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);

      // is only the nesting key (key1 = '$(key2)') return the value without stringify
      if (value && match[0] === str && typeof value !== 'string') return value;

      // no string to include or empty
      if (typeof value !== 'string') value = makeString(value);
      if (!value) {
        this.logger.warn('missed to resolve ' + match[1] + ' for nesting ' + str);
        value = '';
      }
      // Nested keys should not be escaped by default #854
      // value = this.escapeValue ? regexSafe(utils.escape(value)) : regexSafe(value);
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  };

  return Interpolator;
}();

function remove(arr, what) {
  var found = arr.indexOf(what);

  while (found !== -1) {
    arr.splice(found, 1);
    found = arr.indexOf(what);
  }
}

var Connector = function (_EventEmitter) {
  inherits(Connector, _EventEmitter);

  function Connector(backend, store, services) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    classCallCheck(this, Connector);

    var _this = possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.backend = backend;
    _this.store = store;
    _this.languageUtils = services.languageUtils;
    _this.options = options;
    _this.logger = baseLogger.create('backendConnector');

    _this.state = {};
    _this.queue = [];

    if (_this.backend && _this.backend.init) {
      _this.backend.init(services, options.backend, options);
    }
    return _this;
  }

  Connector.prototype.queueLoad = function queueLoad(languages, namespaces, callback) {
    var _this2 = this;

    // find what needs to be loaded
    var toLoad = [];
    var pending = [];
    var toLoadLanguages = [];
    var toLoadNamespaces = [];

    languages.forEach(function (lng) {
      var hasAllNamespaces = true;

      namespaces.forEach(function (ns) {
        var name = lng + '|' + ns;

        if (_this2.store.hasResourceBundle(lng, ns)) {
          _this2.state[name] = 2; // loaded
        } else if (_this2.state[name] < 0) {
          // nothing to do for err
        } else if (_this2.state[name] === 1) {
          if (pending.indexOf(name) < 0) pending.push(name);
        } else {
          _this2.state[name] = 1; // pending

          hasAllNamespaces = false;

          if (pending.indexOf(name) < 0) pending.push(name);
          if (toLoad.indexOf(name) < 0) toLoad.push(name);
          if (toLoadNamespaces.indexOf(ns) < 0) toLoadNamespaces.push(ns);
        }
      });

      if (!hasAllNamespaces) toLoadLanguages.push(lng);
    });

    if (toLoad.length || pending.length) {
      this.queue.push({
        pending: pending,
        loaded: {},
        errors: [],
        callback: callback
      });
    }

    return {
      toLoad: toLoad,
      pending: pending,
      toLoadLanguages: toLoadLanguages,
      toLoadNamespaces: toLoadNamespaces
    };
  };

  Connector.prototype.loaded = function loaded(name, err, data) {
    var _this3 = this;

    var _name$split = name.split('|'),
        _name$split2 = slicedToArray(_name$split, 2),
        lng = _name$split2[0],
        ns = _name$split2[1];

    if (err) this.emit('failedLoading', lng, ns, err);

    if (data) {
      this.store.addResourceBundle(lng, ns, data);
    }

    // set loaded
    this.state[name] = err ? -1 : 2;

    // callback if ready
    this.queue.forEach(function (q) {
      pushPath(q.loaded, [lng], ns);
      remove(q.pending, name);

      if (err) q.errors.push(err);

      if (q.pending.length === 0 && !q.done) {
        _this3.emit('loaded', q.loaded);
        /* eslint no-param-reassign: 0 */
        q.done = true;
        if (q.errors.length) {
          q.callback(q.errors);
        } else {
          q.callback();
        }
      }
    });

    // remove done load requests
    this.queue = this.queue.filter(function (q) {
      return !q.done;
    });
  };

  Connector.prototype.read = function read(lng, ns, fcName) {
    var tried = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    var _this4 = this;

    var wait = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 250;
    var callback = arguments[5];

    if (!lng.length) return callback(null, {}); // noting to load

    return this.backend[fcName](lng, ns, function (err, data) {
      if (err && data /* = retryFlag */ && tried < 5) {
        setTimeout(function () {
          _this4.read.call(_this4, lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    });
  };

  /* eslint consistent-return: 0 */


  Connector.prototype.load = function load(languages, namespaces, callback) {
    var _this5 = this;

    if (!this.backend) {
      this.logger.warn('No backend was added via i18next.use. Will not load resources.');
      return callback && callback();
    }
    var options = _extends({}, this.backend.options, this.options.backend);

    if (typeof languages === 'string') languages = this.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];

    var toLoad = this.queueLoad(languages, namespaces, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length) callback(); // nothing to load and no pendings...callback now
      return null; // pendings will trigger callback
    }

    // load with multi-load
    if (options.allowMultiLoading && this.backend.readMulti) {
      this.read(toLoad.toLoadLanguages, toLoad.toLoadNamespaces, 'readMulti', null, null, function (err, data) {
        if (err) _this5.logger.warn('loading namespaces ' + toLoad.toLoadNamespaces.join(', ') + ' for languages ' + toLoad.toLoadLanguages.join(', ') + ' via multiloading failed', err);
        if (!err && data) _this5.logger.log('successfully loaded namespaces ' + toLoad.toLoadNamespaces.join(', ') + ' for languages ' + toLoad.toLoadLanguages.join(', ') + ' via multiloading', data);

        toLoad.toLoad.forEach(function (name) {
          var _name$split3 = name.split('|'),
              _name$split4 = slicedToArray(_name$split3, 2),
              l = _name$split4[0],
              n = _name$split4[1];

          var bundle = getPath(data, [l, n]);
          if (bundle) {
            _this5.loaded(name, err, bundle);
          } else {
            var error = 'loading namespace ' + n + ' for language ' + l + ' via multiloading failed';
            _this5.loaded(name, error);
            _this5.logger.error(error);
          }
        });
      });
    } else {
      toLoad.toLoad.forEach(function (name) {
        _this5.loadOne(name);
      });
    }
  };

  Connector.prototype.reload = function reload(languages, namespaces) {
    var _this6 = this;

    if (!this.backend) {
      this.logger.warn('No backend was added via i18next.use. Will not load resources.');
    }
    var options = _extends({}, this.backend.options, this.options.backend);

    if (typeof languages === 'string') languages = this.languageUtils.toResolveHierarchy(languages);
    if (typeof namespaces === 'string') namespaces = [namespaces];

    // load with multi-load
    if (options.allowMultiLoading && this.backend.readMulti) {
      this.read(languages, namespaces, 'readMulti', null, null, function (err, data) {
        if (err) _this6.logger.warn('reloading namespaces ' + namespaces.join(', ') + ' for languages ' + languages.join(', ') + ' via multiloading failed', err);
        if (!err && data) _this6.logger.log('successfully reloaded namespaces ' + namespaces.join(', ') + ' for languages ' + languages.join(', ') + ' via multiloading', data);

        languages.forEach(function (l) {
          namespaces.forEach(function (n) {
            var bundle = getPath(data, [l, n]);
            if (bundle) {
              _this6.loaded(l + '|' + n, err, bundle);
            } else {
              var error = 'reloading namespace ' + n + ' for language ' + l + ' via multiloading failed';
              _this6.loaded(l + '|' + n, error);
              _this6.logger.error(error);
            }
          });
        });
      });
    } else {
      languages.forEach(function (l) {
        namespaces.forEach(function (n) {
          _this6.loadOne(l + '|' + n, 're');
        });
      });
    }
  };

  Connector.prototype.loadOne = function loadOne(name) {
    var _this7 = this;

    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    var _name$split5 = name.split('|'),
        _name$split6 = slicedToArray(_name$split5, 2),
        lng = _name$split6[0],
        ns = _name$split6[1];

    this.read(lng, ns, 'read', null, null, function (err, data) {
      if (err) _this7.logger.warn(prefix + 'loading namespace ' + ns + ' for language ' + lng + ' failed', err);
      if (!err && data) _this7.logger.log(prefix + 'loaded namespace ' + ns + ' for language ' + lng, data);

      _this7.loaded(name, err, data);
    });
  };

  Connector.prototype.saveMissing = function saveMissing(languages, namespace, key, fallbackValue, isUpdate) {
    var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

    if (this.backend && this.backend.create) {
      this.backend.create(languages, namespace, key, fallbackValue, null /* unused callback */, _extends({}, options, { isUpdate: isUpdate }));
    }

    // write to store to avoid resending
    if (!languages || !languages[0]) return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  };

  return Connector;
}(EventEmitter);

var Connector$1 = function (_EventEmitter) {
  inherits(Connector, _EventEmitter);

  function Connector(cache, store, services) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    classCallCheck(this, Connector);

    var _this = possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.cache = cache;
    _this.store = store;
    _this.services = services;
    _this.options = options;
    _this.logger = baseLogger.create('cacheConnector');

    if (_this.cache && _this.cache.init) _this.cache.init(services, options.cache, options);
    return _this;
  }

  /* eslint consistent-return: 0 */


  Connector.prototype.load = function load(languages, namespaces, callback) {
    var _this2 = this;

    if (!this.cache) return callback && callback();
    var options = _extends({}, this.cache.options, this.options.cache);

    var loadLngs = typeof languages === 'string' ? this.services.languageUtils.toResolveHierarchy(languages) : languages;

    if (options.enabled) {
      this.cache.load(loadLngs, function (err, data) {
        if (err) _this2.logger.error('loading languages ' + loadLngs.join(', ') + ' from cache failed', err);
        if (data) {
          /* eslint no-restricted-syntax: 0 */
          for (var l in data) {
            if (Object.prototype.hasOwnProperty.call(data, l)) {
              for (var n in data[l]) {
                if (Object.prototype.hasOwnProperty.call(data[l], n)) {
                  if (n !== 'i18nStamp') {
                    var bundle = data[l][n];
                    if (bundle) _this2.store.addResourceBundle(l, n, bundle);
                  }
                }
              }
            }
          }
        }
        if (callback) callback();
      });
    } else if (callback) {
      callback();
    }
  };

  Connector.prototype.save = function save() {
    if (this.cache && this.options.cache && this.options.cache.enabled) this.cache.save(this.store.data);
  };

  return Connector;
}(EventEmitter);

function get$1() {
  return {
    debug: false,
    initImmediate: true,

    ns: ['translation'],
    defaultNS: ['translation'],
    fallbackLng: ['dev'],
    fallbackNS: false, // string or array of namespaces

    whitelist: false, // array with whitelisted languages
    nonExplicitWhitelist: false,
    load: 'all', // | currentOnly | languageOnly
    preload: false, // array with preload languages

    simplifyPluralSuffix: true,
    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_',

    saveMissing: false, // enable to send missing values
    updateMissing: false, // enable to update default values if different from translated value (only useful on initial development, or when keeping code as source of truth)
    saveMissingTo: 'fallback', // 'current' || 'all'
    saveMissingPlurals: true, // will save all forms not only singular key
    missingKeyHandler: false, // function(lng, ns, key, fallbackValue) -> override if prefer on handling
    missingInterpolationHandler: false, // function(str, match)

    postProcess: false, // string or array of postProcessor names
    returnNull: true, // allows null value as valid translation
    returnEmptyString: true, // allows empty string value as valid translation
    returnObjects: false,
    joinArrays: false, // or string to join array
    returnedObjectHandler: function returnedObjectHandler() {}, // function(key, value, options) triggered if key returns object but returnObjects is set to false
    parseMissingKeyHandler: false, // function(key) parsed a key that was not found in t() before returning
    appendNamespaceToMissingKey: false,
    appendNamespaceToCIMode: false,
    overloadTranslationOptionHandler: function handle(args) {
      var ret = {};
      if (args[1]) ret.defaultValue = args[1];
      if (args[2]) ret.tDescription = args[2];
      return ret;
    },

    interpolation: {
      escapeValue: true,
      format: function format(value, _format, lng) {
        return value;
      },
      prefix: '{{',
      suffix: '}}',
      formatSeparator: ',',
      // prefixEscaped: '{{',
      // suffixEscaped: '}}',
      // unescapeSuffix: '',
      unescapePrefix: '-',

      nestingPrefix: '$t(',
      nestingSuffix: ')',
      // nestingPrefixEscaped: '$t(',
      // nestingSuffixEscaped: ')',
      // defaultVariables: undefined // object that can have values to interpolate on - extends passed in interpolation data
      maxReplaces: 1000 // max replaces to prevent endless loop
    }
  };
}

/* eslint no-param-reassign: 0 */
function transformOptions(options) {
  // create namespace object if namespace is passed in as string
  if (typeof options.ns === 'string') options.ns = [options.ns];
  if (typeof options.fallbackLng === 'string') options.fallbackLng = [options.fallbackLng];
  if (typeof options.fallbackNS === 'string') options.fallbackNS = [options.fallbackNS];

  // extend whitelist with cimode
  if (options.whitelist && options.whitelist.indexOf('cimode') < 0) {
    options.whitelist = options.whitelist.concat(['cimode']);
  }

  return options;
}

function noop() {}

var I18n = function (_EventEmitter) {
  inherits(I18n, _EventEmitter);

  function I18n() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];
    classCallCheck(this, I18n);

    var _this = possibleConstructorReturn(this, _EventEmitter.call(this));

    _this.options = transformOptions(options);
    _this.services = {};
    _this.logger = baseLogger;
    _this.modules = { external: [] };

    if (callback && !_this.isInitialized && !options.isClone) {
      var _ret;

      // https://github.com/i18next/i18next/issues/879
      if (!_this.options.initImmediate) return _ret = _this.init(options, callback), possibleConstructorReturn(_this, _ret);
      setTimeout(function () {
        _this.init(options, callback);
      }, 0);
    }
    return _this;
  }

  I18n.prototype.init = function init() {
    var _this2 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    this.options = _extends({}, get$1(), this.options, transformOptions(options));

    this.format = this.options.interpolation.format;
    if (!callback) callback = noop;

    function createClassOnDemand(ClassOrObject) {
      if (!ClassOrObject) return null;
      if (typeof ClassOrObject === 'function') return new ClassOrObject();
      return ClassOrObject;
    }

    // init services
    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
      } else {
        baseLogger.init(null, this.options);
      }

      var lu = new LanguageUtil(this.options);
      this.store = new ResourceStore(this.options.resources, this.options);

      var s = this.services;
      s.logger = baseLogger;
      s.resourceStore = this.store;
      s.resourceStore.on('added removed', function (lng, ns) {
        s.cacheConnector.save();
      });
      s.languageUtils = lu;
      s.pluralResolver = new PluralResolver(lu, { prepend: this.options.pluralSeparator, compatibilityJSON: this.options.compatibilityJSON, simplifyPluralSuffix: this.options.simplifyPluralSuffix });
      s.interpolator = new Interpolator(this.options);

      s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      // pipe events from backendConnector
      s.backendConnector.on('*', function (event) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      s.backendConnector.on('loaded', function (loaded) {
        s.cacheConnector.save();
      });

      s.cacheConnector = new Connector$1(createClassOnDemand(this.modules.cache), s.resourceStore, s, this.options);
      // pipe events from backendConnector
      s.cacheConnector.on('*', function (event) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        s.languageDetector.init(s, this.options.detection, this.options);
      }

      this.translator = new Translator(this.services, this.options);
      // pipe events from translator
      this.translator.on('*', function (event) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        _this2.emit.apply(_this2, [event].concat(args));
      });

      this.modules.external.forEach(function (m) {
        if (m.init) m.init(_this2);
      });
    }

    // append api
    var storeApi = ['getResource', 'addResource', 'addResources', 'addResourceBundle', 'removeResourceBundle', 'hasResourceBundle', 'getResourceBundle'];
    storeApi.forEach(function (fcName) {
      _this2[fcName] = function () {
        var _store;

        return (_store = _this2.store)[fcName].apply(_store, arguments);
      };
    });

    var load = function load() {
      _this2.changeLanguage(_this2.options.lng, function (err, t) {
        _this2.isInitialized = true;
        _this2.logger.log('initialized', _this2.options);
        _this2.emit('initialized', _this2.options);

        callback(err, t);
      });
    };

    if (this.options.resources || !this.options.initImmediate) {
      load();
    } else {
      setTimeout(load, 0);
    }

    return this;
  };

  /* eslint consistent-return: 0 */


  I18n.prototype.loadResources = function loadResources() {
    var _this3 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

    if (!this.options.resources) {
      if (this.language && this.language.toLowerCase() === 'cimode') return callback(); // avoid loading resources for cimode

      var toLoad = [];

      var append = function append(lng) {
        if (!lng) return;
        var lngs = _this3.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach(function (l) {
          if (toLoad.indexOf(l) < 0) toLoad.push(l);
        });
      };

      if (!this.language) {
        // at least load fallbacks in this case
        var fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        fallbacks.forEach(function (l) {
          return append(l);
        });
      } else {
        append(this.language);
      }

      if (this.options.preload) {
        this.options.preload.forEach(function (l) {
          return append(l);
        });
      }

      this.services.cacheConnector.load(toLoad, this.options.ns, function () {
        _this3.services.backendConnector.load(toLoad, _this3.options.ns, callback);
      });
    } else {
      callback(null);
    }
  };

  I18n.prototype.reloadResources = function reloadResources(lngs, ns) {
    if (!lngs) lngs = this.languages;
    if (!ns) ns = this.options.ns;
    this.services.backendConnector.reload(lngs, ns);
  };

  I18n.prototype.use = function use(module) {
    if (module.type === 'backend') {
      this.modules.backend = module;
    }

    if (module.type === 'cache') {
      this.modules.cache = module;
    }

    if (module.type === 'logger' || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }

    if (module.type === 'languageDetector') {
      this.modules.languageDetector = module;
    }

    if (module.type === 'postProcessor') {
      postProcessor.addPostProcessor(module);
    }

    if (module.type === '3rdParty') {
      this.modules.external.push(module);
    }

    return this;
  };

  I18n.prototype.changeLanguage = function changeLanguage(lng, callback) {
    var _this4 = this;

    var done = function done(err, l) {
      _this4.translator.changeLanguage(l);

      if (l) {
        _this4.emit('languageChanged', l);
        _this4.logger.log('languageChanged', l);
      }

      if (callback) callback(err, function () {
        return _this4.t.apply(_this4, arguments);
      });
    };

    var setLng = function setLng(l) {
      if (l) {
        _this4.language = l;
        _this4.languages = _this4.services.languageUtils.toResolveHierarchy(l);
        if (!_this4.translator.language) _this4.translator.changeLanguage(l);

        if (_this4.services.languageDetector) _this4.services.languageDetector.cacheUserLanguage(l);
      }

      _this4.loadResources(function (err) {
        done(err, l);
      });
    };

    if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
      setLng(this.services.languageDetector.detect());
    } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
      this.services.languageDetector.detect(setLng);
    } else {
      setLng(lng);
    }
  };

  I18n.prototype.getFixedT = function getFixedT(lng, ns) {
    var _this5 = this;

    var fixedT = function fixedT(key, opts) {
      for (var _len4 = arguments.length, rest = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        rest[_key4 - 2] = arguments[_key4];
      }

      var options = _extends({}, opts);
      if ((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        options = _this5.options.overloadTranslationOptionHandler([key, opts].concat(rest));
      }

      options.lng = options.lng || fixedT.lng;
      options.lngs = options.lngs || fixedT.lngs;
      options.ns = options.ns || fixedT.ns;
      return _this5.t(key, options);
    };
    if (typeof lng === 'string') {
      fixedT.lng = lng;
    } else {
      fixedT.lngs = lng;
    }
    fixedT.ns = ns;
    return fixedT;
  };

  I18n.prototype.t = function t() {
    var _translator;

    return this.translator && (_translator = this.translator).translate.apply(_translator, arguments);
  };

  I18n.prototype.exists = function exists() {
    var _translator2;

    return this.translator && (_translator2 = this.translator).exists.apply(_translator2, arguments);
  };

  I18n.prototype.setDefaultNamespace = function setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  };

  I18n.prototype.loadNamespaces = function loadNamespaces(ns, callback) {
    var _this6 = this;

    if (!this.options.ns) return callback && callback();
    if (typeof ns === 'string') ns = [ns];

    ns.forEach(function (n) {
      if (_this6.options.ns.indexOf(n) < 0) _this6.options.ns.push(n);
    });

    this.loadResources(callback);
  };

  I18n.prototype.loadLanguages = function loadLanguages(lngs, callback) {
    if (typeof lngs === 'string') lngs = [lngs];
    var preloaded = this.options.preload || [];

    var newLngs = lngs.filter(function (lng) {
      return preloaded.indexOf(lng) < 0;
    });
    // Exit early if all given languages are already preloaded
    if (!newLngs.length) return callback();

    this.options.preload = preloaded.concat(newLngs);
    this.loadResources(callback);
  };

  I18n.prototype.dir = function dir(lng) {
    if (!lng) lng = this.languages && this.languages.length > 0 ? this.languages[0] : this.language;
    if (!lng) return 'rtl';

    var rtlLngs = ['ar', 'shu', 'sqr', 'ssh', 'xaa', 'yhd', 'yud', 'aao', 'abh', 'abv', 'acm', 'acq', 'acw', 'acx', 'acy', 'adf', 'ads', 'aeb', 'aec', 'afb', 'ajp', 'apc', 'apd', 'arb', 'arq', 'ars', 'ary', 'arz', 'auz', 'avl', 'ayh', 'ayl', 'ayn', 'ayp', 'bbz', 'pga', 'he', 'iw', 'ps', 'pbt', 'pbu', 'pst', 'prp', 'prd', 'ur', 'ydd', 'yds', 'yih', 'ji', 'yi', 'hbo', 'men', 'xmn', 'fa', 'jpr', 'peo', 'pes', 'prs', 'dv', 'sam'];

    return rtlLngs.indexOf(this.services.languageUtils.getLanguagePartFromCode(lng)) >= 0 ? 'rtl' : 'ltr';
  };

  /* eslint class-methods-use-this: 0 */


  I18n.prototype.createInstance = function createInstance() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];

    return new I18n(options, callback);
  };

  I18n.prototype.cloneInstance = function cloneInstance() {
    var _this7 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

    var mergedOptions = _extends({}, this.options, options, { isClone: true });
    var clone = new I18n(mergedOptions);
    var membersToCopy = ['store', 'services', 'language'];
    membersToCopy.forEach(function (m) {
      clone[m] = _this7[m];
    });
    clone.translator = new Translator(clone.services, clone.options);
    clone.translator.on('*', function (event) {
      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      clone.emit.apply(clone, [event].concat(args));
    });
    clone.init(mergedOptions, callback);
    clone.translator.options = clone.options; // sync options

    return clone;
  };

  return I18n;
}(EventEmitter);

var i18next = new I18n();

return i18next;

})));

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.i18nextXHRBackend = factory());
}(this, (function () { 'use strict';

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function addQueryString(url, params) {
  if (params && (typeof params === 'undefined' ? 'undefined' : _typeof(params)) === 'object') {
    var queryString = '',
        e = encodeURIComponent;

    // Must encode data
    for (var paramName in params) {
      queryString += '&' + e(paramName) + '=' + e(params[paramName]);
    }

    if (!queryString) {
      return url;
    }

    url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1);
  }

  return url;
}

// https://gist.github.com/Xeoncross/7663273
function ajax(url, options, callback, data, cache) {

  if (data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    if (!cache) {
      data['_t'] = new Date();
    }
    // URL encoded form data must be in querystring format
    data = addQueryString('', data).slice(1);
  }

  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams);
  }

  try {
    var x;
    if (XMLHttpRequest) {
      x = new XMLHttpRequest();
    } else {
      x = new ActiveXObject('MSXML2.XMLHTTP.3.0');
    }
    x.open(data ? 'POST' : 'GET', url, 1);
    if (!options.crossDomain) {
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    x.withCredentials = !!options.withCredentials;
    if (data) {
      x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    if (x.overrideMimeType) {
      x.overrideMimeType("application/json");
    }
    var h = options.customHeaders;
    if (h) {
      for (var i in h) {
        x.setRequestHeader(i, h[i]);
      }
    }
    x.onreadystatechange = function () {
      x.readyState > 3 && callback && callback(x.responseText, x);
    };
    x.send(data);
  } catch (e) {
    console && console.log(e);
  }
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getDefaults() {
  return {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    parse: JSON.parse,
    crossDomain: false,
    ajax: ajax
  };
}

var Backend = function () {
  function Backend(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Backend);

    this.init(services, options);

    this.type = 'backend';
  }

  _createClass(Backend, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'readMulti',
    value: function readMulti(languages, namespaces, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath(languages, namespaces);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'read',
    value: function read(language, namespace, callback) {
      var loadPath = this.options.loadPath;
      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath([language], [namespace]);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

      this.loadUrl(url, callback);
    }
  }, {
    key: 'loadUrl',
    value: function loadUrl(url, callback) {
      var _this = this;

      this.options.ajax(url, this.options, function (data, xhr) {
        if (xhr.status >= 500 && xhr.status < 600) return callback('failed loading ' + url, true /* retry */);
        if (xhr.status >= 400 && xhr.status < 500) return callback('failed loading ' + url, false /* no retry */);

        var ret = void 0,
            err = void 0;
        try {
          ret = _this.options.parse(data, url);
        } catch (e) {
          err = 'failed parsing ' + url + ' to json';
        }
        if (err) return callback(err, false);
        callback(null, ret);
      });
    }
  }, {
    key: 'create',
    value: function create(languages, namespace, key, fallbackValue) {
      var _this2 = this;

      if (typeof languages === 'string') languages = [languages];

      var payload = {};
      payload[key] = fallbackValue || '';

      languages.forEach(function (lng) {
        var url = _this2.services.interpolator.interpolate(_this2.options.addPath, { lng: lng, ns: namespace });

        _this2.options.ajax(url, _this2.options, function (data, xhr) {
          //const statusCode = xhr.status.toString();
          // TODO: if statusCode === 4xx do log
        }, payload);
      });
    }
  }]);

  return Backend;
}();

Backend.type = 'backend';

return Backend;

})));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.i18nextLocalStorageCache = factory());
}(this, (function () { 'use strict';

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}



function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
        args = arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var storage = {
  setItem: function setItem(key, value) {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        // f.log('failed to set value for key "' + key + '" to localStorage.');
      }
    }
  },
  getItem: function getItem(key, value) {
    if (window.localStorage) {
      try {
        return window.localStorage.getItem(key, value);
      } catch (e) {
        // f.log('failed to get value for key "' + key + '" from localStorage.');
      }
    }
    return undefined;
  }
};

function getDefaults() {
  return {
    enabled: false,
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000,
    versions: {}
  };
}

var Cache = function () {
  function Cache(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Cache);

    this.init(services, options);

    this.type = 'cache';
    this.debouncedStore = debounce(this.store, 10000);
  }

  _createClass(Cache, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'load',
    value: function load(lngs, callback) {
      var _this = this;

      var store = {};
      var nowMS = new Date().getTime();

      if (!window.localStorage || !lngs.length) {
        return callback(null, null);
      }

      var todo = lngs.length;

      lngs.forEach(function (lng) {
        var local = storage.getItem(_this.options.prefix + lng);

        if (local) {
          local = JSON.parse(local);
          if (
          // expiration field is mandatory, and should not be expired
          local.i18nStamp && local.i18nStamp + _this.options.expirationTime > nowMS &&

          // there should be no language version set, or if it is, it should match the one in translation
          _this.options.versions[lng] === local.i18nVersion) {
            delete local.i18nVersion;
            store[lng] = local;
          }
        }

        todo -= 1;
        if (todo === 0) {
          callback(null, store);
        }
      });
      return undefined;
    }
  }, {
    key: 'store',
    value: function store(storeParam) {
      var store = storeParam;
      if (window.localStorage) {
        for (var m in store) {
          // eslint-disable-line
          // timestamp
          store[m].i18nStamp = new Date().getTime();

          // language version (if set)
          if (this.options.versions[m]) {
            store[m].i18nVersion = this.options.versions[m];
          }

          // save
          storage.setItem(this.options.prefix + m, JSON.stringify(store[m]));
        }
      }
    }
  }, {
    key: 'save',
    value: function save(store) {
      this.debouncedStore(store);
    }
  }]);

  return Cache;
}();

Cache.type = 'cache';

return Cache;

})));

/*
 * Timer.js: A periodic timer for Node.js and the browser.
 *
 * Copyright (c) 2012 Arthur Klepchukov, Jarvis Badgley, Florian Schäfer
 * Licensed under the BSD license (BSD_LICENSE.txt)
 *
 * Version: 0.0.1
 *
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.Timer = factory();
    }
})(this, function () {

    function timeStringToMilliseconds(timeString) {
        if (typeof timeString === 'string') {

            if (isNaN(parseInt(timeString, 10))) {
                timeString = '1' + timeString;
            }

            var match = timeString
                .replace(/[^a-z0-9\.]/g, '')
                .match(/(?:(\d+(?:\.\d+)?)(?:days?|d))?(?:(\d+(?:\.\d+)?)(?:hours?|hrs?|h))?(?:(\d+(?:\.\d+)?)(?:minutes?|mins?|m\b))?(?:(\d+(?:\.\d+)?)(?:seconds?|secs?|s))?(?:(\d+(?:\.\d+)?)(?:milliseconds?|ms))?/);

            if (match[0]) {
                return parseFloat(match[1] || 0) * 86400000 +  // days
                       parseFloat(match[2] || 0) * 3600000 +   // hours
                       parseFloat(match[3] || 0) * 60000 +     // minutes
                       parseFloat(match[4] || 0) * 1000 +      // seconds
                       parseInt(match[5] || 0, 10);            // milliseconds
            }

            if (!isNaN(parseInt(timeString, 10))) {
                return parseInt(timeString, 10);
            }
        }

        if (typeof timeString === 'number') {
            return timeString;
        }

        return 0;
    }

    function millisecondsToTicks(milliseconds, resolution) {
        return parseInt(milliseconds / resolution, 10) || 1;
    }

    function Timer(resolution) {
        if (this instanceof Timer === false) {
            return new Timer(resolution);
        }

        this._notifications = [];
        this._resolution = timeStringToMilliseconds(resolution) || 1000;
        this._running = false;
        this._ticks = 0;
        this._timer = null;
        this._drift = 0;
    }

    Timer.prototype = {
        start: function () {
            var self = this;
            if (!this._running) {
                this._running = !this._running;
                setTimeout(function loopsyloop() {
                    self._ticks++;
                    for (var i = 0, l = self._notifications.length; i < l; i++) {
                        if (self._notifications[i] && self._ticks % self._notifications[i].ticks === 0) {
                            self._notifications[i].callback.call(self._notifications[i], { ticks: self._ticks, resolution: self._resolution });
                        }
                    }
                    if (self._running) {
                        self._timer = setTimeout(loopsyloop, self._resolution + self._drift);
                        self._drift = 0;
                    }
                }, this._resolution + this._drift);
                this._drift = 0;
            }
            return this;
        },
        stop: function () {
            if (this._running) {
                this._running = !this._running;
                clearTimeout(this._timer);
            }
            return this;
        },
        reset: function () {
            this.stop();
            this._ticks = 0;
            return this;
        },
        clear: function () {
            this.reset();
            this._notifications = [];
            return this;
        },
        ticks: function () {
            return this._ticks;
        },
        resolution: function () {
            return this._resolution;
        },
        running: function () {
            return this._running;
        },
        bind: function (when, callback) {
            if (when && callback) {
                var ticks = millisecondsToTicks(timeStringToMilliseconds(when), this._resolution);
                this._notifications.push({
                    ticks: ticks,
                    callback: callback
                });
            }
            return this;
        },
        unbind: function (callback) {
            if (!callback) {
                this._notifications = [];
            } else {
                for (var i = 0, l = this._notifications.length; i < l; i++) {
                    if (this._notifications[i] && this._notifications[i].callback === callback) {
                        this._notifications.splice(i, 1);
                    }
                }
            }
            return this;
        },
        drift: function (timeDrift) {
            this._drift = timeDrift;
            return this;
        }
    };

    Timer.prototype.every = Timer.prototype.bind;
    Timer.prototype.after = function (when, callback) {
        var self = this;
        Timer.prototype.bind.call(self, when, function fn () {
            Timer.prototype.unbind.call(self, fn);
            callback.apply(this, arguments);
        });
        return this;
    };

    return Timer;

});

/* smoothscroll v0.4.0 - 2017 - Dustan Kasten, Jeremias Menichelli - MIT License */
(function () {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   */
  var w = window;
  var d = document;

  /**
   * indicates if a the current browser is made by Microsoft
   * @method isMicrosoftBrowser
   * @param {String} userAgent
   * @returns {Boolean}
   */
  function isMicrosoftBrowser(userAgent) {
    var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

    return new RegExp(userAgentPatterns.join('|')).test(userAgent);
  }

   // polyfill
  function polyfill() {
    // return if scroll behavior is supported and polyfill is not forced
    if ('scrollBehavior' in d.documentElement.style
      && w.__forceSmoothScrollPolyfill__ !== true) {
      return;
    }

    // globals
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * IE has rounding bug rounding down clientHeight and clientWidth and
     * rounding up scrollHeight and scrollWidth causing false positives
     * on hasScrollableSpace
     */
    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

    // object gathering original scroll methods
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elementScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    // define timing method
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance)
      : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} firstArg
     * @returns {Boolean}
     */
    function shouldBailOut(firstArg) {
      if (firstArg === null
        || typeof firstArg !== 'object'
        || firstArg.behavior === undefined
        || firstArg.behavior === 'auto'
        || firstArg.behavior === 'instant') {
        // first argument is not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError(
        'behavior member of ScrollOptions '
        + firstArg.behavior
        + ' is not a valid value for enumeration ScrollBehavior.'
      );
    }

    /**
     * indicates if an element has scrollable space in the provided axis
     * @method hasScrollableSpace
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function hasScrollableSpace(el, axis) {
      if (axis === 'Y') {
        return (el.clientHeight + ROUNDING_TOLERANCE) < el.scrollHeight;
      }

      if (axis === 'X') {
        return (el.clientWidth + ROUNDING_TOLERANCE) < el.scrollWidth;
      }
    }

    /**
     * indicates if an element has a scrollable overflow property in the axis
     * @method canOverflow
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function canOverflow(el, axis) {
      var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

      return overflowValue === 'auto' || overflowValue === 'scroll';
    }

    /**
     * indicates if an element can be scrolled in either axis
     * @method isScrollable
     * @param {Node} el
     * @param {String} axis
     * @returns {Boolean}
     */
    function isScrollable(el) {
      var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
      var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

      return isScrollableY || isScrollableX;
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;

      do {
        el = el.parentNode;

        isBody = el === d.body;
      } while (isBody === false && isScrollable(el) === false);

      isBody = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     * @returns {undefined}
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window or element with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     * @returns {undefined}
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    // ORIGINAL METHODS OVERRIDES
    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scroll.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object'
              ? arguments[0]
              : (w.scrollX || w.pageXOffset),
          // use top prop, second argument if present or fallback to scrollY
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined
              ? arguments[1]
              : (w.scrollY || w.pageYOffset)
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        arguments[0].left !== undefined
          ? ~~arguments[0].left
          : (w.scrollX || w.pageXOffset),
        arguments[0].top !== undefined
          ? ~~arguments[0].top
          : (w.scrollY || w.pageYOffset)
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left !== undefined
            ? arguments[0].left
            : typeof arguments[0] !== 'object'
              ? arguments[0]
              : 0,
          arguments[0].top !== undefined
            ? arguments[0].top
            : arguments[1] !== undefined
             ? arguments[1]
             : 0
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        // if one number is passed, throw error to match Firefox implementation
        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
          throw new SyntaxError('Value couldn\'t be converted');
        }

        original.elementScroll.call(
          this,
          // use left prop, first number argument or fallback to scrollLeft
          arguments[0].left !== undefined
            ? ~~arguments[0].left
            : typeof arguments[0] !== 'object'
              ? ~~arguments[0]
              : this.scrollLeft,
          // use top prop, second argument or fallback to scrollTop
          arguments[0].top !== undefined
            ? ~~arguments[0].top
            : arguments[1] !== undefined
              ? ~~arguments[1]
              : this.scrollTop
        );

        return;
      }

      var left = arguments[0].left;
      var top = arguments[0].top;

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        this,
        this,
        typeof left === 'undefined' ? this.scrollLeft : ~~left,
        typeof top === 'undefined' ? this.scrollTop : ~~top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      // avoid action when no arguments are passed
      if (arguments[0] === undefined) {
        return;
      }

      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.elementScroll.call(
          this,
          arguments[0].left !== undefined
            ? ~~arguments[0].left + this.scrollLeft
            : ~~arguments[0] + this.scrollLeft,
          arguments[0].top !== undefined
            ? ~~arguments[0].top + this.scrollTop
            : ~~arguments[1] + this.scrollTop
        );

        return;
      }

      this.scroll({
        left: ~~arguments[0].left + this.scrollLeft,
        top: ~~arguments[0].top + this.scrollTop,
        behavior: arguments[0].behavior
      });
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0]) === true) {
        original.scrollIntoView.call(
          this,
          arguments[0] === undefined
            ? true
            : arguments[0]
        );

        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );

        // reveal parent in viewport unless is fixed
        if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
          w.scrollBy({
            left: parentRects.left,
            top: parentRects.top,
            behavior: 'smooth'
          });
        }
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (typeof exports === 'object') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }

}());

!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.swal=e():t.swal=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=8)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o="swal-button";e.CLASS_NAMES={MODAL:"swal-modal",OVERLAY:"swal-overlay",SHOW_MODAL:"swal-overlay--show-modal",MODAL_TITLE:"swal-title",MODAL_TEXT:"swal-text",ICON:"swal-icon",ICON_CUSTOM:"swal-icon--custom",CONTENT:"swal-content",FOOTER:"swal-footer",BUTTON_CONTAINER:"swal-button-container",BUTTON:o,CONFIRM_BUTTON:o+"--confirm",CANCEL_BUTTON:o+"--cancel",DANGER_BUTTON:o+"--danger",BUTTON_LOADING:o+"--loading",BUTTON_LOADER:o+"__loader"},e.default=e.CLASS_NAMES},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getNode=function(t){var e="."+t;return document.querySelector(e)},e.stringToNode=function(t){var e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild},e.insertAfter=function(t,e){var n=e.nextSibling;e.parentNode.insertBefore(t,n)},e.removeNode=function(t){t.parentElement.removeChild(t)},e.throwErr=function(t){throw t=t.replace(/ +(?= )/g,""),"SweetAlert: "+(t=t.trim())},e.isPlainObject=function(t){if("[object Object]"!==Object.prototype.toString.call(t))return!1;var e=Object.getPrototypeOf(t);return null===e||e===Object.prototype},e.ordinalSuffixOf=function(t){var e=t%10,n=t%100;return 1===e&&11!==n?t+"st":2===e&&12!==n?t+"nd":3===e&&13!==n?t+"rd":t+"th"}},function(t,e,n){"use strict";function o(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}Object.defineProperty(e,"__esModule",{value:!0}),o(n(25));var r=n(26);e.overlayMarkup=r.default,o(n(27)),o(n(28)),o(n(29));var i=n(0),a=i.default.MODAL_TITLE,s=i.default.MODAL_TEXT,c=i.default.ICON,l=i.default.FOOTER;e.iconMarkup='\n  <div class="'+c+'"></div>',e.titleMarkup='\n  <div class="'+a+'"></div>\n',e.textMarkup='\n  <div class="'+s+'"></div>',e.footerMarkup='\n  <div class="'+l+'"></div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1);e.CONFIRM_KEY="confirm",e.CANCEL_KEY="cancel";var r={visible:!0,text:null,value:null,className:"",closeModal:!0},i=Object.assign({},r,{visible:!1,text:"Cancel",value:null}),a=Object.assign({},r,{text:"OK",value:!0});e.defaultButtonList={cancel:i,confirm:a};var s=function(t){switch(t){case e.CONFIRM_KEY:return a;case e.CANCEL_KEY:return i;default:var n=t.charAt(0).toUpperCase()+t.slice(1);return Object.assign({},r,{text:n,value:t})}},c=function(t,e){var n=s(t);return!0===e?Object.assign({},n,{visible:!0}):"string"==typeof e?Object.assign({},n,{visible:!0,text:e}):o.isPlainObject(e)?Object.assign({visible:!0},n,e):Object.assign({},n,{visible:!1})},l=function(t){for(var e={},n=0,o=Object.keys(t);n<o.length;n++){var r=o[n],a=t[r],s=c(r,a);e[r]=s}return e.cancel||(e.cancel=i),e},u=function(t){var n={};switch(t.length){case 1:n[e.CANCEL_KEY]=Object.assign({},i,{visible:!1});break;case 2:n[e.CANCEL_KEY]=c(e.CANCEL_KEY,t[0]),n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t[1]);break;default:o.throwErr("Invalid number of 'buttons' in array ("+t.length+").\n      If you want more than 2 buttons, you need to use an object!")}return n};e.getButtonListOpts=function(t){var n=e.defaultButtonList;return"string"==typeof t?n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t):Array.isArray(t)?n=u(t):o.isPlainObject(t)?n=l(t):!0===t?n=u([!0,!0]):!1===t?n=u([!1,!1]):void 0===t&&(n=e.defaultButtonList),n}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=n(0),a=i.default.MODAL,s=i.default.OVERLAY,c=n(30),l=n(31),u=n(32),f=n(33);e.injectElIntoModal=function(t){var e=o.getNode(a),n=o.stringToNode(t);return e.appendChild(n),n};var d=function(t){t.className=a,t.textContent=""},p=function(t,e){d(t);var n=e.className;n&&t.classList.add(n)};e.initModalContent=function(t){var e=o.getNode(a);p(e,t),c.default(t.icon),l.initTitle(t.title),l.initText(t.text),f.default(t.content),u.default(t.buttons,t.dangerMode)};var m=function(){var t=o.getNode(s),e=o.stringToNode(r.modalMarkup);t.appendChild(e)};e.default=m},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r={isOpen:!1,promise:null,actions:{},timer:null},i=Object.assign({},r);e.resetState=function(){i=Object.assign({},r)},e.setActionValue=function(t){if("string"==typeof t)return a(o.CONFIRM_KEY,t);for(var e in t)a(e,t[e])};var a=function(t,e){i.actions[t]||(i.actions[t]={}),Object.assign(i.actions[t],{value:e})};e.setActionOptionsFor=function(t,e){var n=(void 0===e?{}:e).closeModal,o=void 0===n||n;Object.assign(i.actions[t],{closeModal:o})},e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(0),a=i.default.OVERLAY,s=i.default.SHOW_MODAL,c=i.default.BUTTON,l=i.default.BUTTON_LOADING,u=n(5);e.openModal=function(){o.getNode(a).classList.add(s),u.default.isOpen=!0};var f=function(){o.getNode(a).classList.remove(s),u.default.isOpen=!1};e.onAction=function(t){void 0===t&&(t=r.CANCEL_KEY);var e=u.default.actions[t],n=e.value;if(!1===e.closeModal){var i=c+"--"+t;o.getNode(i).classList.add(l)}else f();u.default.promise.resolve(n)},e.getState=function(){var t=Object.assign({},u.default);return delete t.promise,delete t.timer,t},e.stopLoading=function(){for(var t=document.querySelectorAll("."+c),e=0;e<t.length;e++){t[e].classList.remove(l)}}},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){(function(e){t.exports=e.sweetAlert=n(9)}).call(e,n(7))},function(t,e,n){(function(e){t.exports=e.swal=n(10)}).call(e,n(7))},function(t,e,n){"undefined"!=typeof window&&n(11),n(16);var o=n(23).default;t.exports=o},function(t,e,n){var o=n(12);"string"==typeof o&&(o=[[t.i,o,""]]);var r={insertAt:"top"};r.transform=void 0;n(14)(o,r);o.locals&&(t.exports=o.locals)},function(t,e,n){e=t.exports=n(13)(void 0),e.push([t.i,'.swal-icon--error{border-color:#f27474;-webkit-animation:animateErrorIcon .5s;animation:animateErrorIcon .5s}.swal-icon--error__x-mark{position:relative;display:block;-webkit-animation:animateXMark .5s;animation:animateXMark .5s}.swal-icon--error__line{position:absolute;height:5px;width:47px;background-color:#f27474;display:block;top:37px;border-radius:2px}.swal-icon--error__line--left{-webkit-transform:rotate(45deg);transform:rotate(45deg);left:17px}.swal-icon--error__line--right{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);right:16px}@-webkit-keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@-webkit-keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}@keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}.swal-icon--warning{border-color:#f8bb86;-webkit-animation:pulseWarning .75s infinite alternate;animation:pulseWarning .75s infinite alternate}.swal-icon--warning__body{width:5px;height:47px;top:10px;border-radius:2px;margin-left:-2px}.swal-icon--warning__body,.swal-icon--warning__dot{position:absolute;left:50%;background-color:#f8bb86}.swal-icon--warning__dot{width:7px;height:7px;border-radius:50%;margin-left:-4px;bottom:-11px}@-webkit-keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}@keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}.swal-icon--success{border-color:#a5dc86}.swal-icon--success:after,.swal-icon--success:before{content:"";border-radius:50%;position:absolute;width:60px;height:120px;background:#fff;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.swal-icon--success:before{border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;transform-origin:60px 60px}.swal-icon--success:after{border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;transform-origin:0 60px;-webkit-animation:rotatePlaceholder 4.25s ease-in;animation:rotatePlaceholder 4.25s ease-in}.swal-icon--success__ring{width:80px;height:80px;border:4px solid hsla(98,55%,69%,.2);border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.swal-icon--success__hide-corners{width:5px;height:90px;background-color:#fff;padding:1px;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.swal-icon--success__line{height:5px;background-color:#a5dc86;display:block;border-radius:2px;position:absolute;z-index:2}.swal-icon--success__line--tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);transform:rotate(45deg);-webkit-animation:animateSuccessTip .75s;animation:animateSuccessTip .75s}.swal-icon--success__line--long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-animation:animateSuccessLong .75s;animation:animateSuccessLong .75s}@-webkit-keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@-webkit-keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@-webkit-keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}@keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}.swal-icon--info{border-color:#c9dae1}.swal-icon--info:before{width:5px;height:29px;bottom:17px;border-radius:2px;margin-left:-2px}.swal-icon--info:after,.swal-icon--info:before{content:"";position:absolute;left:50%;background-color:#c9dae1}.swal-icon--info:after{width:7px;height:7px;border-radius:50%;margin-left:-3px;top:19px}.swal-icon{width:80px;height:80px;border-width:4px;border-style:solid;border-radius:50%;padding:0;position:relative;box-sizing:content-box;margin:20px auto}.swal-icon:first-child{margin-top:32px}.swal-icon--custom{width:auto;height:auto;max-width:100%;border:none;border-radius:0}.swal-icon img{max-width:100%;max-height:100%}.swal-title{color:rgba(0,0,0,.65);font-weight:600;text-transform:none;position:relative;display:block;padding:13px 16px;font-size:27px;line-height:normal;text-align:center;margin-bottom:0}.swal-title:first-child{margin-top:26px}.swal-title:not(:first-child){padding-bottom:0}.swal-title:not(:last-child){margin-bottom:13px}.swal-text{font-size:16px;position:relative;float:none;line-height:normal;vertical-align:top;text-align:left;display:inline-block;margin:0;padding:0 10px;font-weight:400;color:rgba(0,0,0,.64);max-width:calc(100% - 20px);overflow-wrap:break-word;box-sizing:border-box}.swal-text:first-child{margin-top:45px}.swal-text:last-child{margin-bottom:45px}.swal-footer{text-align:right;padding-top:13px;margin-top:13px;padding:13px 16px;border-radius:inherit;border-top-left-radius:0;border-top-right-radius:0}.swal-button-container{margin:5px;display:inline-block;position:relative}.swal-button{background-color:#7cd1f9;color:#fff;border:none;box-shadow:none;border-radius:5px;font-weight:600;font-size:14px;padding:10px 24px;margin:0;cursor:pointer}.swal-button[not:disabled]:hover{background-color:#78cbf2}.swal-button:active{background-color:#70bce0}.swal-button:focus{outline:none;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(43,114,165,.29)}.swal-button[disabled]{opacity:.5;cursor:default}.swal-button::-moz-focus-inner{border:0}.swal-button--cancel{color:#555;background-color:#efefef}.swal-button--cancel[not:disabled]:hover{background-color:#e8e8e8}.swal-button--cancel:active{background-color:#d7d7d7}.swal-button--cancel:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(116,136,150,.29)}.swal-button--danger{background-color:#e64942}.swal-button--danger[not:disabled]:hover{background-color:#df4740}.swal-button--danger:active{background-color:#cf423b}.swal-button--danger:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(165,43,43,.29)}.swal-content{padding:0 20px;margin-top:20px;font-size:medium}.swal-content:last-child{margin-bottom:20px}.swal-content__input,.swal-content__textarea{-webkit-appearance:none;background-color:#fff;border:none;font-size:14px;display:block;box-sizing:border-box;width:100%;border:1px solid rgba(0,0,0,.14);padding:10px 13px;border-radius:2px;transition:border-color .2s}.swal-content__input:focus,.swal-content__textarea:focus{outline:none;border-color:#6db8ff}.swal-content__textarea{resize:vertical}.swal-button--loading{color:transparent}.swal-button--loading~.swal-button__loader{opacity:1}.swal-button__loader{position:absolute;height:auto;width:43px;z-index:2;left:50%;top:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);text-align:center;pointer-events:none;opacity:0}.swal-button__loader div{display:inline-block;float:none;vertical-align:baseline;width:9px;height:9px;padding:0;border:none;margin:2px;opacity:.4;border-radius:7px;background-color:hsla(0,0%,100%,.9);transition:background .2s;-webkit-animation:swal-loading-anim 1s infinite;animation:swal-loading-anim 1s infinite}.swal-button__loader div:nth-child(3n+2){-webkit-animation-delay:.15s;animation-delay:.15s}.swal-button__loader div:nth-child(3n+3){-webkit-animation-delay:.3s;animation-delay:.3s}@-webkit-keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}@keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}.swal-overlay{position:fixed;top:0;bottom:0;left:0;right:0;text-align:center;font-size:0;overflow-y:auto;background-color:rgba(0,0,0,.4);z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s}.swal-overlay:before{content:" ";display:inline-block;vertical-align:middle;height:100%}.swal-overlay--show-modal{opacity:1;pointer-events:auto}.swal-overlay--show-modal .swal-modal{opacity:1;pointer-events:auto;box-sizing:border-box;-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s;will-change:transform}.swal-modal{width:478px;opacity:0;pointer-events:none;background-color:#fff;text-align:center;border-radius:5px;position:static;margin:20px auto;display:inline-block;vertical-align:middle;-webkit-transform:scale(1);transform:scale(1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;z-index:10001;transition:opacity .2s,-webkit-transform .3s;transition:transform .3s,opacity .2s;transition:transform .3s,opacity .2s,-webkit-transform .3s}@media (max-width:500px){.swal-modal{width:calc(100% - 20px)}}@-webkit-keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}',""])},function(t,e){function n(t,e){var n=t[1]||"",r=t[3];if(!r)return n;if(e&&"function"==typeof btoa){var i=o(r);return[n].concat(r.sources.map(function(t){return"/*# sourceURL="+r.sourceRoot+t+" */"})).concat([i]).join("\n")}return[n].join("\n")}function o(t){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(t))))+" */"}t.exports=function(t){var e=[];return e.toString=function(){return this.map(function(e){var o=n(e,t);return e[2]?"@media "+e[2]+"{"+o+"}":o}).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var o={},r=0;r<this.length;r++){var i=this[r][0];"number"==typeof i&&(o[i]=!0)}for(r=0;r<t.length;r++){var a=t[r];"number"==typeof a[0]&&o[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(t,e,n){function o(t,e){for(var n=0;n<t.length;n++){var o=t[n],r=m[o.id];if(r){r.refs++;for(var i=0;i<r.parts.length;i++)r.parts[i](o.parts[i]);for(;i<o.parts.length;i++)r.parts.push(u(o.parts[i],e))}else{for(var a=[],i=0;i<o.parts.length;i++)a.push(u(o.parts[i],e));m[o.id]={id:o.id,refs:1,parts:a}}}}function r(t,e){for(var n=[],o={},r=0;r<t.length;r++){var i=t[r],a=e.base?i[0]+e.base:i[0],s=i[1],c=i[2],l=i[3],u={css:s,media:c,sourceMap:l};o[a]?o[a].parts.push(u):n.push(o[a]={id:a,parts:[u]})}return n}function i(t,e){var n=v(t.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var o=w[w.length-1];if("top"===t.insertAt)o?o.nextSibling?n.insertBefore(e,o.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),w.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(e)}}function a(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=w.indexOf(t);e>=0&&w.splice(e,1)}function s(t){var e=document.createElement("style");return t.attrs.type="text/css",l(e,t.attrs),i(t,e),e}function c(t){var e=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",l(e,t.attrs),i(t,e),e}function l(t,e){Object.keys(e).forEach(function(n){t.setAttribute(n,e[n])})}function u(t,e){var n,o,r,i;if(e.transform&&t.css){if(!(i=e.transform(t.css)))return function(){};t.css=i}if(e.singleton){var l=h++;n=g||(g=s(e)),o=f.bind(null,n,l,!1),r=f.bind(null,n,l,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=c(e),o=p.bind(null,n,e),r=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(e),o=d.bind(null,n),r=function(){a(n)});return o(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;o(t=e)}else r()}}function f(t,e,n,o){var r=n?"":o.css;if(t.styleSheet)t.styleSheet.cssText=x(e,r);else{var i=document.createTextNode(r),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(i,a[e]):t.appendChild(i)}}function d(t,e){var n=e.css,o=e.media;if(o&&t.setAttribute("media",o),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}function p(t,e,n){var o=n.css,r=n.sourceMap,i=void 0===e.convertToAbsoluteUrls&&r;(e.convertToAbsoluteUrls||i)&&(o=y(o)),r&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var a=new Blob([o],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}var m={},b=function(t){var e;return function(){return void 0===e&&(e=t.apply(this,arguments)),e}}(function(){return window&&document&&document.all&&!window.atob}),v=function(t){var e={};return function(n){return void 0===e[n]&&(e[n]=t.call(this,n)),e[n]}}(function(t){return document.querySelector(t)}),g=null,h=0,w=[],y=n(15);t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");e=e||{},e.attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||(e.singleton=b()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=r(t,e);return o(n,e),function(t){for(var i=[],a=0;a<n.length;a++){var s=n[a],c=m[s.id];c.refs--,i.push(c)}if(t){o(r(t,e),e)}for(var a=0;a<i.length;a++){var c=i[a];if(0===c.refs){for(var l=0;l<c.parts.length;l++)c.parts[l]();delete m[c.id]}}}};var x=function(){var t=[];return function(e,n){return t[e]=n,t.filter(Boolean).join("\n")}}()},function(t,e){t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var n=e.protocol+"//"+e.host,o=n+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,e){var r=e.trim().replace(/^"(.*)"$/,function(t,e){return e}).replace(/^'(.*)'$/,function(t,e){return e});if(/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(r))return t;var i;return i=0===r.indexOf("//")?r:0===r.indexOf("/")?n+r:o+r.replace(/^\.\//,""),"url("+JSON.stringify(i)+")"})}},function(t,e,n){var o=n(17);"undefined"==typeof window||window.Promise||(window.Promise=o),n(21),String.prototype.includes||(String.prototype.includes=function(t,e){"use strict";return"number"!=typeof e&&(e=0),!(e+t.length>this.length)&&-1!==this.indexOf(t,e)}),Array.prototype.includes||Object.defineProperty(Array.prototype,"includes",{value:function(t,e){if(null==this)throw new TypeError('"this" is null or not defined');var n=Object(this),o=n.length>>>0;if(0===o)return!1;for(var r=0|e,i=Math.max(r>=0?r:o-Math.abs(r),0);i<o;){if(function(t,e){return t===e||"number"==typeof t&&"number"==typeof e&&isNaN(t)&&isNaN(e)}(n[i],t))return!0;i++}return!1}}),"undefined"!=typeof window&&function(t){t.forEach(function(t){t.hasOwnProperty("remove")||Object.defineProperty(t,"remove",{configurable:!0,enumerable:!0,writable:!0,value:function(){this.parentNode.removeChild(this)}})})}([Element.prototype,CharacterData.prototype,DocumentType.prototype])},function(t,e,n){(function(e){!function(n){function o(){}function r(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;if(0===t._state)return void t._deferreds.push(e);t._handled=!0,i._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?s:c)(e.promise,t._value);var o;try{o=n(t._value)}catch(t){return void c(e.promise,t)}s(e.promise,o)})}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void l(t);if("function"==typeof n)return void f(r(n,e),t)}t._state=1,t._value=e,l(t)}catch(e){c(t,e)}}function c(t,e){t._state=2,t._value=e,l(t)}function l(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t))},function(t){n||(n=!0,c(e,t))})}catch(t){if(n)return;n=!0,c(e,t)}}var d=setTimeout;i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var n=new this.constructor(o);return a(this,new u(t,e,n)),n},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function o(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(t){o(i,t)},n)}e[i]=a,0==--r&&t(e)}catch(t){n(t)}}if(0===e.length)return t([]);for(var r=e.length,i=0;i<e.length;i++)o(i,e[i])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var o=0,r=t.length;o<r;o++)t[o].then(e,n)})},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(t){d(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},i._setImmediateFn=function(t){i._immediateFn=t},i._setUnhandledRejectionFn=function(t){i._unhandledRejectionFn=t},void 0!==t&&t.exports?t.exports=i:n.Promise||(n.Promise=i)}(this)}).call(e,n(18).setImmediate)},function(t,e,n){function o(t,e){this._id=t,this._clearFn=e}var r=Function.prototype.apply;e.setTimeout=function(){return new o(r.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new o(r.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(19),e.setImmediate=setImmediate,e.clearImmediate=clearImmediate},function(t,e,n){(function(t,e){!function(t,n){"use strict";function o(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var o={callback:t,args:e};return l[c]=o,s(c),c++}function r(t){delete l[t]}function i(t){var e=t.callback,o=t.args;switch(o.length){case 0:e();break;case 1:e(o[0]);break;case 2:e(o[0],o[1]);break;case 3:e(o[0],o[1],o[2]);break;default:e.apply(n,o)}}function a(t){if(u)setTimeout(a,0,t);else{var e=l[t];if(e){u=!0;try{i(e)}finally{r(t),u=!1}}}}if(!t.setImmediate){var s,c=1,l={},u=!1,f=t.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(t);d=d&&d.setTimeout?d:t,"[object process]"==={}.toString.call(t.process)?function(){s=function(t){e.nextTick(function(){a(t)})}}():function(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}()?function(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&a(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),s=function(n){t.postMessage(e+n,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){a(t.data)},s=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;s=function(e){var n=f.createElement("script");n.onreadystatechange=function(){a(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}():function(){s=function(t){setTimeout(a,0,t)}}(),d.setImmediate=o,d.clearImmediate=r}}("undefined"==typeof self?void 0===t?this:t:self)}).call(e,n(7),n(20))},function(t,e){function n(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function r(t){if(u===setTimeout)return setTimeout(t,0);if((u===n||!u)&&setTimeout)return u=setTimeout,setTimeout(t,0);try{return u(t,0)}catch(e){try{return u.call(null,t,0)}catch(e){return u.call(this,t,0)}}}function i(t){if(f===clearTimeout)return clearTimeout(t);if((f===o||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{return f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}function a(){b&&p&&(b=!1,p.length?m=p.concat(m):v=-1,m.length&&s())}function s(){if(!b){var t=r(a);b=!0;for(var e=m.length;e;){for(p=m,m=[];++v<e;)p&&p[v].run();v=-1,e=m.length}p=null,b=!1,i(t)}}function c(t,e){this.fun=t,this.array=e}function l(){}var u,f,d=t.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:n}catch(t){u=n}try{f="function"==typeof clearTimeout?clearTimeout:o}catch(t){f=o}}();var p,m=[],b=!1,v=-1;d.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];m.push(new c(t,e)),1!==m.length||b||r(s)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=l,d.addListener=l,d.once=l,d.off=l,d.removeListener=l,d.removeAllListeners=l,d.emit=l,d.prependListener=l,d.prependOnceListener=l,d.listeners=function(t){return[]},d.binding=function(t){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(t){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(t,e,n){"use strict";n(22).polyfill()},function(t,e,n){"use strict";function o(t,e){if(void 0===t||null===t)throw new TypeError("Cannot convert first argument to object");for(var n=Object(t),o=1;o<arguments.length;o++){var r=arguments[o];if(void 0!==r&&null!==r)for(var i=Object.keys(Object(r)),a=0,s=i.length;a<s;a++){var c=i[a],l=Object.getOwnPropertyDescriptor(r,c);void 0!==l&&l.enumerable&&(n[c]=r[c])}}return n}function r(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:o})}t.exports={assign:o,polyfill:r}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(24),r=n(6),i=n(5),a=n(36),s=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if("undefined"!=typeof window){var n=a.getOpts.apply(void 0,t);return new Promise(function(t,e){i.default.promise={resolve:t,reject:e},o.default(n),setTimeout(function(){r.openModal()})})}};s.close=r.onAction,s.getState=r.getState,s.setActionValue=i.setActionValue,s.stopLoading=r.stopLoading,s.setDefaults=a.setDefaults,e.default=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(0),i=r.default.MODAL,a=n(4),s=n(34),c=n(35),l=n(1);e.init=function(t){o.getNode(i)||(document.body||l.throwErr("You can only use SweetAlert AFTER the DOM has loaded!"),s.default(),a.default()),a.initModalContent(t),c.default(t)},e.default=e.init},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.MODAL;e.modalMarkup='\n  <div class="'+r+'" role="dialog" aria-modal="true"></div>',e.default=e.modalMarkup},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.OVERLAY,i='<div \n    class="'+r+'"\n    tabIndex="-1">\n  </div>';e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.ICON;e.errorIconMarkup=function(){var t=r+"--error",e=t+"__line";return'\n    <div class="'+t+'__x-mark">\n      <span class="'+e+" "+e+'--left"></span>\n      <span class="'+e+" "+e+'--right"></span>\n    </div>\n  '},e.warningIconMarkup=function(){var t=r+"--warning";return'\n    <span class="'+t+'__body">\n      <span class="'+t+'__dot"></span>\n    </span>\n  '},e.successIconMarkup=function(){var t=r+"--success";return'\n    <span class="'+t+"__line "+t+'__line--long"></span>\n    <span class="'+t+"__line "+t+'__line--tip"></span>\n\n    <div class="'+t+'__ring"></div>\n    <div class="'+t+'__hide-corners"></div>\n  '}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.CONTENT;e.contentMarkup='\n  <div class="'+r+'">\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.BUTTON_CONTAINER,i=o.default.BUTTON,a=o.default.BUTTON_LOADER;e.buttonMarkup='\n  <div class="'+r+'">\n\n    <button\n      class="'+i+'"\n    ></button>\n\n    <div class="'+a+'">\n      <div></div>\n      <div></div>\n      <div></div>\n    </div>\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(4),r=n(2),i=n(0),a=i.default.ICON,s=i.default.ICON_CUSTOM,c=["error","warning","success","info"],l={error:r.errorIconMarkup(),warning:r.warningIconMarkup(),success:r.successIconMarkup()},u=function(t,e){var n=a+"--"+t;e.classList.add(n);var o=l[t];o&&(e.innerHTML=o)},f=function(t,e){e.classList.add(s);var n=document.createElement("img");n.src=t,e.appendChild(n)},d=function(t){if(t){var e=o.injectElIntoModal(r.iconMarkup);c.includes(t)?u(t,e):f(t,e)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(2),r=n(4),i=function(t){navigator.userAgent.includes("AppleWebKit")&&(t.style.display="none",t.offsetHeight,t.style.display="")};e.initTitle=function(t){if(t){var e=r.injectElIntoModal(o.titleMarkup);e.textContent=t,i(e)}},e.initText=function(t){if(t){var e=document.createDocumentFragment();t.split("\n").forEach(function(t,n,o){e.appendChild(document.createTextNode(t)),n<o.length-1&&e.appendChild(document.createElement("br"))});var n=r.injectElIntoModal(o.textMarkup);n.appendChild(e),i(n)}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(4),i=n(0),a=i.default.BUTTON,s=i.default.DANGER_BUTTON,c=n(3),l=n(2),u=n(6),f=n(5),d=function(t,e,n){var r=e.text,i=e.value,d=e.className,p=e.closeModal,m=o.stringToNode(l.buttonMarkup),b=m.querySelector("."+a),v=a+"--"+t;if(b.classList.add(v),d){(Array.isArray(d)?d:d.split(" ")).filter(function(t){return t.length>0}).forEach(function(t){b.classList.add(t)})}n&&t===c.CONFIRM_KEY&&b.classList.add(s),b.textContent=r;var g={};return g[t]=i,f.setActionValue(g),f.setActionOptionsFor(t,{closeModal:p}),b.addEventListener("click",function(){return u.onAction(t)}),m},p=function(t,e){var n=r.injectElIntoModal(l.footerMarkup);for(var o in t){var i=t[o],a=d(o,i,e);i.visible&&n.appendChild(a)}0===n.children.length&&n.remove()};e.default=p},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r=n(4),i=n(2),a=n(5),s=n(6),c=n(0),l=c.default.CONTENT,u=function(t){t.addEventListener("input",function(t){var e=t.target,n=e.value;a.setActionValue(n)}),t.addEventListener("keyup",function(t){if("Enter"===t.key)return s.onAction(o.CONFIRM_KEY)}),setTimeout(function(){t.focus(),a.setActionValue("")},0)},f=function(t,e,n){var o=document.createElement(e),r=l+"__"+e;o.classList.add(r);for(var i in n){var a=n[i];o[i]=a}"input"===e&&u(o),t.appendChild(o)},d=function(t){if(t){var e=r.injectElIntoModal(i.contentMarkup),n=t.element,o=t.attributes;"string"==typeof n?f(e,n,o):e.appendChild(n)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=function(){var t=o.stringToNode(r.overlayMarkup);document.body.appendChild(t)};e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),r=n(6),i=n(1),a=n(3),s=n(0),c=s.default.MODAL,l=s.default.BUTTON,u=s.default.OVERLAY,f=function(t){t.preventDefault(),v()},d=function(t){t.preventDefault(),g()},p=function(t){if(o.default.isOpen)switch(t.key){case"Escape":return r.onAction(a.CANCEL_KEY)}},m=function(t){if(o.default.isOpen)switch(t.key){case"Tab":return f(t)}},b=function(t){if(o.default.isOpen)return"Tab"===t.key&&t.shiftKey?d(t):void 0},v=function(){var t=i.getNode(l);t&&(t.tabIndex=0,t.focus())},g=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l),n=e.length-1,o=e[n];o&&o.focus()},h=function(t){t[t.length-1].addEventListener("keydown",m)},w=function(t){t[0].addEventListener("keydown",b)},y=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l);e.length&&(h(e),w(e))},x=function(t){if(i.getNode(u)===t.target)return r.onAction(a.CANCEL_KEY)},_=function(t){var e=i.getNode(u);e.removeEventListener("click",x),t&&e.addEventListener("click",x)},k=function(t){o.default.timer&&clearTimeout(o.default.timer),t&&(o.default.timer=window.setTimeout(function(){return r.onAction(a.CANCEL_KEY)},t))},O=function(t){t.closeOnEsc?document.addEventListener("keyup",p):document.removeEventListener("keyup",p),t.dangerMode?v():g(),y(),_(t.closeOnClickOutside),k(t.timer)};e.default=O},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(37),a=n(38),s={title:null,text:null,icon:null,buttons:r.defaultButtonList,content:null,className:null,closeOnClickOutside:!0,closeOnEsc:!0,dangerMode:!1,timer:null},c=Object.assign({},s);e.setDefaults=function(t){c=Object.assign({},s,t)};var l=function(t){var e=t&&t.button,n=t&&t.buttons;return void 0!==e&&void 0!==n&&o.throwErr("Cannot set both 'button' and 'buttons' options!"),void 0!==e?{confirm:e}:n},u=function(t){return o.ordinalSuffixOf(t+1)},f=function(t,e){o.throwErr(u(e)+" argument ('"+t+"') is invalid")},d=function(t,e){var n=t+1,r=e[n];o.isPlainObject(r)||void 0===r||o.throwErr("Expected "+u(n)+" argument ('"+r+"') to be a plain object")},p=function(t,e){var n=t+1,r=e[n];void 0!==r&&o.throwErr("Unexpected "+u(n)+" argument ("+r+")")},m=function(t,e,n,r){var i=typeof e,a="string"===i,s=e instanceof Element;if(a){if(0===n)return{text:e};if(1===n)return{text:e,title:r[0]};if(2===n)return d(n,r),{icon:e};f(e,n)}else{if(s&&0===n)return d(n,r),{content:e};if(o.isPlainObject(e))return p(n,r),e;f(e,n)}};e.getOpts=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var n={};t.forEach(function(e,o){var r=m(0,e,o,t);Object.assign(n,r)});var o=l(n);n.buttons=r.getButtonListOpts(o),delete n.button,n.content=i.getContentOpts(n.content);var u=Object.assign({},s,c,n);return Object.keys(u).forEach(function(t){a.DEPRECATED_OPTS[t]&&a.logDeprecation(t)}),u}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r={element:"input",attributes:{placeholder:""}};e.getContentOpts=function(t){var e={};return o.isPlainObject(t)?Object.assign(e,t):t instanceof Element?{element:t}:"input"===t?r:null}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.logDeprecation=function(t){var n=e.DEPRECATED_OPTS[t],o=n.onlyRename,r=n.replacement,i=n.subOption,a=n.link,s=o?"renamed":"deprecated",c='SweetAlert warning: "'+t+'" option has been '+s+".";if(r){c+=" Please use"+(i?' "'+i+'" in ':" ")+'"'+r+'" instead.'}var l="https://sweetalert.js.org";c+=a?" More details: "+l+a:" More details: "+l+"/guides/#upgrading-from-1x",console.warn(c)},e.DEPRECATED_OPTS={type:{replacement:"icon",link:"/docs/#icon"},imageUrl:{replacement:"icon",link:"/docs/#icon"},customClass:{replacement:"className",onlyRename:!0,link:"/docs/#classname"},imageSize:{},showCancelButton:{replacement:"buttons",link:"/docs/#buttons"},showConfirmButton:{replacement:"button",link:"/docs/#button"},confirmButtonText:{replacement:"button",link:"/docs/#button"},confirmButtonColor:{},cancelButtonText:{replacement:"buttons",link:"/docs/#buttons"},closeOnConfirm:{replacement:"button",subOption:"closeModal",link:"/docs/#button"},closeOnCancel:{replacement:"buttons",subOption:"closeModal",link:"/docs/#buttons"},showLoaderOnConfirm:{replacement:"buttons"},animation:{},inputType:{replacement:"content",link:"/docs/#content"},inputValue:{replacement:"content",link:"/docs/#content"},inputPlaceholder:{replacement:"content",link:"/docs/#content"},html:{replacement:"content",link:"/docs/#content"},allowEscapeKey:{replacement:"closeOnEsc",onlyRename:!0,link:"/docs/#closeonesc"},allowClickOutside:{replacement:"closeOnClickOutside",onlyRename:!0,link:"/docs/#closeonclickoutside"}}}])});
/*global define:false */
/**
 * Copyright 2016 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.6.0
 * @url craig.is/killing/mice
 */
(function(window, document, undefined) {

    // Check if mousetrap is used inside browser, if not, return
    if (!window) {
        return;
    }

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };

    /**
     * mapping for special characters so they can support
     *
     * this dictionary is only used incase you want to bind a
     * keyup or keydown event to one of these keys
     *
     * @type {Object}
     */
    var _KEYCODE_MAP = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111 : '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };

    /**
     * this is a mapping of keys that require shift on a US keypad
     * back to the non shift equivelents
     *
     * this is so you can use keyup events with these keys
     *
     * note that this will only work reliably on US keyboards
     *
     * @type {Object}
     */
    var _SHIFT_MAP = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        ':': ';',
        '\"': '\'',
        '<': ',',
        '>': '.',
        '?': '/',
        '|': '\\'
    };

    /**
     * this is a list of special strings you can use to map
     * to modifier keys when you specify your keyboard shortcuts
     *
     * @type {Object}
     */
    var _SPECIAL_ALIASES = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'plus': '+',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };

    /**
     * variable to store the flipped version of _MAP from above
     * needed to check if we should use keypress or not when no action
     * is specified
     *
     * @type {Object|undefined}
     */
    var _REVERSE_MAP;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {

        // This needs to use a string cause otherwise since 0 is falsey
        // mousetrap will never fire for numpad 0 pressed as part of a keydown
        // event.
        //
        // @see https://github.com/ccampbell/mousetrap/pull/258
        _MAP[i + 96] = i.toString();
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        combination = combination.replace(/\+{2}/g, '+plus');
        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys;
        var key;
        var i;
        var modifiers = [];

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }

    function _belongsTo(element, ancestor) {
        if (element === null || element === document) {
            return false;
        }

        if (element === ancestor) {
            return true;
        }

        return _belongsTo(element.parentNode, ancestor);
    }

    function Mousetrap(targetElement) {
        var self = this;

        targetElement = targetElement || document;

        if (!(self instanceof Mousetrap)) {
            return new Mousetrap(targetElement);
        }

        /**
         * element to attach key events to
         *
         * @type {Element}
         */
        self.target = targetElement;

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        self._callbacks = {};

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        self._directMap = {};

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        var _sequenceLevels = {};

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        var _resetTimer;

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        var _ignoreNextKeyup = false;

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        var _ignoreNextKeypress = false;

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        var _nextExpectedAction = false;

        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset) {
            doNotReset = doNotReset || {};

            var activeSequences = false,
                key;

            for (key in _sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }

            if (!activeSequences) {
                _nextExpectedAction = false;
            }
        }

        /**
         * finds all callbacks that match based on the keycode, modifiers,
         * and action
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {string=} sequenceName - name of the sequence we are looking for
         * @param {string=} combination
         * @param {number=} level
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, sequenceName, combination, level) {
            var i;
            var callback;
            var matches = [];
            var action = e.type;

            // if there are no events related to this keycode
            if (!self._callbacks[character]) {
                return [];
            }

            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }

            // loop through all callbacks for the key that was pressed
            // and see if any of them match
            for (i = 0; i < self._callbacks[character].length; ++i) {
                callback = self._callbacks[character][i];

                // if a sequence name is not specified, but this is a sequence at
                // the wrong level then move onto the next match
                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }

                // if the action we are looking for doesn't match the action we got
                // then we should keep going
                if (action != callback.action) {
                    continue;
                }

                // if this is a keypress event and the meta key and control key
                // are not pressed that means that we need to only look at the
                // character, otherwise check the modifiers as well
                //
                // chrome will not fire a keypress if meta or control is down
                // safari will fire a keypress if meta or meta+shift is down
                // firefox will fire a keypress if meta or control is down
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                    // when you bind a combination or sequence a second time it
                    // should overwrite the first one.  if a sequenceName or
                    // combination is specified in this call it does just that
                    //
                    // @todo make deleting its own method?
                    var deleteCombo = !sequenceName && callback.combo == combination;
                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                    if (deleteCombo || deleteSequence) {
                        self._callbacks[character].splice(i, 1);
                    }

                    matches.push(callback);
                }
            }

            return matches;
        }

        /**
         * actually calls the callback function
         *
         * if your callback function returns false this will use the jquery
         * convention - prevent default and stop propogation on the event
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo, sequence) {

            // if this event should not happen stop here
            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                return;
            }

            if (callback(e, combo) === false) {
                _preventDefault(e);
                _stopPropagation(e);
            }
        }

        /**
         * handles a character key event
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        self._handleKey = function(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e);
            var i;
            var doNotReset = {};
            var maxLevel = 0;
            var processedSequenceCallback = false;

            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }

            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {

                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {

                    // only fire callbacks for the maxLevel to prevent
                    // subsequences from also firing
                    //
                    // for example 'a option b' should not cause 'option b' to fire
                    // even though 'option b' is part of the other sequence
                    //
                    // any sequences that do not match here will be discarded
                    // below by the _resetSequences call
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }

                    processedSequenceCallback = true;

                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }

                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }

            // if the key you pressed matches the type of sequence without
            // being a modifier (ie "keyup" or "keypress") then we should
            // reset all sequences that were not matched by this event
            //
            // this is so, for example, if you have the sequence "h a t" and you
            // type "h e a r t" it does not match.  in this case the "e" will
            // cause the sequence to reset
            //
            // modifier keys are ignored because you can have a sequence
            // that contains modifiers such as "enter ctrl+space" and in most
            // cases the modifier key will be pressed before the next key
            //
            // also if you have a sequence such as "ctrl+b a" then pressing the
            // "b" key will trigger a "keypress" and a "keydown"
            //
            // the "keydown" is expected when there is a modifier, but the
            // "keypress" ends up matching the _nextExpectedAction since it occurs
            // after and that causes the sequence to reset
            //
            // we ignore keypresses in a sequence that directly follow a keydown
            // for the same character
            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                _resetSequences(doNotReset);
            }

            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
        };

        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {

            // normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }

            var character = _characterFromEvent(e);

            // no character found then stop
            if (!character) {
                return;
            }

            // need to use === for the character check because the character can be 0
            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                _ignoreNextKeyup = false;
                return;
            }

            self.handleKey(character, _eventModifiers(e), e);
        }

        /**
         * called to set a 1 second timeout on the specified sequence
         *
         * this is so after each key press in the sequence you have 1 second
         * to press the next key before you have to start over
         *
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }

        /**
         * binds a key sequence to an event
         *
         * @param {string} combo - combo specified in bind call
         * @param {Array} keys
         * @param {Function} callback
         * @param {string=} action
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {

            // start off by adding a sequence level record for this combination
            // and setting the level to 0
            _sequenceLevels[combo] = 0;

            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {string} nextAction
             * @returns {Function}
             */
            function _increaseSequence(nextAction) {
                return function() {
                    _nextExpectedAction = nextAction;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                };
            }

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            function _callbackAndReset(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            }

            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            //
            // if an action is specified in the original bind call then that will
            // be used throughout.  otherwise we will pass the action that the
            // next key in the sequence should match.  this allows a sequence
            // to mix and match keypress and keydown events depending on which
            // ones are better suited to the key provided
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                _bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        }

        /**
         * binds a single keyboard combination
         *
         * @param {string} combination
         * @param {Function} callback
         * @param {string=} action
         * @param {string=} sequenceName - name of sequence if part of sequence
         * @param {number=} level - what part of the sequence the command is
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {

            // store a direct mapped reference for use with Mousetrap.trigger
            self._directMap[combination + ':' + action] = callback;

            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');

            var sequence = combination.split(' ');
            var info;

            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }

            info = _getKeyInfo(combination, action);

            // make sure to initialize array if this is the first time
            // a callback is added for this key
            self._callbacks[info.key] = self._callbacks[info.key] || [];

            // remove an existing match if there is one
            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }

        /**
         * binds multiple combinations to the same callback
         *
         * @param {Array} combinations
         * @param {Function} callback
         * @param {string|undefined} action
         * @returns void
         */
        self._bindMultiple = function(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        };

        // start!
        _addEvent(targetElement, 'keypress', _handleKeyEvent);
        _addEvent(targetElement, 'keydown', _handleKeyEvent);
        _addEvent(targetElement, 'keyup', _handleKeyEvent);
    }

    /**
     * binds an event to mousetrap
     *
     * can be a single key, a combination of keys separated with +,
     * an array of keys, or a sequence of keys separated by spaces
     *
     * be sure to list the modifier keys first to make sure that the
     * correct key ends up getting bound (the last key in the pattern)
     *
     * @param {string|Array} keys
     * @param {Function} callback
     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
     * @returns void
     */
    Mousetrap.prototype.bind = function(keys, callback, action) {
        var self = this;
        keys = keys instanceof Array ? keys : [keys];
        self._bindMultiple.call(self, keys, callback, action);
        return self;
    };

    /**
     * unbinds an event to mousetrap
     *
     * the unbinding sets the callback function of the specified key combo
     * to an empty function and deletes the corresponding key in the
     * _directMap dict.
     *
     * TODO: actually remove this from the _callbacks dictionary instead
     * of binding an empty function
     *
     * the keycombo+action has to be exactly the same as
     * it was defined in the bind method
     *
     * @param {string|Array} keys
     * @param {string} action
     * @returns void
     */
    Mousetrap.prototype.unbind = function(keys, action) {
        var self = this;
        return self.bind.call(self, keys, function() {}, action);
    };

    /**
     * triggers an event that has already been bound
     *
     * @param {string} keys
     * @param {string=} action
     * @returns void
     */
    Mousetrap.prototype.trigger = function(keys, action) {
        var self = this;
        if (self._directMap[keys + ':' + action]) {
            self._directMap[keys + ':' + action]({}, keys);
        }
        return self;
    };

    /**
     * resets the library back to its initial state.  this is useful
     * if you want to clear out the current keyboard shortcuts and bind
     * new ones - for example if you switch to another page
     *
     * @returns void
     */
    Mousetrap.prototype.reset = function() {
        var self = this;
        self._callbacks = {};
        self._directMap = {};
        return self;
    };

    /**
     * should we stop this event before firing off callbacks
     *
     * @param {Event} e
     * @param {Element} element
     * @return {boolean}
     */
    Mousetrap.prototype.stopCallback = function(e, element) {
        var self = this;

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        if (_belongsTo(element, self.target)) {
            return false;
        }

        // stop for input, select, and textarea
        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
    };

    /**
     * exposes _handleKey publicly so it can be overwritten by extensions
     */
    Mousetrap.prototype.handleKey = function() {
        var self = this;
        return self._handleKey.apply(self, arguments);
    };

    /**
     * allow custom key mappings
     */
    Mousetrap.addKeycodes = function(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                _MAP[key] = object[key];
            }
        }
        _REVERSE_MAP = null;
    };

    /**
     * Init the global mousetrap functions
     *
     * This method is needed to allow the global mousetrap functions to work
     * now that mousetrap is a constructor function.
     */
    Mousetrap.init = function() {
        var documentMousetrap = Mousetrap(document);
        for (var method in documentMousetrap) {
            if (method.charAt(0) !== '_') {
                Mousetrap[method] = (function(method) {
                    return function() {
                        return documentMousetrap[method].apply(documentMousetrap, arguments);
                    };
                } (method));
            }
        }
    };

    Mousetrap.init();

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose as a common js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Mousetrap;
    }

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Mousetrap;
        });
    }
}) (typeof window !== 'undefined' ? window : null, typeof  window !== 'undefined' ? document : null);

'use strict';
/**
 * Defines the pgnReader function / object that is used for reading and writing
 * pgn. This should build then a structure that is easier to
 * use, but contains all the information necessary to do all
 * the things we want to do. So calling this function with no argument will
 * just give you a pgnReader that is able to record moves and write them out.
 * @param spec object with keys
 *  'pgn': the pgn string, if missing replaced with an empty string
 * @returns {{}}
 */

// Initializes a new instance of the StringBuilder class
// and appends the given value if supplied
function StringBuilder(value) {
    let that = {};
    that.strings = new Array("");
    // Appends the given value to the end of this instance.
    let append = function (value) {
        if (value) {
            that.strings.push(value);
        }
    };

    // Clears the string buffer
    let clear = function () {
        that.strings.length = 1;
    };

    // Returns the length of the final string (without building it)
    let length = function () {
        return that.strings.reduce(function(previousValue, currentValue, index, array){
            return previousValue + currentValue.length;
        }, 0);
    };

    // Return true if the receiver is empty. Don't compute length!!
    let isEmpty = function () {
        for (let i = 0; i < that.strings.length; i++) {
            if (that.strings[i].length > 0) {
                return false;
            }
        }
        return true;
    };

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    let lastChar = function () {
        if (that.strings.length === 0) {
            return null;
        }
        return that.strings[that.strings.length - 1].slice(-1);
    };

    // Converts this instance to a String.
    let toString = function () {
        return that.strings.join("");
    };

    append(value);

    return {
        append: append,
        clear: clear,
        toString: toString,
        length: length,
        isEmpty: isEmpty,
        lastChar: lastChar
    };
}

function Utils() {
    let
        nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys,
        nativeCreate       = Object.create;
    
    let isString = function(obj) {
        return toString.call(obj) === '[object String]';
    };
    let isArguments = function(obj) {
        return toString.call(obj) === '[object Arguments]';
    };
    let MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;  
    let isArrayLike = function(collection) {
        const length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    let isArray = nativeIsArray || function(obj) {
        return Array.isArray(obj);
      };
    let property = function(key) {
        return function(obj) {
          return obj == null ? void 0 : obj[key];
        };
      };
    let getLength = property('length');
    let isObject = function(obj) {
        const type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
      };
    let optimizeCb = function(func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
          case 1: return function(value) {
            return func.call(context, value);
          };
          case 2: return function(value, other) {
            return func.call(context, value, other);
          };
          case 3: return function(value, index, collection) {
            return func.call(context, value, index, collection);
          };
          case 4: return function(accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection);
          };
        }
        return function() {
          return func.apply(context, arguments);
        };
      };  
    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
    let pvEach = function(obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        let i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
            } else {
            let keys = keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };
    let has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
      };    
    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    let keys = function(obj) {
        if (! isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        let keys = [];
        for (let key in obj) if (has(obj, key)) keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Is a given value a DOM element?
    let pvIsElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    let pvIsEmpty = function(obj) {
        if (obj == null) return true;
        if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
        return keys(obj).length === 0;
    };

    return {
        pvEach: pvEach,
        pvIsElement: pvIsElement,
        pvIsEmpty: pvIsEmpty
    };
}

/**
 * Defines the base functionality for reading and working with PGN.
 * The configuration is the part of the configuration given to the PgnViewer that is relevant
 * for the reader.
 * @param {*} configuration Given values that are relevant for reading and working with PGN
 * @param {*} chess  the chess instance used to evaluate the PGN when reading
 */
const pgnReader = function (configuration, chess) {
    const that = {};
    const utils = new Utils();
    const initialize_configuration = function(configuration) {
        const readPgnFromFile = function(url) {
            const request = new XMLHttpRequest()
            request.open('GET', url, false)
            request.send()
            if (request.status === 200) {
                return request.responseText
            }
        }
        let defaults = {
            notation: 'short',
            position: 'start',
            locale: 'en'
        }
        if (typeof configuration.pgn == 'undefined') {
            if (typeof configuration.pgnFile == 'undefined') {
                configuration.pgn = '';
            } else {
                configuration.pgn = readPgnFromFile(configuration.pgnFile);
            }
        }
        return Object.assign(defaults, configuration)
    };
    that.configuration = initialize_configuration(configuration);
    // The parser given by pgn-parser, generated by PEG.js
    const parser = pgnParser;
    that.startMove = 0;
    const game = chess || new Chess();
    const set_to_start = function() {
        if (that.configuration.position == 'start') {
                game.reset();
            } else {
                game.load(that.configuration.position);
            }
    };
    that.PGN_TAGS = {
        event: "the name of the tournament or match event",
        site: "the location of the event",
        date: "the starting date of the game (format: YYYY.MM.TT)",
        round: "the playing round ordinal of the game",
        white: "the player of the white pieces (last name, pre name)",
        black: "the player of the black pieces (last name, pre name)",
        result: "the result of the game (1 - 0, 1/2 - 1/2, 0 - 1)",
        // from here, the keys are optional, order may be different
        board: "the board number in a team event",
        eco: "ECO-Opening-Key (ECO = 'Encyclopaedia of Chess Openings')",
        whitemyelo: "myELO-score white (at the beginning of the game)",
        blackmyelo: "myELO-score black (at the beginning of the game)",
        whitedays: "rate in days for white",
        blackdays: "rate in days for black",
        mychessno: "identification-no. of the game on the myChess.de - server",
        // From here it was from Wikipedia
        annotator: "The person providing notes to the game.",
        plycount: "String value denoting total number of half-moves played.",
        timecontrol: "40/7200:3600 (moves per seconds: sudden death seconds)",
        time: 'Time the game started, in "HH:MM:SS" format, in local clock time.',
        termination: 'Gives more details about the termination of the game. It may be "abandoned", "adjudication" (result determined by third-party adjudication), "death", "emergency", "normal", "rules infraction", "time forfeit", or "unterminated".',
        mode: '"OTB" (over-the-board) "ICS" (Internet Chess Server)',
        setup: '"0": position is start position, "1": tag FEN defines the position',
        fen: 'Alternative start position, tag SetUp has to be set to "1"'
    };
    that.PROMOTIONS = {
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight'
    };
    /**
     * Returns the NAGs as defined in http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c10
     * The index is the index number after the '$' sign like in $3 == 'very good move'.
     * For a complete index, see https://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs
     * @type {Array} the array with the (english) explanations.
     */
    that.NAGs = new Array(220);
    that.NAGs[1]=    "!";    // 1
    that.NAGs[2]=    "?";    // 2
    that.NAGs[3]=    "‼";   // 3
    that.NAGs[4]=    "⁇";   // 4
    that.NAGs[5]=    "⁉";   // 5
    that.NAGs[6]=    "⁈";   // 6
    that.NAGs[7]=    "□";    // 7
    that.NAGs[10]=    "=";    // 10
    that.NAGs[13]=    "∞";    // 13
    that.NAGs[14]=    "⩲";    // 14
    that.NAGs[15]=    "⩱";    // 15
    that.NAGs[16]=    "±";    // 16
    that.NAGs[17]=    "∓";    // 17
    that.NAGs[18]=    "+−";   // 18
    that.NAGs[19]=    "-+";    // 19
    that.NAGs[22]=    "⨀";
    that.NAGs[23]=    "⨀";
    that.NAGs[32]=    "⟳";
    that.NAGs[33]=    "⟳";
    that.NAGs[36]=    "→";
    that.NAGs[37]=    "→";
    that.NAGs[40]=    "↑";
    that.NAGs[41]=    "↑";
    that.NAGs[44]=    "=∞";
    that.NAGs[132]=   "⇆";
    that.NAGs[133]=   "⇆";
    that.NAGs[136]=   "⊕";
    that.NAGs[140]=   "∆";
    that.NAGs[146]=   "N";
    that.NAGs[220]=   "D";
    that.NAGs[221]=   "D";

    that.PGN_NAGS = {};

    // build the reverse index
    for (let i = 0; i < that.NAGs.length; i++) {
        that.PGN_NAGS[that.NAGs[i]] = i;
    }
    // Special case for duplicate NAGs
    that.PGN_NAGS['!!'] = 3;
    that.PGN_NAGS['??'] = 4;
    that.PGN_NAGS['!?'] = 5;
    that.PGN_NAGS['?!'] = 6;

    /**
     * Returns the NAG notation from the array of symbols
     * @param array the NAG symbols like $1, $3, ...
     * @returns {string} the result string like !, !!
     */
    const nag_to_symbol = function (array) {
        let ret_string = "";
        if (array === null || array === undefined) {
            return ret_string;
        }
        for (let i = 0; i < array.length; i++) {
            const number = parseInt(array[i].substring(1));
            if (number != 220) { // Don't add diagrams to notation
                const ret = that.NAGs[number];
                ret_string += (typeof ret != 'undefined') ? ret : "$"+number;
            }
        }
        return ret_string;
    }

    /**
     * Returns the internationalized variation of the figure, or the original itself.
     * Optional pawn symbols are ignored (SAN is used for output, not reading).
     */
    const figI18n = function (fig) {
        if (fig == 'P') {
            return '';
        }
        return i18next.t(fig, {lng: that.configuration.locale});
    }

    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param notation
     * @return {*}
     */
    const san = function(move) {
        let notation = move.notation;
        if (typeof notation.row == 'undefined') {
            return notation.notation; // move like O-O and O-O-O
        }
        const fig = notation.fig ? figI18n(notation.fig) : '';
        const disc = notation.disc ? notation.disc : '';
        const strike = notation.strike ? notation.strike : '';
        // Pawn moves with capture need the col as "discriminator"
        const check = notation.check ? notation.check : '';
        const mate = notation.mate ? notation.mate : '';
        const prom = notation.promotion ? '=' + figI18n(notation.promotion.substring(1,2).toLowerCase()) : '';
        if (that.configuration.notation === 'short') {
            return fig + disc + strike + notation.col + notation.row + prom + check + mate;
        } else if (that.configuration.notation === 'long') {
            return fig + move.from + (notation.strike ? strike : '-') + move.to + prom + check + mate;
        }
    }

    const sanWithNags = function (move) {
        let _san = san(move);
        if (move.nag) {
            _san += nag_to_symbol(move.nag);
        }
        return _san;
    }

    /**
     * Returns the SYM notation for a single NAG (like !!, ?!, ...)
     * @param string the NAG in the chess notation
     * @returns {*} the symbold like $0, $3, ...
     */
    const symbol_to_nag = function(string) {
        const nag = that.PGN_NAGS[string];
        if (nag === "undefined") {
            return null;
        } else {
            return "$" + nag;
        }
    };

    /**
     * Main function, automatically called when calling pgn function.
     * Special handling here, when startPlay and hideMovesBefore are set,
     * the moves from the beginning to the startPlay are cut. Ugly, but working.
     */
    let load_pgn = function () {
        let restString = readHeaders();
        readMoves(restString);
        if (that.configuration.startPlay && that.configuration.hideMovesBefore) {
            let new_fen = deleteMovesBefore(that.configuration.startPlay);
            let new_pgn = write_pgn();
            that.configuration.startPlay = null;
            that.configuration.hideMovesBefore = false;
            that.configuration.pgn = new_pgn;
            that.configuration.position = new_fen;
            load_pgn();
        }
        return that;
    };

    /**
     * Reads the headers from the pgn string given, returns what is not consumed
     * by the headers.
     * Ensure that the headers are interpreted and even modify the configuration.
     * @returns {string} the remaining moves
     */
    const readHeaders = function () {
        /**
         * Split the headers (marked by []), and collect them in the return value.
         * @param string the pgn string that contains (at the beginning) the headers of the game
         * @returns the headers read
         */
        const splitHeaders = function (string) {
            let headers = {};
            let xarr;
            let index = 0;
            let lastMatch = '';
            let re = /\[([^\]]+)]/g;
            while (xarr = re.exec(string)) {
                let ret = xarr[0].match(/\[(\w+)\s+\"([^\"]+)\"/);
                if (ret) {
                    let key = ret[1].toLowerCase();
                    if (that.PGN_TAGS[key]) {
                        headers[key] = ret[2];
                    }
                    index = xarr.index;
                    lastMatch = xarr[0];
                }
            }
            return { headers: headers, rest: (string.substring(index + lastMatch.length))};
        };
        /**
         * Implement the logic to interpret the headers.
         */
        const interpretHeaders = function () {
            if (that.headers.setup) {
                const setup = that.headers.setup;
                if (setup === '0') {
                    that.configuration.position = 'start';
                } else {
                    const fen = that.headers.fen;
                    that.configuration.position = fen;
                }
            }
            if (that.headers.result) {
                that.endGame = that.headers.result;            }
        };
        let retHeaders = splitHeaders(that.configuration.pgn);
        that.headers = retHeaders.headers;
        interpretHeaders();
        return retHeaders.rest;
    };

    const wireMoves = function(current, prev, currentMove, prevMove) {
        if (prevMove != null) {
            currentMove.prev = prev;
            if (! prevMove.next) { // only set, if not set already
                prevMove.next = current;
            }
        }
        currentMove.index = current;
    };

    /**
     * Read moves read the moves that are not part of the headers.
     */
    const readMoves = function(movesString) {

        /**
         * Originally variations are kept as array of moves. But after having linked prev and next,
         * it is much easier to keep only the first move of the variation.
         */
        const correctVariations = function() {
            utils.pvEach(getMoves(), function(move) {
                for (let i = 0; i < move.variations.length; i++) {
                    move.variations[i] = move.variations[i][0];
                }
            });
        };
        const remindEndGame = function(movesMainLine) {
            if (typeof movesMainLine[movesMainLine.length - 1] == "string") {
                that.endGame = movesMainLine.pop();
            }
        };
        /**
         * If black started with a move, FEN must be set to a black start position.
         * Then turn should be switched for all moves, if first moves is falsly white.
         */
        const correctTurn = function() {
            const getTurn = function(fen) {
                const tokens = fen.split(/\s+/);
                return tokens[1];
            };
            //
            if ((getTurn(that.configuration.position) === 'b') &&
                    (isMove(0)) &&
                    (that.moves[0].turn === 'w')) {
                utils.pvEach(getMoves(), function(move) {
                    move.turn = (move.turn === 'w') ? 'b' : 'w';
                });
            }
        };

        // Ensure that PGN string is just one line, with no tab or line break in it.
        let movesStringTrimmed = movesString.trim();
        movesStringTrimmed = movesStringTrimmed.replace(/(\r\n|\n|\r)/gm," ");
        movesStringTrimmed = movesStringTrimmed.replace(/\t/gm, " ");
        const movesMainLine = parser.parse(movesStringTrimmed)[0];
        remindEndGame(movesMainLine);
        eachMove(movesMainLine);
        correctTurn();
        correctVariations();
    };

    /**
     * Checks if the move with index id is a valid move
     * @param id the index of the moves in the moves array
     * @returns {boolean} true, if there exists a move with that index, false else
     */
    const isMove = function(id) {
        return getMoves().length > id;
    };

    /**
     * Returns true, if the move with ID id is deleted.
     * @param id the numerical index
     * @returns {boolean} true, if deleted
     */
    const isDeleted = function(id) {
        if (! isMove(id))
            return true; // Every non-existing moves is "deleted"
        const current = getMoves()[id];
        if (current === null) {
            return true;
        }
        if (id == 0 && (current)) // The first move is not deleted
            return false;
//        return (current.prev === null); // All moves without a previous move are deleted
    };


    /**
     * Returns the move that matches the id. Take into consideration:
     * <ul><li>if the move has no pre, and it is not the first one, the move should be considered deleted</li>
     * <li>if the move has no pre, but it is the first one, it is the first move</li>
     * </ul>
     * So only remove a move, if the move is not deleted
     * @param id the ID of the move
     */
    const getMove = function(id) {
        return getMoves()[id];
    };


    /**
     * Updates the variation level for all moves. If no arguments are given,
     * update the variation level for all moves.
     */
    const updateVariationLevel = function(move, varLevel) {
        if (arguments.length === 0) {
            // Workaround: we don't know which is the first move, so that that with index 0
            const my_move = getMove(0);
            updateVariationLevel(my_move, 0);
        } else {
            move.variationLevel = varLevel;
            if (move.next !== undefined) {
                updateVariationLevel(getMove(move.next), varLevel);
            }
            if (move.variations) {
                for (let i = 0; i < move.variations.length; i++) {
                    updateVariationLevel(move.variations[i], varLevel + 1);
                }
            }
        }
    };

    /**
     * Deletes the move that matches the id (including the move itself).
     * There are some cases to expect:
     * <ul><li>the first move of the main line: delete everything</li>
     * <li>some move in between of the main line: make the first variation the main line, and the rest variations the
     * variations of the now main line</li>
     * <li>the first move of some variation: delete the whole variation</li>
     * <li>some move in the variation (not the first): delete the rest moves of that variation</li>
     * </ul>
     */
    let deleteMove = function(id) {
        /**
         * Removes the object at index from the array, returns the object.
         */
        const removeFromArray = function(array, index) {
            const ret = array[index];
            array.splice(index, 1);
            return ret;
        };

        if (isDeleted(id)) {
            return;
        }
        // 1. Main line first move
        if (id === 0) {
            // Delete all moves
            that.moves = [];
            return;
        }
        let current = getMove(id);
        // 2. First move of variation
        if (startVariation(current)) {
            const vars = getMove(getMove(current.prev).next).variations;
            for (let i = 0; vars.length; i++) {
                if (vars[i] === current) {
                    let my_let = removeFromArray(vars, i);
                    if (current.next !== undefined) {
                       deleteMove(current.next);
                    }
                    getMoves()[current.index] = null;
                    return;
                }
            }
        }
        // 3. Some line some other move, no variation
        if (current.variations.length === 0) {
            if (current.next !== undefined && (current.next !== null)) {
                deleteMove(current.next);
            }
            that.moves[current.prev].next = null;
            that.moves[id] = null;
            return;
        }
        // 4. Some line some other move, with variation
        if (current.variations.length > 0) {
            if (current.next !== undefined) {
                deleteMove(current.next);
            }
            let variationMove = removeFromArray(current.variations, 0);
            let varLevel = variationMove.variationLevel;
            that.moves[current.prev].next = variationMove.index;
            that.moves[id] = null;
            updateVariationLevel(variationMove, varLevel - 1);
        }
    };

    /**
     * Find a move from a given representation. This may be an index, or a FEN string, or a notation.
     */
    function findMove(moveRep) {
        if (!isNaN(moveRep)) {   // the following goes only over the main line, move number cannot denote a variation
            moveRep = moveRep - 1;
            let move = getMove(0);
            while (moveRep > 0) {
                moveRep = moveRep - 1;
                move = getMove(move.next);
            }
            return move;
        }
        let moves = getMoves();
        for (let move of moves) {
            if (move.fen.startsWith(moveRep)) {
                return move;
            } else if (move.notation.notation == moveRep) {
                return move;
            }
        }
        return undefined;
    }

    /**
     * Delete the moves before the current move, but without deleting the rest.
     * TODO: This should be written in such a way, that this is only used when the game
     * has not already started, so when loading the moves and interpreting them
     * 3 cases:
     * 1. Nothing special, just skip that.
     * 2. startPlay is set, nothing to do here as well.
     * 3. hideMovesBefore == true: Ensure that everything is done again after having called this function.
     * 
     * So no, this should not be called from the UI, but when reading the moves.
     * @param id
     */
    let deleteMovesBefore = function(id) {
        // Inner function, that really deletes
        let deleteMovesBeforeIncluding = function (id) {
            let my_fen = that.moves[id].fen
            that.moves[id] = null;
            if (id <= 0) return my_fen;
            deleteMovesBeforeIncluding(id - 1);
            return my_fen;
        };
        if (id === undefined) return;
        if (id === null) return;
        if (id <= 0) return;
        let my_fen = deleteMovesBeforeIncluding(id - 1);
        getMove(id).prev = null;
        return my_fen // Need position to start game here
    };

    /**
     * Promotes the variation that is denoted by the move ID.
     * These are the relevant cases:
     * <ul>
     * <li>Move is part of the main line: no promotion</li>
     * <li>Move is part of the first variation: move the variation to the next level (or main line), make the previous promoted line the first variation.</li>
     * <li>Move is part of second or higher variation: just switch index of variation arrays</li>
     * </ul>
     */
    const promoteMove = function (id) {
        /**
         * Returns the index of the variation denoted by the move.
         */
        const indexOfVariationArray = function (move) {

        };
        /**
         * Returns the first move of a variation.
         */
        const firstMoveOfVariation = function(move) {
            if (startVariation(move)) {
                return move;
            }
            return firstMoveOfVariation(getMove(move.prev));
        };
        const move = getMove(id);
        // 1. Check that is variation
        if ((typeof move.variationLevel == "undefined") || (move.variationLevel === 0)) {
            return;
        }

        // 2. Get the first move of the variation
        const myFirst = firstMoveOfVariation(move);

        // 3. Get the index of that moves variation array
        const higherVariationMove = getMove(getMove(myFirst.prev).next);
        let indexVariation;
        for (let i = 0; i < higherVariationMove.variations.length; i++) {
            if (higherVariationMove.variations[i] === myFirst) {
                indexVariation = i;
            }
        }

        // 4. If variation index is > 0 (not the first variation)
        if (indexVariation > 0) {
            // Just switch with the previous index
            let tmpMove = higherVariationMove.variations[indexVariation-1];
            higherVariationMove.variations[indexVariation-1] = higherVariationMove.variations[indexVariation];
            higherVariationMove.variations[indexVariation] = tmpMove;
        } else {
            // 5. Now the most difficult case: create new array from line above, switch that with
            // the variation
            let tmpMove = higherVariationMove;
            const tmpVariations = higherVariationMove.variations;
            const prevMove = getMove(higherVariationMove.prev);
            prevMove.next = myFirst.index;
            tmpMove.variations = myFirst.variations;
            myFirst.variations = tmpVariations;
            myFirst.variations[0] = tmpMove;
        }
        // Update the variation level because there will be changes
        updateVariationLevel();
    };


    // Returns true, if the move is the start of teh main line
    const startMainLine = function(move) {
        return  move.variationLevel == 0 && (typeof move.prev != "number") ;
    };

    // Returns true, if the move is the start of a (new) variation
    const startVariation = function(move) {
        return  move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (getMoves()[move.prev].next != move.index));
    };
    // Returns true, if the move is the end of a variation
    const endVariation = function(move) {
        return move.variationLevel > 0 && ! move.next;
    };

    // Returns true, if the move is after a move with at least one variation
    const afterMoveWithVariation = function(move) {
        return getMoves()[move.prev] && (getMoves()[move.prev].variations.length > 0);
    };

    /**
     * Writes the pgn (fully) of the current game. The algorithm goes like that:
     * * Start with the first move (there has to be only one in the main line)
     * * For each move (call that recursively)
     * * print-out the move itself
     * * then the variations (one by one)
     * * then the next move of the main line
     * @return the string of all moves
     */
    const write_pgn = function() {
        let left_variation = false;

        // Prepend a space if necessary
        function prepend_space(sb) {
            if ( (!sb.isEmpty()) && (sb.lastChar() != " ")) {
                sb.append(" ");
            }
        }

        const write_comment = function(comment, sb) {
            if (comment === undefined || comment === null) {
                return;
            }
            prepend_space(sb);
            sb.append("{");
            sb.append(comment);
            sb.append("}");
        };

        const write_comment_move = function(move, sb) {
            write_comment(move.commentMove, sb);
        };

        const write_comment_before = function(move, sb) {
            write_comment(move.commentBefore, sb);
        };

        const write_comment_after = function(move, sb) {
            write_comment(move.commentAfter, sb);
        };

        const write_check_or_mate  = function (move, sb) {
            if (move.notation.check) {
                sb.append(move.notation.check);
            }
        };

        const write_comment_diag = function(move, sb) {
            let has_diags = (move) => {
                return move.commentDiag
                && ( ( move.commentDiag.colorArrows && move.commentDiag.colorArrows.length > 0)
                    || ( move.commentDiag.colorFields && move.commentDiag.colorFields.length > 0)
                );
            }
            let arrows = (move) => { return move.commentDiag.colorArrows || []; }
            let fields = (move) => { return move.commentDiag.colorFields || []; }

            if (has_diags(move)) {
                let sbdiags = StringBuilder("");
                let first = true
                sbdiags.append("[%csl ")
                fields(move).forEach( (field) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("");
                    first = false;
                    sbdiags.append(field);
                });
                sbdiags.append("]");
                first = true
                sbdiags.append("[%cal ")
                arrows(move).forEach( (arrow) => {
                    ! first ? sbdiags.append(",") : sbdiags.append("");
                    first = false;
                    sbdiags.append(arrow);
                });
                sbdiags.append("]");
                write_comment(sbdiags.toString(), sb);
            }
        }

        const write_move_number = function (move, sb) {
            prepend_space(sb);
            if (move.turn === "w") {
                sb.append("" + move.moveNumber);
                sb.append(".");
            } else if (startVariation(move)) {
                sb.append("" + move.moveNumber);
                sb.append("...");
            }
        };

        const write_notation = function (move, sb) {
            prepend_space(sb);
            sb.append(move.notation.notation);
        };

        const write_NAGs = function(move, sb) {
            if (move.nag) {
                move.nag.forEach(function(ele) {
                    sb.append(ele);
                });
            }
        };

        const write_variation = function (move, sb) {
            prepend_space(sb);
            sb.append("(");
            write_move(move, sb);
            prepend_space(sb);
            sb.append(")");
        };

        const write_variations = function (move, sb) {
            for (let i = 0; i < move.variations.length; i++) {
                write_variation(move.variations[i], sb);
            }
        };

        const get_next_move = function (move) {
            return move.next ? getMove(move.next) : null;
        };

        /**
         * Write the normalised notation: comment move, move number (if necessary),
         * comment before, move, NAGs, comment after, variations.
         * Then go into recursion for the next move.
         * @param move the move in the exploded format
         * @param sb the string builder to use
         */
        const write_move = function(move, sb) {
            if (move === null || move === undefined) {
                return;
            }
            write_comment_move(move, sb);
            write_move_number(move, sb);
            write_comment_before(move, sb);
            write_notation(move, sb);
            //write_check_or_mate(move, sb);    // not necessary if san from chess.js is used
            write_NAGs(move, sb);
            write_comment_after(move, sb);
            write_comment_diag(move, sb);
            write_variations(move, sb);
            const next = get_next_move(move);
            write_move(next, sb);
        };

        const write_end_game = function(_sb) {
            if (that.endGame) {
                _sb.append(" ");
                _sb.append(that.endGame);
            }
        };

        const write_pgn2 = function(move, _sb) {

            write_move(move, sb);
            write_end_game(_sb);
            return sb.toString();
        };
        const sb = StringBuilder("");
        let indexFirstMove = 0;
        while (getMove(indexFirstMove) === null) { indexFirstMove += 1; }
        return write_pgn2(getMove(indexFirstMove), sb);
    };

    /**
     * Return true if the diagram NAG (== $220) is found.
     * @param move
     */
    const has_diagram_nag = function(move) {
        if (typeof move.nag == "undefined") return false;
        if (move.nag == null) return false;
        return move.nag.indexOf('$220') > -1;
    };

    /**
     * Final algorithm to read and map the moves. Seems to be tricky ...
     * @param movesMainLine all the moves of the game
     */
    const eachMove = function(movesMainLine) {
        that.moves = [];
        let current = -1;
        /**
         * Search for the right previous move. Go back until you find a move on the same
         * level. Only used inside the eachMode algorithm
         * @param level the current level to the move
         * @param index the current index where the search (backwards) should start
         * @returns {*} the resulting move or null, if none was found (should not happen)
         */
        const findPrevMove = function(level, index) {
            while (index >= 0) {
                if (that.moves[index].variationLevel == level) {
                    return that.moves[index];
                }
                index--;
            }
            return null;
        };
        /**
         * Recursive call that does the whole work
         * @param moveArray move array, first call with the main line
         * @param level the level of variation, 0 for the main line
         * @param prev the index of the previous move
         *          * null when main line and the first move
         *          * the correct one if the index is 0
         *          * overwritten by current - 1 if iterating and not the first move
         */
        const eachMoveVariation = function(moveArray, level, prev) {
            // Computes the correct move numer from the position
            const getMoveNumberFromPosition = function(fen) {
                const tokens = fen.split(/\s+/);
                const move_number = parseInt(tokens[5], 10);
                return (tokens[1] === 'b') ? move_number : move_number - 1;
            };
            let prevMove = (prev != null ? that.moves[prev] : null);
            utils.pvEach(moveArray, function(move, i) {
                current++;
                move.variationLevel = level;
                that.moves.push(move);
                if (i > 0) {
                    if (that.moves[current - 1].variationLevel > level) {
                        prevMove = findPrevMove(level, current -1);
                        prev = prevMove.index;
                    } else {
                        prev = current - 1;
                        prevMove = that.moves[prev];
                    }
                }
                wireMoves(current, prev, move, prevMove);
                // Checks the move on a real board, and hold the fen
                // TODO: Use the position from the configuration, to ensure, that games
                // could be played not starting at the start position.
                if (typeof move.prev == "number") {
                    game.load(getMove(move.prev).fen);
                } else {
                    set_to_start();
                }
                let pgn_move = game.move(move.notation.notation, {'sloppy' : true});
                if (pgn_move == null) {
                    throw "No legal move: " + move.notation.notation;
                }
                let fen = game.fen();
                move.fen = fen;
                move.from = pgn_move.from;
                move.to = pgn_move.to;
                if (pgn_move != null) {
                    move.notation.notation = pgn_move.san;
                }
                if (pgn_move != null && pgn_move.flags == 'c') {
                    move.notation.strike = 'x';
                }
                if (pgn_move != null && game.in_checkmate()) {
                    move.notation.check = '#';
                } else if (pgn_move != null && game.in_check()) {
                    move.notation.check = '+';
                }
                move.moveNumber = getMoveNumberFromPosition(fen);

                utils.pvEach(move.variations, function(variation) {
                    eachMoveVariation(variation, level + 1, prev);
                });
            });
        };
        that.firstMove = movesMainLine[0];
        eachMoveVariation(movesMainLine, 0, null);
    };

    /**
     * Returns a map of possible moves.
     * @param {*} game the chess to use
     */
    let possibleMoves = function(game) {
        const dests = {};
        game.SQUARES.forEach(s => {
          const ms = game.moves({square: s, verbose: true});
          if (ms.length) dests[s] = ms.map(m => m.to);
        });
        return dests;
    };

    /**
     * Adds the move to the current state after moveNumber.
     * In all cases the following has to be done:
     * * compute a complete move object
     * * Add that to the end of moves (returning the index)
     * * Wire the previous move to that new one
     *
     * Depending on the current situation, the following will be necessary:
     * * add to the end of the main line
     * * add to the end of a variation
     * * add as a new variation to the current one
     * * completely ignore it, because the move is already there
     * @param move the move notation (simplest form)
     * @param moveNumber the number of the previous made move, null if it is the first one
     */
    const addMove = function (move, moveNumber) {
        const get_turn = function (moveNumber) {
              return getMove(moveNumber).turn === "w" ? 'b' : "w";
        };

        // Special case: first move, so there is no previous move
        function existing_first_move(move) {
            function first_move_notation() {
                if (typeof getMove(0) == 'undefined') return null;
                return getMove(0).notation.notation;
            }
            set_to_start();
            let pgn_move = game.move(move);
            if (typeof pgn_move == "undefined") {
                return null;
             } else if (first_move_notation() == pgn_move.san) {
                return 0;
             } else {   // TODO: Could be a variation of the first move ...
                return existing_variation_first_move(pgn_move);
             }
        }

        // Handles the first move that may be a variation of the first move, returns that.
        // If not, returns null
        function existing_variation_first_move(pgn_move) {
            if (typeof getMove(0) == 'undefined') return null;
            let variations = getMove(0).variations;
            let vari;
            for (vari in variations) {
                if (variations[vari].notation.notation == pgn_move.san) return variations[vari].moveNumber;
            }
            return null; // no variation found
        }

        // Returns the existing move number or null
        // Should include all variations as well
        function existing_move(move, moveNumber) {
            if (moveNumber == null) return existing_first_move(move);
            let prevMove = getMove(moveNumber);
            if (typeof prevMove == "undefined") return null;
            game.load(prevMove.fen);
            let pgn_move = game.move(move);
            let nextMove = getMove(prevMove.next);
            if (typeof nextMove == "undefined") return null;
            if (nextMove.notation.notation == pgn_move.san) {
                return prevMove.next;
            } else { // check if there exists variations
                let mainMove = getMove(prevMove.next);
                for (let i = 0; i < mainMove.variations.length; i++) {
                    let variation = mainMove.variations[i];
                    if (variation.notation.notation == pgn_move.san) {
                        return variation.index;
                    }
                }
            }
            return null;
        }

        // Handle possible variation
        function handle_variation(move, prev, next) {
            //console.log("handle variation: prev == " + prev + " next == " + next);
            let prevMove = getMove(prev);
            if (prevMove === undefined) { // special case: variation on first move
                if (next === 0) return; // First move
                getMove(0).variations.push(move);
                move.variationLevel = 1;
                if (move.turn == 'b') {
                    move.moveNumber = prevMove.moveNumber;
                }
                return;
            }
            if (prevMove.next) {    // has a next move set, so should be a variation
                getMove(prevMove.next).variations.push(move);
                move.variationLevel = (prevMove.variationLevel ? prevMove.variationLevel : 0) + 1;
                if (move.turn == 'b') {
                    move.moveNumber = prevMove.moveNumber;
                }
            } else {    // main variation
                prevMove.next = next;
                move.variationLevel = prevMove.variationLevel;
            }
        }

        let curr = existing_move(move, moveNumber);
        if (typeof curr == 'number') return curr;
        let real_move = {};
        real_move.from = move.from;
        real_move.to = move.to;
        real_move.notation = {};
        real_move.variations = [];
        if (moveNumber == null) {
            set_to_start();
            real_move.turn = game.turn();
            real_move.moveNumber = 1;
        } else {
            game.load(getMove(moveNumber).fen);
            real_move.turn = get_turn(moveNumber);
            if (real_move.turn === "w") {
                real_move.moveNumber = getMove(moveNumber).moveNumber + 1;
            } else {
                real_move.moveNumber = getMove(moveNumber).moveNumber;
            }
        }
        let pgn_move = game.move(move);
        real_move.fen = game.fen();
        // san is the real notation, in case of O-O is that O-O.
        // to is the to field, in case of (white) O-O is that g1.
        if (pgn_move.san.substring(0,1) != "O") {
            real_move.notation.notation = pgn_move.san;
            real_move.notation.col = pgn_move.to.substring(0,1);
            real_move.notation.row = pgn_move.to.substring(1,2);
            if (pgn_move.piece != "p") {
                real_move.notation.fig = pgn_move.piece.charAt(0).toUpperCase();
            }
            if (pgn_move.promotion) {
                real_move.notation.promotion = '=' + pgn_move.promotion.toUpperCase();
            }
            if (pgn_move.flags.includes(game.FLAGS.CAPTURE) || (pgn_move.flags.includes(game.FLAGS.EP_CAPTURE))) {
                real_move.notation.strike = 'x';
            }
            real_move.notation.ep = pgn_move.flags.includes(game.FLAGS.EP_CAPTURE)
            if (game.in_check()) {
                if (game.in_checkmate()) {
                    real_move.notation.mate = '#';
                } else {
                    real_move.notation.check = '+';
                }
            }
        } else {
            real_move.notation.notation = pgn_move.san;
        }
        getMoves().push(real_move);
        real_move.prev = moveNumber;
        let next = getMoves().length - 1;
        real_move.index = next;
        handle_variation(real_move, moveNumber, next);
        return next;
    };

    /**
     * Adds the nag to the move with move number moveNumber
     * @param nag the nag in normal notation or as symbol
     * @param moveNumber the number of the move
     * @param added true, if the nag should be added
     */
    const changeNag = function (nag, moveNumber, added) {
        let move = getMove(moveNumber);
        if (move.nag == null) {
            move.nag = [];
        }
        let nagSym = (nag[0] == "$") ? nag : symbol_to_nag(nag);
        if (added) {
            if (move.nag.indexOf(nagSym) == -1) {
                move.nag.push(nagSym);
            }
        } else {
            let index = move.nag.indexOf(nagSym);
            if (index > -1) {
                move.nag.splice(index, 1);
            }
        }
    };

    const clearNags = function (moveNumber) {
        let move = getMove(moveNumber);
        move.nag = [];
    };

    /**
     * Return all moves in the order they are displayed: move, variations of that move,
     * next move, ...
     */
    const getOrderedMoves = function(current, returnedMoves) {
        if (arguments.length === 0) {
            current = getMove(that.startMove);
            returnedMoves = [];
        }
        returnedMoves.push(current);
        if (current.variations) {
            for (let i = 0; i < current.variations.length; i++) {
                getOrderedMoves(current.variations[i], returnedMoves);
            }
        }
        if (current.next) {
            return getOrderedMoves(getMove(current.next), returnedMoves);
        } else {
            return returnedMoves;
        }
    };

    /**
     * Return the moves of the main line.
     */
    const movesMainLine = function() {
        let current = getMove(that.startMove);
        let returnedMoves = [];
        returnedMoves.push(current);
        while (current.next) {
            current = getMove(current.next);
            returnedMoves.push(current);
        }
        return returnedMoves;
    };

    /**
     * Returns the moves, ensures that the pgn string is read.
     */
    function getMoves() {
        if (typeof that.moves != 'undefined') {
            return that.moves;
        } else {
            load_pgn();
            return that.moves;
        }
    }

    /**
     * Returns the headers. Ensures that pgn is already read.
     */
    function getHeaders() {
        if (typeof that.headers != 'undefined') {
            return that.headers;
        } else {
            load_pgn();
            return that.headers;
        }
    }

    function getEndGame() {
        return that.endGame;
    }

    function setShapes(move, shapes) {
        if (! move.commentDiag) {
            move.commentDiag = {};
        }
        // Ensure everything is reset
        move.commentDiag.colorArrows = [];
        move.commentDiag.colorFields = [];

        shapes.forEach( (shape) => {
            if (shape.dest) { // arrow
                let colArrow = shape.brush.slice(0,1).toUpperCase()
                let arr = shape.orig + shape.dest;
                move.commentDiag.colorArrows.push(colArrow + arr);
            } else { // field
                let colField = shape.brush.slice(0,1).toUpperCase();
                let fie = shape.orig;
                move.commentDiag.colorFields.push(colField + fie);
            }
        })
    }

    // This defines the public API of the pgn function.
    return {
        configuration: that.configuration,
        readHeaders: readHeaders,
        deleteMove: deleteMove,
        deleteMovesBefore: deleteMovesBefore,
        promoteMove: promoteMove,
        isDeleted: isDeleted,
        readMoves: function () { return readMoves; },
        findMove: findMove,
        getMoves: getMoves,
        getOrderedMoves: getOrderedMoves,
        getMove: getMove,
        getEndGame: getEndGame,
        getHeaders: getHeaders,
//        splitHeaders: splitHeaders,
        getParser: function() { return parser; },
//        eachMove: function() { return eachMove(); },
        movesMainLine: movesMainLine,
        write_pgn: write_pgn,
        nag_to_symbol: nag_to_symbol,
        startVariation: startVariation,
        startMainLine: startMainLine,
        endVariation: endVariation,
        afterMoveWithVariation: afterMoveWithVariation,
        changeNag: changeNag,
        clearNags: clearNags,
        addMove: addMove,
        has_diagram_nag: has_diagram_nag,
        PGN_NAGS: that.PGN_NAGS,
        PROMOTIONS: that.PROMOTIONS,
        NAGS: that.NAGs,
        san: san,
        sanWithNags: sanWithNags,
        game: game,
        load_pgn: load_pgn,
        possibleMoves: possibleMoves,
        setShapes: setShapes
    };
};

/*
* Generated by PEG.js 0.10.0.
*
* http://pegjs.org/
*/
var pgnParser =
    (function() {
      "use strict";

      function peg$subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
      }

      function peg$SyntaxError(message, expected, found, location) {
        this.message  = message;
        this.expected = expected;
        this.found    = found;
        this.location = location;
        this.name     = "SyntaxError";

        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, peg$SyntaxError);
        }
      }

      peg$subclass(peg$SyntaxError, Error);

      peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },

          "class": function(expectation) {
            var escapedParts = "",
                i;

            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                  ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                  : classEscape(expectation.parts[i]);
            }

            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },

          any: function(expectation) {
            return "any character";
          },

          end: function(expectation) {
            return "end of input";
          },

          other: function(expectation) {
            return expectation.description;
          }
        };

        function hex(ch) {
          return ch.charCodeAt(0).toString(16).toUpperCase();
        }

        function literalEscape(s) {
          return s
              .replace(/\\/g, '\\\\')
              .replace(/"/g,  '\\"')
              .replace(/\0/g, '\\0')
              .replace(/\t/g, '\\t')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
              .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function classEscape(s) {
          return s
              .replace(/\\/g, '\\\\')
              .replace(/\]/g, '\\]')
              .replace(/\^/g, '\\^')
              .replace(/-/g,  '\\-')
              .replace(/\0/g, '\\0')
              .replace(/\t/g, '\\t')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
              .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }

        function describeExpected(expected) {
          var descriptions = new Array(expected.length),
              i, j;

          for (i = 0; i < expected.length; i++) {
            descriptions[i] = describeExpectation(expected[i]);
          }

          descriptions.sort();

          if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }

          switch (descriptions.length) {
            case 1:
              return descriptions[0];

            case 2:
              return descriptions[0] + " or " + descriptions[1];

            default:
              return descriptions.slice(0, -1).join(", ")
                  + ", or "
                  + descriptions[descriptions.length - 1];
          }
        }

        function describeFound(found) {
          return found ? "\"" + literalEscape(found) + "\"" : "end of input";
        }

        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      };

      function peg$parse(input, options) {
        options = options !== void 0 ? options : {};

        var peg$FAILED = {},

            peg$startRuleFunctions = { pgn: peg$parsepgn },
            peg$startRuleFunction  = peg$parsepgn,

            peg$c0 = function(pw, all) { var arr = (all ? all : []); arr.unshift(pw);return arr; },
            peg$c1 = function(pb, all) { var arr = (all ? all : []); arr.unshift(pb); return arr; },
            peg$c2 = function() { return [[]]; },
            peg$c3 = function(pw) { return pw; },
            peg$c4 = function(pb) { return pb; },
            peg$c5 = function(cm, mn, cb, hm, nag, ca, cd, vari, all) { var arr = (all ? all : []);
              var move = {}; move.turn = 'w'; move.moveNumber = mn;
              move.notation = hm; move.commentBefore = cb; move.commentAfter = ca; move.commentMove = cm;
              move.variations = (vari ? vari : []); move.nag = (nag ? nag : null); arr.unshift(move);
              move.commentDiag = cd;
              return arr; },
            peg$c6 = function(cm, me, cb, hm, nag, ca, cd, vari, all) { var arr = (all ? all : []);
              var move = {}; move.turn = 'b'; move.moveNumber = me;
              move.notation = hm; move.commentBefore = cb; move.commentAfter = ca; move.commentMove = cm;
              move.variations = (vari ? vari : []); arr.unshift(move); move.nag = (nag ? nag : null);
              move.commentDiag = cd;
              return arr; },
            peg$c7 = "1:0",
            peg$c8 = peg$literalExpectation("1:0", false),
            peg$c9 = function() { return ["1:0"]; },
            peg$c10 = "0:1",
            peg$c11 = peg$literalExpectation("0:1", false),
            peg$c12 = function() { return ["0:1"]; },
            peg$c13 = "1-0",
            peg$c14 = peg$literalExpectation("1-0", false),
            peg$c15 = function() { return ["1-0"]; },
            peg$c16 = "0-1",
            peg$c17 = peg$literalExpectation("0-1", false),
            peg$c18 = function() { return ["0-1"]; },
            peg$c19 = "1/2-1/2",
            peg$c20 = peg$literalExpectation("1/2-1/2", false),
            peg$c21 = function() { return ["1/2-1/2"]; },
            peg$c22 = "*",
            peg$c23 = peg$literalExpectation("*", false),
            peg$c24 = function() { return ["*"]; },
            peg$c25 = function(cf, cfl) { var comm = cf; for (var i=0; i < cfl.length; i++) { comm += " " + cfl[i][1]}; return comm; },
            peg$c26 = /^[^}]/,
            peg$c27 = peg$classExpectation(["}"], true, false),
            peg$c28 = function(cm) { return cm.join("").trim(); },
            peg$c29 = function(cas) { return cas; },
            peg$c30 = function(ca, cal) { var ret = { }; if (cal) { var o = cal[0]; return {...ca, ...o}; } return ca; },
            peg$c31 = function(caf) { var ret = {}; ret.colorFields = caf; return ret; },
            peg$c32 = function(caa) { var ret = {}; ret.colorArrows = caa; return ret; },
            peg$c33 = function(cac) { var ret = {}; ret.clock = cac; return ret; },
            peg$c34 = "%csl",
            peg$c35 = peg$literalExpectation("%csl", false),
            peg$c36 = function(cfs) { return cfs; },
            peg$c37 = "%cal",
            peg$c38 = peg$literalExpectation("%cal", false),
            peg$c39 = ",",
            peg$c40 = peg$literalExpectation(",", false),
            peg$c41 = function(cf, cfl) { var arr = []; arr.push(cf); for (var i=0; i < cfl.length; i++) { arr.push(cfl[i][2])}; return arr; },
            peg$c42 = function(col, f) { return col + f; },
            peg$c43 = function(col, ff, ft) { return col + ff + ft; },
            peg$c44 = "Y",
            peg$c45 = peg$literalExpectation("Y", false),
            peg$c46 = function() { return "Y"; },
            peg$c47 = "G",
            peg$c48 = peg$literalExpectation("G", false),
            peg$c49 = function() { return "G"; },
            peg$c50 = "R",
            peg$c51 = peg$literalExpectation("R", false),
            peg$c52 = function() { return "R"; },
            peg$c53 = "B",
            peg$c54 = peg$literalExpectation("B", false),
            peg$c55 = function() { return "B"; },
            peg$c56 = function(col, row) { return col + row; },
            peg$c57 = "{",
            peg$c58 = peg$literalExpectation("{", false),
            peg$c59 = "}",
            peg$c60 = peg$literalExpectation("}", false),
            peg$c61 = "[",
            peg$c62 = peg$literalExpectation("[", false),
            peg$c63 = "]",
            peg$c64 = peg$literalExpectation("]", false),
            peg$c65 = "%",
            peg$c66 = peg$literalExpectation("%", false),
            peg$c67 = function(cc, cv) { var ret = {}; ret.type = cc; ret.value = cv; return ret; },
            peg$c68 = "clk",
            peg$c69 = peg$literalExpectation("clk", false),
            peg$c70 = function() { return "clk"; },
            peg$c71 = "egt",
            peg$c72 = peg$literalExpectation("egt", false),
            peg$c73 = function() { return "egt"; },
            peg$c74 = "emt",
            peg$c75 = peg$literalExpectation("emt", false),
            peg$c76 = function() { return "emt"; },
            peg$c77 = "mct",
            peg$c78 = peg$literalExpectation("mct", false),
            peg$c79 = function() { return "mct"; },
            peg$c80 = ":",
            peg$c81 = peg$literalExpectation(":", false),
            peg$c82 = function(h1, h2, m1, m2, s1, s2) { var ret = h1; if (h2) { ret += h2 }; ret += ":" + m1 + m2 + ":" + s1 + s2; return ret; },
            peg$c83 = /^[0-9]/,
            peg$c84 = peg$classExpectation([["0", "9"]], false, false),
            peg$c85 = function(d) { return d; },
            peg$c86 = function(vari, all, me) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
            peg$c87 = function(vari, all) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
            peg$c88 = "(",
            peg$c89 = peg$literalExpectation("(", false),
            peg$c90 = ")",
            peg$c91 = peg$literalExpectation(")", false),
            peg$c92 = function(num) { return num; },
            peg$c93 = ".",
            peg$c94 = peg$literalExpectation(".", false),
            peg$c95 = peg$otherExpectation("integer"),
            peg$c96 = function(digits) { return makeInteger(digits); },
            peg$c97 = " ",
            peg$c98 = peg$literalExpectation(" ", false),
            peg$c99 = function() { return '';},
            peg$c100 = function(fig, disc, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.disc =  (disc ? disc : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.promotion = pr; hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : ""); return hm; },
            peg$c101 = function(fig, cols, rows, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str =='x' ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig && (fig!=='P') ? fig : "") + cols + rows + (str=='x' ? str : "-") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
            peg$c102 = function(fig, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig ? fig : "") + (str ? str : "") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
            peg$c103 = "O-O-O",
            peg$c104 = peg$literalExpectation("O-O-O", false),
            peg$c105 = function(ch) { var hm = {}; hm.notation = 'O-O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
            peg$c106 = "O-O",
            peg$c107 = peg$literalExpectation("O-O", false),
            peg$c108 = function(ch) { var hm = {}; hm.notation = 'O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
            peg$c109 = "+-",
            peg$c110 = peg$literalExpectation("+-", false),
            peg$c111 = "+",
            peg$c112 = peg$literalExpectation("+", false),
            peg$c113 = function(ch) { return ch[1]; },
            peg$c114 = "$$$",
            peg$c115 = peg$literalExpectation("$$$", false),
            peg$c116 = "#",
            peg$c117 = peg$literalExpectation("#", false),
            peg$c118 = "=",
            peg$c119 = peg$literalExpectation("=", false),
            peg$c120 = function(f) { return '=' + f; },
            peg$c121 = function(nag, nags) { var arr = (nags ? nags : []); arr.unshift(nag); return arr; },
            peg$c122 = "$",
            peg$c123 = peg$literalExpectation("$", false),
            peg$c124 = function(num) { return '$' + num; },
            peg$c125 = "!!",
            peg$c126 = peg$literalExpectation("!!", false),
            peg$c127 = function() { return '$3'; },
            peg$c128 = "??",
            peg$c129 = peg$literalExpectation("??", false),
            peg$c130 = function() { return '$4'; },
            peg$c131 = "!?",
            peg$c132 = peg$literalExpectation("!?", false),
            peg$c133 = function() { return '$5'; },
            peg$c134 = "?!",
            peg$c135 = peg$literalExpectation("?!", false),
            peg$c136 = function() { return '$6'; },
            peg$c137 = "!",
            peg$c138 = peg$literalExpectation("!", false),
            peg$c139 = function() { return '$1'; },
            peg$c140 = "?",
            peg$c141 = peg$literalExpectation("?", false),
            peg$c142 = function() { return '$2'; },
            peg$c143 = "\u203C",
            peg$c144 = peg$literalExpectation("\u203C", false),
            peg$c145 = "\u2047",
            peg$c146 = peg$literalExpectation("\u2047", false),
            peg$c147 = "\u2049",
            peg$c148 = peg$literalExpectation("\u2049", false),
            peg$c149 = "\u2048",
            peg$c150 = peg$literalExpectation("\u2048", false),
            peg$c151 = "\u25A1",
            peg$c152 = peg$literalExpectation("\u25A1", false),
            peg$c153 = function() { return '$7'; },
            peg$c154 = function() { return '$10'; },
            peg$c155 = "\u221E",
            peg$c156 = peg$literalExpectation("\u221E", false),
            peg$c157 = function() { return '$13'; },
            peg$c158 = "\u2A72",
            peg$c159 = peg$literalExpectation("\u2A72", false),
            peg$c160 = function() { return '$14'; },
            peg$c161 = "\u2A71",
            peg$c162 = peg$literalExpectation("\u2A71", false),
            peg$c163 = function() { return '$15';},
            peg$c164 = "\xB1",
            peg$c165 = peg$literalExpectation("\xB1", false),
            peg$c166 = function() { return '$16';},
            peg$c167 = "\u2213",
            peg$c168 = peg$literalExpectation("\u2213", false),
            peg$c169 = function() { return '$17';},
            peg$c170 = function() { return '$18';},
            peg$c171 = "-+",
            peg$c172 = peg$literalExpectation("-+", false),
            peg$c173 = function() { return '$19';},
            peg$c174 = "\u2A00",
            peg$c175 = peg$literalExpectation("\u2A00", false),
            peg$c176 = function() { return '$22'; },
            peg$c177 = "\u27F3",
            peg$c178 = peg$literalExpectation("\u27F3", false),
            peg$c179 = function() { return '$32'; },
            peg$c180 = "\u2192",
            peg$c181 = peg$literalExpectation("\u2192", false),
            peg$c182 = function() { return '$36'; },
            peg$c183 = "\u2191",
            peg$c184 = peg$literalExpectation("\u2191", false),
            peg$c185 = function() { return '$40'; },
            peg$c186 = "\u21C6",
            peg$c187 = peg$literalExpectation("\u21C6", false),
            peg$c188 = function() { return '$132'; },
            peg$c189 = "D",
            peg$c190 = peg$literalExpectation("D", false),
            peg$c191 = function() { return '$220'; },
            peg$c192 = /^[RNBQKP]/,
            peg$c193 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false),
            peg$c194 = /^[a-h]/,
            peg$c195 = peg$classExpectation([["a", "h"]], false, false),
            peg$c196 = /^[1-8]/,
            peg$c197 = peg$classExpectation([["1", "8"]], false, false),
            peg$c198 = "x",
            peg$c199 = peg$literalExpectation("x", false),
            peg$c200 = "-",
            peg$c201 = peg$literalExpectation("-", false),

            peg$currPos          = 0,
            peg$savedPos         = 0,
            peg$posDetailsCache  = [{ line: 1, column: 1 }],
            peg$maxFailPos       = 0,
            peg$maxFailExpected  = [],
            peg$silentFails      = 0,

            peg$result;

        if ("startRule" in options) {
          if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
          }

          peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function text() {
          return input.substring(peg$savedPos, peg$currPos);
        }

        function location() {
          return peg$computeLocation(peg$savedPos, peg$currPos);
        }

        function expected(description, location) {
          location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

          throw peg$buildStructuredError(
              [peg$otherExpectation(description)],
              input.substring(peg$savedPos, peg$currPos),
              location
          );
        }

        function error(message, location) {
          location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

          throw peg$buildSimpleError(message, location);
        }

        function peg$literalExpectation(text, ignoreCase) {
          return { type: "literal", text: text, ignoreCase: ignoreCase };
        }

        function peg$classExpectation(parts, inverted, ignoreCase) {
          return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }

        function peg$anyExpectation() {
          return { type: "any" };
        }

        function peg$endExpectation() {
          return { type: "end" };
        }

        function peg$otherExpectation(description) {
          return { type: "other", description: description };
        }

        function peg$computePosDetails(pos) {
          var details = peg$posDetailsCache[pos], p;

          if (details) {
            return details;
          } else {
            p = pos - 1;
            while (!peg$posDetailsCache[p]) {
              p--;
            }

            details = peg$posDetailsCache[p];
            details = {
              line:   details.line,
              column: details.column
            };

            while (p < pos) {
              if (input.charCodeAt(p) === 10) {
                details.line++;
                details.column = 1;
              } else {
                details.column++;
              }

              p++;
            }

            peg$posDetailsCache[pos] = details;
            return details;
          }
        }

        function peg$computeLocation(startPos, endPos) {
          var startPosDetails = peg$computePosDetails(startPos),
              endPosDetails   = peg$computePosDetails(endPos);

          return {
            start: {
              offset: startPos,
              line:   startPosDetails.line,
              column: startPosDetails.column
            },
            end: {
              offset: endPos,
              line:   endPosDetails.line,
              column: endPosDetails.column
            }
          };
        }

        function peg$fail(expected) {
          if (peg$currPos < peg$maxFailPos) { return; }

          if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
          }

          peg$maxFailExpected.push(expected);
        }

        function peg$buildSimpleError(message, location) {
          return new peg$SyntaxError(message, null, null, location);
        }

        function peg$buildStructuredError(expected, found, location) {
          return new peg$SyntaxError(
              peg$SyntaxError.buildMessage(expected, found),
              expected,
              found,
              location
          );
        }

        function peg$parsepgn() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = peg$parsepgnStartWhite();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsepgnBlack();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c0(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsepgnStartBlack();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsepgnWhite();
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c1(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsewhiteSpace();
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c2();
              }
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parsepgnStartWhite() {
          var s0, s1;

          s0 = peg$currPos;
          s1 = peg$parsepgnWhite();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c3(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsepgnStartBlack() {
          var s0, s1;

          s0 = peg$currPos;
          s1 = peg$parsepgnBlack();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c4(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsepgnWhite() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17;

          s0 = peg$currPos;
          s1 = peg$parsewhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsecomments();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsewhiteSpace();
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsemoveNumber();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsewhiteSpace();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsecomments();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsewhiteSpace();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parsehalfMove();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parsewhiteSpace();
                          if (s9 === peg$FAILED) {
                            s9 = null;
                          }
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parsenags();
                            if (s10 === peg$FAILED) {
                              s10 = null;
                            }
                            if (s10 !== peg$FAILED) {
                              s11 = peg$parsewhiteSpace();
                              if (s11 === peg$FAILED) {
                                s11 = null;
                              }
                              if (s11 !== peg$FAILED) {
                                s12 = peg$parsecomments();
                                if (s12 === peg$FAILED) {
                                  s12 = null;
                                }
                                if (s12 !== peg$FAILED) {
                                  s13 = peg$parsewhiteSpace();
                                  if (s13 === peg$FAILED) {
                                    s13 = null;
                                  }
                                  if (s13 !== peg$FAILED) {
                                    s14 = peg$parsecommentDiag();
                                    if (s14 === peg$FAILED) {
                                      s14 = null;
                                    }
                                    if (s14 !== peg$FAILED) {
                                      s15 = peg$parsewhiteSpace();
                                      if (s15 === peg$FAILED) {
                                        s15 = null;
                                      }
                                      if (s15 !== peg$FAILED) {
                                        s16 = peg$parsevariationWhite();
                                        if (s16 === peg$FAILED) {
                                          s16 = null;
                                        }
                                        if (s16 !== peg$FAILED) {
                                          s17 = peg$parsepgnBlack();
                                          if (s17 === peg$FAILED) {
                                            s17 = null;
                                          }
                                          if (s17 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c5(s2, s4, s6, s8, s10, s12, s14, s16, s17);
                                            s0 = s1;
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseendGame();
          }

          return s0;
        }

        function peg$parsepgnBlack() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17;

          s0 = peg$currPos;
          s1 = peg$parsewhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsecomments();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsewhiteSpace();
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsemoveNumber();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsewhiteSpace();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsecomments();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsewhiteSpace();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parsehalfMove();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parsewhiteSpace();
                          if (s9 === peg$FAILED) {
                            s9 = null;
                          }
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parsenags();
                            if (s10 === peg$FAILED) {
                              s10 = null;
                            }
                            if (s10 !== peg$FAILED) {
                              s11 = peg$parsewhiteSpace();
                              if (s11 === peg$FAILED) {
                                s11 = null;
                              }
                              if (s11 !== peg$FAILED) {
                                s12 = peg$parsecomments();
                                if (s12 === peg$FAILED) {
                                  s12 = null;
                                }
                                if (s12 !== peg$FAILED) {
                                  s13 = peg$parsewhiteSpace();
                                  if (s13 === peg$FAILED) {
                                    s13 = null;
                                  }
                                  if (s13 !== peg$FAILED) {
                                    s14 = peg$parsecommentDiag();
                                    if (s14 === peg$FAILED) {
                                      s14 = null;
                                    }
                                    if (s14 !== peg$FAILED) {
                                      s15 = peg$parsewhiteSpace();
                                      if (s15 === peg$FAILED) {
                                        s15 = null;
                                      }
                                      if (s15 !== peg$FAILED) {
                                        s16 = peg$parsevariationBlack();
                                        if (s16 === peg$FAILED) {
                                          s16 = null;
                                        }
                                        if (s16 !== peg$FAILED) {
                                          s17 = peg$parsepgnWhite();
                                          if (s17 === peg$FAILED) {
                                            s17 = null;
                                          }
                                          if (s17 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c6(s2, s4, s6, s8, s10, s12, s14, s16, s17);
                                            s0 = s1;
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseendGame();
          }

          return s0;
        }

        function peg$parseendGame() {
          var s0, s1;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3) === peg$c7) {
            s1 = peg$c7;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c9();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c10) {
              s1 = peg$c10;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c11); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c12();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c13) {
                s1 = peg$c13;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c14); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c15();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c16) {
                  s1 = peg$c16;
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c17); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c18();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 7) === peg$c19) {
                    s1 = peg$c19;
                    peg$currPos += 7;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c20); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c21();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 42) {
                      s1 = peg$c22;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c23); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c24();
                    }
                    s0 = s1;
                  }
                }
              }
            }
          }

          return s0;
        }

        function peg$parsecomments() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          s1 = peg$parsecomment();
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsecomment();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$parsewhiteSpace();
              if (s4 === peg$FAILED) {
                s4 = null;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsecomment();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c25(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecomment() {
          var s0, s1, s2, s3, s4;

          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          s2 = peg$parsecommentDiag();
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = void 0;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsecl();
            if (s2 !== peg$FAILED) {
              s3 = [];
              if (peg$c26.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c27); }
              }
              if (s4 !== peg$FAILED) {
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  if (peg$c26.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c27); }
                  }
                }
              } else {
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsecr();
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c28(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecommentDiag() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          s1 = peg$parsecl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsecommentAnnotations();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsewhiteSpace();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsecr();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c29(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecommentAnnotations() {
          var s0, s1, s2, s3, s4;

          s0 = peg$currPos;
          s1 = peg$parsecommentAnnotation();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parsecommentAnnotation();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsecommentAnnotation();
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c30(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecommentAnnotation() {
          var s0, s1;

          s0 = peg$currPos;
          s1 = peg$parsecommentAnnotationFields();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c31(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsecommentAnnotationArrows();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c32(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsecommentAnnotationClock();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c33(s1);
              }
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parsecommentAnnotationFields() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          s0 = peg$currPos;
          s1 = peg$parsebl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c34) {
                s3 = peg$c34;
                peg$currPos += 4;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c35); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsewhiteSpace();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsecolorFields();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsewhiteSpace();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsebr();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c36(s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecommentAnnotationArrows() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          s0 = peg$currPos;
          s1 = peg$parsebl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c37) {
                s3 = peg$c37;
                peg$currPos += 4;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c38); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsewhiteSpace();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsecolorArrows();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsewhiteSpace();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsebr();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c36(s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecolorFields() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          s0 = peg$currPos;
          s1 = peg$parsecolorField();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c39;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c40); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsewhiteSpace();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsecolorField();
                  if (s7 !== peg$FAILED) {
                    s5 = [s5, s6, s7];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c39;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c40); }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsewhiteSpace();
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsecolorField();
                    if (s7 !== peg$FAILED) {
                      s5 = [s5, s6, s7];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c41(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecolorField() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = peg$parsecolor();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsefield();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c42(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecolorArrows() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          s0 = peg$currPos;
          s1 = peg$parsecolorArrow();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c39;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c40); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsewhiteSpace();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsecolorArrow();
                  if (s7 !== peg$FAILED) {
                    s5 = [s5, s6, s7];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c39;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c40); }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsewhiteSpace();
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsecolorArrow();
                    if (s7 !== peg$FAILED) {
                      s5 = [s5, s6, s7];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c41(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecolorArrow() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$parsecolor();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsefield();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsefield();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c43(s1, s2, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecolor() {
          var s0, s1;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 89) {
            s1 = peg$c44;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c46();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 71) {
              s1 = peg$c47;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c49();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 82) {
                s1 = peg$c50;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c51); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c52();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 66) {
                  s1 = peg$c53;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c54); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c55();
                }
                s0 = s1;
              }
            }
          }

          return s0;
        }

        function peg$parsefield() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = peg$parsecolumn();
          if (s1 !== peg$FAILED) {
            s2 = peg$parserow();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c56(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsecl() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 123) {
            s0 = peg$c57;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
          }

          return s0;
        }

        function peg$parsecr() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 125) {
            s0 = peg$c59;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c60); }
          }

          return s0;
        }

        function peg$parsebl() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 91) {
            s0 = peg$c61;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c62); }
          }

          return s0;
        }

        function peg$parsebr() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 93) {
            s0 = peg$c63;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c64); }
          }

          return s0;
        }

        function peg$parsecommentAnnotationClock() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          s1 = peg$parsebl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 37) {
                s3 = peg$c65;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c66); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parseclockCommand();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsewhiteSpace();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseclockValue();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsewhiteSpace();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parsebr();
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c67(s4, s6);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseclockCommand() {
          var s0, s1;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3) === peg$c68) {
            s1 = peg$c68;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c69); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c70();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c71) {
              s1 = peg$c71;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c72); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c73();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c74) {
                s1 = peg$c74;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c75); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c76();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c77) {
                  s1 = peg$c77;
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c78); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c79();
                }
                s0 = s1;
              }
            }
          }

          return s0;
        }

        function peg$parseclockValue() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          s1 = peg$parsedigit();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsedigit();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 58) {
                s3 = peg$c80;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c81); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsedigit();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsedigit();
                  if (s5 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s6 = peg$c80;
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c81); }
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsedigit();
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parsedigit();
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c82(s1, s2, s4, s5, s7, s8);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsedigit() {
          var s0, s1;

          s0 = peg$currPos;
          if (peg$c83.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c85(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsevariationWhite() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          s0 = peg$currPos;
          s1 = peg$parsepl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsepgnWhite();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsepr();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsewhiteSpace();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsevariationWhite();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsewhiteSpace();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsemoveNumber();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c86(s2, s5, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsevariationBlack() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          s1 = peg$parsepl();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsepgnStartBlack();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsepr();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsewhiteSpace();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsevariationBlack();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c87(s2, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsepl() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 40) {
            s0 = peg$c88;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c89); }
          }

          return s0;
        }

        function peg$parsepr() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 41) {
            s0 = peg$c90;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c91); }
          }

          return s0;
        }

        function peg$parsemoveNumber() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$parseinteger();
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parsedotOrWhitespace();
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parsedotOrWhitespace();
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c92(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsedot() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 46) {
            s0 = peg$c93;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c94); }
          }

          return s0;
        }

        function peg$parseinteger() {
          var s0, s1, s2;

          peg$silentFails++;
          s0 = peg$currPos;
          s1 = [];
          if (peg$c83.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              if (peg$c83.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c84); }
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c96(s1);
          }
          s0 = s1;
          peg$silentFails--;
          if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c95); }
          }

          return s0;
        }

        function peg$parsewhiteSpace() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = [];
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c97;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c98); }
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              if (input.charCodeAt(peg$currPos) === 32) {
                s2 = peg$c97;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c98); }
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c99();
          }
          s0 = s1;

          return s0;
        }

        function peg$parsedotOrWhitespace() {
          var s0;

          s0 = peg$parsedot();
          if (s0 === peg$FAILED) {
            s0 = peg$parsewhiteSpace();
          }

          return s0;
        }

        function peg$parsehalfMove() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          s1 = peg$parsefigure();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parsecheckdisc();
            peg$silentFails--;
            if (s3 !== peg$FAILED) {
              peg$currPos = s2;
              s2 = void 0;
            } else {
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsediscriminator();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsestrike();
                if (s4 === peg$FAILED) {
                  s4 = null;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsecolumn();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parserow();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsepromotion();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parsecheck();
                        if (s8 === peg$FAILED) {
                          s8 = null;
                        }
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c100(s1, s3, s4, s5, s6, s7, s8);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsefigure();
            if (s1 === peg$FAILED) {
              s1 = null;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecolumn();
              if (s2 !== peg$FAILED) {
                s3 = peg$parserow();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsestrikeOrDash();
                  if (s4 === peg$FAILED) {
                    s4 = null;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsecolumn();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parserow();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsepromotion();
                        if (s7 === peg$FAILED) {
                          s7 = null;
                        }
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parsecheck();
                          if (s8 === peg$FAILED) {
                            s8 = null;
                          }
                          if (s8 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c101(s1, s2, s3, s4, s5, s6, s7, s8);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsefigure();
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsestrike();
                if (s2 === peg$FAILED) {
                  s2 = null;
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsecolumn();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parserow();
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parsepromotion();
                      if (s5 === peg$FAILED) {
                        s5 = null;
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsecheck();
                        if (s6 === peg$FAILED) {
                          s6 = null;
                        }
                        if (s6 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c102(s1, s2, s3, s4, s5, s6);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 5) === peg$c103) {
                  s1 = peg$c103;
                  peg$currPos += 5;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c104); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsecheck();
                  if (s2 === peg$FAILED) {
                    s2 = null;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c105(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c106) {
                    s1 = peg$c106;
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c107); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsecheck();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c108(s2);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
            }
          }

          return s0;
        }

        function peg$parsecheck() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$currPos;
          s2 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c109) {
            s3 = peg$c109;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c110); }
          }
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = void 0;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s3 = peg$c111;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c112); }
            }
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c113(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 3) === peg$c114) {
              s3 = peg$c114;
              peg$currPos += 3;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c115); }
            }
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = void 0;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 35) {
                s3 = peg$c116;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c117); }
              }
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c113(s1);
            }
            s0 = s1;
          }

          return s0;
        }

        function peg$parsepromotion() {
          var s0, s1, s2;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 61) {
            s1 = peg$c118;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c119); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsefigure();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c120(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsenags() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$parsenag();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsewhiteSpace();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsenags();
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c121(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsenag() {
          var s0, s1, s2;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 36) {
            s1 = peg$c122;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c123); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseinteger();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c124(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c125) {
              s1 = peg$c125;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c126); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c127();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c128) {
                s1 = peg$c128;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c129); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c130();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c131) {
                  s1 = peg$c131;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c132); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c133();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c134) {
                    s1 = peg$c134;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c135); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c136();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 33) {
                      s1 = peg$c137;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c138); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c139();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 63) {
                        s1 = peg$c140;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c141); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c142();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 8252) {
                          s1 = peg$c143;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c144); }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c127();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 8263) {
                            s1 = peg$c145;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c146); }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c130();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 8265) {
                              s1 = peg$c147;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c148); }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c133();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 8264) {
                                s1 = peg$c149;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c150); }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c136();
                              }
                              s0 = s1;
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 9633) {
                                  s1 = peg$c151;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c152); }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c153();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 61) {
                                    s1 = peg$c118;
                                    peg$currPos++;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c119); }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c154();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 8734) {
                                      s1 = peg$c155;
                                      peg$currPos++;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c156); }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$c157();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 10866) {
                                        s1 = peg$c158;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c159); }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$c160();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 10865) {
                                          s1 = peg$c161;
                                          peg$currPos++;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c162); }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$c163();
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          if (input.charCodeAt(peg$currPos) === 177) {
                                            s1 = peg$c164;
                                            peg$currPos++;
                                          } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c165); }
                                          }
                                          if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c166();
                                          }
                                          s0 = s1;
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 8723) {
                                              s1 = peg$c167;
                                              peg$currPos++;
                                            } else {
                                              s1 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$c168); }
                                            }
                                            if (s1 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s1 = peg$c169();
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              if (input.substr(peg$currPos, 2) === peg$c109) {
                                                s1 = peg$c109;
                                                peg$currPos += 2;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c110); }
                                              }
                                              if (s1 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c170();
                                              }
                                              s0 = s1;
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.substr(peg$currPos, 2) === peg$c171) {
                                                  s1 = peg$c171;
                                                  peg$currPos += 2;
                                                } else {
                                                  s1 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$c172); }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c173();
                                                }
                                                s0 = s1;
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$currPos;
                                                  if (input.charCodeAt(peg$currPos) === 10752) {
                                                    s1 = peg$c174;
                                                    peg$currPos++;
                                                  } else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c175); }
                                                  }
                                                  if (s1 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s1 = peg$c176();
                                                  }
                                                  s0 = s1;
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    if (input.charCodeAt(peg$currPos) === 10227) {
                                                      s1 = peg$c177;
                                                      peg$currPos++;
                                                    } else {
                                                      s1 = peg$FAILED;
                                                      if (peg$silentFails === 0) { peg$fail(peg$c178); }
                                                    }
                                                    if (s1 !== peg$FAILED) {
                                                      peg$savedPos = s0;
                                                      s1 = peg$c179();
                                                    }
                                                    s0 = s1;
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$currPos;
                                                      if (input.charCodeAt(peg$currPos) === 8594) {
                                                        s1 = peg$c180;
                                                        peg$currPos++;
                                                      } else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) { peg$fail(peg$c181); }
                                                      }
                                                      if (s1 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s1 = peg$c182();
                                                      }
                                                      s0 = s1;
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        if (input.charCodeAt(peg$currPos) === 8593) {
                                                          s1 = peg$c183;
                                                          peg$currPos++;
                                                        } else {
                                                          s1 = peg$FAILED;
                                                          if (peg$silentFails === 0) { peg$fail(peg$c184); }
                                                        }
                                                        if (s1 !== peg$FAILED) {
                                                          peg$savedPos = s0;
                                                          s1 = peg$c185();
                                                        }
                                                        s0 = s1;
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$currPos;
                                                          if (input.charCodeAt(peg$currPos) === 8646) {
                                                            s1 = peg$c186;
                                                            peg$currPos++;
                                                          } else {
                                                            s1 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$c187); }
                                                          }
                                                          if (s1 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s1 = peg$c188();
                                                          }
                                                          s0 = s1;
                                                          if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            if (input.charCodeAt(peg$currPos) === 68) {
                                                              s1 = peg$c189;
                                                              peg$currPos++;
                                                            } else {
                                                              s1 = peg$FAILED;
                                                              if (peg$silentFails === 0) { peg$fail(peg$c190); }
                                                            }
                                                            if (s1 !== peg$FAILED) {
                                                              peg$savedPos = s0;
                                                              s1 = peg$c191();
                                                            }
                                                            s0 = s1;
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          return s0;
        }

        function peg$parsediscriminator() {
          var s0;

          s0 = peg$parsecolumn();
          if (s0 === peg$FAILED) {
            s0 = peg$parserow();
          }

          return s0;
        }

        function peg$parsecheckdisc() {
          var s0, s1, s2, s3, s4;

          s0 = peg$currPos;
          s1 = peg$parsediscriminator();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsestrike();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsecolumn();
              if (s3 !== peg$FAILED) {
                s4 = peg$parserow();
                if (s4 !== peg$FAILED) {
                  s1 = [s1, s2, s3, s4];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsefigure() {
          var s0;

          if (peg$c192.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c193); }
          }

          return s0;
        }

        function peg$parsecolumn() {
          var s0;

          if (peg$c194.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c195); }
          }

          return s0;
        }

        function peg$parserow() {
          var s0;

          if (peg$c196.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c197); }
          }

          return s0;
        }

        function peg$parsestrike() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 120) {
            s0 = peg$c198;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c199); }
          }

          return s0;
        }

        function peg$parsestrikeOrDash() {
          var s0;

          if (input.charCodeAt(peg$currPos) === 120) {
            s0 = peg$c198;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c199); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s0 = peg$c200;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c201); }
            }
          }

          return s0;
        }


        function makeInteger(o) {
          return parseInt(o.join(""), 10);
        }


        peg$result = peg$startRuleFunction();

        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
          return peg$result;
        } else {
          if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
          }

          throw peg$buildStructuredError(
              peg$maxFailExpected,
              peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
              peg$maxFailPos < input.length
                  ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                  : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
          );
        }
      }

      return {
        SyntaxError: peg$SyntaxError,
        parse:       peg$parse
      };
    })();
'use strict';

// Users of PgnViewerJS may redefine some defaults by defining globally the var `PgnBaseDefaults.
// This will be merged then with the defaults defined by the app itself.
var PgnBaseDefaults = window.PgnBaseDefaults ? window.PgnBaseDefaults : {};
// Holds defined pgnBase objects to allow test specs
window.pgnTestRegistry = {};

/**
 * Utilities used outside from pgnBase.
 */
function PgnScheduler() {
    this.list = [];
}

var GLOB_SCHED = new PgnScheduler();
GLOB_SCHED.schedule = function (loc, func, res) {
    let myLoc = (typeof loc != 'undefined') ? loc : 'en';
    if (i18next.hasResourceBundle(myLoc)) {
        func.call(null);
    } else {
        i18next.loadLanguages(myLoc, (err, t) => {
            let myRes = func.call(null);
            if (typeof res != 'undefined') {
                res.call(null, myRes);
            }
        });
    }
};

// Anonymous function, has not to be visible from the outside
// Does all the initialization stuff only needed once, here mostly internationalization.
let initI18n = function () {
    let localPath = function () {
        if (window.PgnBaseDefaults.localPath) {
            return window.PgnBaseDefaults.localPath;
        }
        let jsFileLocation = document.querySelector('script[src*=pgnvjs]').src;  // the js file path
        var index = jsFileLocation.indexOf('pgnvjs');
        console.log("Local path: " + jsFileLocation.substring(0, index - 3));
        return jsFileLocation.substring(0, index - 3);   // the father of the js folder
    };
    let localesPattern = window.PgnBaseDefaults.localesPattern || 'locales/{{ns}}-{{lng}}.json';
    let loadPath = window.PgnBaseDefaults.loadPath || (localPath() + localesPattern);
    var i18n_option = {
        backend: {loadPath: loadPath},
        cache: {enabled: true},
        fallbackLng: 'en',
        ns: ['chess', 'nag', 'buttons'],
        defaultNS: 'chess',
        debug: false
    };
    i18next.use(window.i18nextXHRBackend).use(window.i18nextLocalStorageCache).init(i18n_option, (err, t) => {
    });
};
initI18n();

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */
var pgnBase = function (boardId, configuration) {
    // Section defines the variables needed everywhere.
    const VERSION = "0.9.7";
    let that = {};
    let utils = new Utils();
    // Sets the default parameters for all modes. See individual functions for individual overwrites
    let defaults = {
        width: '320px',
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
        notation: 'short'
    };
    that.promMappings = {q: 'queen', r: 'rook', b: 'bishop', n: 'knight'};
    that.configuration = Object.assign(Object.assign(defaults, PgnBaseDefaults), configuration);
    let game = new Chess();
    that.mypgn = pgnReader(that.configuration, game); // Use the same instance from chess.js
    let theme = that.configuration.theme || 'default';
    that.configuration.markup = (typeof boardId) == "object";
    let hasMarkup = function () {
        return that.configuration.markup;
    };
    let hasMode = function (mode) {
        return that.configuration.mode === mode;
    };
    let possibleMoves = function () {
        return that.mypgn.possibleMoves(game);
    };
    let board;              // Will be set later, but has to be a known variable
    // IDs needed for styling and adressing the HTML elements, only used if no markup is done by the user
    if (!hasMarkup()) {
        var headersId = boardId + 'Headers';
        var innerBoardId = boardId + 'Inner';
        var movesId = boardId + 'Moves';
        var buttonsId = boardId + 'Button';
        var fenId = boardId + "Fen";
        var colorMarkerId = innerBoardId + 'ColorMarker';
    } else { // will be filled later
        var innerBoardId;
        var headersId;
        var movesId;
        var buttonsId;
        var fenId;
        var colorMarkerId;

    }

    if (that.configuration.locale) {
        that.configuration.locale = that.configuration.locale.replace(/_/g, "-");
        i18next.loadLanguages(that.configuration.locale, (err, t) => {
        });
    }

    if (that.configuration.position) { // Allow early correction
        if (that.configuration.position !== 'start') {
            let tokens = that.configuration.position.split(/\s+/);
            if (tokens.length == 4) {
                that.configuration.position += ' 1 1';
            }
        }
    }

    /**
     * Allow logging of error to HTML.
     */
    function logError(str) {
        var node = document.createElement("DIV");
        var textnode = document.createTextNode(str);
        node.appendChild(textnode);
        that.errorDiv.appendChild(node);
    }

    /**
     * Adds a class to an element.
     */
    function addClass(elementOrId, className) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (!ele) return;
        if (ele.classList) {
            ele.classList.add(className);
        } else {
            ele.className += ' ' + className;
        }
    }

    /**
     * Remove a class from an element.
     */
    function removeClass(elementOrId, className) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (ele === null) return;
        if (ele.classList) {
            ele.classList.remove(className);
        } else {
            ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    /**
     * Inserts an element after targetElement
     * @param {*} newElement the element to insert
     * @param {*} targetElement the element after to insert
     */
    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    /**
     * Adds an event listener to the DOM element.
     */
    function addEventListener(elementOrId, event, func) {
        let ele = utils.pvIsElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
        if (ele === null) return;
        ele.addEventListener(event, func);
    }

    function toggleColorMarker() {
        let ele = document.getElementById(colorMarkerId);
        if (!ele) return;
        if (ele.classList.contains('cm-black')) {
            ele.classList.remove('cm-black');
        } else {
            ele.classList.add('cm-black');
        }
    }

    /**
     * Scroll if element is not visible
     * @param element the element to show by scrolling
     */
    function scrollToView(element) {
        function scrollParentToChild(parent, child) {
            let parentRect = parent.getBoundingClientRect();
            // What can you see?
            let parentViewableArea = {
                height: parent.clientHeight,
                width: parent.clientWidth
            };

            // Where is the child
            let childRect = child.getBoundingClientRect();
            // Is the child viewable?
            let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

            // if you can't see the child try to scroll parent
            if (!isViewable) {
                // scroll by offset relative to parent
                parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top;
            }
        }

        var node = element;
        var movesNode = node.parentElement;
        scrollParentToChild(movesNode, node);
    }

    /**
     * Called when the piece is released. Here should be the logic for calling all
     * pgn enhancement.
     * @param from the source
     * @param to the destination
     * @param meta additional parameters (not used at the moment)
     */
    var onSnapEnd = async function (from, to, meta) {
        //console.log("Move from: " + from + " To: " + to + " Meta: " + JSON.stringify(meta, null, 2));
        //board.set({fen: game.fen()});
        var cur = that.currentMove;
        let primMove = {from: from, to: to};
        if ((that.mypgn.game.get(from).type == 'p') && ((to.substring(1, 2) == '8') || (to.substring(1, 2) == '1'))) {
            let sel = await swal("Select the promotion figure", {
                buttons: {
                    queen: {text: "Queen", value: 'q'},
                    rook: {text: "Rook", value: 'r'},
                    bishop: {text: "Bishop", value: 'b'},
                    knight: {text: 'Knight', value: 'n'}
                }
            });
            primMove.promotion = sel;
            //primMove.promotion = 'q'    // Here a real selection should stand!!
        }
        that.currentMove = that.mypgn.addMove(primMove, cur);
        var move = that.mypgn.getMove(that.currentMove);
        if (primMove.promotion) {
            let pieces = {};
            pieces[to] = null;
            board.setPieces(pieces);
            pieces[to] = {color: (move.turn == 'w' ? 'white' : 'black'), role: that.promMappings[primMove.promotion]};
            board.setPieces(pieces);
        }
        if (move.notation.ep) {
            let ep_field = to[0] + from[1];
            let pieces = {};
            pieces[ep_field] = null;
            board.setPieces(pieces);
        }
        if (moveSpan(that.currentMove) === null) {
            generateMove(that.currentMove, null, move, move.prev, document.getElementById(movesId), []);
        }
        unmarkMark(that.currentMove);
        updateUI(that.currentMove);
        let col = move.turn == 'w' ? 'black' : 'white';
        board.set({
            movable: Object.assign({}, board.state.movable, {color: col, dests: possibleMoves(game)}),
            check: game.in_check()
        });
        //makeMove(null, that.currentMove, move.fen);
        let fenView = document.getElementById(fenId);
        if (fenView) {
            fenView.value = move.fen;
        }
        toggleColorMarker();
    };

    // Utility function for generating general HTML elements with id, class (with theme)
    function createEle(kind, id, clazz, my_theme, father) {
        var ele = document.createElement(kind);
        if (id) {
            ele.setAttribute("id", id);
        }
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

    /**
     * Generates all HTML elements needed for display of the (playing) board and
     * the moves. Generates that in dependence of the theme
     */
    var generateHTML = function () {
        // Utility function for generating buttons divs
        function addButton(pair, buttonDiv) {
            var l_theme = (['green', 'blue'].indexOf(theme) >= 0) ? theme : 'default';
            var button = createEle("i", buttonsId + pair[0], "button fa " + pair[1], l_theme, buttonDiv);
            var title = i18next.t("buttons:" + pair[0], {lng: that.configuration.locale});
            document.getElementById(buttonsId + pair[0]).setAttribute("title", title);
            return button;
        }

        // Generates the view buttons (only)
        var generateViewButtons = function (buttonDiv) {
            [["flipper", "fa-adjust"], ["first", "fa-fast-backward"], ["prev", "fa-step-backward"],
                ["next", "fa-step-forward"], ["play", "fa-play-circle"], ["last", "fa-fast-forward"]].forEach(function (entry) {
                addButton(entry, buttonDiv);
            });
        };
        // Generates the edit buttons (only)
        var generateEditButtons = function (buttonDiv) {
            [["promoteVar", "fa-hand-o-up"], ["deleteMoves", "fa-scissors"]].forEach(function (entry) {
                var but = addButton(entry, buttonDiv);
                //but.className = but.className + " gray"; // just a test, worked.
                // only gray out if not usable, check that later.
            });
            [["pgn", "fa-print"], ['nags', 'fa-cog']].forEach(function (entry) {
                var but = addButton(entry, buttonDiv);
            });
        };

        // Generate 3 rows, similar to lichess in studies
        let generateNagMenu = function (nagEle) {
            let generateRow = function (array, rowClass, nagEle) {
                let generateLink = function (link, nagDiv) {
                    let generateIcon = function (icon, myLink) {
                        let ele = createEle('i', null, null, theme, myLink);
                        let i = that.mypgn.NAGS[icon] || '';
                        ele.setAttribute("data-symbol", i);
                        ele.setAttribute("data-value", icon);
                        ele.textContent = i18next.t('nag:$' + icon + "_menu", {lng: that.configuration.locale});
                    };
                    let myLink = createEle('a', null, null, theme, myDiv);
                    generateIcon(link, myLink);
                    myLink.addEventListener("click", function () {
                        function updateMoveSAN(moveIndex) {
                            let move = that.mypgn.getMove(moveIndex);
                            document.querySelector("#" + movesId + moveIndex + " > a").textContent = that.mypgn.sanWithNags(move);
                        }

                        this.classList.toggle("active");
                        let iNode = this.firstChild;
                        that.mypgn.changeNag('$' + iNode.getAttribute('data-value'), that.currentMove, this.classList.contains('active'));
                        updateMoveSAN(that.currentMove);
                    });
                };
                let myDiv = createEle('div', null, rowClass, theme, nagEle);
                array.forEach(ele => generateLink(ele, myDiv));
            };
            generateRow([1, 2, 3, 4, 5, 6, 7, 146], 'nagMove', nagEle);
            generateRow([10, 13, 14, 15, 16, 17, 18, 19], 'nagPosition', nagEle);
            generateRow([22, 40, 36, 132, 136, 32, 44, 140], 'nagObservation', nagEle);
        };
        var generateCommentDiv = function (commentDiv) {
            var radio = createEle("div", null, "commentRadio", theme, commentDiv);
            var mc = createEle("input", null, "moveComment", theme, radio);
            mc.type = "radio";
            mc.value = "move";
            mc.name = "radio";
            createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"));
            var mb = createEle("input", null, "beforeComment", theme, radio);
            mb.type = "radio";
            mb.value = "before";
            mb.name = "radio";
            createEle("label", null, "labelBeforeComment", theme, radio).appendChild(document.createTextNode("Before"));
            var ma = createEle("input", null, "afterComment", theme, radio);
            ma.type = "radio";
            ma.value = "after";
            ma.name = "radio";
            createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"));
            createEle("textarea", null, "comment", theme, commentDiv);
        };
        if (hasMarkup()) {
            if (boardId.header) {
                headersId = boardId.header; // Real header will be built later
                addClass(headersId, 'headers');
            }
            if (boardId.inner) {
                innerBoardId = boardId.inner;
                addClass(innerBoardId, 'board');
            }
            if (boardId.button) {
                buttonsId = boardId.button;
                addClass(buttonsId, 'buttons');
                var buttonsDiv = document.getElementById(buttonsId);
                generateViewButtons(buttonsDiv);
            }
            if (boardId.moves) {
                movesId = boardId.moves;
                addClass(movesId, 'moves');
            }
            if (boardId.editButton) {
                var editButtonsBoardDiv = document.getElementById(boardId.editButton);
                generateEditButtons(editButtonsBoardDiv);
            }
        } else {
            var divBoard = document.getElementById(boardId);
            if (divBoard == null) {
                return;
            } else {
                // ensure that the board is empty before filling it
                while (divBoard.childNodes.length > 0) {
                    divBoard.removeChild(divBoard.childNodes[0]);
                }
            }
            divBoard.classList.add(theme);
            divBoard.classList.add('whole');
            divBoard.setAttribute('tabindex', '0');
            // Add layout for class if configured
            if (that.configuration.layout) {
                divBoard.classList.add('layout-' + that.configuration.layout);
            }
            // Add an error div to show errors
            that.errorDiv = createEle("div", boardId + "Error", 'error', null, divBoard);
            createEle("div", headersId, "headers", theme, divBoard);
            var outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
            let boardAndDiv = createEle('div', null, 'boardAnd', theme, outerInnerBoardDiv);
            if (that.configuration.boardSize) {
                outerInnerBoardDiv.style.width = that.configuration.boardSize;
            }
            if (that.configuration.width || that.configuration.boardSize) {
                let size = that.configuration.width ? that.configuration.width : that.configuration.boardSize;
                //boardAndDiv.style.display = 'grid';
                boardAndDiv.style.gridTemplateColumns = size + ' 40px';
            }
            let topInnerBoardDiv = createEle("div", null, "topInnerBoard", theme, boardAndDiv);
            let topTime = createEle("span", null, "topTime", theme, topInnerBoardDiv);
            var innerBoardDiv = createEle("div", innerBoardId, "board", theme, boardAndDiv);
            let bottomInnerBoardDiv = createEle("div", null, "bottomInnerBoard", theme, boardAndDiv);
            let bottomTime = createEle("div", null, "bottomTime", theme, bottomInnerBoardDiv);
            if (that.configuration.colorMarker && (!hasMode('print'))) {
                createEle("div", colorMarkerId, 'colorMarker' + " " + that.configuration.colorMarker, theme, boardAndDiv);
            }
            if (hasMode('view') || hasMode('edit')) {
                var buttonsBoardDiv = createEle("div", buttonsId, "buttons", theme, outerInnerBoardDiv);
                generateViewButtons(buttonsBoardDiv);
            }
            if ((hasMode('edit') || hasMode('view')) && (that.configuration.showFen)) {
                var fenDiv = createEle("textarea", fenId, "fen", theme, outerInnerBoardDiv);
                addEventListener(fenId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    this.select();
                });
                if (hasMode('edit')) {
                    document.getElementById(fenId).onpaste = function (e) {
                        var pastedData = e.originalEvent.clipboardData.getData('text');
                        // console.log(pastedData);
                        that.configuration.position = pastedData;
                        that.configuration.pgn = '';
                        pgnEdit(boardId, that.configuration);
                    };
                } else {
                    document.getElementById(fenId).readonly = true;
                }
                let fenSize = that.configuration.width ? that.configuration.width : that.configuration.boardSize;
                document.getElementById(fenId).style.width = fenSize;
            }
            if (hasMode('print') || hasMode('view') || hasMode('edit')) {
                // Ensure that moves are scrollable (by styling CSS) when necessary
                // To be scrollable, the height of the element has to be set
                // TODO: Find a way to set the height, if all other parameters denote that it had to be set:
                // scrollable == true; layout == left|right
                var movesDiv = createEle("div", movesId, "moves", null, divBoard);

                if (that.configuration.movesWidth) {
                    movesDiv.style.width = that.configuration.movesWidth;
                }
                else if (that.configuration.width) {
                    movesDiv.style.width = that.configuration.width;
                }
                if (that.configuration.movesHeight) {
                    movesDiv.style.height = that.configuration.movesHeight;
                }
            }
            if (hasMode('edit')) {
                var editButtonsBoardDiv = createEle("div", "edit" + buttonsId, "edit", theme, divBoard);
                generateEditButtons(editButtonsBoardDiv);
//                var outerPgnDiv = createEle("div", "outerpgn" + buttonsId, "outerpgn", theme, outerInnerBoardDiv);
//                var pgnHideButton  = addButton(["hidePGN", "fa-times"], outerPgnDiv);
                let nagMenu = createEle('div', 'nagMenu' + buttonsId, 'nagMenu', theme, divBoard);
                generateNagMenu(nagMenu);
                var pgnDiv = createEle("textarea", "pgn" + buttonsId, "pgn", theme, divBoard);
                var commentBoardDiv = createEle("div", "comment" + buttonsId, "comment", theme, divBoard);
                generateCommentDiv(commentBoardDiv);
                // Bind the paste key ...
                addEventListener("pgn" + buttonsId, 'mousedown', function (e) {
                    e = e || window.event;
                    e.preventDefault();
                    e.target.select();
                });
                document.getElementById("pgn" + buttonsId).onpaste = function (e) {
                    var pastedData = e.originalEvent.clipboardData.getData('text');
                    that.configuration.pgn = pastedData;
                    pgnEdit(boardId, that.configuration);
                };
            }
            var endDiv = createEle("div", null, "endBoard", null, divBoard);
        }
    };

    /**
     * Generate the board that uses the unique innerBoardId and the part of the configuration
     * that is for the board only. Returns the resulting object (as reference for others).
     * @returns {Window.ChessBoard} the board object that may play the moves later
     */
    var generateBoard = function () {
        function copyBoardConfiguration(source, target, keys) {
            //var pieceStyle = source.pieceStyle || 'wikipedia';
            utils.pvEach(keys, function (key) {
                if (typeof source[key] != "undefined") {
                    target[key] = source[key];
                }
            });
        }

        // Default values of the board, if not overwritten by the given configuration
        let boardConfiguration = {coordsInner: true, coordsFactor: 1.0, disableContextMenu: true,
            drawable: {
                onChange: (shapes) => {
                    let move = that.mypgn.getMove(that.currentMove)
                    that.mypgn.setShapes(move, shapes);
                }
            }};

        copyBoardConfiguration(that.configuration, boardConfiguration,
            ['position', 'orientation', 'showCoords', 'pieceTheme', 'draggable',
                'coordsInner', 'coordsFactor', 'width', 'movable', 'viewOnly', 'highlight', 'boardSize',
                'rankFontSize']);
        // board = new ChessBoard(innerBoardId, boardConfiguration);
        // Allow Chessground to be resizable
        boardConfiguration.resizable = true;
        if (typeof boardConfiguration.showCoords != 'undefined') {
            boardConfiguration.coordinates = boardConfiguration.showCoords;
        }
        boardConfiguration.fen = boardConfiguration.position;
        var el = document.getElementById(innerBoardId);
        if (typeof that.configuration.pieceStyle != 'undefined') {
            el.className += " " + that.configuration.pieceStyle;
        }
        if (boardConfiguration.boardSize) {
            boardConfiguration.width = boardConfiguration.boardSize;
        }
        let currentWidth = parseInt(boardConfiguration.width);
        let moduloWidth = currentWidth % 8;
        let smallerWidth = currentWidth - moduloWidth;
        // Ensure that boardWidth is a multiply of 8
        boardConfiguration.width = "" + smallerWidth +"px";
        board = window.Chessground(el, boardConfiguration);
        //console.log("Board width: " + board.width);
        if (boardConfiguration.width) {
            el.style.width = boardConfiguration.width;
            el.style.height = boardConfiguration.width;
            let fontSize = null;
            if (boardConfiguration.rankFontSize) {
                fontSize = boardConfiguration.rankFontSize;
            } else {
                // Set the font size related to the board (factor 28), ensure at least 8px font
                fontSize = Math.max(8, Math.round(parseInt(boardConfiguration.width.slice(0, -2)) / 28 * boardConfiguration.coordsFactor));
            }
            el.style.fontSize = `${fontSize}px`;
            document.body.dispatchEvent(new Event('chessground.resize'));
        }
        if (boardConfiguration.coordsInner) {
            el.classList.add('coords-inner');
        }
        if (hasMode('edit')) {
            game.load(boardConfiguration.position);
            let toMove = (game.turn() == 'w') ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: toMove, dests: possibleMoves(game)}),
                turnColor: toMove, check: game.in_check()
            });
        }
        if (that.configuration.colorMarker) {
            if ( (that.configuration.position != 'start') &&
                (that.configuration.position.split(' ')[1] == 'b') ) {
                let ele = document.getElementById(colorMarkerId);
                if (ele) {
                    ele.classList.add('cm-black');
                }
            }
        }
        return board;
    };

    var moveSpan = function (i) {
        return document.getElementById(movesId + i);
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
    var generateMove = function (currentCounter, game, move, prevCounter, movesDiv, varStack) {
        /**
         * Comments are generated inline, there is no special block rendering
         * possible for them.
         * @param comment the comment to render as span
         * @param clazz class parameter appended to differentiate different comments
         * @returns {HTMLElement} the new created span with the comment as text
         */
        var generateCommentSpan = function (comment, clazz) {
            var span = createEle('span', null, "comment " + clazz);
            if (comment && (typeof comment == "string")) {
                span.appendChild(document.createTextNode(" " + comment + " "));
            }
            return span;
        };

        var append_to_current_div = function (index, span, movesDiv, varStack) {
            if (varStack.length == 0) {
                if (typeof index == "number") {
                    insertAfter(span, moveSpan(index));
                } else {
                    movesDiv.appendChild(span);
                }
            } else {
                varStack[varStack.length - 1].appendChild(span);
            }
        };
        // Ignore null moves
        if (move === null || (move === undefined)) {
            return prevCounter;
        }
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
                moveSpan(varHead).appendChild(varDiv);
                // movesDiv.appendChild(varDiv);
            } else {
                varStack[varStack.length - 1].appendChild(varDiv);
            }
            varStack.push(varDiv);
            //span.appendChild(document.createTextNode(" ( "));
        }
        span.appendChild(generateCommentSpan(move.commentMove, "moveComment"));
        if ((move.turn == 'w') || (that.mypgn.startMainLine(move)) || (that.mypgn.startVariation(move)) || (that.mypgn.afterMoveWithVariation(move))) {
            var mn = move.moveNumber;
            var num = createEle('span', null, "moveNumber", null, span);
            num.appendChild(document.createTextNode("" + mn + ((move.turn == 'w') ? ". " : "... ")));
        }
        span.appendChild(generateCommentSpan(move.commentBefore, "beforeComment"));
        var link = createEle('a', null, null, null, span);
        var san = that.mypgn.sanWithNags(move);
        var text = document.createTextNode(san);
        link.appendChild(text);
        span.appendChild(document.createTextNode(" "));
        if (that.configuration.timeAnnotation != 'none' && move.commentDiag && move.commentDiag.clock) {
            let cl_time = move.commentDiag.clock.value;
            let cl_class = that.configuration.timeAnnotation.class || 'timeNormal';
            let clock_span = generateCommentSpan(cl_time, cl_class);
            if (that.configuration.timeAnnotation.colorClass) {
                clock_span.style = "color: " + that.configuration.timeAnnotation.colorClass;
            }
            span.appendChild(clock_span);
        }
        span.appendChild(generateCommentSpan(move.commentAfter, "afterComment"));
        append_to_current_div(move.prev, span, movesDiv, varStack);
        //movesDiv.appendChild(span);
        if (that.mypgn.endVariation(move)) {
            //span.appendChild(document.createTextNode(" ) "));
            varStack.pop();
        }
        addEventListener(moveSpan(currentCounter), 'click', function (event) {
            makeMove(that.currentMove, currentCounter, move.fen);
            event.stopPropagation();
        });
        if (that.mypgn.has_diagram_nag(move)) {
            var diaID = boardId + "dia" + currentCounter;
            var diaDiv = createEle('div', diaID);
            span.appendChild(diaDiv);
            that.configuration.position = move.fen;
            pgnBoard(diaID, that.configuration);
        }
        return currentCounter;
    };

    /**
     * Unmark all marked moves, mark the next one.
     * @param next the next move number
     */
    function unmarkMark(next) {
        var moveASpan = function (i) {
            return document.querySelector('#' + movesId + i + '> a');
        };

        removeClass(document.querySelector('#' + movesId + " a.yellow"), 'yellow');
        addClass(moveASpan(next), 'yellow');
    }

    /**
     * Check which buttons should be grayed out
     */
    var updateUI = function (next) {
        let elements = document.querySelectorAll("div.buttons .gray");
        utils.pvEach(elements, function (ele) {
            removeClass(ele, 'gray');
        });
        var move = that.mypgn.getMove(next);
        if (next === null) {
            ["prev", "first"].forEach(function (name) {
                addClass(document.querySelector("div.buttons ." + name), 'gray');
            });
        }
        if ((next !== null) && (typeof move.next != "number")) {
            ["next", "play", "last"].forEach(function (name) {
                addClass(document.querySelector("div.buttons ." + name), 'gray');
            });
        }
        // Update the drop-down for NAGs
        try {
            if (move === undefined) {
                return;
            }
            let nagMenu = document.querySelector('#nagMenu' + buttonsId);
            document.querySelectorAll('#nagMenu' + buttonsId + ' a.active').forEach(function (act) {
                act.classList.toggle('active');
            });
            let nags = move.nag || [];
            nags.forEach(function (eachNag) {
                document.querySelector('#nagMenu' + buttonsId + ' [data-value="' + eachNag.substring(1) + '"]')
                    .parentNode.classList.toggle('active');
            });
        } catch (err) {

        }

    };

    /**
     * Plays the move that is already in the notation on the board.
     * @param curr the current move number
     * @param next the move to take now
     * @param fen the fen of the move to make
     */
    var makeMove = function (curr, next, fen) {
        /**
         * Fills the comment field depending on which and if a comment is filled for that move.
         */
        function fillComment(moveNumber) {
            let myMove = that.mypgn.getMove(moveNumber);
            if (!~myMove) return;
            if (myMove.commentAfter) {
                document.querySelector('#' + boardId + " input.afterComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentAfter;
            } else if (myMove.commentBefore) {
                document.querySelector('#' + boardId + " input.beforeComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentBefore;
            } else if (myMove.commentMove) {
                document.querySelector('#' + boardId + " input.moveComment").checked = true;
                document.querySelector('#' + boardId + " textarea.comment").value = myMove.commentMove;
            } else {
                document.querySelector('#' + boardId + " textarea.comment").value = "";
            }
        }

        function handlePromotion(aMove) {
            if (!aMove) return;
            if (aMove.notation.promotion) {
                let promPiece = aMove.notation.promotion.substring(1, 2).toLowerCase();
                let pieces = {};
                pieces[aMove.to] =
                    {
                        role: that.mypgn.PROMOTIONS[promPiece],
                        color: (aMove.turn == 'w' ? 'white' : 'black')
                    };
                board.setPieces(pieces);
            }
        }

        function getShapes(commentDiag) {
            function colOfDiag(color) {
                const colors = {Y: 'yellow', R: 'red', B: 'blue', G: 'green'};
                return colors[color];
            }

            let arr = [];
            if ((commentDiag !== undefined) && (commentDiag !== null)) {
                if (commentDiag.colorArrows) {
                    for (var i = 0; i < commentDiag.colorArrows.length; i++) {
                        let comm = commentDiag.colorArrows[i];
                        arr.push({
                            orig: comm.substring(1, 3),
                            dest: comm.substring(3, 5),
                            brush: colOfDiag(comm.substring(0, 1))
                        });
                    }
                }
                if (commentDiag.colorFields) {
                    for (let i = 0; i < commentDiag.colorFields.length; i++) {
                        let comm = commentDiag.colorFields[i];
                        arr.push({orig: comm.substring(1, 3), brush: colOfDiag(comm.substring(0, 1))});
                    }
                }
            }
            return arr;
        }

        //console.log("Marke move: Curr " + curr + " Next " + next + " FEN " + fen);
        //board.set({fen: fen});
        let myMove = that.mypgn.getMove(next);
        let myFen = myMove ? myMove.fen : fen;
        if (!myFen) { // fen not given, take start position
            myFen = that.configuration.position == 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : that.configuration.position;
        }
        if (myMove) {
            board.set({fen: myFen, lastMove: [myMove.from, myMove.to]});
        } else {
            board.set({fen: myFen, lastMove: []});
        }
        handlePromotion(myMove);
        if (myMove) {
            board.setShapes(getShapes(myMove.commentDiag));
        }
        game.load(myFen);
        unmarkMark(next);
        that.currentMove = next;
        if (next) {
            scrollToView(moveSpan(next));
        }
        if (hasMode('edit')) {
            let col = game.turn() == 'w' ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: col, dests: possibleMoves(game)}),
                turnColor: col, check: game.in_check()
            });
            if (next) {
                fillComment(next);
            }
        } else if (hasMode('view')) {
            let col = game.turn() == 'w' ? 'white' : 'black';
            board.set({
                movable: Object.assign({}, board.state.movable, {color: col}),
                turnColor: col, check: game.in_check()
            });
        }
        let fenView = document.getElementById(fenId);
        if (fenView) {
            fenView.value = fen;
        }
        toggleColorMarker();
        updateUI(next);
    };

    /**
     * Generates the HTML (for the given moves). Includes the following: move number,
     * link to FEN (position after move)
     */
    var generateMoves = function (board) {
        try {
            that.mypgn.load_pgn();
        } catch (err) {
            if (typeof err.location != "undefined") {
                var sta = err.location.start.offset;
                let pgnStr = that.configuration.pgn;
                logError("Offset: " + sta);
                logError("PGN: " + pgnStr);
                logError(err.message);
            } else {
                let pgnStr = that.configuration.pgn;
                logError("PGN: " + pgnStr);
                logError(err);
            }
        }
        //TODO: Move the whole block to `pgn.js` and do the compuation there.
        // This should already be finished after load_pgn
        // if (that.configuration.startPlay && that.configuration.hideMovesBefore) {
        //     let new_fen = that.mypgn.deleteMovesBefore(that.configuration.startPlay);
        //     let new_pgn = that.mypgn.write_pgn();
        //     that.configuration.startPlay = null;
        //     that.configuration.hideMovesBefore = false;
        //     that.configuration.pgn = new_pgn;
        //     that.configuration.position = new_fen;
        //     that.mypgn.load_pgn();
        // }
        let myMoves = that.mypgn.getMoves();
        if (that.configuration.position == 'start') {
            game.reset();
        } else {
            game.load(that.configuration.position);
        }
        if (board !== null) {
            board.set({fen: game.fen()});
        }
        let fenField = document.getElementById(fenId);
        if (utils.pvIsElement(fenField)) {
            fenField.value = game.fen();
        }

        /**
         * Generate a useful notation for the headers, allow for styling. First a version
         * that just works.
         */
        var generateHeaders = function () {
            var headers = that.mypgn.getHeaders();
            if (that.configuration.headers == false || (utils.pvIsEmpty(headers))) {
                let hd = document.getElementById(headersId);
                hd.parentNode.removeChild(hd);
                return;
            }
            var div_h = document.getElementById(headersId);
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
            var appendHeader = function (result, header, separator) {
                if (header) {
                    if (result.length > 0) {
                        result += separator;
                    }
                    result += header;
                }
                return result;
            };
            [headers.Event, headers.Site, headers.Round, headers.Date,
                headers.ECO, headers.Result].forEach(function (header) {
                rest = appendHeader(rest, header, " | ");
            });
            var restSpan = createEle("span", null, "restHeader", theme, div_h);
            restSpan.appendChild(document.createTextNode(rest));

        };

        // Bind the necessary functions to move the pieces.
        var bindFunctions = function () {
            var bind_key = function (key, to_call) {
                var key_ID;
                if (hasMarkup()) {
                    key_ID = "#" + boardId.moves;
                } else {
                    key_ID = "#" + boardId + ",#" + boardId + "Moves";
                }
                var form = document.querySelector(key_ID);
                Mousetrap(form).bind(key, function (evt) {
                    to_call();
                    evt.stopPropagation();
                });
            };
            var nextMove = function () {
                var fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove === null)) {
                    fen = that.mypgn.getMove(0).fen;
                    makeMove(null, 0, fen);
                } else {
                    var next = that.mypgn.getMove(that.currentMove).next;
                    if (typeof next == 'undefined') return;
                    fen = that.mypgn.getMove(next).fen;
                    makeMove(that.currentMove, next, fen);
                }
            };
            var prevMove = function () {
                var fen = null;
                if ((typeof that.currentMove == 'undefined') || (that.currentMove == null)) {
                    /*fen = that.mypgn.getMove(0).fen;
                     makeMove(null, 0, fen);*/
                }
                else {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    if ((typeof prev === 'undefined') || (prev == null)) {
                        firstMove();
                    } else {
                        fen = that.mypgn.getMove(prev).fen;
                        makeMove(that.currentMove, prev, fen);
                    }
                }
            };
            var firstMove = function () {
                makeMove(null, null, null);
            };
            var timer = new Timer(10);
            timer.bind(that.configuration.timerTime, function () {
                nextMove();
            });
            addEventListener(buttonsId + 'flipper', 'click', function () {
                board.toggleOrientation();
            });
            addEventListener(buttonsId + 'next', 'click', function () {
                nextMove();
            });
            addEventListener(buttonsId + 'prev', 'click', function () {
                prevMove();
            });
            addEventListener(buttonsId + 'first', 'click', function () {
                // Goes to the position after the first move.
                // var fen = that.mypgn.getMove(0).fen;
                // makeMove(that.currentMove, 0, fen);
                firstMove();
            });
            addEventListener(buttonsId + 'last', 'click', function () {
                var fen = that.mypgn.getMove(that.mypgn.getMoves().length - 1).fen;
                makeMove(that.currentMove, that.mypgn.getMoves().length - 1, fen);
            });
            let togglePgn = function () {
                var pgnButton = document.getElementById(buttonsId + "pgn");
                var pgnText = document.getElementById(boardId + " .outerpgn");
                document.getElementById(buttonsId + "pgn").classList.toggle('selected');
                if (document.getElementById(buttonsId + "pgn").classList.contains('selected')) {
                    var str = computePgn();
                    showPgn(str);
                    document.querySelector("#" + boardId + " .pgn").style.display = 'block'; //slideDown(700, "linear");
                } else {
                    document.querySelector("#" + boardId + " .pgn").style.display = 'none';
                }
            };
            let toggleNagMenu = function () {
                let nagMenu = document.getElementById(buttonsId + 'nags').classList.toggle('selected');
                if (document.getElementById(buttonsId + 'nags').classList.contains('selected')) {
                    document.getElementById('nagMenu' + buttonsId).style.display = 'flex';
                } else {
                    document.getElementById('nagMenu' + buttonsId).style.display = 'none';
                }
            };
            if (hasMode('edit')) { // only relevant functions for edit mode
                addEventListener(buttonsId + "pgn", 'click', function () {
                    togglePgn();
                });
                addEventListener(buttonsId + 'nags', 'click', function () {
                    toggleNagMenu();
                });
                addEventListener(buttonsId + "deleteMoves", 'click', function () {
                    var prev = that.mypgn.getMove(that.currentMove).prev;
                    var fen = that.mypgn.getMove(prev).fen;
                    that.mypgn.deleteMove(that.currentMove);
                    //document.getElementById(movesId).innerHtml = "";
                    let myNode = document.getElementById(movesId);
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    regenerateMoves(that.mypgn.getMoves());
                    makeMove(null, prev, fen);
                });
                addEventListener(buttonsId + "promoteVar", 'click', function () {
                    let curr = that.currentMove;
                    that.mypgn.promoteMove(that.currentMove);
                    //document.getElementById(movesId).html("");
                    let myNode = document.getElementById(movesId);
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    regenerateMoves(that.mypgn.getOrderedMoves());
                    let fen = that.mypgn.getMove(curr).fen;
                    makeMove(null, that.currentMove, fen);
                });
                document.querySelector('#' + boardId + ' .pgn').style.display = 'none';
                document.querySelector('#comment' + buttonsId + " textarea.comment").onchange = function () {
                    function commentText() {
                        return " " + document.querySelector('#' + 'comment' + buttonsId + " textarea.comment").value + " ";
                    }

                    let text = commentText();
                    let checked = document.querySelector('#' + "comment" + buttonsId + " :checked");
                    checked = checked ? checked.value : "after";
                    moveSpan(that.currentMove).querySelector("." + checked + "Comment").textContent = text;
                    if (checked === "after") {
                        that.mypgn.getMove(that.currentMove).commentAfter = text;
                    } else if (checked === "before") {
                        that.mypgn.getMove(that.currentMove).commentBefore = text;
                    } else if (checked === "move") {
                        that.mypgn.getMove(that.currentMove).commentMove = text;
                    }
                };
                var rad = ["moveComment", "beforeComment", "afterComment"];
                var prevComment = null;
                for (var i = 0; i < rad.length; i++) {
                    document.querySelector('#' + 'comment' + buttonsId + " ." + rad[i]).onclick = function () {
                        var checked = this.value;
                        var text;
                        if (checked === "after") {
                            text = that.mypgn.getMove(that.currentMove).commentAfter;
                        } else if (checked === "before") {
                            text = that.mypgn.getMove(that.currentMove).commentBefore;
                        } else if (checked === "move") {
                            text = that.mypgn.getMove(that.currentMove).commentMove;
                        }
                        document.querySelector('#' + boardId + " textarea.comment").value = text;
                    };
                }
            }

            function togglePlay() {
                timer.running() ? timer.stop() : timer.start();
                var playButton = document.getElementById(buttonsId + 'play');
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
            //bind_key("space", togglePlay);
            addEventListener(buttonsId + 'play', 'click', function () {
                togglePlay();
            });

        };

        var computePgn = function () {
            return that.mypgn.write_pgn();
        };

        var showPgn = function (val) {
            document.getElementById('pgn' + buttonsId).textContent = val;
        };

        /**
         * Regenerate the moves div, may be used the first time (DIV is empty)
         * or later (moves have changed).
         */
        var regenerateMoves = function (myMoves) {
            var movesDiv = document.getElementById(movesId);
            var prev = null;
            var varStack = [];
            var firstMove = 0;
            for (var i = firstMove; i < myMoves.length; i++) {
                if (!that.mypgn.isDeleted(i)) {
                    var move = myMoves[i];
                    prev = generateMove(move.index, game, move, prev, movesDiv, varStack);
                }
            }
        };
        regenerateMoves(myMoves);
        bindFunctions();
        generateHeaders();

        /**
         * Allows to add functions after having generated the moves. Used currently for setting start position.
         */
        function postGenerateMoves() {
            if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
                let move = that.mypgn.findMove(that.configuration.startPlay)
                if (move === undefined) {
                    logError('Could not find startPlay: ' + that.configuration.startPlay);
                    return;
                }
                makeMove(move.prev, move.index, move.fen);
                unmarkMark(move.index);
            }

            if (that.configuration.showResult) {
                // find the result from the header
                let endGame = that.mypgn.getEndGame();
                // Insert it as new span
                let span = createEle("span", movesId + "Result", "move", theme,
                    document.getElementById(movesId));
                span.innerHTML = endGame ? endGame : "*";

            }
        }

        postGenerateMoves();
    };
    let ret = {
        // PUBLIC API
        chess: game,
        board: board,
        getPgn: function () {
            return that.mypgn;
        },
        generateHTML: generateHTML,
        generateBoard: generateBoard,
        generateMoves: generateMoves,
        onSnapEnd: onSnapEnd
    };
    window.pgnTestRegistry[boardId] = ret;
    return ret;
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
var pgnView = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale,
        () => {
            var base = pgnBase(boardId, Object.assign({mode: 'view'}, configuration));
            base.generateHTML();
            var b = base.generateBoard();
            base.generateMoves(b);
        });
};

/**
 * Defines a utility function just to display a board (only). There are some similar
 * parameters to `pgnView`, but some are not necessary.
 * @param boardId needed for the inclusion of the board itself
 * @param configuration object with the attributes:
 *  position: 'start' or FEN string
 *  orientation: 'black' or 'white' (default)
 *  showCoords: false or true (default)
 *  pieceStyle: some of alpha, uscf, wikipedia (from chessboardjs) or
 *              merida (default), case, leipzip, maya, condal (from ChessTempo)
 *              or chesscom (from chess.com) (as string)
 *  pieceTheme: allows to adapt the path to the pieces, default is 'img/chesspieces/alpha/{piece}.png'
 *          Normally not changed by clients
 *  theme: (only CSS related) some of zeit, blue, chesscom, ... (as string)
 */
var pgnBoard = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign({headers: false, mode: 'board'}, configuration));
        base.generateHTML();
        let b = base.generateBoard();
        return {
            chess: base.chess,
            board: b
        };
    });
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
var pgnEdit = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign(
            {
                showFen: true, mode: 'edit',
                movable: {
                    free: false,
                    events: {
                        after: function (orig, dest, meta) {
                            base.onSnapEnd(orig, dest, meta);
                        }
                    }
                },
                viewOnly: false
            },
            configuration));
        base.generateHTML();
        let board = base.generateBoard();
        base.generateMoves(board);
    });
};

/**
 * Defines a utility function to get a printable version of a game, enriched
 * by diagrams, comments, ... Does  not allow to replay the game (no buttons),
 * disables all editing functionality.
 * @param boardId the unique ID of the board (per HTML page)
 * @param configuration the configuration, mainly here the board style and position.
 * Rest will be ignored.
 */
var pgnPrint = function (boardId, configuration) {
    GLOB_SCHED.schedule(configuration.locale, () => {
        let base = pgnBase(boardId, Object.assign({showCoords: false, mode: 'print'}, configuration));
        base.generateHTML();
        base.generateMoves(null);
    });
};

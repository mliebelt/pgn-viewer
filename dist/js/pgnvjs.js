/*
 * Copyright (c) 2016, Jeff Hlywa (jhlywa@gmail.com)
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
 * Copyright (c) 2016, Jeff Hlywa (jhlywa@gmail.com)
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

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
      {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
      {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  var board = new Array(128);
  var kings = {w: EMPTY, b: EMPTY};
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

  function clear() {
    board = new Array(128);
    kings = {w: EMPTY, b: EMPTY};
    turn = WHITE;
    castling = {w: 0, b: 0};
    ep_square = EMPTY;
    half_moves = 0;
    move_number = 1;
    history = [];
    header = {};
    update_setup(generate_fen());
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  function load(fen) {
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;

    if (!validate_fen(fen).valid) {
      return false;
    }

    clear();

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

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE;
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
    if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
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
    if (castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

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

  function build_move(board, from, to, flags, promotion) {
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

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
      move.captured = PAWN;
    }
    return move;
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (board[from].type === PAWN &&
          (rank(to) === RANK_8 || rank(to) === RANK_1)) {
        var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
        for (var i = 0, len = pieces.length; i < len; i++) {
          moves.push(build_move(board, from, to, flags, pieces[i]));
        }
      } else {
        moves.push(build_move(board, from, to, flags));
      }
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
        var castling_from = kings[us];
        var castling_to = castling_from + 2;

        if (board[castling_from + 1] == null &&
            board[castling_to]       == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us] , castling_to,
              BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from - 2;

        if (board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us], castling_to,
              BITS.QSIDE_CASTLE);
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
        var castling_from = move.to + 1;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      /* turn off castling */
      castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag) {
          castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag) {
          castling[them] ^= ROOKS[them][i].flag;
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
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      board[castling_to] = board[castling_from];
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
        if (!(('FEN' in headers) && load(headers['FEN']))) {
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
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).Chessground=e()}}(function(){return function e(t,r,n){function o(a,s){if(!r[a]){if(!t[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(i)return i(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var l=r[a]={exports:{}};t[a][0].call(l.exports,function(e){var r=t[a][1][e];return o(r||e)},l,l.exports,e,t,r,n)}return r[a].exports}for(var i="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({1:[function(e,t,r){"use strict";function n(e,t){var r=e(t);return t.dom.redraw(),r}function o(e,t){return{key:e,pos:c.key2pos(e),piece:t}}function i(e,t){var r=e.animation.current;if(void 0!==r){var n=1-(t-r.start)*r.frequency;if(n<=0)e.animation.current=void 0,e.dom.redrawNow();else{var o=function(e){return e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1}(n);for(var a in r.plan.anims){var s=r.plan.anims[a];s[2]=s[0]*o,s[3]=s[1]*o}e.dom.redrawNow(!0),c.raf(function(t){return void 0===t&&(t=u.now()),i(e,t)})}}else e.dom.destroyed||e.dom.redrawNow()}function a(e){for(var t in e)return!1;return!0}var s=this&&this.__assign||Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++){t=arguments[r];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e};Object.defineProperty(r,"__esModule",{value:!0});var c=e("./util");r.anim=function(e,t){return t.animation.enabled?function(e,t){var r=s({},t.pieces),n=e(t),l=function(e,t){var r,n,i,a,s={},u=[],l={},d=[],f=[],p={};for(i in e)p[i]=o(i,e[i]);for(var v=0,g=c.allKeys;v<g.length;v++){var h=g[v];r=t.pieces[h],n=p[h],r?n?c.samePiece(r,n.piece)||(d.push(n),f.push(o(h,r))):f.push(o(h,r)):n&&d.push(n)}return f.forEach(function(e){(n=function(t,r){return d.filter(function(t){return c.samePiece(e.piece,t.piece)}).sort(function(e,r){return c.distanceSq(t.pos,e.pos)-c.distanceSq(t.pos,r.pos)})[0]}(e))&&(a=[n.pos[0]-e.pos[0],n.pos[1]-e.pos[1]],s[e.key]=a.concat(a),u.push(n.key))}),d.forEach(function(e){c.containsX(u,e.key)||t.items&&t.items(e.pos,e.key)||(l[e.key]=e.piece)}),{anims:s,fadings:l}}(r,t);if(a(l.anims)&&a(l.fadings))t.dom.redraw();else{var d=t.animation.current&&t.animation.current.start;t.animation.current={start:u.now(),frequency:1/t.animation.duration,plan:l},d||i(t,u.now())}return n}(e,t):n(e,t)},r.render=n;var u=void 0!==window.performance?window.performance:Date},{"./util":17}],2:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("./board"),o=e("./fen"),i=e("./config"),a=e("./anim"),s=e("./drag"),c=e("./explosion");r.start=function(e,t){function r(){n.toggleOrientation(e),t()}return{set:function(t){t.orientation&&t.orientation!==e.orientation&&r(),(t.fen?a.anim:a.render)(function(e){return i.configure(e,t)},e)},state:e,getFen:function(){return o.write(e.pieces)},toggleOrientation:r,setPieces:function(t){a.anim(function(e){return n.setPieces(e,t)},e)},selectSquare:function(t,r){t?a.anim(function(e){return n.selectSquare(e,t,r)},e):e.selected&&(n.unselect(e),e.dom.redraw())},move:function(t,r){a.anim(function(e){return n.baseMove(e,t,r)},e)},newPiece:function(t,r){a.anim(function(e){return n.baseNewPiece(e,t,r)},e)},playPremove:function(){if(e.premovable.current){if(a.anim(n.playPremove,e))return!0;e.dom.redraw()}return!1},playPredrop:function(t){if(e.predroppable.current){var r=n.playPredrop(e,t);return e.dom.redraw(),r}return!1},cancelPremove:function(){a.render(n.unsetPremove,e)},cancelPredrop:function(){a.render(n.unsetPredrop,e)},cancelMove:function(){a.render(function(e){n.cancelMove(e),s.cancel(e)},e)},stop:function(){a.render(function(e){n.stop(e),s.cancel(e)},e)},explode:function(t){c.default(e,t)},setAutoShapes:function(t){a.render(function(e){return e.drawable.autoShapes=t},e)},setShapes:function(t){a.render(function(e){return e.drawable.shapes=t},e)},getKeyAtDomPos:function(t){return n.getKeyAtDomPos(t,"white"===e.orientation,e.dom.bounds())},redrawAll:t,dragNewPiece:function(t,r,n){s.dragNewPiece(e,t,r,n)},destroy:function(){n.stop(e),e.dom.unbind&&e.dom.unbind(),e.dom.destroyed=!0}}}},{"./anim":1,"./board":3,"./config":5,"./drag":6,"./explosion":9,"./fen":10}],3:[function(e,t,r){"use strict";function n(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];e&&setTimeout(function(){return e.apply(void 0,t)},1)}function o(e){e.premovable.current&&(e.premovable.current=void 0,n(e.premovable.events.unset))}function i(e){var t=e.predroppable;t.current&&(t.current=void 0,n(t.events.unset))}function a(e,t,r){if(t===r||!e.pieces[t])return!1;var o=e.pieces[r]&&e.pieces[r].color!==e.pieces[t].color?e.pieces[r]:void 0;return r==e.selected&&d(e),n(e.events.move,t,r,o),function(e,t,r){if(!e.autoCastle)return!1;var n=e.pieces[t];if("king"!==n.role)return!1;var o=h.key2pos(t);if(5!==o[0])return!1;if(1!==o[1]&&8!==o[1])return!1;var i,a,s,c=h.key2pos(r);if(7===c[0]||8===c[0])i=h.pos2key([8,o[1]]),a=h.pos2key([6,o[1]]),s=h.pos2key([7,o[1]]);else{if(3!==c[0]&&1!==c[0])return!1;i=h.pos2key([1,o[1]]),a=h.pos2key([4,o[1]]),s=h.pos2key([3,o[1]])}var u=e.pieces[i];return"rook"===u.role&&(delete e.pieces[t],delete e.pieces[i],e.pieces[s]=n,e.pieces[a]=u,!0)}(e,t,r)||(e.pieces[r]=e.pieces[t],delete e.pieces[t]),e.lastMove=[t,r],e.check=void 0,n(e.events.change),o||!0}function s(e,t,r,o){if(e.pieces[r]){if(!o)return!1;delete e.pieces[r]}return n(e.events.dropNewPiece,t,r),e.pieces[r]=t,e.lastMove=[r],e.check=void 0,n(e.events.change),e.movable.dests=void 0,e.turnColor=h.opposite(e.turnColor),!0}function c(e,t,r){var n=a(e,t,r);return n&&(e.movable.dests=void 0,e.turnColor=h.opposite(e.turnColor),e.animation.current=void 0),n}function u(e,t,r){if(p(e,t,r)){var o=c(e,t,r);if(o){var a=e.hold.stop();d(e);var s={premove:!1,ctrlKey:e.stats.ctrlKey,holdTime:a};return!0!==o&&(s.captured=o),n(e.movable.events.after,t,r,s),!0}}else!function(e,t,r){return t!==r&&v(e,t)&&h.containsX(b.default(e.pieces,t,e.premovable.castle),r)}(e,t,r)?f(e,r)||v(e,r)?(l(e,r),e.hold.start()):d(e):(!function(e,t,r,o){i(e),e.premovable.current=[t,r],n(e.premovable.events.set,t,r,o)}(e,t,r,{ctrlKey:e.stats.ctrlKey}),d(e));return!1}function l(e,t){e.selected=t,v(e,t)?e.premovable.dests=b.default(e.pieces,t,e.premovable.castle):e.premovable.dests=void 0}function d(e){e.selected=void 0,e.premovable.dests=void 0,e.hold.cancel()}function f(e,t){var r=e.pieces[t];return r&&("both"===e.movable.color||e.movable.color===r.color&&e.turnColor===r.color)}function p(e,t,r){return t!==r&&f(e,t)&&(e.movable.free||!!e.movable.dests&&h.containsX(e.movable.dests[t],r))}function v(e,t){var r=e.pieces[t];return r&&e.premovable.enabled&&e.movable.color===r.color&&e.turnColor!==r.color}function g(e){o(e),i(e),d(e)}Object.defineProperty(r,"__esModule",{value:!0});var h=e("./util"),b=e("./premove");r.callUserFunction=n,r.toggleOrientation=function(e){e.orientation=h.opposite(e.orientation),e.animation.current=e.draggable.current=e.selected=void 0},r.reset=function(e){e.lastMove=void 0,d(e),o(e),i(e)},r.setPieces=function(e,t){for(var r in t){var n=t[r];n?e.pieces[r]=n:delete e.pieces[r]}},r.setCheck=function(e,t){if(!0===t&&(t=e.turnColor),t)for(var r in e.pieces)"king"===e.pieces[r].role&&e.pieces[r].color===t&&(e.check=r);else e.check=void 0},r.unsetPremove=o,r.unsetPredrop=i,r.baseMove=a,r.baseNewPiece=s,r.userMove=u,r.dropNewPiece=function(e,t,r,a){if(function(e,t,r){var n=e.pieces[t];return n&&r&&(t===r||!e.pieces[r])&&("both"===e.movable.color||e.movable.color===n.color&&e.turnColor===n.color)}(e,t,r)||a){var c=e.pieces[t];delete e.pieces[t],s(e,c,r,a),n(e.movable.events.afterNewPiece,c.role,r,{predrop:!1})}else!function(e,t,r){var n=e.pieces[t];return n&&r&&(!e.pieces[r]||e.pieces[r].color!==e.movable.color)&&e.predroppable.enabled&&("pawn"!==n.role||"1"!==r[1]&&"8"!==r[1])&&e.movable.color===n.color&&e.turnColor!==n.color}(e,t,r)?(o(e),i(e)):function(e,t,r){o(e),e.predroppable.current={role:t,key:r},n(e.predroppable.events.set,t,r)}(e,e.pieces[t].role,r);delete e.pieces[t],d(e)},r.selectSquare=function(e,t,r){e.selected?e.selected!==t||e.draggable.enabled?(e.selectable.enabled||r)&&e.selected!==t?u(e,e.selected,t)&&(e.stats.dragged=!1):e.hold.start():(d(e),e.hold.cancel()):(f(e,t)||v(e,t))&&(l(e,t),e.hold.start()),n(e.events.select,t)},r.setSelected=l,r.unselect=d,r.canMove=p,r.isDraggable=function(e,t){var r=e.pieces[t];return r&&e.draggable.enabled&&("both"===e.movable.color||e.movable.color===r.color&&(e.turnColor===r.color||e.premovable.enabled))},r.playPremove=function(e){var t=e.premovable.current;if(!t)return!1;var r=t[0],i=t[1],a=!1;if(p(e,r,i)){var s=c(e,r,i);if(s){var u={premove:!0};!0!==s&&(u.captured=s),n(e.movable.events.after,r,i,u),a=!0}}return o(e),a},r.playPredrop=function(e,t){var r=e.predroppable.current,o=!1;if(!r)return!1;t(r)&&s(e,{role:r.role,color:e.movable.color},r.key)&&(n(e.movable.events.afterNewPiece,r.role,r.key,{predrop:!0}),o=!0);return i(e),o},r.cancelMove=g,r.stop=function(e){e.movable.color=e.movable.dests=e.animation.current=void 0,g(e)},r.getKeyAtDomPos=function(e,t,r){var n=Math.ceil((e[0]-r.left)/r.width*8);t||(n=9-n);var o=Math.ceil(8-(e[1]-r.top)/r.height*8);return t||(o=9-o),n>0&&n<9&&o>0&&o<9?h.pos2key([n,o]):void 0}},{"./premove":12,"./util":17}],4:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("./api"),o=e("./config"),i=e("./state"),a=e("./wrap"),s=e("./events"),c=e("./render"),u=e("./svg"),l=e("./util");r.Chessground=function(e,t){function r(){var t=d.dom&&d.dom.unbind;e.classList.add("cg-board-wrap");var n=l.memo(function(){return e.getBoundingClientRect()}),o=d.viewOnly&&!d.drawable.visible,i=a.default(e,d,o?void 0:n()),f=function(e){c.default(d),!e&&i.svg&&u.renderSvg(d,i.svg)};d.dom={elements:i,bounds:n,redraw:function(e){var t=!1;return function(){t||(t=!0,l.raf(function(){e(),t=!1}))}}(f),redrawNow:f,unbind:t,relative:o},d.drawable.prevSvgHash="",f(!1),s.bindBoard(d),t||(d.dom.unbind=s.bindDocument(d,r))}var d=i.defaults();return o.configure(d,t||{}),r(),n.start(d,r)}},{"./api":2,"./config":5,"./events":8,"./render":13,"./state":14,"./svg":15,"./util":17,"./wrap":18}],5:[function(e,t,r){"use strict";function n(e,t){for(var r in t)o(e[r])&&o(t[r])?n(e[r],t[r]):e[r]=t[r]}function o(e){return"object"==typeof e}Object.defineProperty(r,"__esModule",{value:!0});var i=e("./board"),a=e("./fen");r.configure=function(e,t){if(t.movable&&t.movable.dests&&(e.movable.dests=void 0),n(e,t),t.fen&&(e.pieces=a.read(t.fen),e.drawable.shapes=[]),t.hasOwnProperty("check")&&i.setCheck(e,t.check||!1),t.hasOwnProperty("lastMove")&&!t.lastMove?e.lastMove=void 0:t.lastMove&&(e.lastMove=t.lastMove),e.selected&&i.setSelected(e,e.selected),(!e.animation.duration||e.animation.duration<100)&&(e.animation.enabled=!1),!e.movable.rookCastle&&e.movable.dests){var r="white"===e.movable.color?1:8,o="e"+r,s=e.movable.dests[o];if(!s||"king"!==e.pieces[o].role)return;e.movable.dests[o]=s.filter(function(e){return!(e==="a"+r&&-1!==s.indexOf("c"+r)||e==="h"+r&&-1!==s.indexOf("g"+r))})}}},{"./board":3,"./fen":10}],6:[function(e,t,r){"use strict";function n(e){u.raf(function(){var t=e.draggable.current;if(t){e.animation.current&&e.animation.current.plan.anims[t.orig]&&(e.animation.current=void 0);var r=e.pieces[t.orig];if(r&&u.samePiece(r,t.piece)){if(!t.started&&u.distanceSq(t.epos,t.rel)>=Math.pow(e.draggable.distance,2)&&(t.started=!0),t.started){if("function"==typeof t.element){var i=t.element();if(!i)return;t.element=i,t.element.cgDragging=!0,t.element.classList.add("dragging")}var a="white"===e.orientation,s=e.dom.bounds();t.pos=[t.epos[0]-t.rel[0],t.epos[1]-t.rel[1]];var c=u.posToTranslateAbs(s)(t.origPos,a);c[0]+=t.pos[0]+t.dec[0],c[1]+=t.pos[1]+t.dec[1],u.translateAbs(t.element,c)}}else o(e);n(e)}})}function o(e){var t=e.draggable.current;t&&(t.newPiece&&delete e.pieces[t.orig],e.draggable.current=void 0,c.unselect(e),i(e),e.dom.redraw())}function i(e){var t=e.dom.elements;t.ghost&&u.setVisible(t.ghost,!1)}function a(e,t,r){var n=u.key2pos(e);return t||(n[0]=9-n[0],n[1]=9-n[1]),{left:r.left+r.width*(n[0]-1)/8,top:r.top+r.height*(8-n[1])/8,width:r.width/8,height:r.height/8}}function s(e,t){for(var r=e.dom.elements.board.firstChild;r;){if(r.cgKey===t&&"PIECE"===r.tagName)return r;r=r.nextSibling}}Object.defineProperty(r,"__esModule",{value:!0});var c=e("./board"),u=e("./util"),l=e("./draw"),d=e("./anim");r.start=function(e,t){if(!(void 0!==t.button&&0!==t.button||t.touches&&t.touches.length>1)){t.preventDefault();var r="white"===e.orientation,o=e.dom.bounds(),i=u.eventPosition(t),f=c.getKeyAtDomPos(i,r,o);if(f){var p=e.pieces[f],v=e.selected;v||!e.drawable.enabled||!e.drawable.eraseOnClick&&p&&p.color===e.turnColor||l.clear(e);var g=!!e.premovable.current,h=!!e.predroppable.current;e.stats.ctrlKey=t.ctrlKey,e.selected&&c.canMove(e,e.selected,f)?d.anim(function(e){return c.selectSquare(e,f)},e):c.selectSquare(e,f);var b=e.selected===f,m=s(e,f);if(p&&m&&b&&c.isDraggable(e,f)){var y=a(f,r,o);e.draggable.current={orig:f,origPos:u.key2pos(f),piece:p,rel:i,epos:i,pos:[0,0],dec:e.draggable.centerPiece?[i[0]-(y.left+y.width/2),i[1]-(y.top+y.height/2)]:[0,0],started:e.draggable.autoDistance&&e.stats.dragged,element:m,previouslySelected:v,originTarget:t.target},m.cgDragging=!0,m.classList.add("dragging");var w=e.dom.elements.ghost;w&&(w.className="ghost "+p.color+" "+p.role,u.translateAbs(w,u.posToTranslateAbs(o)(u.key2pos(f),r)),u.setVisible(w,!0)),n(e)}else g&&c.unsetPremove(e),h&&c.unsetPredrop(e);e.dom.redraw()}}},r.dragNewPiece=function(e,t,r,o){e.pieces.a0=t,e.dom.redraw();var i=u.eventPosition(r),c="white"===e.orientation,l=e.dom.bounds(),d=a("a0",c,l),f=[(c?0:7)*d.width+l.left,(c?8:-1)*d.height+l.top];e.draggable.current={orig:"a0",origPos:u.key2pos("a0"),piece:t,rel:f,epos:i,pos:[i[0]-f[0],i[1]-f[1]],dec:[-d.width/2,-d.height/2],started:!0,element:function(){return s(e,"a0")},originTarget:r.target,newPiece:!0,force:o||!1},n(e)},r.move=function(e,t){e.draggable.current&&(!t.touches||t.touches.length<2)&&(e.draggable.current.epos=u.eventPosition(t))},r.end=function(e,t){var r=e.draggable.current;if(r)if("touchend"!==t.type||!r||r.originTarget===t.target||r.newPiece){c.unsetPremove(e),c.unsetPredrop(e);var n=u.eventPosition(t)||r.epos,o=c.getKeyAtDomPos(n,"white"===e.orientation,e.dom.bounds());o&&r.started?r.newPiece?c.dropNewPiece(e,r.orig,o,r.force):(e.stats.ctrlKey=t.ctrlKey,c.userMove(e,r.orig,o)&&(e.stats.dragged=!0)):r.newPiece?delete e.pieces[r.orig]:e.draggable.deleteOnDropOff&&(delete e.pieces[r.orig],c.callUserFunction(e.events.change)),!r||r.orig!==r.previouslySelected||r.orig!==o&&o?e.selectable.enabled||c.unselect(e):c.unselect(e),i(e),e.draggable.current=void 0,e.dom.redraw()}else e.draggable.current=void 0},r.cancel=o},{"./anim":1,"./board":3,"./draw":7,"./util":17}],7:[function(e,t,r){"use strict";function n(e){s.raf(function(){var t=e.drawable.current;if(t){var r=a.getKeyAtDomPos(t.pos,"white"===e.orientation,e.dom.bounds());r!==t.mouseSq&&(t.mouseSq=r,t.dest=r!==t.orig?r:void 0,e.dom.redrawNow()),n(e)}})}function o(e){e.drawable.current&&(e.drawable.current=void 0,e.dom.redraw())}function i(e){e.onChange&&e.onChange(e.shapes)}Object.defineProperty(r,"__esModule",{value:!0});var a=e("./board"),s=e("./util"),c=["green","red","blue","yellow"];r.start=function(e,t){if(!(t.touches&&t.touches.length>1)){t.stopPropagation(),t.preventDefault(),a.cancelMove(e);var r=s.eventPosition(t),o=a.getKeyAtDomPos(r,"white"===e.orientation,e.dom.bounds());o&&(e.drawable.current={orig:o,pos:r,brush:function(e){var t=e.shiftKey&&s.isRightButton(e)?1:0,r=e.altKey?2:0;return c[t+r]}(t)},n(e))}},r.processDraw=n,r.move=function(e,t){e.drawable.current&&(e.drawable.current.pos=s.eventPosition(t))},r.end=function(e){var t=e.drawable.current;t&&(t.mouseSq&&function(e,t){var r=function(e){return e.orig===t.orig&&e.dest===t.dest},n=e.shapes.filter(r)[0];n&&(e.shapes=e.shapes.filter(function(e){return function(t){return!e(t)}}(r))),n&&n.brush===t.brush||e.shapes.push(t),i(e)}(e.drawable,t),o(e))},r.cancel=o,r.clear=function(e){e.drawable.shapes.length&&(e.drawable.shapes=[],e.dom.redraw(),i(e.drawable))}},{"./board":3,"./util":17}],8:[function(e,t,r){"use strict";function n(e,t,r,n){return e.addEventListener(t,r,n),function(){return e.removeEventListener(t,r)}}function o(e,t,r){return function(n){n.shiftKey||s.isRightButton(n)?e.drawable.enabled&&r(e,n):e.viewOnly||t(e,n)}}Object.defineProperty(r,"__esModule",{value:!0});var i=e("./drag"),a=e("./draw"),s=e("./util");r.bindBoard=function(e){if(!e.viewOnly){var t=e.dom.elements.board,r=function(e){return function(t){e.draggable.current?i.cancel(e):e.drawable.current?a.cancel(e):t.shiftKey||s.isRightButton(t)?e.drawable.enabled&&a.start(e,t):e.viewOnly||i.start(e,t)}}(e);t.addEventListener("touchstart",r),t.addEventListener("mousedown",r),(e.disableContextMenu||e.drawable.enabled)&&t.addEventListener("contextmenu",function(e){return e.preventDefault()})}},r.bindDocument=function(e,t){var r=[];!e.dom.relative&&e.resizable&&r.push(n(document.body,"chessground.resize",function(){e.dom.bounds.clear(),s.raf(t)}));if(!e.viewOnly){var c=o(e,i.move,a.move),u=o(e,i.end,a.end);["touchmove","mousemove"].forEach(function(e){return r.push(n(document,e,c))}),["touchend","mouseup"].forEach(function(e){return r.push(n(document,e,u))});var l=function(){return e.dom.bounds.clear()};r.push(n(window,"scroll",l,{passive:!0})),r.push(n(window,"resize",l,{passive:!0}))}return function(){return r.forEach(function(e){return e()})}}},{"./drag":6,"./draw":7,"./util":17}],9:[function(e,t,r){"use strict";function n(e,t){e.exploding&&(t?e.exploding.stage=t:e.exploding=void 0,e.dom.redraw())}Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(e,t){e.exploding={stage:1,keys:t},e.dom.redraw(),setTimeout(function(){n(e,2),setTimeout(function(){return n(e,void 0)},120)},120)}},{}],10:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("./util"),o=e("./types");r.initial="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";var i={p:"pawn",r:"rook",n:"knight",b:"bishop",q:"queen",k:"king"},a={pawn:"p",rook:"r",knight:"n",bishop:"b",queen:"q",king:"k"};r.read=function(e){"start"===e&&(e=r.initial);for(var t={},o=8,a=0,s=0,c=e;s<c.length;s++){var u=c[s];switch(u){case" ":return t;case"/":if(0==--o)return t;a=0;break;case"~":t[n.pos2key([a,o])].promoted=!0;break;default:var l=u.charCodeAt(0);if(l<57)a+=l-48;else{++a;var d=u.toLowerCase();t[n.pos2key([a,o])]={role:i[d],color:u===d?"black":"white"}}}}return t},r.write=function(e){var t,r;return n.invRanks.map(function(i){return o.ranks.map(function(o){return(t=e[n.pos2key([o,i])])?(r=a[t.role],"white"===t.color?r.toUpperCase():r):"1"}).join("")}).join("/").replace(/1{2,}/g,function(e){return e.length.toString()})}},{"./types":16,"./util":17}],11:[function(e,t,r){t.exports=e("./chessground").Chessground},{"./chessground":4}],12:[function(e,t,r){"use strict";function n(e,t){return Math.abs(e-t)}Object.defineProperty(r,"__esModule",{value:!0});var o=e("./util"),i=function(e,t,r,o){var i=n(e,r),a=n(t,o);return 1===i&&2===a||2===i&&1===a},a=function(e,t,r,o){return n(e,r)===n(t,o)},s=function(e,t,r,n){return e===r||t===n},c=function(e,t,r,n){return a(e,t,r,n)||s(e,t,r,n)};r.default=function(e,t,r){var u,l=e[t],d=o.key2pos(t);switch(l.role){case"pawn":u=function(e){return function(t,r,o,i){return n(t,o)<2&&("white"===e?i===r+1||r<=2&&i===r+2&&t===o:i===r-1||r>=7&&i===r-2&&t===o)}}(l.color);break;case"knight":u=i;break;case"bishop":u=a;break;case"rook":u=s;break;case"queen":u=c;break;case"king":u=function(e,t,r){return function(i,a,s,c){return n(i,s)<2&&n(a,c)<2||r&&a===c&&a===("white"===e?1:8)&&(5===i&&(3===s||7===s)||o.containsX(t,s))}}(l.color,function(e,t){var r;return Object.keys(e).filter(function(n){return(r=e[n])&&r.color===t&&"rook"===r.role}).map(function(e){return o.key2pos(e)[0]})}(e,l.color),r)}return o.allKeys.map(o.key2pos).filter(function(e){return(d[0]!==e[0]||d[1]!==e[1])&&u(d[0],d[1],e[0],e[1])}).map(o.pos2key)}},{"./util":17}],13:[function(e,t,r){"use strict";function n(e,t){for(var r in t)e.dom.elements.board.removeChild(t[r])}function o(e,t){var r=2+8*(e[1]-1)+(8-e[0]);return t&&(r=67-r),r+""}function i(e){return e.color+" "+e.role}function a(e,t,r){e[t]?e[t]+=" "+r:e[t]=r}Object.defineProperty(r,"__esModule",{value:!0});var s=e("./util"),c=e("./util");r.default=function(e){var t,r,u,l,d,f,p,v,g,h,b,m="white"===e.orientation,y=e.dom.relative?c.posToTranslateRel:c.posToTranslateAbs(e.dom.bounds()),w=e.dom.relative?c.translateRel:c.translateAbs,k=e.dom.elements.board,P=e.pieces,M=e.animation.current,C=M?M.plan.anims:{},O=M?M.plan.fadings:{},x=e.draggable.current,_=function(e){var t,r,n={};if(e.lastMove&&e.highlight.lastMove)for(t in e.lastMove)a(n,e.lastMove[t],"last-move");if(e.check&&e.highlight.check&&a(n,e.check,"check"),e.selected&&(a(n,e.selected,"selected"),e.movable.showDests)){var o=e.movable.dests&&e.movable.dests[e.selected];if(o)for(t in o)r=o[t],a(n,r,"move-dest"+(e.pieces[r]?" oc":""));var i=e.premovable.dests;if(i)for(t in i)r=i[t],a(n,r,"premove-dest"+(e.pieces[r]?" oc":""))}var s=e.premovable.current;if(s)for(t in s)a(n,s[t],"current-premove");else e.predroppable.current&&a(n,e.predroppable.current.key,"current-premove");var c=e.exploding;if(c)for(t in c.keys)a(n,c.keys[t],"exploding"+c.stage);return n}(e),S={},E={},A={},K={},D=Object.keys(P);for(u=k.firstChild;u;){if(t=u.cgKey,"PIECE"===u.tagName)l=P[t],f=C[t],p=O[t],d=u.cgPiece,!u.cgDragging||x&&x.orig===t||(u.classList.remove("dragging"),w(u,y(s.key2pos(t),m)),u.cgDragging=!1),!p&&u.cgFading&&(u.cgFading=!1,u.classList.remove("fading")),l?(f&&u.cgAnimating&&d===i(l)?((B=s.key2pos(t))[0]+=f[2],B[1]+=f[3],u.classList.add("anim"),w(u,y(B,m))):u.cgAnimating&&(u.cgAnimating=!1,u.classList.remove("anim"),w(u,y(s.key2pos(t),m)),e.addPieceZIndex&&(u.style.zIndex=o(s.key2pos(t),m))),d!==i(l)||p&&u.cgFading?p&&d===i(p)?(u.classList.add("fading"),u.cgFading=!0):A[d]?A[d].push(u):A[d]=[u]:S[t]=!0):A[d]?A[d].push(u):A[d]=[u];else if("SQUARE"===u.tagName){var j=u.className;_[t]===j?E[t]=!0:K[j]?K[j].push(u):K[j]=[u]}u=u.nextSibling}for(var T in _)if(!E[T]){b=(h=K[_[T]])&&h.pop();var q=y(s.key2pos(T),m);if(b)b.cgKey=T,w(b,q);else{var N=s.createEl("square",_[T]);N.cgKey=T,w(N,q),k.insertBefore(N,k.firstChild)}}for(var L in D)if(t=D[L],r=P[t],f=C[t],!S[t])if(v=A[i(r)],g=v&&v.pop())g.cgKey=t,g.cgFading&&(g.classList.remove("fading"),g.cgFading=!1),B=s.key2pos(t),e.addPieceZIndex&&(g.style.zIndex=o(B,m)),f&&(g.cgAnimating=!0,g.classList.add("anim"),B[0]+=f[2],B[1]+=f[3]),w(g,y(B,m));else{var R=i(r),W=s.createEl("piece",R),B=s.key2pos(t);W.cgPiece=R,W.cgKey=t,f&&(W.cgAnimating=!0,B[0]+=f[2],B[1]+=f[3]),w(W,y(B,m)),e.addPieceZIndex&&(W.style.zIndex=o(B,m)),k.appendChild(W)}for(var F in A)n(e,A[F]);for(var F in K)n(e,K[F])}},{"./util":17}],14:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("./fen"),o=e("./util");r.defaults=function(){return{pieces:n.read(n.initial),orientation:"white",turnColor:"white",coordinates:!0,autoCastle:!0,viewOnly:!1,disableContextMenu:!1,resizable:!0,addPieceZIndex:!1,pieceKey:!1,highlight:{lastMove:!0,check:!0},animation:{enabled:!0,duration:200},movable:{free:!0,color:"both",showDests:!0,events:{},rookCastle:!0},premovable:{enabled:!0,showDests:!0,castle:!0,events:{}},predroppable:{enabled:!1,events:{}},draggable:{enabled:!0,distance:3,autoDistance:!0,centerPiece:!0,showGhost:!0,deleteOnDropOff:!1},selectable:{enabled:!0},stats:{dragged:!("ontouchstart"in window)},events:{},drawable:{enabled:!0,visible:!0,eraseOnClick:!0,shapes:[],autoShapes:[],brushes:{green:{key:"g",color:"#15781B",opacity:1,lineWidth:10},red:{key:"r",color:"#882020",opacity:1,lineWidth:10},blue:{key:"b",color:"#003088",opacity:1,lineWidth:10},yellow:{key:"y",color:"#e68f00",opacity:1,lineWidth:10},paleBlue:{key:"pb",color:"#003088",opacity:.4,lineWidth:15},paleGreen:{key:"pg",color:"#15781B",opacity:.4,lineWidth:15},paleRed:{key:"pr",color:"#882020",opacity:.4,lineWidth:15},paleGrey:{key:"pgr",color:"#4a4a4a",opacity:.35,lineWidth:15}},pieces:{baseUrl:"https://lichess1.org/assets/piece/cburnett/"},prevSvgHash:""},hold:o.timer()}}},{"./fen":10,"./util":17}],15:[function(e,t,r){"use strict";function n(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function o(e,t,r){var n=e.orig,o=e.dest,i=e.brush,a=e.piece,s=e.modifiers;return[r,n,o,i,o&&t[o]>1,a&&function(e){return[e.color,e.role,e.scale].filter(function(e){return e}).join("")}(a),s&&function(e){return""+(e.lineWidth||"")}(s)].filter(function(e){return e}).join("")}function i(e,t){for(var r in t)e.setAttribute(r,t[r]);return e}function a(e,t){return"white"===t?e:[9-e[0],9-e[1]]}function s(e,t){var r={color:e.color,opacity:Math.round(10*e.opacity)/10,lineWidth:Math.round(t.lineWidth||e.lineWidth)};return r.key=[e.key,t.lineWidth].filter(function(e){return e}).join(""),r}function c(e,t){return(e.opacity||1)*(t?.9:1)}function u(e,t){return[(e[0]-.5)*t.width/8,(8.5-e[1])*t.height/8]}Object.defineProperty(r,"__esModule",{value:!0});var l=e("./util");r.createElement=n;var d;r.renderSvg=function(e,t){var r=e.drawable,f=r.current,p=f&&f.mouseSq?f:void 0,v={};r.shapes.concat(r.autoShapes).concat(p?[p]:[]).forEach(function(e){e.dest&&(v[e.dest]=(v[e.dest]||0)+1)});var g=r.shapes.concat(r.autoShapes).map(function(e){return{shape:e,current:!1,hash:o(e,v,!1)}});p&&g.push({shape:p,current:!0,hash:o(p,v,!0)});var h=g.map(function(e){return e.hash}).join("");if(h!==e.drawable.prevSvgHash){e.drawable.prevSvgHash=h;var b=t.firstChild;!function(e,t,r){var o,a={};g.forEach(function(t){t.shape.dest&&(o=e.brushes[t.shape.brush],t.shape.modifiers&&(o=s(o,t.shape.modifiers)),a[o.key]=o)});for(var c={},u=r.firstChild;u;)c[u.getAttribute("cgKey")]=!0,u=u.nextSibling;for(var l in a)c[l]||r.appendChild(function(e){var t=i(n("marker"),{id:"arrowhead-"+e.key,orient:"auto",markerWidth:4,markerHeight:8,refX:2.05,refY:2.01});return t.appendChild(i(n("path"),{d:"M0,0 V4 L3,2 Z",fill:e.color})),t.setAttribute("cgKey",e.key),t}(a[l]))}(r,0,b),function(e,t,r,o,f,p){void 0===d&&(d=l.computeIsTrident());var v=e.dom.bounds(),g={},h=[];t.forEach(function(e){g[e.hash]=!1});for(var b,m=p.nextSibling;m;)b=m.getAttribute("cgHash"),g.hasOwnProperty(b)?g[b]=!0:h.push(m),m=m.nextSibling;h.forEach(function(e){return f.removeChild(e)}),t.forEach(function(t){g[t.hash]||f.appendChild(function(e,t,r,o,f){var p,v=t.shape,g=t.current,h=t.hash;if(v.piece)p=function(e,t,r,o){var a=u(t,o),s=o.width/8*(r.scale||1),c=r.color[0]+("knight"===r.role?"n":r.role[0]).toUpperCase();return i(n("image"),{className:r.role+" "+r.color,x:a[0]-s/2,y:a[1]-s/2,width:s,height:s,href:e+c+".svg"})}(e.drawable.pieces.baseUrl,a(l.key2pos(v.orig),e.orientation),v.piece,f);else{var b=a(l.key2pos(v.orig),e.orientation);if(v.orig&&v.dest){var m=r[v.brush];v.modifiers&&(m=s(m,v.modifiers)),p=function(e,t,r,o,a,s){var l=d?0:(a&&!o?20:10)/512*s.width,f=u(t,s),p=u(r,s),v=p[0]-f[0],g=p[1]-f[1],h=Math.atan2(g,v),b=Math.cos(h)*l,m=Math.sin(h)*l;return i(n("line"),{stroke:e.color,"stroke-width":function(t,r,n){return(e.lineWidth||10)*(r?.85:1)/512*n.width}(0,o,s),"stroke-linecap":"round","marker-end":d?void 0:"url(#arrowhead-"+e.key+")",opacity:c(e,o),x1:f[0],y1:f[1],x2:p[0]-b,y2:p[1]-m})}(m,b,a(l.key2pos(v.dest),e.orientation),g,o[v.dest]>1,f)}else p=function(e,t,r,o){var a=u(b,o),s=function(e){var t=o.width/512;return[3*t,4*t]}(),l=(o.width+o.height)/32;return i(n("circle"),{stroke:e.color,"stroke-width":s[r?0:1],fill:"none",opacity:c(e,r),cx:a[0],cy:a[1],r:l-s[1]/2})}(r[v.brush],0,g,f)}return p.setAttribute("cgHash",h),p}(e,t,r,o,v))})}(e,g,r.brushes,v,t,b)}}},{"./util":17}],16:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.files=["a","b","c","d","e","f","g","h"],r.ranks=[1,2,3,4,5,6,7,8]},{}],17:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("./types");r.colors=["white","black"],r.invRanks=[8,7,6,5,4,3,2,1],r.allKeys=(i=Array.prototype).concat.apply(i,n.files.map(function(e){return n.ranks.map(function(t){return e+t})})),r.pos2key=function(e){return r.allKeys[8*e[0]+e[1]-9]},r.key2pos=function(e){return[e.charCodeAt(0)-96,e.charCodeAt(1)-48]},r.memo=function(e){var t,r=function(){return void 0===t&&(t=e()),t};return r.clear=function(){t=void 0},r},r.timer=function(){var e;return{start:function(){e=Date.now()},cancel:function(){e=void 0},stop:function(){if(!e)return 0;var t=Date.now()-e;return e=void 0,t}}},r.opposite=function(e){return"white"===e?"black":"white"},r.containsX=function(e,t){return void 0!==e&&-1!==e.indexOf(t)},r.distanceSq=function(e,t){return Math.pow(e[0]-t[0],2)+Math.pow(e[1]-t[1],2)},r.samePiece=function(e,t){return e.role===t.role&&e.color===t.color},r.computeIsTrident=function(){return window.navigator.userAgent.indexOf("Trident/")>-1};var o=function(e,t,r,n){return[(t?e[0]-1:8-e[0])*r,(t?8-e[1]:e[1]-1)*n]};r.posToTranslateAbs=function(e){var t=e.width/8,r=e.height/8;return function(e,n){return o(e,n,t,r)}},r.posToTranslateRel=function(e,t){return o(e,t,12.5,12.5)},r.translateAbs=function(e,t){e.style.transform="translate("+t[0]+"px,"+t[1]+"px)"},r.translateRel=function(e,t){e.style.left=t[0]+"%",e.style.top=t[1]+"%"},r.setVisible=function(e,t){e.style.visibility=t?"visible":"hidden"},r.eventPosition=function(e){return e.clientX||0===e.clientX?[e.clientX,e.clientY]:e.touches&&e.targetTouches[0]?[e.targetTouches[0].clientX,e.targetTouches[0].clientY]:void 0},r.isRightButton=function(e){return 2===e.buttons||2===e.button},r.createEl=function(e,t){var r=document.createElement(e);return t&&(r.className=t),r},r.raf=(window.requestAnimationFrame||window.setTimeout).bind(window);var i},{"./types":16}],18:[function(e,t,r){"use strict";function n(e,t){var r,n=o.createEl("coords",t);for(var i in e)(r=o.createEl("coord")).textContent=e[i],n.appendChild(r);return n}Object.defineProperty(r,"__esModule",{value:!0});var o=e("./util"),i=e("./types"),a=e("./svg");r.default=function(e,t,r){e.innerHTML="",e.classList.add("cg-board-wrap"),o.colors.forEach(function(r){e.classList.toggle("orientation-"+r,t.orientation===r)}),e.classList.toggle("manipulable",!t.viewOnly);var s=o.createEl("div","cg-board");e.appendChild(s);var c;if(t.drawable.visible&&r&&((c=a.createElement("svg")).appendChild(a.createElement("defs")),e.appendChild(c)),t.coordinates){var u="black"===t.orientation?" black":"";e.appendChild(n(i.ranks,"ranks"+u)),e.appendChild(n(i.files,"files"+u))}var l;return r&&t.draggable.showGhost&&(l=o.createEl("piece","ghost"),o.setVisible(l,!1),e.appendChild(l)),{board:s,ghost:l,svg:c}}},{"./svg":15,"./types":16,"./util":17}]},{},[11])(11)});
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.i18next=e()}(this,function(){"use strict";function t(t){return null==t?"":""+t}function e(t,e,n){t.forEach(function(t){e[t]&&(n[t]=e[t])})}function n(t,e,n){function o(t){return t&&t.indexOf("###")>-1?t.replace(/###/g,"."):t}function r(){return!t||"string"==typeof t}for(var i="string"!=typeof e?[].concat(e):e.split(".");i.length>1;){if(r())return{};var s=o(i.shift());!t[s]&&n&&(t[s]=new n),t=t[s]}return r()?{}:{obj:t,k:o(i.shift())}}function o(t,e,o){var r=n(t,e,Object),i=r.obj,s=r.k;i[s]=o}function r(t,e,o,r){var i=n(t,e,Object),s=i.obj,a=i.k;s[a]=s[a]||[],r&&(s[a]=s[a].concat(o)),r||s[a].push(o)}function i(t,e){var o=n(t,e),r=o.obj,i=o.k;if(r)return r[i]}function s(t,e,n){for(var o in e)o in t?"string"==typeof t[o]||t[o]instanceof String||"string"==typeof e[o]||e[o]instanceof String?n&&(t[o]=e[o]):s(t[o],e[o],n):t[o]=e[o];return t}function a(t){return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}function l(t){return"string"==typeof t?t.replace(/[&<>"'\/]/g,function(t){return R[t]}):t}function u(t){return t.charAt(0).toUpperCase()+t.slice(1)}function c(){var t={};return P.forEach(function(e){e.lngs.forEach(function(n){t[n]={numbers:e.nr,plurals:A[e.fc]}})}),t}function p(t,e){for(var n=t.indexOf(e);n!==-1;)t.splice(n,1),n=t.indexOf(e)}function f(){return{debug:!1,initImmediate:!0,ns:["translation"],defaultNS:["translation"],fallbackLng:["dev"],fallbackNS:!1,whitelist:!1,nonExplicitWhitelist:!1,load:"all",preload:!1,simplifyPluralSuffix:!0,keySeparator:".",nsSeparator:":",pluralSeparator:"_",contextSeparator:"_",saveMissing:!1,updateMissing:!1,saveMissingTo:"fallback",saveMissingPlurals:!0,missingKeyHandler:!1,missingInterpolationHandler:!1,postProcess:!1,returnNull:!0,returnEmptyString:!0,returnObjects:!1,joinArrays:!1,returnedObjectHandler:function(){},parseMissingKeyHandler:!1,appendNamespaceToMissingKey:!1,appendNamespaceToCIMode:!1,overloadTranslationOptionHandler:function(t){var e={};return t[1]&&(e.defaultValue=t[1]),t[2]&&(e.tDescription=t[2]),e},interpolation:{escapeValue:!0,format:function(t,e,n){return t},prefix:"{{",suffix:"}}",formatSeparator:",",unescapePrefix:"-",nestingPrefix:"$t(",nestingSuffix:")",maxReplaces:1e3}}}function g(t){return"string"==typeof t.ns&&(t.ns=[t.ns]),"string"==typeof t.fallbackLng&&(t.fallbackLng=[t.fallbackLng]),"string"==typeof t.fallbackNS&&(t.fallbackNS=[t.fallbackNS]),t.whitelist&&t.whitelist.indexOf("cimode")<0&&(t.whitelist=t.whitelist.concat(["cimode"])),t}function h(){}var d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},v=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},y=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t},m=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)},b=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e},x=function(){function t(t,e){var n=[],o=!0,r=!1,i=void 0;try{for(var s,a=t[Symbol.iterator]();!(o=(s=a.next()).done)&&(n.push(s.value),!e||n.length!==e);o=!0);}catch(t){r=!0,i=t}finally{try{!o&&a.return&&a.return()}finally{if(r)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),k=function(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)},S={type:"logger",log:function(t){this.output("log",t)},warn:function(t){this.output("warn",t)},error:function(t){this.output("error",t)},output:function(t,e){var n;console&&console[t]&&(n=console)[t].apply(n,k(e))}},w=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};v(this,t),this.init(e,n)}return t.prototype.init=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.prefix=e.prefix||"i18next:",this.logger=t||S,this.options=e,this.debug=e.debug},t.prototype.setDebug=function(t){this.debug=t},t.prototype.log=function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];return this.forward(e,"log","",!0)},t.prototype.warn=function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];return this.forward(e,"warn","",!0)},t.prototype.error=function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];return this.forward(e,"error","")},t.prototype.deprecate=function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];return this.forward(e,"warn","WARNING DEPRECATED: ",!0)},t.prototype.forward=function(t,e,n,o){return o&&!this.debug?null:("string"==typeof t[0]&&(t[0]=""+n+this.prefix+" "+t[0]),this.logger[e](t))},t.prototype.create=function(e){return new t(this.logger,y({prefix:this.prefix+":"+e+":"},this.options))},t}(),O=new w,L=function(){function t(){v(this,t),this.observers={}}return t.prototype.on=function(t,e){var n=this;t.split(" ").forEach(function(t){n.observers[t]=n.observers[t]||[],n.observers[t].push(e)})},t.prototype.off=function(t,e){var n=this;this.observers[t]&&this.observers[t].forEach(function(){if(e){var o=n.observers[t].indexOf(e);o>-1&&n.observers[t].splice(o,1)}else delete n.observers[t]})},t.prototype.emit=function(t){for(var e=arguments.length,n=Array(e>1?e-1:0),o=1;o<e;o++)n[o-1]=arguments[o];if(this.observers[t]){var r=[].concat(this.observers[t]);r.forEach(function(t){t.apply(void 0,n)})}if(this.observers["*"]){var i=[].concat(this.observers["*"]);i.forEach(function(e){var o;e.apply(e,(o=[t]).concat.apply(o,n))})}},t}(),R={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"},j=function(t){function e(n){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{ns:["translation"],defaultNS:"translation"};v(this,e);var r=b(this,t.call(this));return r.data=n||{},r.options=o,r}return m(e,t),e.prototype.addNamespaces=function(t){this.options.ns.indexOf(t)<0&&this.options.ns.push(t)},e.prototype.removeNamespaces=function(t){var e=this.options.ns.indexOf(t);e>-1&&this.options.ns.splice(e,1)},e.prototype.getResource=function(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},r=o.keySeparator||this.options.keySeparator;void 0===r&&(r=".");var s=[t,e];return n&&"string"!=typeof n&&(s=s.concat(n)),n&&"string"==typeof n&&(s=s.concat(r?n.split(r):n)),t.indexOf(".")>-1&&(s=t.split(".")),i(this.data,s)},e.prototype.addResource=function(t,e,n,r){var i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{silent:!1},s=this.options.keySeparator;void 0===s&&(s=".");var a=[t,e];n&&(a=a.concat(s?n.split(s):n)),t.indexOf(".")>-1&&(a=t.split("."),r=e,e=a[1]),this.addNamespaces(e),o(this.data,a,r),i.silent||this.emit("added",t,e,n,r)},e.prototype.addResources=function(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{silent:!1};for(var r in n)"string"==typeof n[r]&&this.addResource(t,e,r,n[r],{silent:!0});o.silent||this.emit("added",t,e,n)},e.prototype.addResourceBundle=function(t,e,n,r,a){var l=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{silent:!1},u=[t,e];t.indexOf(".")>-1&&(u=t.split("."),r=n,n=e,e=u[1]),this.addNamespaces(e);var c=i(this.data,u)||{};r?s(c,n,a):c=y({},c,n),o(this.data,u,c),l.silent||this.emit("added",t,e,n)},e.prototype.removeResourceBundle=function(t,e){this.hasResourceBundle(t,e)&&delete this.data[t][e],this.removeNamespaces(e),this.emit("removed",t,e)},e.prototype.hasResourceBundle=function(t,e){return void 0!==this.getResource(t,e)},e.prototype.getResourceBundle=function(t,e){return e||(e=this.options.defaultNS),"v1"===this.options.compatibilityAPI?y({},this.getResource(t,e)):this.getResource(t,e)},e.prototype.toJSON=function(){return this.data},e}(L),C={processors:{},addPostProcessor:function(t){this.processors[t.name]=t},handle:function(t,e,n,o,r){var i=this;return t.forEach(function(t){i.processors[t]&&(e=i.processors[t].process(e,n,o,r))}),e}},N=function(t){function n(o){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};v(this,n);var i=b(this,t.call(this));return e(["resourceStore","languageUtils","pluralResolver","interpolator","backendConnector"],o,i),i.options=r,i.logger=O.create("translator"),i}return m(n,t),n.prototype.changeLanguage=function(t){t&&(this.language=t)},n.prototype.exists=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{interpolation:{}},n=this.resolve(t,e);return n&&void 0!==n.res},n.prototype.extractFromKey=function(t,e){var n=e.nsSeparator||this.options.nsSeparator;void 0===n&&(n=":");var o=e.keySeparator||this.options.keySeparator||".",r=e.ns||this.options.defaultNS;if(n&&t.indexOf(n)>-1){var i=t.split(n);(n!==o||n===o&&this.options.ns.indexOf(i[0])>-1)&&(r=i.shift()),t=i.join(o)}return"string"==typeof r&&(r=[r]),{key:t,namespaces:r}},n.prototype.translate=function(t,e){var n=this;if("object"!==("undefined"==typeof e?"undefined":d(e))&&this.options.overloadTranslationOptionHandler&&(e=this.options.overloadTranslationOptionHandler(arguments)),e||(e={}),void 0===t||null===t||""===t)return"";"number"==typeof t&&(t=String(t)),"string"==typeof t&&(t=[t]);var o=e.keySeparator||this.options.keySeparator||".",r=this.extractFromKey(t[t.length-1],e),i=r.key,s=r.namespaces,a=s[s.length-1],l=e.lng||this.language,u=e.appendNamespaceToCIMode||this.options.appendNamespaceToCIMode;if(l&&"cimode"===l.toLowerCase()){if(u){var c=e.nsSeparator||this.options.nsSeparator;return a+c+i}return i}var p=this.resolve(t,e),f=p&&p.res,g=p&&p.usedKey||i,h=Object.prototype.toString.apply(f),v=["[object Number]","[object Function]","[object RegExp]"],m=void 0!==e.joinArrays?e.joinArrays:this.options.joinArrays,b="string"!=typeof f&&"boolean"!=typeof f&&"number"!=typeof f;if(f&&b&&v.indexOf(h)<0&&(!m||"[object Array]"!==h)){if(!e.returnObjects&&!this.options.returnObjects)return this.logger.warn("accessing an object - but returnObjects options is not enabled!"),this.options.returnedObjectHandler?this.options.returnedObjectHandler(g,f,e):"key '"+i+" ("+this.language+")' returned an object instead of string.";if(e.keySeparator||this.options.keySeparator){var x="[object Array]"===h?[]:{};for(var k in f)if(Object.prototype.hasOwnProperty.call(f,k)){var S=""+g+o+k;x[k]=this.translate(S,y({},e,{joinArrays:!1,ns:s})),x[k]===S&&(x[k]=f[k])}f=x}}else if(m&&"[object Array]"===h)f=f.join(m),f&&(f=this.extendTranslation(f,t,e));else{var w=!1,O=!1;this.isValidLookup(f)||void 0===e.defaultValue||(w=!0,f=e.defaultValue),this.isValidLookup(f)||(O=!0,f=i);var L=e.defaultValue&&e.defaultValue!==f&&this.options.updateMissing;if(O||w||L){this.logger.log(L?"updateKey":"missingKey",l,a,i,L?e.defaultValue:f);var R=[],j=this.languageUtils.getFallbackCodes(this.options.fallbackLng,e.lng||this.language);if("fallback"===this.options.saveMissingTo&&j&&j[0])for(var C=0;C<j.length;C++)R.push(j[C]);else"all"===this.options.saveMissingTo?R=this.languageUtils.toResolveHierarchy(e.lng||this.language):R.push(e.lng||this.language);var N=function(t,o){n.options.missingKeyHandler?n.options.missingKeyHandler(t,a,o,L?e.defaultValue:f,L,e):n.backendConnector&&n.backendConnector.saveMissing&&n.backendConnector.saveMissing(t,a,o,L?e.defaultValue:f,L,e),n.emit("missingKey",t,a,o,f)};this.options.saveMissing&&(this.options.saveMissingPlurals&&e.count?R.forEach(function(t){var e=n.pluralResolver.getPluralFormsOfKey(t,i);e.forEach(function(e){return N([t],e)})}):N(R,i))}f=this.extendTranslation(f,t,e),O&&f===i&&this.options.appendNamespaceToMissingKey&&(f=a+":"+i),O&&this.options.parseMissingKeyHandler&&(f=this.options.parseMissingKeyHandler(f))}return f},n.prototype.extendTranslation=function(t,e,n){var o=this;n.interpolation&&this.interpolator.init(y({},n,{interpolation:y({},this.options.interpolation,n.interpolation)}));var r=n.replace&&"string"!=typeof n.replace?n.replace:n;this.options.interpolation.defaultVariables&&(r=y({},this.options.interpolation.defaultVariables,r)),t=this.interpolator.interpolate(t,r,n.lng||this.language),n.nest!==!1&&(t=this.interpolator.nest(t,function(){return o.translate.apply(o,arguments)},n)),n.interpolation&&this.interpolator.reset();var i=n.postProcess||this.options.postProcess,s="string"==typeof i?[i]:i;return void 0!==t&&null!==t&&s&&s.length&&n.applyPostProcessor!==!1&&(t=C.handle(s,t,e,n,this)),t},n.prototype.resolve=function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=void 0,r=void 0;return"string"==typeof t&&(t=[t]),t.forEach(function(t){if(!e.isValidLookup(o)){var i=e.extractFromKey(t,n),s=i.key;r=s;var a=i.namespaces;e.options.fallbackNS&&(a=a.concat(e.options.fallbackNS));var l=void 0!==n.count&&"string"!=typeof n.count,u=void 0!==n.context&&"string"==typeof n.context&&""!==n.context,c=n.lngs?n.lngs:e.languageUtils.toResolveHierarchy(n.lng||e.language);a.forEach(function(t){e.isValidLookup(o)||c.forEach(function(r){if(!e.isValidLookup(o)){var i=s,a=[i],c=void 0;l&&(c=e.pluralResolver.getSuffix(r,n.count)),l&&u&&a.push(i+c),u&&a.push(i+=""+e.options.contextSeparator+n.context),l&&a.push(i+=c);for(var p=void 0;p=a.pop();)e.isValidLookup(o)||(o=e.getResource(r,t,p,n))}})})}}),{res:o,usedKey:r}},n.prototype.isValidLookup=function(t){return!(void 0===t||!this.options.returnNull&&null===t||!this.options.returnEmptyString&&""===t)},n.prototype.getResource=function(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};return this.resourceStore.getResource(t,e,n,o)},n}(L),E=function(){function t(e){v(this,t),this.options=e,this.whitelist=this.options.whitelist||!1,this.logger=O.create("languageUtils")}return t.prototype.getScriptPartFromCode=function(t){if(!t||t.indexOf("-")<0)return null;var e=t.split("-");return 2===e.length?null:(e.pop(),this.formatLanguageCode(e.join("-")))},t.prototype.getLanguagePartFromCode=function(t){if(!t||t.indexOf("-")<0)return t;var e=t.split("-");return this.formatLanguageCode(e[0])},t.prototype.formatLanguageCode=function(t){if("string"==typeof t&&t.indexOf("-")>-1){var e=["hans","hant","latn","cyrl","cans","mong","arab"],n=t.split("-");return this.options.lowerCaseLng?n=n.map(function(t){return t.toLowerCase()}):2===n.length?(n[0]=n[0].toLowerCase(),n[1]=n[1].toUpperCase(),e.indexOf(n[1].toLowerCase())>-1&&(n[1]=u(n[1].toLowerCase()))):3===n.length&&(n[0]=n[0].toLowerCase(),2===n[1].length&&(n[1]=n[1].toUpperCase()),"sgn"!==n[0]&&2===n[2].length&&(n[2]=n[2].toUpperCase()),e.indexOf(n[1].toLowerCase())>-1&&(n[1]=u(n[1].toLowerCase())),e.indexOf(n[2].toLowerCase())>-1&&(n[2]=u(n[2].toLowerCase()))),n.join("-")}return this.options.cleanCode||this.options.lowerCaseLng?t.toLowerCase():t},t.prototype.isWhitelisted=function(t){return("languageOnly"===this.options.load||this.options.nonExplicitWhitelist)&&(t=this.getLanguagePartFromCode(t)),!this.whitelist||!this.whitelist.length||this.whitelist.indexOf(t)>-1},t.prototype.getFallbackCodes=function(t,e){if(!t)return[];if("string"==typeof t&&(t=[t]),"[object Array]"===Object.prototype.toString.apply(t))return t;if(!e)return t.default||[];var n=t[e];return n||(n=t[this.getScriptPartFromCode(e)]),n||(n=t[this.formatLanguageCode(e)]),n||(n=t.default),n||[]},t.prototype.toResolveHierarchy=function(t,e){var n=this,o=this.getFallbackCodes(e||this.options.fallbackLng||[],t),r=[],i=function(t){t&&(n.isWhitelisted(t)?r.push(t):n.logger.warn("rejecting non-whitelisted language code: "+t))};return"string"==typeof t&&t.indexOf("-")>-1?("languageOnly"!==this.options.load&&i(this.formatLanguageCode(t)),"languageOnly"!==this.options.load&&"currentOnly"!==this.options.load&&i(this.getScriptPartFromCode(t)),"currentOnly"!==this.options.load&&i(this.getLanguagePartFromCode(t))):"string"==typeof t&&i(this.formatLanguageCode(t)),o.forEach(function(t){r.indexOf(t)<0&&i(n.formatLanguageCode(t))}),r},t}(),P=[{lngs:["ach","ak","am","arn","br","fil","gun","ln","mfe","mg","mi","oc","pt","pt-BR","tg","ti","tr","uz","wa"],nr:[1,2],fc:1},{lngs:["af","an","ast","az","bg","bn","ca","da","de","dev","el","en","eo","es","et","eu","fi","fo","fur","fy","gl","gu","ha","he","hi","hu","hy","ia","it","kn","ku","lb","mai","ml","mn","mr","nah","nap","nb","ne","nl","nn","no","nso","pa","pap","pms","ps","pt-PT","rm","sco","se","si","so","son","sq","sv","sw","ta","te","tk","ur","yo"],nr:[1,2],fc:2},{lngs:["ay","bo","cgg","fa","id","ja","jbo","ka","kk","km","ko","ky","lo","ms","sah","su","th","tt","ug","vi","wo","zh"],nr:[1],fc:3},{lngs:["be","bs","dz","hr","ru","sr","uk"],nr:[1,2,5],fc:4},{lngs:["ar"],nr:[0,1,2,3,11,100],fc:5},{lngs:["cs","sk"],nr:[1,2,5],fc:6},{lngs:["csb","pl"],nr:[1,2,5],fc:7},{lngs:["cy"],nr:[1,2,3,8],fc:8},{lngs:["fr"],nr:[1,2],fc:9},{lngs:["ga"],nr:[1,2,3,7,11],fc:10},{lngs:["gd"],nr:[1,2,3,20],fc:11},{lngs:["is"],nr:[1,2],fc:12},{lngs:["jv"],nr:[0,1],fc:13},{lngs:["kw"],nr:[1,2,3,4],fc:14},{lngs:["lt"],nr:[1,2,10],fc:15},{lngs:["lv"],nr:[1,2,0],fc:16},{lngs:["mk"],nr:[1,2],fc:17},{lngs:["mnk"],nr:[0,1,2],fc:18},{lngs:["mt"],nr:[1,2,11,20],fc:19},{lngs:["or"],nr:[2,1],fc:2},{lngs:["ro"],nr:[1,2,20],fc:20},{lngs:["sl"],nr:[5,1,2,3],fc:21}],A={1:function(t){return Number(t>1)},2:function(t){return Number(1!=t)},3:function(t){return 0},4:function(t){return Number(t%10==1&&t%100!=11?0:t%10>=2&&t%10<=4&&(t%100<10||t%100>=20)?1:2)},5:function(t){return Number(0===t?0:1==t?1:2==t?2:t%100>=3&&t%100<=10?3:t%100>=11?4:5)},6:function(t){return Number(1==t?0:t>=2&&t<=4?1:2)},7:function(t){return Number(1==t?0:t%10>=2&&t%10<=4&&(t%100<10||t%100>=20)?1:2)},8:function(t){return Number(1==t?0:2==t?1:8!=t&&11!=t?2:3)},9:function(t){return Number(t>=2)},10:function(t){return Number(1==t?0:2==t?1:t<7?2:t<11?3:4)},11:function(t){return Number(1==t||11==t?0:2==t||12==t?1:t>2&&t<20?2:3)},12:function(t){return Number(t%10!=1||t%100==11)},13:function(t){return Number(0!==t)},14:function(t){return Number(1==t?0:2==t?1:3==t?2:3)},15:function(t){return Number(t%10==1&&t%100!=11?0:t%10>=2&&(t%100<10||t%100>=20)?1:2)},16:function(t){return Number(t%10==1&&t%100!=11?0:0!==t?1:2)},17:function(t){return Number(1==t||t%10==1?0:1)},18:function(t){return Number(0==t?0:1==t?1:2)},19:function(t){return Number(1==t?0:0===t||t%100>1&&t%100<11?1:t%100>10&&t%100<20?2:3)},20:function(t){return Number(1==t?0:0===t||t%100>0&&t%100<20?1:2)},21:function(t){return Number(t%100==1?1:t%100==2?2:t%100==3||t%100==4?3:0)}},M=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};v(this,t),this.languageUtils=e,this.options=n,this.logger=O.create("pluralResolver"),this.rules=c()}return t.prototype.addRule=function(t,e){this.rules[t]=e},t.prototype.getRule=function(t){return this.rules[t]||this.rules[this.languageUtils.getLanguagePartFromCode(t)]},t.prototype.needsPlural=function(t){var e=this.getRule(t);return e&&e.numbers.length>1},t.prototype.getPluralFormsOfKey=function(t,e){var n=this,o=[],r=this.getRule(t);return r?(r.numbers.forEach(function(r){var i=n.getSuffix(t,r);o.push(""+e+i)}),o):o},t.prototype.getSuffix=function(t,e){var n=this,o=this.getRule(t);if(o){var r=o.noAbs?o.plurals(e):o.plurals(Math.abs(e)),i=o.numbers[r];this.options.simplifyPluralSuffix&&2===o.numbers.length&&1===o.numbers[0]&&(2===i?i="plural":1===i&&(i=""));var s=function(){return n.options.prepend&&i.toString()?n.options.prepend+i.toString():i.toString()};return"v1"===this.options.compatibilityJSON?1===i?"":"number"==typeof i?"_plural_"+i.toString():s():"v2"===this.options.compatibilityJSON||2===o.numbers.length&&1===o.numbers[0]?s():2===o.numbers.length&&1===o.numbers[0]?s():this.options.prepend&&r.toString()?this.options.prepend+r.toString():r.toString()}return this.logger.warn("no plural rule found for: "+t),""},t}(),U=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};v(this,e),this.logger=O.create("interpolator"),this.init(t,!0)}return e.prototype.init=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments[1];e&&(this.options=t,this.format=t.interpolation&&t.interpolation.format||function(t){return t},this.escape=t.interpolation&&t.interpolation.escape||l),t.interpolation||(t.interpolation={escapeValue:!0});var n=t.interpolation;this.escapeValue=void 0===n.escapeValue||n.escapeValue,this.prefix=n.prefix?a(n.prefix):n.prefixEscaped||"{{",this.suffix=n.suffix?a(n.suffix):n.suffixEscaped||"}}",this.formatSeparator=n.formatSeparator?n.formatSeparator:n.formatSeparator||",",this.unescapePrefix=n.unescapeSuffix?"":n.unescapePrefix||"-",this.unescapeSuffix=this.unescapePrefix?"":n.unescapeSuffix||"",this.nestingPrefix=n.nestingPrefix?a(n.nestingPrefix):n.nestingPrefixEscaped||a("$t("),this.nestingSuffix=n.nestingSuffix?a(n.nestingSuffix):n.nestingSuffixEscaped||a(")"),this.maxReplaces=n.maxReplaces?n.maxReplaces:1e3,this.resetRegExp()},e.prototype.reset=function(){this.options&&this.init(this.options)},e.prototype.resetRegExp=function(){var t=this.prefix+"(.+?)"+this.suffix;this.regexp=new RegExp(t,"g");var e=""+this.prefix+this.unescapePrefix+"(.+?)"+this.unescapeSuffix+this.suffix;this.regexpUnescape=new RegExp(e,"g");var n=this.nestingPrefix+"(.+?)"+this.nestingSuffix;this.nestingRegexp=new RegExp(n,"g")},e.prototype.interpolate=function(e,n,o){function r(t){return t.replace(/\$/g,"$$$$")}var s=this,a=void 0,l=void 0,u=void 0,c=function(t){if(t.indexOf(s.formatSeparator)<0)return i(n,t);var e=t.split(s.formatSeparator),r=e.shift().trim(),a=e.join(s.formatSeparator).trim();return s.format(i(n,r),a,o)};for(this.resetRegExp(),u=0;(a=this.regexpUnescape.exec(e))&&(l=c(a[1].trim()),e=e.replace(a[0],l),this.regexpUnescape.lastIndex=0,u++,!(u>=this.maxReplaces)););for(u=0;a=this.regexp.exec(e);){if(l=c(a[1].trim()),"string"!=typeof l&&(l=t(l)),!l)if("function"==typeof this.options.missingInterpolationHandler){var p=this.options.missingInterpolationHandler(e,a);l="string"==typeof p?p:""}else this.logger.warn("missed to pass in variable "+a[1]+" for interpolating "+e),l="";if(l=r(this.escapeValue?this.escape(l):l),e=e.replace(a[0],l),this.regexp.lastIndex=0,u++,u>=this.maxReplaces)break}return e},e.prototype.nest=function(e,n){function o(t,e){if(t.indexOf(",")<0)return t;var n=t.split(",");t=n.shift();var o=n.join(",");o=this.interpolate(o,a),o=o.replace(/'/g,'"');try{a=JSON.parse(o),e&&(a=y({},e,a))}catch(e){this.logger.error("failed parsing options string in nesting for key "+t,e)}return t}var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=void 0,s=void 0,a=y({},r);for(a.applyPostProcessor=!1;i=this.nestingRegexp.exec(e);){if(s=n(o.call(this,i[1].trim(),a),a),s&&i[0]===e&&"string"!=typeof s)return s;"string"!=typeof s&&(s=t(s)),s||(this.logger.warn("missed to resolve "+i[1]+" for nesting "+e),s=""),e=e.replace(i[0],s),this.regexp.lastIndex=0}return e},e}(),H=function(t){function e(n,o,r){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};v(this,e);var s=b(this,t.call(this));return s.backend=n,s.store=o,s.languageUtils=r.languageUtils,s.options=i,s.logger=O.create("backendConnector"),s.state={},s.queue=[],s.backend&&s.backend.init&&s.backend.init(r,i.backend,i),s}return m(e,t),e.prototype.queueLoad=function(t,e,n){var o=this,r=[],i=[],s=[],a=[];return t.forEach(function(t){var n=!0;e.forEach(function(e){var s=t+"|"+e;o.store.hasResourceBundle(t,e)?o.state[s]=2:o.state[s]<0||(1===o.state[s]?i.indexOf(s)<0&&i.push(s):(o.state[s]=1,n=!1,i.indexOf(s)<0&&i.push(s),r.indexOf(s)<0&&r.push(s),a.indexOf(e)<0&&a.push(e)))}),n||s.push(t)}),(r.length||i.length)&&this.queue.push({pending:i,loaded:{},errors:[],callback:n}),{toLoad:r,pending:i,toLoadLanguages:s,toLoadNamespaces:a}},e.prototype.loaded=function(t,e,n){var o=this,i=t.split("|"),s=x(i,2),a=s[0],l=s[1];e&&this.emit("failedLoading",a,l,e),n&&this.store.addResourceBundle(a,l,n),this.state[t]=e?-1:2,this.queue.forEach(function(n){r(n.loaded,[a],l),p(n.pending,t),e&&n.errors.push(e),0!==n.pending.length||n.done||(o.emit("loaded",n.loaded),n.done=!0,n.errors.length?n.callback(n.errors):n.callback())}),this.queue=this.queue.filter(function(t){return!t.done})},e.prototype.read=function(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,r=this,i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:250,s=arguments[5];return t.length?this.backend[n](t,e,function(a,l){return a&&l&&o<5?void setTimeout(function(){r.read.call(r,t,e,n,o+1,2*i,s)},i):void s(a,l)}):s(null,{})},e.prototype.load=function(t,e,n){var o=this;if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),n&&n();var r=y({},this.backend.options,this.options.backend);"string"==typeof t&&(t=this.languageUtils.toResolveHierarchy(t)),"string"==typeof e&&(e=[e]);var s=this.queueLoad(t,e,n);return s.toLoad.length?void(r.allowMultiLoading&&this.backend.readMulti?this.read(s.toLoadLanguages,s.toLoadNamespaces,"readMulti",null,null,function(t,e){t&&o.logger.warn("loading namespaces "+s.toLoadNamespaces.join(", ")+" for languages "+s.toLoadLanguages.join(", ")+" via multiloading failed",t),!t&&e&&o.logger.log("successfully loaded namespaces "+s.toLoadNamespaces.join(", ")+" for languages "+s.toLoadLanguages.join(", ")+" via multiloading",e),s.toLoad.forEach(function(n){var r=n.split("|"),s=x(r,2),a=s[0],l=s[1],u=i(e,[a,l]);if(u)o.loaded(n,t,u);else{var c="loading namespace "+l+" for language "+a+" via multiloading failed";o.loaded(n,c),o.logger.error(c)}})}):s.toLoad.forEach(function(t){o.loadOne(t)})):(s.pending.length||n(),null)},e.prototype.reload=function(t,e){var n=this;this.backend||this.logger.warn("No backend was added via i18next.use. Will not load resources.");var o=y({},this.backend.options,this.options.backend);"string"==typeof t&&(t=this.languageUtils.toResolveHierarchy(t)),"string"==typeof e&&(e=[e]),o.allowMultiLoading&&this.backend.readMulti?this.read(t,e,"readMulti",null,null,function(o,r){o&&n.logger.warn("reloading namespaces "+e.join(", ")+" for languages "+t.join(", ")+" via multiloading failed",o),!o&&r&&n.logger.log("successfully reloaded namespaces "+e.join(", ")+" for languages "+t.join(", ")+" via multiloading",r),t.forEach(function(t){e.forEach(function(e){var s=i(r,[t,e]);if(s)n.loaded(t+"|"+e,o,s);else{var a="reloading namespace "+e+" for language "+t+" via multiloading failed";n.loaded(t+"|"+e,a),n.logger.error(a)}})})}):t.forEach(function(t){e.forEach(function(e){n.loadOne(t+"|"+e,"re")})})},e.prototype.loadOne=function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",o=t.split("|"),r=x(o,2),i=r[0],s=r[1];this.read(i,s,"read",null,null,function(o,r){o&&e.logger.warn(n+"loading namespace "+s+" for language "+i+" failed",o),!o&&r&&e.logger.log(n+"loaded namespace "+s+" for language "+i,r),e.loaded(t,o,r)})},e.prototype.saveMissing=function(t,e,n,o,r){var i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{};this.backend&&this.backend.create&&this.backend.create(t,e,n,o,null,y({},i,{isUpdate:r})),t&&t[0]&&this.store.addResource(t[0],e,n,o)},e}(L),T=function(t){function e(n,o,r){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};v(this,e);var s=b(this,t.call(this));return s.cache=n,s.store=o,s.services=r,s.options=i,s.logger=O.create("cacheConnector"),s.cache&&s.cache.init&&s.cache.init(r,i.cache,i),s}return m(e,t),e.prototype.load=function(t,e,n){var o=this;if(!this.cache)return n&&n();var r=y({},this.cache.options,this.options.cache),i="string"==typeof t?this.services.languageUtils.toResolveHierarchy(t):t;r.enabled?this.cache.load(i,function(t,e){if(t&&o.logger.error("loading languages "+i.join(", ")+" from cache failed",t),e)for(var r in e)if(Object.prototype.hasOwnProperty.call(e,r))for(var s in e[r])if(Object.prototype.hasOwnProperty.call(e[r],s)&&"i18nStamp"!==s){var a=e[r][s];a&&o.store.addResourceBundle(r,s,a)}n&&n()}):n&&n()},e.prototype.save=function(){this.cache&&this.options.cache&&this.options.cache.enabled&&this.cache.save(this.store.data)},e}(L),V=function(t){function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments[1];v(this,e);var r=b(this,t.call(this));if(r.options=g(n),r.services={},r.logger=O,r.modules={external:[]},o&&!r.isInitialized&&!n.isClone){var i;if(!r.options.initImmediate)return i=r.init(n,o),b(r,i);setTimeout(function(){r.init(n,o)},0)}return r}return m(e,t),e.prototype.init=function(){function t(t){return t?"function"==typeof t?new t:t:null}var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments[1];if("function"==typeof n&&(o=n,n={}),this.options=y({},f(),this.options,g(n)),this.format=this.options.interpolation.format,o||(o=h),!this.options.isClone){this.modules.logger?O.init(t(this.modules.logger),this.options):O.init(null,this.options);var r=new E(this.options);this.store=new j(this.options.resources,this.options);var i=this.services;i.logger=O,i.resourceStore=this.store,i.resourceStore.on("added removed",function(t,e){i.cacheConnector.save()}),i.languageUtils=r,i.pluralResolver=new M(r,{prepend:this.options.pluralSeparator,compatibilityJSON:this.options.compatibilityJSON,simplifyPluralSuffix:this.options.simplifyPluralSuffix}),i.interpolator=new U(this.options),i.backendConnector=new H(t(this.modules.backend),i.resourceStore,i,this.options),i.backendConnector.on("*",function(t){for(var n=arguments.length,o=Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];e.emit.apply(e,[t].concat(o))}),i.backendConnector.on("loaded",function(t){i.cacheConnector.save()}),i.cacheConnector=new T(t(this.modules.cache),i.resourceStore,i,this.options),i.cacheConnector.on("*",function(t){for(var n=arguments.length,o=Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];e.emit.apply(e,[t].concat(o))}),this.modules.languageDetector&&(i.languageDetector=t(this.modules.languageDetector),i.languageDetector.init(i,this.options.detection,this.options)),this.translator=new N(this.services,this.options),this.translator.on("*",function(t){for(var n=arguments.length,o=Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];e.emit.apply(e,[t].concat(o))}),this.modules.external.forEach(function(t){t.init&&t.init(e)})}var s=["getResource","addResource","addResources","addResourceBundle","removeResourceBundle","hasResourceBundle","getResourceBundle"];s.forEach(function(t){e[t]=function(){var n;return(n=e.store)[t].apply(n,arguments)}});var a=function(){e.changeLanguage(e.options.lng,function(t,n){e.isInitialized=!0,e.logger.log("initialized",e.options),e.emit("initialized",e.options),o(t,n)})};return this.options.resources||!this.options.initImmediate?a():setTimeout(a,0),this},e.prototype.loadResources=function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:h;if(this.options.resources)e(null);else{if(this.language&&"cimode"===this.language.toLowerCase())return e();var n=[],o=function(e){if(e){var o=t.services.languageUtils.toResolveHierarchy(e);o.forEach(function(t){n.indexOf(t)<0&&n.push(t)})}};if(this.language)o(this.language);else{var r=this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);r.forEach(function(t){return o(t)})}this.options.preload&&this.options.preload.forEach(function(t){return o(t)}),this.services.cacheConnector.load(n,this.options.ns,function(){t.services.backendConnector.load(n,t.options.ns,e)})}},e.prototype.reloadResources=function(t,e){t||(t=this.languages),e||(e=this.options.ns),this.services.backendConnector.reload(t,e)},e.prototype.use=function(t){return"backend"===t.type&&(this.modules.backend=t),"cache"===t.type&&(this.modules.cache=t),
("logger"===t.type||t.log&&t.warn&&t.error)&&(this.modules.logger=t),"languageDetector"===t.type&&(this.modules.languageDetector=t),"postProcessor"===t.type&&C.addPostProcessor(t),"3rdParty"===t.type&&this.modules.external.push(t),this},e.prototype.changeLanguage=function(t,e){var n=this,o=function(t,o){n.translator.changeLanguage(o),o&&(n.emit("languageChanged",o),n.logger.log("languageChanged",o)),e&&e(t,function(){return n.t.apply(n,arguments)})},r=function(t){t&&(n.language=t,n.languages=n.services.languageUtils.toResolveHierarchy(t),n.translator.language||n.translator.changeLanguage(t),n.services.languageDetector&&n.services.languageDetector.cacheUserLanguage(t)),n.loadResources(function(e){o(e,t)})};t||!this.services.languageDetector||this.services.languageDetector.async?!t&&this.services.languageDetector&&this.services.languageDetector.async?this.services.languageDetector.detect(r):r(t):r(this.services.languageDetector.detect())},e.prototype.getFixedT=function(t,e){var n=this,o=function t(e,o){for(var r=arguments.length,i=Array(r>2?r-2:0),s=2;s<r;s++)i[s-2]=arguments[s];var a=y({},o);return"object"!==("undefined"==typeof o?"undefined":d(o))&&(a=n.options.overloadTranslationOptionHandler([e,o].concat(i))),a.lng=a.lng||t.lng,a.lngs=a.lngs||t.lngs,a.ns=a.ns||t.ns,n.t(e,a)};return"string"==typeof t?o.lng=t:o.lngs=t,o.ns=e,o},e.prototype.t=function(){var t;return this.translator&&(t=this.translator).translate.apply(t,arguments)},e.prototype.exists=function(){var t;return this.translator&&(t=this.translator).exists.apply(t,arguments)},e.prototype.setDefaultNamespace=function(t){this.options.defaultNS=t},e.prototype.loadNamespaces=function(t,e){var n=this;return this.options.ns?("string"==typeof t&&(t=[t]),t.forEach(function(t){n.options.ns.indexOf(t)<0&&n.options.ns.push(t)}),void this.loadResources(e)):e&&e()},e.prototype.loadLanguages=function(t,e){"string"==typeof t&&(t=[t]);var n=this.options.preload||[],o=t.filter(function(t){return n.indexOf(t)<0});return o.length?(this.options.preload=n.concat(o),void this.loadResources(e)):e()},e.prototype.dir=function(t){if(t||(t=this.languages&&this.languages.length>0?this.languages[0]:this.language),!t)return"rtl";var e=["ar","shu","sqr","ssh","xaa","yhd","yud","aao","abh","abv","acm","acq","acw","acx","acy","adf","ads","aeb","aec","afb","ajp","apc","apd","arb","arq","ars","ary","arz","auz","avl","ayh","ayl","ayn","ayp","bbz","pga","he","iw","ps","pbt","pbu","pst","prp","prd","ur","ydd","yds","yih","ji","yi","hbo","men","xmn","fa","jpr","peo","pes","prs","dv","sam"];return e.indexOf(this.services.languageUtils.getLanguagePartFromCode(t))>=0?"rtl":"ltr"},e.prototype.createInstance=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments[1];return new e(t,n)},e.prototype.cloneInstance=function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:h,r=y({},this.options,n,{isClone:!0}),i=new e(r),s=["store","services","language"];return s.forEach(function(e){i[e]=t[e]}),i.translator=new N(i.services,i.options),i.translator.on("*",function(t){for(var e=arguments.length,n=Array(e>1?e-1:0),o=1;o<e;o++)n[o-1]=arguments[o];i.emit.apply(i,[t].concat(n))}),i.init(r,o),i.translator.options=i.options,i},e}(L),F=new V;return F});

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
    var that = {};
    that.strings = new Array("");
    // Appends the given value to the end of this instance.
    var append = function (value) {
        if (value) {
            that.strings.push(value);
        }
    };

    // Clears the string buffer
    var clear = function () {
        that.strings.length = 1;
    };

    // Returns the length of the final string (without building it)
    var length = function () {
        return that.strings.reduce(function(previousValue, currentValue, index, array){
            return previousValue + currentValue.length;
        }, 0);
    };

    // Return true if the receiver is empty. Don't compute length!!
    var isEmpty = function () {
        for (var i = 0; i < that.strings.length; i++) {
            if (that.strings[i].length > 0) {
                return false;
            }
        }
        return true;
    };

    // Return the last character (as string) of the receiver.
    // Return null if none is found
    var lastChar = function () {
        if (that.strings.length === 0) {
            return null;
        }
        return that.strings[that.strings.length - 1].slice(-1);
    };

    // Converts this instance to a String.
    var toString = function () {
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
    var
        nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys,
        nativeCreate       = Object.create;
    
    var isString = function(obj) {
        return toString.call(obj) === '[object String]';
    };
    var isArguments = function(obj) {
        return toString.call(obj) === '[object Arguments]';
    };
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;  
    var isArrayLike = function(collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    var isArray = nativeIsArray || function(obj) {
        return Array.isArray(obj);
      };
    var property = function(key) {
        return function(obj) {
          return obj == null ? void 0 : obj[key];
        };
      };
    var getLength = property('length');
    var isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
      };
    var optimizeCb = function(func, context, argCount) {
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
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
            } else {
            var keys = keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };
    var has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
      };    
    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    let keys = function(obj) {
        if (! isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (has(obj, key)) keys.push(key);
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



var pgnReader = function (configuration, chess) {
    var that = {};
    var utils = new Utils();
    that.configuration = configuration;
    var initialize_configuration = function(configuration) {
        var readPgnFromFile = function(url) {
            let request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send();
            if (request.status === 200) {
                return request.responseText;
            }
        };
        if (typeof configuration.position == 'undefined') {
            configuration.position = 'start';
        }
        if (typeof configuration.pgn == 'undefined') {
            if (typeof configuration.pgnFile == 'undefined') {
                configuration.pgn = '';
            } else {
                configuration.pgn = readPgnFromFile(configuration.pgnFile);
            }
        }
        if (typeof configuration.locale == 'undefined') {
            configuration.locale = 'en';
        }
    };
    initialize_configuration(configuration);
    var parser = pgnParser;
    that.startMove = 0;
    var game = chess || new Chess();
    var set_to_start = function() {
        if (configuration.position == 'start') {
                game.reset();
            } else {
                game.load(configuration.position);
            }
    };
    that.PGN_TAGS = {
        Event: "the name of the tournament or match event",
        Site: "the location of the event",
        Date: "the starting date of the game (format: YYYY.MM.TT)",
        Round: "the playing round ordinal of the game",
        White: "the player of the white pieces (last name, pre name)",
        Black: "the player of the black pieces (last name, pre name)",
        Result: "the result of the game (1 - 0, 1/2 - 1/2, 0 - 1)",
        // from here, the keys are optional, order may be different
        Board: "the board number in a team event",
        ECO: "ECO-Opening-Key (ECO = 'Encyclopaedia of Chess Openings')",
        WhitemyELO: "myELO-score white (at the beginning of the game)",
        BlackmyELO: "myELO-score black (at the beginning of the game)",
        WhiteDays: "rate in days for white",
        BlackDays: "rate in days for black",
        myChessNo: "identification-no. of the game on the myChess.de - server",
        // From here it was from Wikipedia
        Annotator: "The person providing notes to the game.",
        PlyCount: "String value denoting total number of half-moves played.",
        TimeControl: "40/7200:3600 (moves per seconds: sudden death seconds)",
        Time: 'Time the game started, in "HH:MM:SS" format, in local clock time.',
        Termination: 'Gives more details about the termination of the game. It may be "abandoned", "adjudication" (result determined by third-party adjudication), "death", "emergency", "normal", "rules infraction", "time forfeit", or "unterminated".',
        Mode: '"OTB" (over-the-board) "ICS" (Internet Chess Server)',
        SetUp: '"0": position is start position, "1": tag FEN defines the position',
        FEN: 'Alternative start position, tag SetUp has to be set to "1"'
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
    for (var i = 0; i < that.NAGs.length; i++) {
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
    var nag_to_symbol = function (array) {
        var ret_string = "";
        if (array === null || array === undefined) {
            return ret_string;
        }
        for (var i = 0; i < array.length; i++) {
            var number = parseInt(array[i].substring(1));
            if (number != 220) { // Don't add diagrams to notation
                var ret = that.NAGs[number];
                ret_string += (typeof ret != 'undefined') ? ret : "$"+number;    
            }
        }
        return ret_string;
    };

    /**
     * Returns the internationalized variation of the figure, or the original itself.
     * Optional pawn symbols are ignored (SAN is used for output, not reading).
     */
    var figI18n = function (fig) {
        if (fig == 'P') {
            return '';
        }
        return i18next.t(fig, {lng: that.configuration.locale});
    };

    /**
     * Returns the real notation from the move (excluding NAGs).
     * @param notation
     * @return {*}
     */
    var san = function(notation) {
        if (typeof notation.row == 'undefined') {
            return notation.notation; // move like O-O and O-O-O
        }
        var fig = notation.fig ? figI18n(notation.fig) : '';
        var disc = notation.disc ? notation.disc : '';
        var strike = notation.strike ? notation.strike : '';
        // Pawn moves with capture need the col as "discriminator"
        if ((fig === '') && (strike === 'x')) {
            return notation.notation;
        }
        var check = notation.check ? notation.check : '';
        var mate = notation.mate ? notation.mate : '';
        var prom = notation.promotion ? '=' + figI18n(notation.promotion.substring(1,2).toLowerCase()) : '';
        return fig + disc + strike + notation.col + notation.row + prom + check + mate;
    };

    var sanWithNags = function (move) {
        var _san = san(move.notation);
        if (move.nag) {
            _san += nag_to_symbol(move.nag);
        }
        return _san;
    };

    /**
     * Returns the SYM notation for a single NAG (like !!, ?!, ...)
     * @param string the NAG in the chess notation
     * @returns {*} the symbold like $0, $3, ...
     */
    var symbol_to_nag = function(string) {
        var nag = that.PGN_NAGS[string];
        if (nag === "undefined") {
            return null;
        } else {
            return "$" + nag;
        }
    };

    /**
     * Main function, automatically called when calling pgn function.
     */
    var load_pgn = function () {
        var restString = readHeaders();
        readMoves(restString);
        return that;
    };

    /**
     * Reads the headers from the pgn string given, returns what is not consumed
     * by the headers.
     * Ensure that the headers are interpreted and even modify the configuration.
     * @returns {string} the remaining moves
     */
    var readHeaders = function () {
        /**
         * Split the headers (marked by []), and collect them in the return value.
         * @param string the pgn string that contains (at the beginning) the headers of the game
         * @returns the headers read
         */
        var splitHeaders = function (string) {
            let headers = {};
            let xarr;
            let index = 0;
            let lastMatch = '';
            let re = /\[([^\]]+)]/g;
            while (xarr = re.exec(string)) {
                let ret = xarr[0].match(/\[(\w+)\s+\"([^\"]+)\"/);
                if (ret) {
                    let key = ret[1];
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
         * Implemment the logic to interpret the headers.
         */
        var interpretHeaders = function () {
            if (that.headers.SetUp) {
                var setup = that.headers.SetUp;
                if (setup === '0') {
                    configuration.position = 'start';
                } else {
                    var fen = that.headers.FEN;
                    configuration.position = fen;
                }
            }
            if (that.headers.Result) {
                that.endGame = that.headers.Result;            }
        };
        let retHeaders = splitHeaders(configuration.pgn);
        that.headers = retHeaders.headers;
        interpretHeaders();
        return retHeaders.rest;
    };

    var wireMoves = function(current, prev, currentMove, prevMove) {
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
    var readMoves = function(movesString) {
        
        /**
         * Originally variations are kept as array of moves. But after having linked prev and next,
         * it is much easier to keep only the first move of the variation.
         */
        var correctVariations = function() {
            utils.pvEach(getMoves(), function(move) {
                for (i = 0; i < move.variations.length; i++) {
                    move.variations[i] = move.variations[i][0];
                }
            });
        };
        var remindEndGame = function(movesMainLine) {
            if (typeof movesMainLine[movesMainLine.length - 1] == "string") {
                that.endGame = movesMainLine.pop();
            }
        };
        /**
         * If black started with a move, FEN must be set to a black start position.
         * Then turn should be switched for all moves, if first moves is falsly white.
         */
        var correctTurn = function() {
            var getTurn = function(fen) {
                var tokens = fen.split(/\s+/);
                return tokens[1];
            };
            // 
            if ((getTurn(configuration.position) === 'b') &&
                    (isMove(0)) &&
                    (that.moves[0].turn === 'w')) {
                utils.pvEach(getMoves(), function(move) {
                    move.turn = (move.turn === 'w') ? 'b' : 'w';
                });
            }
        };

        // Ensure that PGN string is just one line, with no tab or line break in it.
        var movesStringTrimmed = movesString.trim();
        movesStringTrimmed = movesStringTrimmed.replace(/(\r\n|\n|\r)/gm," ");
        movesStringTrimmed = movesStringTrimmed.replace(/\t/gm, " ");
        var movesMainLine = parser.parse(movesStringTrimmed)[0];
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
    var isMove = function(id) {
        return getMoves().length > id;
    };

    /**
     * Returns true, if the move with ID id is deleted.
     * @param id the numerical index
     * @returns {boolean} true, if deleted
     */
    var isDeleted = function(id) {
        if (! isMove(id))
            return true; // Every non-existing moves is "deleted"
        var current = getMoves()[id];
        if (current === null) {
            return true;
        }
        if (id == 0 && (current)) // The first move is not deleted
            return false;
        return (current.prev === null); // All moves without a previous move are deleted
    };


    /**
     * Returns the move that matches the id. Take into consideration:
     * <ul><li>if the move has no pre, and it is not the first one, the move should be considered deleted</li>
     * <li>if the move has no pre, but it is the first one, it is the first move</li>
     * </ul>
     * So only remove a move, if the move is not deleted
     * @param id the ID of the move
     */
    var getMove = function(id) {
        return getMoves()[id];
    };


    /**
     * Updates the variation level for all moves. If no arguments are given,
     * update the variation level for all moves.
     */
    var updateVariationLevel = function(move, varLevel) {
        if (arguments.length === 0) {
            // Workaround: we don't know which is the first move, so that that with index 0
            var my_move = getMove(0);
            updateVariationLevel(my_move, 0);
        } else {
            move.variationLevel = varLevel;
            if (move.next !== undefined) {
                updateVariationLevel(getMove(move.next), varLevel);
            }
            if (move.variations) {
                for (var i = 0; i < move.variations.length; i++) {
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
    var deleteMove = function(id) {
        /**
         * Removes the object at index from the array, returns the object.
         */
        var removeFromArray = function(array, index) {
            var ret = array[index];
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
        var current = getMove(id);
        // 2. First move of variation
        if (startVariation(current)) {
            var vars = getMove(getMove(current.prev).next).variations;
            for (var i = 0; vars.length; i++) {
                if (vars[i] === current) {
                    var my_var = removeFromArray(vars, i);
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
            var variationMove = removeFromArray(current.variations, 0);
            var varLevel = variationMove.variationLevel;
            that.moves[current.prev].next = variationMove.index;
            that.moves[id] = null;
            updateVariationLevel(variationMove, varLevel - 1);
        } 
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
    var promoteMove = function (id) {
        /**
         * Returns the index of the variation denoted by the move.
         */
        var indexOfVariationArray = function (move) {

        };
        /**
         * Returns the first move of a variation.
         */
        var firstMoveOfVariation = function(move) {
            if (startVariation(move)) {
                return move;
            }
            return firstMoveOfVariation(getMove(move.prev));
        };
        var move = getMove(id);
        // 1. Check that is variation
        if ((typeof move.variationLevel == "undefined") || (move.variationLevel === 0)) {
            return;
        }

        // 2. Get the first move of the variation
        var myFirst = firstMoveOfVariation(move);

        // 3. Get the index of that moves variation array
        var higherVariationMove = getMove(getMove(myFirst.prev).next);
        var indexVariation;
        for (i = 0; i < higherVariationMove.variations.length; i++) {
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
            var tmpVariations = higherVariationMove.variations;
            var prevMove = getMove(higherVariationMove.prev);
            prevMove.next = myFirst.index;
            tmpMove.variations = myFirst.variations;
            myFirst.variations = tmpVariations;
            myFirst.variations[0] = tmpMove;
        }
        // Update the variation level because there will be changes
        updateVariationLevel();
    };


    // Returns true, if the move is the start of a (new) variation
    var startVariation = function(move) {
        return  move.variationLevel > 0 &&
            ( (typeof move.prev != "number") || (getMoves()[move.prev].next != move.index));
    };
    // Returns true, if the move is the end of a variation
    var endVariation = function(move) {
        return move.variationLevel > 0 && ! move.next;
    };

    // Returns true, if the move is after a move with at least one variation
    var afterMoveWithVariation = function(move) {
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
    var write_pgn = function() {
        var left_variation = false;

        // Prepend a space if necessary
        function prepend_space(sb) {
            if ( (!sb.isEmpty()) && (sb.lastChar() != " ")) {
                sb.append(" ");
            }
        }

        var write_comment = function(comment, sb) {
            if (comment === undefined || comment === null) {
                return;
            }
            prepend_space(sb);
            sb.append("{");
            sb.append(comment);
            sb.append("}");
        };

        var write_comment_move = function(move, sb) {
            write_comment(move.commentMove, sb);
        };

        var write_comment_before = function(move, sb) {
            write_comment(move.commentBefore, sb);
        };

        var write_comment_after = function(move, sb) {
            write_comment(move.commentAfter, sb);
        };
        
        var write_check_or_mate  = function (move, sb) {
            if (move.notation.check) {
                sb.append(move.notation.check);
            }
        };

        var write_move_number = function (move, sb) {
            prepend_space(sb);
            if (move.turn === "w") {
                sb.append("" + move.moveNumber);
                sb.append(".");
            } else if (startVariation(move)) {
                sb.append("" + move.moveNumber);
                sb.append("...");
            }
        };

        var write_notation = function (move, sb) {
            prepend_space(sb);
            sb.append(move.notation.notation);
        };

        var write_NAGs = function(move, sb) {
            if (move.nag) {
                move.nag.forEach(function(ele) {
                    sb.append(ele);
                });
            }
        };

        var write_variation = function (move, sb) {
            prepend_space(sb);
            sb.append("(");
            write_move(move, sb);
            prepend_space(sb);
            sb.append(")");
        };

        var write_variations = function (move, sb) {
            for (var i = 0; i < move.variations.length; i++) {
                write_variation(move.variations[i], sb);
            }
        };

        var get_next_move = function (move) {
            return move.next ? getMove(move.next) : null;
        };

        /**
         * Write the normalised notation: comment move, move number (if necessary),
         * comment before, move, NAGs, comment after, variations.
         * Then go into recursion for the next move.
         * @param move the move in the exploded format
         * @param sb the string builder to use
         */
        var write_move = function(move, sb) {
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
            write_variations(move, sb);
            var next = get_next_move(move);
            write_move(next, sb);
        };

        var write_end_game = function(_sb) {
            if (that.endGame) {
                _sb.append(" ");
                _sb.append(that.endGame);
            }
        };

        var write_pgn2 = function(move, _sb) {

            write_move(move, sb);
            write_end_game(_sb);
            return sb.toString();
        };
        var sb = StringBuilder("");
        return write_pgn2(getMove(0), sb);
    };

    /**
     * Return true if the diagram NAG (== $220) is found.
     * @param move
     */
    var has_diagram_nag = function(move) {
        if (typeof move.nag == "undefined") return false;
        if (move.nag == null) return false;
        return move.nag.indexOf('$220') > -1;
    };

    /**
     * Final algorithm to read and map the moves. Seems to be tricky ...
     * @param movesMainLine all the moves of the game
     */
    var eachMove = function(movesMainLine) {
        that.moves = [];
        var current = -1;
        /**
         * Search for the right previous move. Go back until you find a move on the same
         * level. Only used inside the eachMode algorithm
         * @param level the current level to the move
         * @param index the current index where the search (backwards) should start
         * @returns {*} the resulting move or null, if none was found (should not happen)
         */
        var findPrevMove = function(level, index) {
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
        var eachMoveVariation = function(moveArray, level, prev) {
            // Computes the correct move numer from the position
            var getMoveNumberFromPosition = function(fen) {
                var tokens = fen.split(/\s+/);
                var move_number = parseInt(tokens[5], 10);
                return (tokens[1] === 'b') ? move_number : move_number - 1;
            };
            var prevMove = (prev != null ? that.moves[prev] : null);
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
                var pgn_move = game.move(move.notation.notation, {'sloppy' : true});
                if (pgn_move == null) {
                    throw "No legal move: " + move.notation.notation;
                }
                var fen = game.fen();
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
    var addMove = function (move, moveNumber) {
        var get_turn = function (moveNumber) {
              return getMove(moveNumber).turn === "w" ? 'b' : "w";
        };

        // Special case: first move, so there is no previous move
        function existing_first_move(move) {
            function first_move_notation() {
                if (typeof getMove(0) == 'undefined') return null;
                return getMove(0).notation.notation;
            }
            set_to_start();
            var pgn_move = game.move(move);
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
            var variations = getMove(0).variations;
            var vari;
            for (vari in variations) {
                if (variations[vari].notation.notation == pgn_move.san) return variations[vari].moveNumber;
            }
            return null; // no variation found
        }

        // Returns the existing move number or null
        // Should include all variations as well
        function existing_move(move, moveNumber) {
            if (moveNumber == null) return existing_first_move(move);
            var prevMove = getMove(moveNumber);
            if (typeof prevMove == "undefined") return null;
            game.load(prevMove.fen);
            var pgn_move = game.move(move);
            var nextMove = getMove(prevMove.next);
            if (typeof nextMove == "undefined") return null;
            if (nextMove.notation.notation == pgn_move.san) {
                return prevMove.next;
            } else { // check if there exists variations
                var mainMove = getMove(prevMove.next);
                for (i = 0; i < mainMove.variations.length; i++) {
                    var variation = mainMove.variations[i];
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
            var prevMove = getMove(prev);
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

        var curr = existing_move(move, moveNumber);
        if (typeof curr == 'number') return curr;
        var real_move = {};
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
        var pgn_move = game.move(move);
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
        var next = getMoves().length - 1;
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
    var changeNag = function (nag, moveNumber, added) {
        var move = getMove(moveNumber);
        if (move.nag == null) {
            move.nag = [];
        }
        var nagSym = (nag[0] == "$") ? nag : symbol_to_nag(nag);
        if (added) {
            if (move.nag.indexOf(nagSym) == -1) {
                move.nag.push(nagSym);
            }
        } else {
            var index = move.nag.indexOf(nagSym);
            if (index > -1) {
                move.nag.splice(index, 1);
            }
        }
    };

    var clearNags = function (moveNumber) {
        var move = getMove(moveNumber);
        move.nag = [];
    };

    /**
     * Return all moves in the order they are displayed: move, variations of that move,
     * next move, ...
     */
    var getOrderedMoves = function(current, returnedMoves) {
        if (arguments.length === 0) {
            current = getMove(that.startMove);
            returnedMoves = [];
        }
        returnedMoves.push(current);
        if (current.variations) {
            for (var i = 0; i < current.variations.length; i++) {
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
    var movesMainLine = function() {
        var current = getMove(that.startMove);
        var returnedMoves = [];
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

    // This defines the public API of the pgn function.
    return {
        configuration: configuration,
        readHeaders: readHeaders,
        deleteMove: deleteMove,
        promoteMove: promoteMove,
        isDeleted: isDeleted,
        readMoves: function () { return readMoves; },
        getMoves: getMoves,
        getOrderedMoves: getOrderedMoves,
        getMove: getMove,
        getHeaders: getHeaders,
//        splitHeaders: splitHeaders,
        getParser: function() { return parser; },
//        eachMove: function() { return eachMove(); },
        movesMainLine: movesMainLine,
        write_pgn: write_pgn,
        nag_to_symbol: nag_to_symbol,
        startVariation: startVariation,
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
        possibleMoves: possibleMoves
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
        peg$c30 = function(caf, caa) { var ret = {}; if (caf) { ret.colorFields = caf; }; if (caa) { ret.colorArrows = caa; }; return ret; },
        peg$c31 = "%csl",
        peg$c32 = peg$literalExpectation("%csl", false),
        peg$c33 = function(cfs) { return cfs; },
        peg$c34 = "%cal",
        peg$c35 = peg$literalExpectation("%cal", false),
        peg$c36 = ",",
        peg$c37 = peg$literalExpectation(",", false),
        peg$c38 = function(cf, cfl) { var arr = []; arr.push(cf); for (var i=0; i < cfl.length; i++) { arr.push(cfl[i][2])}; return arr; },
        peg$c39 = function(col, f) { return col + f; },
        peg$c40 = function(col, ff, ft) { return col + ff + ft; },
        peg$c41 = "Y",
        peg$c42 = peg$literalExpectation("Y", false),
        peg$c43 = function() { return "Y"; },
        peg$c44 = "G",
        peg$c45 = peg$literalExpectation("G", false),
        peg$c46 = function() { return "G"; },
        peg$c47 = "R",
        peg$c48 = peg$literalExpectation("R", false),
        peg$c49 = function() { return "R"; },
        peg$c50 = "B",
        peg$c51 = peg$literalExpectation("B", false),
        peg$c52 = function() { return "B"; },
        peg$c53 = function(col, row) { return col + row; },
        peg$c54 = "{",
        peg$c55 = peg$literalExpectation("{", false),
        peg$c56 = "}",
        peg$c57 = peg$literalExpectation("}", false),
        peg$c58 = "[",
        peg$c59 = peg$literalExpectation("[", false),
        peg$c60 = "]",
        peg$c61 = peg$literalExpectation("]", false),
        peg$c62 = function(vari, all, me) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
        peg$c63 = function(vari, all) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
        peg$c64 = "(",
        peg$c65 = peg$literalExpectation("(", false),
        peg$c66 = ")",
        peg$c67 = peg$literalExpectation(")", false),
        peg$c68 = ".",
        peg$c69 = peg$literalExpectation(".", false),
        peg$c70 = function(num) { return num; },
        peg$c71 = peg$otherExpectation("integer"),
        peg$c72 = /^[0-9]/,
        peg$c73 = peg$classExpectation([["0", "9"]], false, false),
        peg$c74 = function(digits) { return makeInteger(digits); },
        peg$c75 = " ",
        peg$c76 = peg$literalExpectation(" ", false),
        peg$c77 = function() { return '';},
        peg$c78 = function(fig, disc, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.disc =  (disc ? disc : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.promotion = pr; hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : ""); return hm; },
        peg$c79 = function(fig, cols, rows, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str =='x' ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig && (fig!=='P') ? fig : "") + cols + rows + (str=='x' ? str : "-") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
        peg$c80 = function(fig, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig ? fig : "") + (str ? str : "") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
        peg$c81 = "O-O-O",
        peg$c82 = peg$literalExpectation("O-O-O", false),
        peg$c83 = function(ch) { var hm = {}; hm.notation = 'O-O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
        peg$c84 = "O-O",
        peg$c85 = peg$literalExpectation("O-O", false),
        peg$c86 = function(ch) { var hm = {}; hm.notation = 'O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
        peg$c87 = "+-",
        peg$c88 = peg$literalExpectation("+-", false),
        peg$c89 = "+",
        peg$c90 = peg$literalExpectation("+", false),
        peg$c91 = function(ch) { return ch[1]; },
        peg$c92 = "$$$",
        peg$c93 = peg$literalExpectation("$$$", false),
        peg$c94 = "#",
        peg$c95 = peg$literalExpectation("#", false),
        peg$c96 = "=",
        peg$c97 = peg$literalExpectation("=", false),
        peg$c98 = function(f) { return '=' + f; },
        peg$c99 = function(nag, nags) { var arr = (nags ? nags : []); arr.unshift(nag); return arr; },
        peg$c100 = "$",
        peg$c101 = peg$literalExpectation("$", false),
        peg$c102 = function(num) { return '$' + num; },
        peg$c103 = "!!",
        peg$c104 = peg$literalExpectation("!!", false),
        peg$c105 = function() { return '$3'; },
        peg$c106 = "??",
        peg$c107 = peg$literalExpectation("??", false),
        peg$c108 = function() { return '$4'; },
        peg$c109 = "!?",
        peg$c110 = peg$literalExpectation("!?", false),
        peg$c111 = function() { return '$5'; },
        peg$c112 = "?!",
        peg$c113 = peg$literalExpectation("?!", false),
        peg$c114 = function() { return '$6'; },
        peg$c115 = "!",
        peg$c116 = peg$literalExpectation("!", false),
        peg$c117 = function() { return '$1'; },
        peg$c118 = "?",
        peg$c119 = peg$literalExpectation("?", false),
        peg$c120 = function() { return '$2'; },
        peg$c121 = "\u203C",
        peg$c122 = peg$literalExpectation("\u203C", false),
        peg$c123 = "\u2047",
        peg$c124 = peg$literalExpectation("\u2047", false),
        peg$c125 = "\u2049",
        peg$c126 = peg$literalExpectation("\u2049", false),
        peg$c127 = "\u2048",
        peg$c128 = peg$literalExpectation("\u2048", false),
        peg$c129 = "\u25A1",
        peg$c130 = peg$literalExpectation("\u25A1", false),
        peg$c131 = function() { return '$7'; },
        peg$c132 = function() { return '$10'; },
        peg$c133 = "\u221E",
        peg$c134 = peg$literalExpectation("\u221E", false),
        peg$c135 = function() { return '$13'; },
        peg$c136 = "\u2A72",
        peg$c137 = peg$literalExpectation("\u2A72", false),
        peg$c138 = function() { return '$14'; },
        peg$c139 = "\u2A71",
        peg$c140 = peg$literalExpectation("\u2A71", false),
        peg$c141 = function() { return '$15';},
        peg$c142 = "\xB1",
        peg$c143 = peg$literalExpectation("\xB1", false),
        peg$c144 = function() { return '$16';},
        peg$c145 = "\u2213",
        peg$c146 = peg$literalExpectation("\u2213", false),
        peg$c147 = function() { return '$17';},
        peg$c148 = function() { return '$18';},
        peg$c149 = "-+",
        peg$c150 = peg$literalExpectation("-+", false),
        peg$c151 = function() { return '$19';},
        peg$c152 = "\u2A00",
        peg$c153 = peg$literalExpectation("\u2A00", false),
        peg$c154 = function() { return '$22'; },
        peg$c155 = "\u27F3",
        peg$c156 = peg$literalExpectation("\u27F3", false),
        peg$c157 = function() { return '$32'; },
        peg$c158 = "\u2192",
        peg$c159 = peg$literalExpectation("\u2192", false),
        peg$c160 = function() { return '$36'; },
        peg$c161 = "\u2191",
        peg$c162 = peg$literalExpectation("\u2191", false),
        peg$c163 = function() { return '$40'; },
        peg$c164 = "\u21C6",
        peg$c165 = peg$literalExpectation("\u21C6", false),
        peg$c166 = function() { return '$132'; },
        peg$c167 = "D",
        peg$c168 = peg$literalExpectation("D", false),
        peg$c169 = function() { return '$220'; },
        peg$c170 = /^[RNBQKP]/,
        peg$c171 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false),
        peg$c172 = /^[a-h]/,
        peg$c173 = peg$classExpectation([["a", "h"]], false, false),
        peg$c174 = /^[1-8]/,
        peg$c175 = peg$classExpectation([["1", "8"]], false, false),
        peg$c176 = "x",
        peg$c177 = peg$literalExpectation("x", false),
        peg$c178 = "-",
        peg$c179 = peg$literalExpectation("-", false),

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
            s4 = peg$parsemoveEllipse();
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
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsecommentAnnotationFields();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecommentAnnotationArrows();
          if (s3 === peg$FAILED) {
            s3 = null;
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
          if (input.substr(peg$currPos, 4) === peg$c31) {
            s3 = peg$c31;
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
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
                    s1 = peg$c33(s5);
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
                    s1 = peg$c33(s5);
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
            s5 = peg$c36;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
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
              s5 = peg$c36;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c37); }
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
            s1 = peg$c38(s1, s3);
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
          s1 = peg$c39(s1, s2);
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
            s5 = peg$c36;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
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
              s5 = peg$c36;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c37); }
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
            s1 = peg$c38(s1, s3);
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
            s1 = peg$c40(s1, s2, s3);
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
        s1 = peg$c41;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c43();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 71) {
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
          if (input.charCodeAt(peg$currPos) === 82) {
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
            if (input.charCodeAt(peg$currPos) === 66) {
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
          s1 = peg$c53(s1, s2);
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
        s0 = peg$c54;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }

      return s0;
    }

    function peg$parsecr() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 125) {
        s0 = peg$c56;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }

      return s0;
    }

    function peg$parsebl() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 91) {
        s0 = peg$c58;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c59); }
      }

      return s0;
    }

    function peg$parsebr() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 93) {
        s0 = peg$c60;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }

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
                  s7 = peg$parsemoveEllipse();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c62(s2, s5, s7);
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
                s1 = peg$c63(s2, s5);
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
        s0 = peg$c64;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
      }

      return s0;
    }

    function peg$parsepr() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 41) {
        s0 = peg$c66;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }

      return s0;
    }

    function peg$parsemoveNumber() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s2 = peg$c68;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c69); }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c70(s1);
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

    function peg$parseinteger() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c72.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c73); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c72.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c73); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c74(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c71); }
      }

      return s0;
    }

    function peg$parsewhiteSpace() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c75;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c75;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c77();
      }
      s0 = s1;

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
                      s1 = peg$c78(s1, s3, s4, s5, s6, s7, s8);
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
                        s1 = peg$c79(s1, s2, s3, s4, s5, s6, s7, s8);
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
                      s1 = peg$c80(s1, s2, s3, s4, s5, s6);
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
            if (input.substr(peg$currPos, 5) === peg$c81) {
              s1 = peg$c81;
              peg$currPos += 5;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c82); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecheck();
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c83(s2);
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
              if (input.substr(peg$currPos, 3) === peg$c84) {
                s1 = peg$c84;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c85); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsecheck();
                if (s2 === peg$FAILED) {
                  s2 = null;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c86(s2);
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
      if (input.substr(peg$currPos, 2) === peg$c87) {
        s3 = peg$c87;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
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
          s3 = peg$c89;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c90); }
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
        s1 = peg$c91(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 3) === peg$c92) {
          s3 = peg$c92;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c93); }
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
            s3 = peg$c94;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c95); }
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
          s1 = peg$c91(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsepromotion() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c96;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c97); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefigure();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c98(s2);
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
            s1 = peg$c99(s1, s3);
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
        s1 = peg$c100;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c101); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c102(s2);
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
        if (input.substr(peg$currPos, 2) === peg$c103) {
          s1 = peg$c103;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c104); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c105();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c106) {
            s1 = peg$c106;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c107); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c108();
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
              s1 = peg$c111();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c112) {
                s1 = peg$c112;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c113); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c114();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 33) {
                  s1 = peg$c115;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c116); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c117();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 63) {
                    s1 = peg$c118;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c119); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c120();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 8252) {
                      s1 = peg$c121;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c122); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c105();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 8263) {
                        s1 = peg$c123;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c124); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c108();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 8265) {
                          s1 = peg$c125;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c126); }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c111();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 8264) {
                            s1 = peg$c127;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c128); }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c114();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 9633) {
                              s1 = peg$c129;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c130); }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c131();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 61) {
                                s1 = peg$c96;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c97); }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c132();
                              }
                              s0 = s1;
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 8734) {
                                  s1 = peg$c133;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c134); }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c135();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 10866) {
                                    s1 = peg$c136;
                                    peg$currPos++;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c137); }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c138();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 10865) {
                                      s1 = peg$c139;
                                      peg$currPos++;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c140); }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$c141();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 177) {
                                        s1 = peg$c142;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c143); }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$c144();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 8723) {
                                          s1 = peg$c145;
                                          peg$currPos++;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c146); }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$c147();
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          if (input.substr(peg$currPos, 2) === peg$c87) {
                                            s1 = peg$c87;
                                            peg$currPos += 2;
                                          } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c88); }
                                          }
                                          if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c148();
                                          }
                                          s0 = s1;
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.substr(peg$currPos, 2) === peg$c149) {
                                              s1 = peg$c149;
                                              peg$currPos += 2;
                                            } else {
                                              s1 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$c150); }
                                            }
                                            if (s1 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s1 = peg$c151();
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              if (input.charCodeAt(peg$currPos) === 10752) {
                                                s1 = peg$c152;
                                                peg$currPos++;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c153); }
                                              }
                                              if (s1 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c154();
                                              }
                                              s0 = s1;
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.charCodeAt(peg$currPos) === 10227) {
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
                                                  if (input.charCodeAt(peg$currPos) === 8594) {
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
                                                    if (input.charCodeAt(peg$currPos) === 8593) {
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
                                                      if (input.charCodeAt(peg$currPos) === 8646) {
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
                                                        if (input.charCodeAt(peg$currPos) === 68) {
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

    function peg$parsemoveEllipse() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c68;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c69); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 46) {
              s3 = peg$c68;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c69); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c70(s1);
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

    function peg$parsefigure() {
      var s0;

      if (peg$c170.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c171); }
      }

      return s0;
    }

    function peg$parsecolumn() {
      var s0;

      if (peg$c172.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c173); }
      }

      return s0;
    }

    function peg$parserow() {
      var s0;

      if (peg$c174.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c175); }
      }

      return s0;
    }

    function peg$parsestrike() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 120) {
        s0 = peg$c176;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c177); }
      }

      return s0;
    }

    function peg$parsestrikeOrDash() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 120) {
        s0 = peg$c176;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c177); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s0 = peg$c178;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c179); }
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
        showNotation: true,
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
        colorMarker: null
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
        var movesNode = node.offsetParent;
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
                boardAndDiv.style.display = 'grid';
                boardAndDiv.style.gridTemplateColumns = size + ' 40px';
            }
            var innerBoardDiv = createEle("div", innerBoardId, "board", theme, boardAndDiv);
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
        let boardConfiguration = {coordsInner: true, coordsFactor: 1.0};
        copyBoardConfiguration(that.configuration, boardConfiguration,
            ['position', 'orientation', 'showNotation', 'pieceTheme', 'draggable',
                'coordsInner', 'coordsFactor', 'width', 'movable', 'viewOnly', 'highlight', 'boardSize',
                'rankFontSize']);
        // board = new ChessBoard(innerBoardId, boardConfiguration);
        if (typeof boardConfiguration.showNotation != 'undefined') {
            boardConfiguration.coordinates = boardConfiguration.showNotation;
        }
        boardConfiguration.fen = boardConfiguration.position;
        var el = document.getElementById(innerBoardId);
        if (typeof that.configuration.pieceStyle != 'undefined') {
            el.className += " " + that.configuration.pieceStyle;
        }
        if (boardConfiguration.boardSize) {
            boardConfiguration.width = boardConfiguration.boardSize;
        }
        board = Chessground(el, boardConfiguration);
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
        if ((move.turn == 'w') || (that.mypgn.startVariation(move)) || (that.mypgn.afterMoveWithVariation(move))) {
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
            board.set({fen: myFen});
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
        var myMoves = that.mypgn.getMoves();
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
            for (var i = 0; i < myMoves.length; i++) {
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
            function findMoveForStart() {
                let startPlay = that.configuration.startPlay;
                if (!isNaN(startPlay)) {   // the following goes only over the main line, move number cannot denote a variation
                    startPlay = startPlay - 1;
                    let move = that.mypgn.getMove(0);
                    while (startPlay > 0) {
                        startPlay = startPlay - 1;
                        move = that.mypgn.getMove(move.next);
                    }
                    return move;
                }
                let moves = that.mypgn.getMoves();
                for (let move of moves) {
                    if (move.fen.startsWith(startPlay)) {
                        return move;
                    } else if (move.notation.notation == startPlay) {
                        return move;
                    }
                }
                return undefined;
            }

            if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
                let move = findMoveForStart();
                if (move === undefined) {
                    logError('Could not find startPlay: ' + that.configuration.startPlay);
                    return;
                }
                makeMove(move.prev, move.index, move.fen);
                unmarkMark(move.index);
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
 *  showNotation: false or true (default)
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
        let base = pgnBase(boardId, Object.assign({showNotation: false, mode: 'print'}, configuration));
        base.generateHTML();
        base.generateMoves(null);
    });
};

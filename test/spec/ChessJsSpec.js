describe("Chess Game", function() {
  var chess;

  beforeEach(function() {
    chess = new Chess();
  });

  it("should be able instantiate a chess game", function() {
    expect(chess.fen()).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(chess.turn()).toEqual("w");
  });

  describe("know the castling rules", function() {
    xit ("should know the castling rules from moves", function() {
      expect(chess.castling()).toEqual("Whatever");
    });

    xit("should know the castling rules from FEN only white", function() {
      var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      chess = new Chess(fen);
      // ==> e4 e5 Nf3 Nc6 Bc4 Bc5 ==> only white castle allowed
      // how to create a game from FEN?
    });

    xit("should know the castling rules from FEN white and black", function() {
      var fen = "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5";
      chess = new Chess(fen);
    });

    xit("should know the castling rules from FEN only black", function(){
      var fen ="rnbqk2r/pppp1ppp/5n2/4p3/1b1PP3/5N2/PPPB1PPP/RN1QKB1R b KQkq - 2 4";
      chess = new Chess(fen);
    });

    it("should know the castling rules for chess960: white", function () {
      let fen = ""
    })
  });


  describe("when reads a plain pgn", function() {
    beforeEach(function() {
      chess.load_pgn("1. e4 e5 2. Nf3 Nc6");
    });

    it("should have 4 moves (named history)", function() {
      expect(chess.history().length).toEqual(4);
    });

    it("should allow next moves", function() {
      var moves = chess.moves();
      expect(moves.length).toBeGreaterThan(0);
    });
  });

});

describe("Chess Game", function() {
  var chess;

  beforeEach(function() {
    chess = new Chess();
  });

  it("should be able instantiate a chess game", function() {
    expect(chess.fen()).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(chess.turn()).toEqual("w");
  });

    xit ("should know the castling rules", function() {
       expect(chess.castling()).toEqual("Whatever");
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

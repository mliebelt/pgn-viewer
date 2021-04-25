examples = {};

examples["1000"] = {
    desc: "Use PgnViewerJS for only displaying a board. See the section \"Boards\" for details on that.",
    html: "<div id=\"board\" style=\"width: 400px\"><\/div>",
    name: "Board with defaults",
    jsStr: "var board = PGNV.pgnBoard('board', {});",
    jsFn: function() {
        var board = PGNV.pgnBoard('board', {});
    }
};

examples["1001"] = {
    desc: "Use PgnViewerJS for showing a (short) game. The buttons, the board and the display of the " +
        "moves are all default values, that may be changed by configuration parameters. Parameter pgn is " +
        "mandatory when using \"pgnView\".",
    html: "<div id=\"board\" style=\"width: 400px\"><\/div>",
    name: "Shortest game possible",
    jsStr: "var pgn = \"1. f4 e6 2. g4 Qh4#\";\nvar board = PGNV.pgnView('board', {pgn: pgn});",
    jsFn: function() {
        var pgn = "1. f4 e6 2. g4 Qh4#";
        var board = PGNV.pgnView('board', {pgn: pgn});
    }
};

examples["1002"] = {
    desc: "Use PgnViewerJS for displaying a game in typical notation, with diagrams and different styles " +
        "for the moves, the boards, ... Looks similar to the style of some magazines or books. " +
        "For the diagram, I have taken the NAG 'D' (or $220), see <a href=\"http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs\">NAGs at Wikipedia</a> for details",
    html: "<div id=\"board\" style=\"width: 250px\"><\/div>",
    name: "Printing a game",
    jsStr: "var pgn = \"1. f4 e6 2. g4D Qh4#$220\";\nvar board = PGNV.pgnPrint('board', {pgn: pgn});",
    jsFn: function() {
        var pgn = "1. f4 e6 2. g4D { what a horrible move (but the shortest mate " +
            "you can get ...) } Qh4#$220";
        var board = PGNV.pgnPrint('board', {pgn: pgn});
    }
};

examples["1003"] = {
    desc: "Use PgnViewerJS for viewing a game with the option to edit it by adding variations, comments, ..." +
        "So start playing on the board, take moves back, and test variations. Not all " +
        "buttons are implemented, but the PGN button works and displays the current " +
        "game in the pgn notation (including comments).",
    html: "<div id=\"board\" style=\"width: 300px\"><\/div>",
    name: "Editing a game",
    jsStr: "var board = PGNV.pgnEdit('board', {});",
    jsFn: function() {
        var board = PGNV.pgnEdit('board', {});
    }
};

examples["1020"] = {
    desc: "ChessBoard initializes to the starting position on board with an empty configuration.",
    html: "<div id=\"board\" style=\"width: 400px\"><\/div>",
    name: "Starting Board",
    jsStr: "var board = PGNV.pgnBoard('board', {});",
    jsFn: function() {
        var board = PGNV.pgnBoard('board', {});
    }
};
examples["1021"] = {
    desc: "ChessBoard pieceStyle 'merida', 'case', 'wikipedia', 'alpha', 'uscf', 'condal', 'maya', and 'leipzig'.",
    html: '<p>Merida Case Wikipedia Alpha USCF Condal Maya Leipzig </p><div id="board" style="float: left; margin: 20px"></div>  <div id="board2" style="float: left; margin: 20px"></div>  <div id="board3" style="float: left; margin: 20px"></div>  <div id="board4" style="float: left; margin: 20px"></div>' +
    '  <div id="board5" style="float: left; margin: 20px"></div>   <div id="board7" style="float: left; margin: 20px"></div>  <div id="board8" style="float: left; margin: 20px"></div>  <div id="board9" style="float: left; margin: 20px"></div>',
    name: "Piece Styles",
    jsStr: "var board = PGNV.pgnBoard('board', {pieceStyle: 'merida', boardSize: '340px'});\nvar board2 = PGNV.pgnBoard('board2', {pieceStyle: 'case', boardSize: '340px'});\nvar board3 = PGNV.pgnBoard('board3', {pieceStyle: 'wikipedia', boardSize: '340px'});\nvar board4 = PGNV.pgnBoard('board4', {pieceStyle: 'alpha',  boardSize: '340px'});\nvar board5 = PGNV.pgnBoard('board5', {pieceStyle: 'uscf',  boardSize: '340px'});\nvar board7 = PGNV.pgnBoard('board7', {pieceStyle: 'condal', boardSize: '340px'});\nvar board8 = PGNV.pgnBoard('board8', {pieceStyle: 'maya',  boardSize: '340px'});\nvar board9 = PGNV.pgnBoard('board9', {pieceStyle: 'leipzig', boardSize: '340px'});",
    jsFn: function() {
        var board = PGNV.pgnBoard('board', {pieceStyle: 'merida', boardSize: '340px'});
        var board2 = PGNV.pgnBoard('board2', {pieceStyle: 'case', boardSize: '340px'});
        var board3 = PGNV.pgnBoard('board3', {pieceStyle: 'wikipedia', boardSize: '340px'});
        var board4 = PGNV.pgnBoard('board4', {pieceStyle: 'alpha',  boardSize: '340px'});
        var board5 = PGNV.pgnBoard('board5', {pieceStyle: 'uscf',  boardSize: '340px'});
        var board7 = PGNV.pgnBoard('board7', {pieceStyle: 'condal', boardSize: '340px'});
        var board8 = PGNV.pgnBoard('board8', {pieceStyle: 'maya',  boardSize: '340px'});
        var board9 = PGNV.pgnBoard('board9', {pieceStyle: 'leipzig', boardSize: '340px'});
    }
};

examples["1022"] = {
    desc: "ChessBoard with different positions. See the start position, a short finished game " +
        "and the Ruy Lopez after the first three moves. The positions are given as " +
        "FEN strings (see <a href=\"http://en.wikipedia.org/wiki/Forsyth–Edwards_Notation\">Forsyth–Edwards Notation</a> for details to that)." +
        "FEN strings are normally generated by software like ChessBase or Scid.",
    html: '<div id="b1" style="width: 300px; margin: 20px;float: left"><\/div>' +
        '\n<div id=\"b2\" style=\"width: 300px; margin: 20px; float: left"><\/div>' +
        '\n<div id=\"b3\" style=\"width: 300px; margin: 20px\"><\/div>',
    name: "Different positions",
    jsStr: "var fen1 = 'start';" +
        "\nvar fen2 = 'rnb1kbnr/pppp1ppp/4p3/8/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 0 3';" +
        "\nvar fen3 = 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4';" +
        "\nPGNV.pgnBoard('b1', {fen: fen1});" +
        "\nPGNV.pgnBoard('b2', {position: fen2});" +
        "\nPGNV.pgnBoard('b3', {position: fen3});",
    jsFn: function() {
        var fen1 = 'start';
        var fen2 = 'rnb1kbnr/pppp1ppp/4p3/8/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 0 3';
        var fen3 = 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4';
        PGNV.pgnBoard('b1', {position: fen1});
        PGNV.pgnBoard('b2', {position: fen2});
        PGNV.pgnBoard('b3', {position: fen3});
    }
};

examples["1023"] = {
    desc: "ChessBoard with orientation set to black.",
    html: "<div id=\"b1\" style=\"width: 300px; margin: 20px;float: left\"\"><\/div>",
    name: "Set orientation to black",
    jsStr: "PGNV.pgnBoard('b1', {orientation: 'black'});",
    jsFn: function() {
        PGNV.pgnBoard('b1', {orientation: 'black'})
    }
};

examples["1024"] = {
    desc: "ChessBoard with showCoords set to false.",
    html: "<div id=\"b1\" style=\"width: 300px; margin: 20px;float: left\"\"><\/div>",
    name: "Don't show coordinates",
    jsStr: "PGNV.pgnBoard('b1', {showCoords: false});",
    jsFn: function() {
        PGNV.pgnBoard('b1', {showCoords: false});
    }
};

examples["1025"] = {
    desc: "ChessBoard with different sizes for coordinates: default, coordFactor: 1.8, coordsSize.",
    html: "<div id='b1'></div><br/>" +
        "\n<div id='b2'></div><br/>" +
        "\n<div id='b3'></div>",
    name: "Different coordinates font sizes in the configuration",
    jsStr: "PGNV.pgnBoard('b1', {});" +
        "\nPGNV.pgnBoard('b2', {coordsFactor: 1.8});" +
        "\nPGNV.pgnBoard('b3', {coordsFontSize: 24});",
    jsFn: function() {
        PGNV.pgnBoard('b1', {});
        PGNV.pgnBoard('b2', {coordsFactor: 1.8});
        PGNV.pgnBoard('b3', {coordsFontSize: 24});
    }
};

examples["1026"] = {
    desc: "ChessBoard with the two options for coordinates layout: coordsInner: true (default); coordsInner: false.",
    html: "<div id='b1'></div><br/>" +
        "\n<div id='b2'></div><br/>",
    name: "Different coordinate layouts in the configuration",
    jsStr: "PGNV.pgnBoard('b1', {});" +
        "\nPGNV.pgnBoard('b2', {coordsInner: false});",
    jsFn: function() {
        PGNV.pgnBoard('b1', {});
        PGNV.pgnBoard('b2', {coordsInner: false});
    }
};

examples["1027"] = {
    desc: "ChessBoard with the 3 different sizes.",
    html: "<div id='b1'></div><br/>" +
        "\n<div id='b2'></div><br/>" +
        "\n<div id='b3'></div><br/>",
    name: "Different board sizes  set in the configuration",
    jsStr: "PGNV.pgnBoard('b1', {width: '250px'});" +
        "\nPGNV.pgnBoard('b2', {});" +
        "\nPGNV.pgnBoard('b3', {width: '400px'});",
    jsFn: function() {
        PGNV.pgnBoard('b1', {width: '250px'});
        PGNV.pgnBoard('b2', {});
        PGNV.pgnBoard('b3', {width: '400px'});
    }
};

examples["1051"] = {
    desc: "An config for a normal game, with the standard style. Try to use the buttons, and play the game forth and back. You may set any position in the game by just clicking on the move.",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Normal Game",
    jsStr: "var pgn = '1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0';\n pgnv = PGNV.pgnView('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn});
    }
};
examples["1052"] = {
    desc: "The same game in a more traditional style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Falken Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'falken'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'falken'});
    }
};
examples["1053"] = {
    desc: "The same game in green style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Green Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'green'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'green'});
    }
};
examples["1054"] = {
    desc: "The same game in Zeit style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Zeit Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'zeit'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'zeit'});
    }
};
examples["1055"] = {
    desc: "The same game in informator style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Informator Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'informator'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'informator'});
    }
};
examples["1056"] = {
    desc: "The same game in sportverlag style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Sportverlag Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'sportverlag'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'sportverlag'});
    }
};
examples["1057"] = {
    desc: "The same game in beyer style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Beyer Style",
    jsStr: "var pgn = [''1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'beyer'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'beyer'});
    }
};
examples["1058"] = {
    desc: "The same game in a blue style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Blue Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'blue'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'blue'});
    }
};
examples["1059"] = {
    desc: "The same game in a brown style",
    html: "<div id=\"b1\" style=\"width: 500px\"><\/div>",
    name: "Brown Style",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnView('b1', {pgn: pgn, theme: 'brown'});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn, theme: 'brown'});
    }
};
examples["1100"] = {
    desc: "A short chess game with the standard configuration.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Edit game",
    jsStr: "var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0']\n.join(\" \");\npgnv = PGNV.pgnEdit('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = ['1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1!  Qxf3? 20.Rxe7+! Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0'].join(" ");
        pgnv = PGNV.pgnView("b1", {pgn: pgn});
    }
};
examples["1101"] = {
    desc: "Here the normal layout of the moves, with some special characters, the so called NAGs. PNGViewerJS knows the NAGs, and " +
        "translates them in the correct notation. The following game " +
        "is not really correct commented, but it shows the different options.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Annotated moves",
    jsStr: "var pgn = '1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$5 a6$6 4. Ba4$7 Nf6$10 5. O-O$13 Be7$14 6. Re1$15 b5$16 7. Bb3$17 O-O$18 8. c3$19 d5$3';\nPGNV.pgnView('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = '1. e4$1 e5$2 2. Nf3$3 Nc6$4 3. Bb5$5 a6$6 4. Ba4$7 Nf6$10 5. O-O$13 Be7$14 6. Re1$15 b5$16 7. Bb3$17 O-O$18 8. c3$19 d5$3';
        PGNV.pgnView('b1', {pgn: pgn});
    }
};
examples["1102"] = {
    desc: "Here a game with a lot of variations, sometimes two or more levels deep. This is part of my opening repertoire as white.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 {the standard open game} 2. d4 {tries to open as early as possible} d6? {that is a bad idea now ...} 3. dxe5 {and now black should not take back, to not loose casteling option}'\nPGNV.pgnView('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = '1. e4 e5 {the standard open game} 2. d4 {tries to open as early as possible} d6? {that is a bad idea now ...} 3. dxe5 {and now black should not take back, to not loose casteling option}'
        PGNV.pgnView('b1', {pgn: pgn});
    }
};

examples["1103"] = {
    desc: "Here a game with a lot of variations, some two or more levels deep.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'\nPGNV.pgnView('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'
        PGNV.pgnView('b1', {pgn: pgn});
    }
};

examples["1104"] = {
    desc: "The game is shown in inline notation, compare with the list notation below.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'\nPGNV.pgnView('b1', {pgn: pgn});",
    jsFn: function() {
        var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'
        PGNV.pgnView('b1', {pgn: pgn});
    }
};

examples["1105"] = {
    desc: "The game is shown in inline notation, compare with the list notation below.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'\nPGNV.pgnView('b1', {pgn: pgn, notationLayout: 'list'});",
    jsFn: function() {
        var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'
        PGNV.pgnView('b1', {pgn: pgn, notationLayout: 'list'});
    }
};

examples["1106"] = {
    desc: "The game is shown in long notation, compare with the default short notation above.",
    html: "<div id=\"b1\" style=\"width: 360px\"><\/div>",
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'\nPGNV.pgnView('b1', {pgn: pgn, notation: 'long'});",
    jsFn: function() {
        var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'
        PGNV.pgnView('b1', {pgn: pgn, notation: 'long'});
    }
};

examples["1107"] = {
    desc: "Shows the same game with default languages: en (default), de, and fr. Look at the SAN notation, and hover over the buttons to see the tooltips.",
    html: '<div id="b1" style="width: 360px"><\/div>' +
        '<div id="b2" style="width: 360px"></div>' +
        '<div id="b3" style="width: 360px"></div>',
    name: "Variations in Moves",
    jsStr: "var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'\nPGNV.pgnView('b1', {pgn: pgn});\nPGNV.pgnView('b2', {pgn: pgn, locale: 'de'});\nPGNV.pgnView('b3', {pgn: pgn, locale: 'fr'});",
    jsFn: function() {
        var pgn = '1. e4 e5 ( 1... c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 ( 5... e5 6. Ndb5 a6 7. Na3 b5 8. Nd5 Nxe4 { This is a wild variation } ) 6. Be3 e6 ) 2. Nf3 ( 2. f4 exf4 3. Nf3 g5 ( 3... Nf6 4. e5 Nh5 ) ( 3... Be7 4. Bc4 Bh4+ 5. Kf1 ) 4. h4 ) Nc6 3. Bb5 a6 4. Ba4'
        PGNV.pgnView('b1', {pgn: pgn});
        PGNV.pgnView('b2', {pgn: pgn, locale: 'de'});
        PGNV.pgnView('b3', {pgn: pgn, locale: 'fr'});
    }
};

examples["1200"] = {
    desc: "Shows a game in default layout top",
    html: '<div id="board2" style="width: 300px"></div>',
    name: "Default layout top",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn});
    }
};

examples["1201"] = {
    desc: "Shows a game in default layout top in edit mode",
    html: '<div id="board2" style="width: 300px"></div>',
    name: "Default layout top in edit mode",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnEdit(\"board2\", {pgn: pgn});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnEdit("board2", {pgn: pgn});
    }
};

examples["1202"] = {
    desc: "Shows a game in layout left",
    html: '<div id="board2" style="width: 500px"></div>',
    name: "Layout left",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn, layout: 'left'});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn, layout: 'left'});
    }
};

examples["1203"] = {
    desc: "Shows a game in default layout top in edit mode",
    html: '<div id="board2" style="width: 500px"></div>',
    name: "Default layout top in edit mode",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnEdit(\"board2\", {pgn: pgn, layout: 'left'});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnEdit("board2", {pgn: pgn, layout: 'left'});
    }
};

examples["1204"] = {
    desc: "Shows a game in layout bottom",
    html: '<div id="board2" style="width: 300px"></div>',
    name: "Default layout top",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn, layout: 'bottom'});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn, layout: 'bottom'});
    }
};

examples["1205"] = {
    desc: "Shows a game in layout right",
    html: '<div id="board2" style="width: 500px"></div>',
    name: "Layout right",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn, layout: 'right'});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn, layout: 'right'});
    }
};

examples["1206"] = {
    desc: "Shows how to change sizes depending on the layout",
    html: '<div id="board2" style="width: 700px"></div>',
    name: "Layout sizes adjusted",
    jsStr: "var pgn = \"1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0\"\;\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn, layout: 'left', boardSize: '200px'});",
    jsFn: function() {
        var pgn = "1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn, layout: 'left', boardSize: '200px'});
    }
};

examples["1207"] = {
    desc: "Shows a change in layout with headers shown.",
    html: '<div id="board2" style="width: 500px"></div>',
    name: "Layout sizes adjusted",
    jsStr: "var pgn = '[White \"Anderssen\"] [Black \"Dufresne\"] 1. e4 e5 2. Nf3 Nc6  ...  24. Bxe7# 1-0';\npgnv = PGNV.pgnView(\"board2\", {pgn: pgn, layout: 'left'});",
    jsFn: function() {
        var pgn = "[White \"Anderssen\"] [Black \"Dufresne\"] 1. e4 e5 2. Nf3 Nc6  3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 { now the whole idea unfolds } 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24. Bxe7# 1-0";
        pgnv = PGNV.pgnView("board2", {pgn: pgn, layout: 'left'});
    }
};


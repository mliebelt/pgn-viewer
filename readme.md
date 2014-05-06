# PgnViewerJS

PgnViewer JS is just a simple JavaScript implementation to show PGN files (Portable Game Notation == Chess)
in a web page. It uses for that the following libraries:

* [chessboardjs](https://github.com/oakmac/chessboardjs) Chess board that has all functionality to
  display chess positions, move pieces, ...
* [chess.js](https://github.com/jhlywa/chess.js) Base library to model chess in JavaScript

# Features

This implementation will have the following features (in the future):

* Allows to show one or more chess games complete
* Allow to play through the games forward and backward, including variations.
* Allows to play from a legal position legal moves, and adds these moves to the notation (in a different style)
* Allows to play through
  * clicking on moves
  * clicking on next and previous button
  * clicking on play button

# Interface

There are 2 parts to the interface:

   * How does the UI work?
   * How is this viewer used?

## Examples

The included example `examples/sample.html` is my first try how to show the board. It will be expanded later by others
(complete) examples that may be used to study the usage.

To use the examples, you have to first download this repository, and open the example files in the browser.
See the different parameters used in this example, to customize the drawing of the board.

The second example `examples/pgn.html` shows the first few moves of a game together with
the (clickable) notation. This shows (at the moment) the deficits I have in using
`chess.js` as a library.

## Using the viewer

To use the viewer in a JavaScript page, you have to do the following steps:

   * include the necessary libraries (should be as short as possible)
   * include the necessary CSS files
   * Include a simple JavaScript inside your HTML page.
   * Include the necessary div containers for rendering of the board and the moves

### JavaScript call inside page

    <script>
    cfg = { pieceStyle: 'merida' };
    new PgnViewer("demo",cfg);
    </script>

Alternative call could be:

    <script>
    var pgnData = "1. e4 e5 2. Nf3 Nc6 3. Bb5";
    cfg = { pgn: pgnData };
    new PgnViewer("demo", cfg};
    </script>

### HTML frame

When you use PgnViewerJS, you have to provide a frame for that. The following example is the minimal frame to use.

    <!DOCTYPE html>
    <html>
        <head lang="en">
            <meta charset="UTF-8">
            <title>Simple Example</title>
            <!-- Libraries used: chessboardjs and chess.js from GitHub -->
            <script src="chessboardjs/js/chessboard.js" type="text/javascript"></script>
            <script src="chessboardjs/js/jquery-1.10.1.min.js" type="text/javascript"></script>
            <script src="chessboardjs/js/json3.min.js" type="text/javascript"></script>
            <script src="chess.js/chess.js" type="text/javascript"></script>

            <!-- CSS used: chessboardjs from GitHub -->
            <link href="chessboardjs/css/chessboard.css" type="text/css" rel="stylesheet"/>

        </head>
        <body>
        <div id="board" style="width: 400px"></div>
        <script>Insert here the script</script>

        </body>
    </html>
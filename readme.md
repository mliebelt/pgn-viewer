# PgnViewerJS

PgnViewerJS is just a simple JavaScript implementation to show PGN files 
(Portable Game Notation == Chess)
in a web page. There are some tools out there, a lot of them with nice
functionality, but none of them met all my expectations, so this is a try
to meet them all. 

For that purpose, it does not write everything anew, but it uses for that the following libraries:

* [chessboardjs](https://github.com/oakmac/chessboardjs) Chess board that has
 all functionality to display chess positions, move pieces, ...
* [chess.js](https://github.com/jhlywa/chess.js) Base library to model 
  chess in JavaScript
* [pegjs](https://github.com/pegjs/pegjs) Parser Generator implemented in Javascript.
  Used to translate the grammer file `pgn-rules.peg` into a Javascript representation.

See the working examples on my new GitHub Pages site [PgnViewerJS](http://mliebelt.github.io/PgnViewerJS/) to see what is working at the moment.

# Development and Releases

* Development will be done (in the future) on the branch `develop` and in future branches.
* The current release will be the content of the `master` branch.
* Use the GitHub `Download ZIP` functionality to get the current release.
* Or go to the github.io pages (documentation), where the current (and former) versions will be available.

# Features

This implementation has the following features:

* Allows to show one chess games complete, with a lot of different
  styles, themes, tuning, ...
* Allows to play through the games forward and backward, including variations.
* Allows to play from a legal position only legal moves, and adds these 
  moves to the notation (in a different style)
* Allows to play through by
  * clicking on moves
  * clicking on next and previous button
  * clicking on play button
* Allows to add moves to a game, when in the right 'mode'.  
* Knows all PGN notation elements, and knows how to render them.  

# Interface

There are 2 parts to the interface:

   * How does the UI work?
   * How is this viewer used?

## UI modes

There are four different kind of usages, which lead to 3 modes:

* pgnBoard, pgnPrint will just show a position or a whole chess game, 
without any interaction possible.
* pgnView renders the whole game, and allows to play it through, jump
to any position.
* pgnEdit is a superset of pgnView, that allows to additional add variations,
change the order of main line and variations, and allows all other kind of
interactions that are possible: adding comments, PGN notation elements, whatever.

There is at the moment no way to save a game that was edited in `pgnEdit` mode. But
you may at least copy the whole notation, and insert it again in the HTML code of
your web page.

## Using the viewer

To use the viewer in an HTML page, you have to do the following steps:

   * Include the necessary libraries (should be as short as possible)
   * Include the necessary CSS files
   * Include some simple JavaScript code inside your HTML page.
   * Include the necessary div container for rendering of the 
   board and the moves

So a rough template will look like:

    <!DOCTYPE html>
        <head>
            <link href="dist/css/pgnvjs.css" rel="stylesheet">
            <script src="dist/js/pgnviewerjs.js" type="text/javascript"></script>
        </head>
        <body>
            <div id="board"></div>
            <script>
                cfg = { pieceStyle: 'merida' };
                pgnView("demo",cfg);
            </script>   
        </body>
    </html>

### JavaScript call inside page

    <script>
    cfg = { pieceStyle: 'merida' };
    pgnView("demo",cfg);
    </script>

Alternative call could be:

    <script>
    var pgnData = "1. e4 e5 2. Nf3 Nc6 3. Bb5";
    cfg = { pgn: pgnData };
    pgnView("demo", cfg};
    </script>

There are 4 different options to call the viewer:

1. pgnBoard: The simplest one just to draw a board. This should work
  with a FEN string as argument. If you give a PGN notation, the board
  will render the last position.
2. pgnView: Render a whole game, and allow to play through it. It may
  be (later) possible to add additional boards, and to disable the
  playing funtionality, just to show a static game (e.g. for printing it).
3. pgnPrint: Prints a whole game (including comments and diagrams where noted)
  in a notation comparable to that used in books and magazines. 
3. pgnEdit: Adds editing functionality, so that the user has the
  option to add (or remove) variants, add comments and PGN notation,
  and to copy at least the current notation to the clipboard, as an
  input for later.
  
## Configuration
    
There are a growing number of parameters for the configuration, so here is the idea behind it:
    
* board parameter: Used partly by the used chessboard.js, partly in the UI
  * showNotation: false or true (default). To show a-h and 1-8 on the board.
  * orientation: 'black' or 'white' (default). Orientation of the board, the color is at the bottom.
  * theme: HTML class given to the board, the moves, ... See the file `pgnvjs.css` for examples.
    Used are currently: 'green', 'zeit' (like the German paper), 'blue', 'chesscom' (similar
    to chess.com), 'informator' (tried to be similar to it), 'sportverlag' (a German VERLAG), 
    'beyer' (another one), 'falken' (had the Najdorf from Nunn from Falken).
  * pieceStyle: 'wikipedia' (default), alpha, uscf (all from chessboard.js),
    'case', 'condal', 'maya', 'merida', 'leipzig' (from ChessTempoViewer),
    'chesscom' (from Chess.com)
  * pieceTheme: Normally adapted automatically, only necessary, when you want to
    integrate your own pieceStyle that has to use a different path. Should be
    relative to the javascript file `pgnviewerjs.js`.
  * timerTime: delay time for the timer, default is 700 ms. Only used when
    pressing the play button.
  * locale: 'en', 'de' or others defined by the files in `locales/*.json`. Default
    is defined by the browser, and may be overridden for each game. The locale
    influences the following:
    * Move notation: Nf3 (en) == Sf3 (de), ...
    * Move annotation: $XX (PGN) == "with compensation for white" (en) ==
      "Mit Kompensation für Weiß" (de), ...
    * Move headers: Depending on the theme, there may be headers generated like
      * Event, Site, Round, Date, Result (en)
      * Veranstaltung, Ort, Runde, Datum, Resultat (de)
      * ...
* chess parameters: Used most by chess.js and pgn.js.    
  * position: a FEN string or 'start' (default) or 'clear' (for an empty board) 
  * pgn: a whole game (or part of a game from the given position)    
    
## API
    
Define how the API should look like, and what are the necessary
things users should know to use the viewer in the best way possible.

* Different calls (external API)
  * Arguments to the calls
  * possible attributes of the configuration object
    * in which part is which configuration parameter used
    * are some of them dependent on each other
    * what are the defaults (if there are any)
* Additional calls (internal API)
  * pgnReader: How to read PGN, and what the resulting object
    will have as attributes to be used.
    * Development mode: Creating the parser every time anew (and later how
      to develop the grammar)
    * Runtime mode: Generating and using the parser.
    * Explain the grammar in enough detail.
  * chess: Access to the inner chess game, that allows to move, check, ...
  * board: Access to the inner board, that uses a chess object
  * moves: inner structure of each move, the linking of them, and how to
    find the next and previous moves.
    
## Public site
    
See the documentation on the public site [PgnViewerJS](http://mliebelt.github.io/PgnViewerJS/docu/index.html)
for the current state, some working examples, and a little bit as background. This
site is growing, and allows me to show the early alpha implementation to others.

### Available versions

I will provide downloads of the versions, that should be easy to install. Just unpack
locally, and copy one of the examples and play with them.

* [Version 0.9.5](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.5.zip): Some more fixes, stability.
* [Version 0.9.4](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.4.zip): Finished edit mode, cleanup, some more fixes.
* [Version 0.9.3](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.3.zip): Allows special markup, some more bug fixes.
* [Version 0.9.2](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.2.zip): Some more bug fixes, examples to all issues at [GitHub](https://github.com/mliebelt/PgnViewerJS/issues), added Changelog.md, started restructuring the sources.
* [Version 0.9.1](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.1.zip): Some bug fixes, examples to all issues at [GitHub](https://github.com/mliebelt/PgnViewerJS/issues),
  some additional examples and a lot of fixes in the documentation.
* [Version 0.9.0](https://s3.eu-central-1.amazonaws.com/pgnviewerjs/releases/PgnViewerJS-0.9.0.zip): Nearly feature complete, roughly documented, stable enough to play with it.

## References

* http://fontawesome.io/: Nice icon font used for some buttons
* http://www.famfamfam.com/lab/icons/silk/: Used part of the icons in the UI
* http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs Definition of the NAGs (partly used)
* **TODO** Collect here all references that are used in the implementation. This is only fair to the many ones that have provided additional parts of the implementation.
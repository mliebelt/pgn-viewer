# Plan for PgnViewerJS

The following describes  what is planed for the viewer. This is more concrete than `readme.md`, but
there is of course no guarantee that anything will be implemented soon.

## Planed features

* Allows to show one or more chess games complete
* Allow to play through the games forward and backward, including variations.
* Allows to play from a legal position legal moves, and adds these moves to the notation (in a different style)
* Allows to play through
   * clicking on moves
   * clicking on next and previous button
   * clicking on play button

## Order of plan

### Visual

#### Show boards (/)

* Transport the features of chessboardjs, so that the same configuration is possible.
* Works sufficiently now.

#### Add additional figure sets (/)

* Add as figure sets the ones from chess.com and from ChessTempo Merida.
* Added as well case, condal, leipzig and maya from ChessTempo.

##### Additional feature

* Allow others to add figure sets as well.
* Provide a registry, and provide there an additional path to the set (relative to the
  JavaScript file that loads it).
* Organisation has to be the same:
  * Path to the piece style (only variant here).
  * Directory named as the piece style.
  * Then '/{piece}.png'

#### Generate from PGN structure moves

* Generate a reasonable frame for the moves (id: <ID>Moves, class: moves).
* Generate the moves in a pleasant style.
* Look at different books and try to adapt some of the styles, allow the style to be set
  (as attribute moveStyle).
    
#### Different move styles

* one or two column (depending on how much to show)
* Main moves flowing or one move (white and black) on one line.
* References to the diagrams (numbered, who is to move)
* Variations flowing in block mode (normally)
* Use Figurine instead of the move letters (for white and black with the same symbols)

#### Different PGN header display

* None at all (default?)
* White and Black players bold, rest flowing (order?)
* Normal order is
  * Wikipedia definition
    * Mandatory: Event, Site, Date, Round, White, Black, Result.
    * Optional: Annotator, PlyCount, TimeControl, Time, Termination, Mode, ...
  * New in Chess: Event, Notes by <Annotator>, White, Black, Event, Date
  * Sicilian Love: White, Black, Round, Site, Year

### Generate moves from PNG (main line)

Given a PNG string with some moves do the following:

1. Give that string to chess.js and parse it.
2. Generate for all moves the HTML.
3. In each HTML move include:
   * a span element with additional class information: mainline, white|black, ??
   * a link that calls a javascript function
   * argument to that function is the FEN string of the resulting position
4. Print that HTML after the board in a special container.

Do all of that with a new example HTML file.

### Understand FEN in a better way

Currently, FEN is black magic. I have to understand what is inside a FEN string, and construct
from that some more information that may be needed otherwise. The following information
is taken by `chess.js`:

* All rows of the chess board with the white and black pieces on it
* 6 space delimited fields: castling, en-passent, side to move, # half moves, # moves, ...

But not all of this information is available from the outside. So it is difficult to get
the current move number, ...

### Provide a FEN API that can be used from the outside.

At least move number, turn, en-passent, rochade, ... should be possible.

### Understand CSS, enhance it. (/)

Currently, the theme of the board is fixed. By adding some CSS, and allowing users
to add their own one. Describe what steps users have to do to do it well.

* Add a new CSS file (as copy of `templ.css`)
* Add to it
  * a new theme key (like in the example `.green`
  * Replace that at each location.
  * Adjust what you want to adjust.

See the default `pgnvjs.css` with the themes `blue` and `green` and the example `sample.html`.

### Read PGN including the comments and variations

Currently, chess.js is only able to read the main line in a PGN string (I tried it).
The following is needed to construct a full-blown PgnViewer:

* Read all lines, and bring them in an order
  * logically (by chess terms)
  * physically (what comes first in the PGN file should be in the output first)
* Define a useful data structure (JSON), that allows to navigate easily PGN.
* Define how the moves are connected:
  * Each one with its previous and following (logically or by ID, or in the data structure).
  * Each moves knows its variants.
  * The structure has to be hierarchical
* Information in the PGN are
  * Header (see `chess.js`  for more information)
  * Moves (partly with move number or without)
  * Comments (before or after moves)
  * Special symbols, that denote something in chess notation

Is there a specification available, is that spec available offline, to study it?

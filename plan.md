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

## Planed and working

### Visual

#### Add additional figure sets (/)

* Add as figure sets the ones from chess.com and from ChessTempo Merida.
* Added as well case, condal, leipzig and maya from ChessTempo.

##### Additional figures (working)

* Allow others to add figure sets as well.
* Provide a registry, and provide there an additional path to the set (relative to the
  JavaScript file that loads it).
* Organisation has to be the same:
  * Path to the piece style (only variant here).
  * Directory named as the piece style.
  * Then '/{piece}.png'

#### Generate from PGN structure moves (working)

* Generate a reasonable frame for the moves (id: <ID>Moves, class: moves).
* Generate the moves in a pleasant style.
* Look at different books and try to adapt some of the styles, allow the style to be set
  (as attribute moveStyle).
  
#### Generate PGN move from data
  
* We have to know every detail from moves, so the resulting notation is not sufficient.
* Collect the details during parsing, and give them out (additionally) so that it can
  be used when generating move output.
* What support is available from chess.js? The following should be clarified:
  * Disambiguation: is that necessary or not? Examples: Nd7, Ng8, move Nf6 is not clear.
    But when white pins the black Nd7, then Nf6 does not need disambiguation.
    
#### Different move styles (working)

* one or two column (depending on how much to show)
* Main moves flowing or one move (white and black) on one line.
* References to the diagrams (numbered, who is to move)
* Variations flowing in block mode (normally)
* Use Figurine instead of the move letters (for white and black with the same symbols)
* white and black together (without comment) as block, if more than one block fits on one line,
  make two or more blocks.

#### Different PGN header display (working)

* None at all (default?)
* White and Black players bold, rest flowing (order?)
* Normal order is
  * Wikipedia definition
    * Mandatory: Event, Site, Date, Round, White, Black, Result.
    * Optional: Annotator, PlyCount, TimeControl, Time, Termination, Mode, ...
  * New in Chess: Event, Notes by <Annotator>, White, Black, Event, Date
  * Sicilian Love: White, Black, Round, Site, Year

#### Prepare different layouts for headers (working)

* See the example with Chess.com
* Try to find different examples, and build them in plain HTML (including CSS)
* Use that CSS later for different styles
  * Styles for the board itself
  * Styles for the display of the moves and comments
  * Styles for the display of the headers
* Generate all HTML elements, so that they can be included easily. Works well
  for the board and the moves, will work for the headers additionally.
  
#### Allow additional boards
  
* Use a special comment for that (like {diagram})
* The generation should be the same as the main board (with the same configuration)
  but reduced size of course.
* Play with different layout possibilities:
  * Centered, moves then below
  * Left, moves flowing to the right
  * Other ??

#### Understand FEN in a better way

Currently, FEN is black magic. I have to understand what is inside a FEN string, and construct
from that some more information that may be needed otherwise. The following information
is taken by `chess.js`:

* All rows of the chess board with the white and black pieces on it
* 6 space delimited fields: castling, en-passent, side to move, # half moves, # moves, ...

But not all of this information is available from the outside. So it is difficult to get
the current move number, ...

#### PGN Annotations (working)

* See http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs (NAGs) for the meaning
* how to represent them as symbols?
* Is there a font for the special symbols, or are these available everywhere?

#### Provide a FEN API that can be used from the outside.

At least move number, turn, en-passent, rochade, ... should be possible.

#### Generate PGN including comments and variations (working)

* Decide the structure of all moves (div, span, IDs, classes, hierarchy).
* Use the linked moves in generation.
* Allow different styling by CSS only (for the `<div class="moves">...</div>`)
* Provide examples for
  * main line in one column
  * main line in one paragraph
  * variations inlined
  * variations separated by paragraphs
  * different styling for them

#### Bind keys

* Allow to stear a game by function keys.
* If more than one game is displayed, only the game that has focus (the user has clicked in)
  can be driven by the function keys.
* Use the following function keys:
  * "left": prevMove
  * "right": nextMove
  * "space": 
  
### Infrastructure

#### Structure of the project

* Get rid of the sub-modules. This was initially a good idea, but is not well now.
* Use instead
  * separate folders during development, so it is easier to develop (and replace older versions
    by newer ones)
  * Rules in the Gruntfile which files should be selected for the distribution (in which order)  

#### Building distribution  (working)

* Use Grunt for building a distribution (/)
* Extract only the files that are needed.
* Decide which ones of them should be used in which version.
* Decide which ones should be minified (all?) and / or concatenated
* Decide if more than one distribution is needed
  + With minimal figure sets (merida, wikipedia?)
  + What else?
* Let the structure as is, see if configuration for paths is needed (if someone
  wants to deploy on different paths).

#### Structure distribution

* What should be the structure of a distributed application? I had problems (first) in using the gruntified application ...
* Does it make sense to have different ones: small, typical, full?
* What should be the different parts in it?

#### Distribution and GitHub

* What are normal patterns for distributions on GitHub?
* Which one of them is the right approach for mine?
* What are the requirements (of myself) according to GitHub and packaging?
* Is there a way to provide an example web site for showing how the application works in real life (without buying something)?

#### Provide web site for distribution

* Design a web site for this project that helps to make marketing.
* Provide the examples / documentation / ... separated from the development.
* Ensure that building the distribution also builds the sources of the web site.
* Use Skeleton for the Look of that web site, but ensure that the files needed for that
  are separated from the files needed for PgnViewerJS.
* Start building the documentation as a web site, so it is easier to use it locally and distribute it.  

## Done and mostly finished

### Visual

#### Show boards (/)

* Transport the features of chessboardjs, so that the same configuration is possible.
* Works sufficiently now.

#### Understand CSS, enhance it. (/)

Currently, the theme of the board is fixed. By adding some CSS, and allowing users
to add their own one. Describe what steps users have to do to do it well.

* Add a new CSS file (as copy of `templ.css`)
* Add to it
  * a new theme key (like in the example `.green`
  * Replace that at each location.
  * Adjust what you want to adjust.

See the default `pgnvjs.css` with the themes `blue` and `green` and the example `sample.html`.

#### Define useful API for pgnView (/)

Currently the API is only one: call the function with a unique ID (for the DIVs needed),
and the configuration with everything included: PGN, configuration parameters for chess or
chessboardjs, additional parameters for anything, ...

This is difficult to use and will lead in short time to a mess of code, because everything
has to fit in the configuration. 

So try to find the needed API for clients. How will they use the viewer, and what are
therefore the APIs needed?

Here are some ides how to structure this:

* Even if it is not very functional, use JS objects (with new ...) and some core APIs for them.
* Provide more than one functional interface, that wraps the core behavior and adds some
  defaults and what to do at the beginning.
  * pgnView: Provide a viewer for a pgn game, with some variants.
  * pgnEdit: Provide a viewer that allows to edit a game.
  * pgnBoard: Provide just a board for some position (by giving a FEN string).
  * pgnBase: Base functionality, used by all others. Decide what is here or in the others.
  
#### Structure pgnviewer.js cleaner (/)
  
Currently the whole thing is a hack. it is not pleasant, growing, and more variables are visible
in more places than wished. At least the following should be done:
  
* Find the parts that define the board (only)
  * configuration needed by chessboardjs, div for it, copying the part of the configuration,
    filling the defaults and dependent parameters
  * utility functions to drive the board: setting position, moving, UI elements for that, ...
* Define the parts for the moves (that correspond to the board
  * DIV for the moves
  * How to structure, expand, ... the DIV
* Define the parts for the UI itself: What is needed for viewing, annotation, editing, ...
* Define the reading and writing of PGN (only), how to handle it, and what is the API to
  work with the PGN object.
  
### PGN

#### Generate moves from PNG (main line) (/)

Given a PNG string with some moves do the following:

1. Give that string to chess.js and parse it.
2. Generate for all moves the HTML.
3. In each HTML move include:
   * a span element with additional class information: mainline, white|black, ??
   * a link that calls a javascript function
   * argument to that function is the FEN string of the resulting position
4. Print that HTML after the board in a special container.

Do all of that with a new example HTML file.

#### Ensure edge-cases of PGN are handled appropriate (/)

Current edge-cases are the following:

* Ending with a half-move of white
* Starting not with the initial position (headers have to include a FEN string, see below)

Later (with variations):

* starting and / or ending with a half-move, with that different notation for the move number
  then.
* Being recursive, that means variations holds an array of pgn result then

#### PGN Comments (/)

* Allows comments at all reasonable places.
* Hold them as commentBefore and commentAfter attributes in the move objects.

#### Read PGN including the comments and variations (/)

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

#### Iterate over all moves including variations in the right order (/)

* Create an iterator that can be used in the generation of the moves.
* Each move should know its counter / index when asked.
* Cache all moves (main line and variations) in the same cache. The index
  is the index of this cache (only). The function getMove(index) should
  work on this cache.
* The index is the same that is used as key in the span / div for the move.
  This index should be varied by:
  * <game-id>move<index>
  * When locating an element in the page, the game-id should be taken into
    consideration.
* Call a function with the following arguments:
  * Current move, last move, current index, last index, 




# Plan for PgnViewerJS

The following describes  what is planed for the viewer. This is more concrete than `readme.md`, but
there is of course no guarantee that anything will be implemented soon. To inform about the current situation, there are 3 states known:

* <>: Empty  == planed
* <(working)> == working on that feature, but not (yet) finished
* <(/)> == done

If a whole section is completely done, it is moved altogether in the done section at the bottom.

## Planed features (working)

* Allows to show one or more chess games complete (/)
* Allow to play through the games forward and backward, including variations. (/)
* Allows to play from a legal position legal moves, and adds these moves to the notation (/)
* Allows to play through (/)
   * clicking on moves (/)
   * clicking on next and previous button (/)
   * clicking on play button (/)
* Allows to add interactively variations to the game, and show these as additional notation. (working)
* Allows to export the current game play as notation in PGN, and export the current position as FEN string. (working)   

## Planed and working (working)

### Visual (working)

#### Allow default configuration used by all pgnViewers on the same page (planned)

* Provide a global configuration which is the base for the local configuration (implicitly).
* This would allow to first make the global configuration right.
* Then base the local configuration on the global one.
* Especially if someone does not like the defaults provided (or want to have their own defaults),
this would help a lot.

#### Allow sizing of board by configuration (working)

* Add parameters for
  * size: size of the whole (board and moves) (/)
  * boardSize: width == height of the board (/)
  * moveWidth: width of the move div (/)
  * moveHeight: width of the move div (/)
* Change the divs by JavaScript
* The combination of the sizes may be difficult, and not all are understood. There should be rules that are easy to understand, so that the configuration is not trial and error prune.
* Ensure that reasonable defaults are used when not all parameters are given.
* Allow setting of parameters by styles (e.g. chesscom should set width and height of board and moves).
* Copy the general layout from the RPB Chessboard. There are 4, I need at least 3: left, right, normal (I don't like popup). That allows to use the moves size independet from the board size.

#### Allow styling of board (and others) by configuration (working)

* Styling of size does work (more or less), why not style other things.
* Styling should be possible for defined things:
  * board color (black and white)
  * border (for notation)
  * notation itself (depending on board color, different possibly for black and white)
* This allows to style boards individually, CSS is for the default styling.  

What styling is available at the moment (see the additional documentation):

    pieceTheme  <string>        of the pieces to take
    theme       <string>        CSS class added to a lot of divs
    headers     <true|false>    if headers should be shown
    scrollable  <true|false>    if movesDiv should be fixed with scroll bars

The following styling should be added to allow styling of CSS things:

    whiteColor  <color>     the color of the white fields on the board
    blackColor  <color>     the color of the black fields on the board
    borderColor <color>     the color of the border
    whiteFontColor  <color> the color of the a-h,1-8 characters on white fields
    blackFontColor  <color> the color of the a-h,1-8 characters on black fields
    

Have a look at https://chess24.com/en/read/news/baku-gp-round-10-caruana-gelfand-are-back and see how they have done the boards. There are a lot of ideas implemented here:

* Board is draggable (that means can be displayed in a separate window)
* Switch between notation and meta-data
* There are popups when you want to make a move, but there are variations. Very handy ...


#### Generate PGN move from data (working)
  
* We have to know every detail from moves, so the resulting notation is not sufficient.
* Collect the details during parsing, and give them out (additionally) so that it can
  be used when generating move output.
* What support is available from chess.js? The following should be clarified:
  * Disambiguation: is that necessary or not? Examples: Nd7, Ng8, move Nf6 is not clear.
    But when white pins the black Nd7, then Nf6 does not need disambiguation.
  * I have read that this depends on reading moves (more lax, that means there may
    be additional information there that is not needed, which is no error). Writing is more strict, and there disambiguation should only used if necessary, and only there.
    
#### Different move styles (working)

* one or two column (depending on how much to show)
* Main moves flowing or one move (white and black) on one line.
* References to the diagrams (numbered, who is to move)
* Variations flowing in block mode (normally)
* Use Figurine instead of the move letters (for white and black with the same symbols)
* white and black together (without comment) as block, if more than one block fits on one line,
  make two or more blocks.
* What about the diagrams themselves? What is a pleasant style? How to map that on HTML, and ensure that the print-out will work?  

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

* See the example with Chess.com (/)
* Try to find different examples, and build them in plain HTML (including CSS)
* Use that CSS later for different styles
  * Styles for the board itself (/)
  * Styles for the display of the moves and comments (working)
  * Styles for the display of the headers (working)
* Generate all HTML elements, so that they can be included easily. Works well
  for the board and the moves, will work for the headers additionally. (/)
  
#### Allow additional boards (working)
  
* ---Use a special comment for that (like {diagram})--- don't do that (/)
* which is not so nice because it binds the comment, that may be used for other things. Provide therefore a different notation for diagrams, e.g. by using a NAG that is not reserverd for that. What about $512??
* The notation could be alternatively like:
  1. e4 D f5?? D
  the D is the symbol for diagram, and means that after that move, a diagram is shown
* Then the different possibilities for comments help much more ....  
* The generation should be the same as the main board (with the same configuration)
  but reduced size of course. (/)
* Play with different layout possibilities:
  * Centered, moves then below
  * Left, moves flowing to the right
  * Other ??
* Whole layout has to change (for pgnPrint)
  * Skip the normal board generation.
  * The boards (as part of the move div) will be contained there.
* pgnView could suppress the additional diagrams (normally), and switch then
  to print-out mode when the HTML page is printed. Is there something JavaScript
  can do to be noticed?
  Alternatively, this could be done altogether with CSS only. Combinations are:
  * pgnView + D + view | edit: hide for normal mode, show for printing
  * pgnBoard: show all the time
  * pgnPrint + D: show all the time
* Use pgnBoard for the diagram-boards, as normal, with the configuration given by the normal call. So only difference is the creation of the moves, and that the board-id is generated during creation of the moves.  
* Allow additional / different styling. Configuration gives the default, and inside
  the comment, additional configuration can be given that overrides the default.

#### Define UI for Editing (working)

* Editing needs additional UI elements for doing its job. These are (stolen mostly from Scid):
  * Buttons for variation management: delete current, increase weight, delete line, delete after
  * Buttons for annotations: drop-down list of annotation symbols (including none) that work on the current move.
  * UI for comments: text field, buttons for add before and add after comment (/)
  * Popup-menu, if necessary: promotion to ..., [replace move, new variation, new main line, ...],  
* Edit: Delete variation, Promote variation, Delete moves after, Drop Down NAG
* Edit Comment: Text editor (/)

##### Variation management (working)

The following cases should be allowed:

* A move of a variation is selected, and it is changed to the main line. The main line (up from that move) will then changed to the variation. The following cases are possible:
** Only one variation: Main line and variation are switched.
** More than one variation on the same level: the selected variation is made the main line, and the main line will get the first variation. All other variations are made additional variations.
* A move of a variation is selected, and it is upgraded / downgraded: Only the order of the variations have to be changed, the rest will be the same.
* A move of a variation is selected, and the line is deleted: The whole line is deleted, nothing more necessary.
* A move of a variation is selected, and the move and the rest of the variation is deleted: Do exactly that, nothing more to do. It is not necessary to additionally allow to deleted  the variation after the move, because then that move should be selected. 
* A move is done on the board: The new move is
  * inserted as the next move, if the previous move was the last one
  * inserted as the first move of the first variation, if the current move has no variation yet.
  * inserted as the first move of a new variation, if the current move has variations.
  * just done, if there is a next move of the main line of in the variations that matches that move. This move is then selected.
  Every time a move is done, the move is added to the moves display, and then the new move is selected then.
  
The following structure is needed, so that the variation management is possible:
  
* The variations have to be a part of the move, which means that adding a variation div after the move is not sufficient. It has to be part of the move. By adding moves (addMove in PGN and on the board), the moves are added after the current move. If that move has variations, the variations will go to the end, if they are not part of the current move.
* It should be checked if it necessary to build the variation array like it was done in the past. The first move should be added in the variation-array, but the rest of the moves don't have to be part of it. It is just sufficient that the move is linked to the previous one and vice versae.
* Variations have to know 2 things:
  * Which move is the father of the variation?
  * Which move is the predecessor of this move of the variation?
  
Examples:
1. e4 ( 1. d4 d5 ) e5 ==> 
[
    { e4, var: [
                [
                  { d4 },
                  { d5 }
                ]
               ]
    },
    { e5 }

1. e4 e5 ( 1... c5 2. Nf3 ) 2. Nf3 ==>
[
    { e4, prev: null },
    { e5, prev: e4, var: [
                [
                    { c5, prev: null },
                    { Nf3, prev: c5 }
                ]
               ]
    },
    { Nf3, prev: e5 }
  
##### Annotations
  
UI of Scid is here totally different: Adds a lot of buttons, for each possible annotation one, and pressing the button, the annotation is added to the collection of annotations. Pressing clear will remove all annotations.
  
Currently, PgnViewerJS does not allow more than one annotation. This has to be changed in the grammar. (/)
  
Annotations are provided by a button, with the entries: Clear, !, !!, ...

Scid used annotation 'D' for diagram, and when that is exported to PGN, this is converted to annotation $201. In the official documentation, this is not found, but could be used anyway.
  
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
* how to represent them as symbols? (/)
* Is there a font for the special symbols, or are these available everywhere?
* Add symbol and number for the diagram extension

#### Provide a FEN API that can be used from the outside.

At least move number, turn, en-passent, rochade, ... should be possible.

#### Generate PGN from current situation (working)

* Allows in an easy manner to see the current PGN as it would be exported. (/)
* Or allow export of PGN (for example to the clipboard)
* Try to be here very strict, and (of course) ensure that everything that is exported can be read again. (/)
* Allow to hide the export by a button.

#### Allow keyboard shortcuts (working)

* Currently working only when I have clicked before on one of the buttons.
* Should be easy to add it to other parts of the HTML code as well.
* After having clicken on a move, the keyboard shortcuts don't work any more. Where are they consumed? Can I see that?

Question for Stackoverflow: Why does a key handler that is bound to the whole div does not work in all circumstances? Where are the events consumed? Is there a way to debug that easily?

I have found some situations where the key-bindings work, and some where they don't work. Is it easy to see all events and who handles these?

A possible workaround could be to give focus to a button, when the user clicks on a move. 

### Infrastructure

#### Building distribution  (working)

* Use Grunt for building a distribution (/)
* Extract only the files that are needed. (/)
* Decide which ones of them should be used in which version. (/)
* Decide which ones should be minified (all?) and / or concatenated (/)
* Decide if more than one distribution is needed
  + With minimal figure sets (merida, wikipedia?)
  + What else?
  + Provide some "cleverness" when figure sets are missing. There should be
    at least a check at the beginning, so that symbols are shown.
    This could be similar to font sets like "Helvetica Neue", Helvetica, Arial, sans-serif (but predefined)
    * Define the figure sets that are similar and can replace each other, ensure
      that at least one (Merida) is available.
* Let the structure as is, see if configuration for paths is needed (if someone
  wants to deploy on different paths).
* Define the Grunt task to deploy the example distribution and the documentation automatically without any additional work to do:
  * minified JS
  * CSS
  * images
* Provide variations of the JS files:
  * as current: all, not minified
  * no jQ: all without jQuery, not minified
  * as current: all, minified
  * no jQ.min: all without jQuery, minified
  So everyone can choose what is best for him.

Here are the size differences in using the files (from a copy of Bash `ls -ls`):

    $ ls -laR
    .:
    -rw-r--r--    1 mliebelt Administ  1270549 Oct  6 16:22 pgnviewerjs.js

    ./min:
    -rw-r--r--    1 mliebelt Administ   496786 Oct  6 16:22 pgnviewerjs.js

So the difference between minified or not is huge, but what is the reason for that big file? Especially when using the library not standalone, but in a different context, it should be possible to strip down it a little bit.

    $ du -s *
    153     css
    388     img
    1727    js
    27      locales

So compared to the rest, js is the differentiator. img files are only read on a per-file basis, that doesn't matter. CSS could be minified, but only on a second step.

    $ ls -laR *js/js
    chessboardjs/js:
    -rw-r--r--    1 mliebelt Administ    44294 Aug 10  2013 chessboard.js
    -rw-r--r--    1 mliebelt Administ   282766 Jun 19 15:48 jquery-1.11.1.js
    -rw-r--r--    1 mliebelt Administ     7354 Apr 10 23:27 json3.min.js

So of the 1.2 MB file is jQuery only 280 KB.

    $ ls -laR js
    -rw-r--r--    1 mliebelt Administ    97221 Jun  9 15:46 i18next-1.7.3.js
    -rw-r--r--    1 mliebelt Administ   480809 Aug 20 16:47 jquery-ui.js
    -rw-r--r--    1 mliebelt Administ     3080 Jun 17  2012 jquery.hotkeys.js
    -rw-r--r--    1 mliebelt Administ    19580 Aug 20 16:47 jquery.multiselect.js
    -rw-r--r--    1 mliebelt Administ     4112 May 31 15:39 jquery.timer.js
    -rw-r--r--    1 mliebelt Administ   162553 May 19 07:33 peg-0.8.0.js
    -rw-r--r--    1 mliebelt Administ    65929 Aug 19 06:15 pgn-parser.js
    -rw-r--r--    1 mliebelt Administ    23924 Sep 12 11:49 pgn.js
    -rw-r--r--    1 mliebelt Administ    34457 Aug 22 07:34 pgnviewerjs.js

Here is the meaning of the different files:

* i18n*.js: internationalization, needed for different languages
* jquery-ui.js: only for parts of the UI, here the multi-select of annotations. I could try to minimize that, so that only the needed widgets and features are integrated. Or we get it from another site, which is a standard (WordPress.org??)
* jquery.hotkeys: Allows to bring event handler that react on keys. 

#### Structure distribution (working)

* What should be the structure of a distributed application? I had problems (first) in using the gruntified application ...
* Does it make sense to have different ones: small, typical, full?
* What should be the different parts in it?
* Version the distribution (by a simple mechanism) so that when changing something, which is
  relevant to distribute, the version can be incremented, and then the distribution can be
  built and uploaded.

#### Distribution and GitHub

* What are normal patterns for distributions on GitHub?
* Which one of them is the right approach for mine?
* What are the requirements (of myself) according to GitHub and packaging?
* Is there a way to provide an example web site for showing how the application works in real life (without buying something)?

#### Provide web site for distribution (working)

* Design a web site for this project that helps to make marketing. (/)
* Provide the examples / documentation / ... separated from the development.
* Ensure that building the distribution also builds the sources of the web site. (/)
* Use Skeleton for the Look of that web site, but ensure that the files needed for that
  are separated from the files needed for PgnViewerJS. (/)
* Start building the documentation as a web site, so it is easier to use it locally and distribute it.
* Web site is currently: http://mliebelt.bplaced.net/pgnvjs
* Decide on the right UI for the examples. With minimal Javascript, and if possible only one file.
  The example from chessboardjs seems appropriate, perhaps it is easy to create
  something similar (or just copy it) with my own examples.

##### Collect nice games (working)

* Collect nice games and insert them into the examples
* Fix errors in the grammar while working on the games

##### Provide the feature in a useful manner

Look if the current categories are the right ones, and nothing is missing.

* Basics: Give minimal hints, more examples will follow later
  * Board
  * Viewer
  * Print
  * Edit
* Boards: Only minimal examples, there are much more (and interesting). See examples/boards.html
  * Simple: The default board, with everything as default.
  * Themes: Perhaps more could be added (or smaller ones)
  * Position: Smaller boards, and more positions
  * Others: Only small features, are there more ???
* Games: Show the combination of boards and moves to whole games
  * Chess.com Style: Hopefully impressive
  * Normal: Boring, but ok.
  * Falken: Interesting, because different
* Moves: Here the examples are missing
  * Main variation
  * Different styles of comments
  * Different variations, combined with comments
  * Moves in the print style with different boards
  * Combination of NAGs
  * Editing possibilities of moves: Adding, change prio / order, Adding NAGs, comments
* Themes & Styles: What is missing?
  * Don't know.
  * Internationalisation!! At least en, de, perhaps fr

##### Provide public documentation

* Provide additional to the web site (or instead of it?) examples that are included
  in the distribution that can be downloaded.
* Zip the examples together with the rest, so that when expanding the distribution,
  the examples can be run just by double-clicking them.
  
## Done and mostly finished (/)

### Visual (/)

#### Generate from PGN structure moves (/)

* Generate a reasonable frame for the moves (id: <ID>Moves, class: moves).
* Generate the moves in a pleasant style.
* Look at different books and try to adapt some of the styles, allow the style to be set
  (as attribute moveStyle).
  

#### Add additional figure sets (/)

* Add as figure sets the ones from chess.com and from ChessTempo Merida.
* Added as well case, condal, leipzig and maya from ChessTempo.

##### Additional figures (/)

* Allow others to add figure sets as well.
* Provide a registry, and provide there an additional path to the set (relative to the
  JavaScript file that loads it).
* Organisation has to be the same:
  * Path to the piece style (only variant here).
  * Directory named as the piece style.
  * Then '/{piece}.png'

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

###### Comments (/)
  
For comments, the following is needed:
  
* Comment entry field. Text line or text editor.
* How to do comments before? There are different possibilities to do that, like switching from end comment to begin comment and vice versae.
* Different possibilities:
  * Comments are created all the time (before and after)
  * Then the position of the comments is known
* Add additional example for comment that shows
  * main line with all kind of comments
  * variations with comments
  * combinations of main line comments and variation comments

#### Generate from PGN including comments and variations (/)

* Decide the structure of all moves (div, span, IDs, classes, hierarchy).
* Use the linked moves in generation.
* Allow different styling by CSS only (for the `<div class="moves">...</div>`)
* Provide examples for
  * main line in one column
  * main line in one paragraph
  * variations inlined
  * variations separated by paragraphs
  * different styling for them

#### Allow multiple comments (/)

* This is at least needed for combining normal comments with diagram comments. They often go together, and at the moment, only one of the 2 can be used.
* Decide if a diagram comment is allowed before the move (does not make sense for me).
* Decision: don't use a comment for diagrams, so no need for multiple comments

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
  
#### Define functions for Editing (/)
  
* chessboardjs provides in its example section the following (which should be used):
  * Only allow legal moves (/)
  * Highlight legal moves (/)
  * Snapback on wrong drop (/)

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

#### Bind keys (/)

* Allow to stear a game by function keys.
* If more than one game is displayed, only the game that has focus (the user has clicked in)
  can be driven by the function keys.
* Use the following function keys:
  * "left": prevMove
  * "right": nextMove
  * "space": 
  
### Infrastructure

#### Structure of the project (/)

* Get rid of the sub-modules. This was initially a good idea, but is not well now.
* Use instead
  * separate folders during development, so it is easier to develop (and replace older versions
    by newer ones)
  * Rules in the Gruntfile which files should be selected for the distribution (in which order) 

The real structure as distribution should be the following:

    / root of the files
      readme.md
      /js
        /pgnviewerjs.js (minified version)
      /css
        chessboard.css (original file, no change)
        pgnvjs.css (rules for PgnViewerJS only, changes to chessboard.css separated from the rest)
      /img
        /buttons (for theming the additional buttons)
          /ff (buttons of ?? SEARCH FOR SOURCE)
          /tango (buttons of tango item theme SEARCH FOR SOURCE) http://tango.freedesktop.org/releases/tango-icon-theme-0.8.90.tar.gz
        /chesspieces
          /separate folders for each piece theme
        /pattern
          *.png (pattern used in file pgnvjs.css)
        blackwhite-* (button for flipping sided --> should be moved to buttons)
      /locales
        chess-*.json (names of the chess pieces, defaults not necesary)
        nag-*.json (meanings of NAG (http://en.wikipedia.org/wiki/Numeric_Annotation_Glyphs), not used at the moment. Should be rendered when used in the PGN notation (e.g. by output of ChessBase))
    

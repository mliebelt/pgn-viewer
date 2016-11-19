I have to have a place where I can add TODOs, that are not automatically visible ....

* Internet (only possible when on the internet)
    * How to add a version number in Grunt-Files to some tasks
        * Version for the ZIP-File
        * Where do we need a version as well? A search brings the following results:
            * docu/*.html files: How to include version in HTML (==> Template parser)
        * `package.json` already contains a definition of `version`, so it should at least possible
        to add the version inside the Grunt build process
    * How to add that version in the documentation (possibly in the examples)?
    * How to exclude `node_modules` (normally) from the search process and result in IntelliJ
    * chess.js should know when to castle, but I did not find an API for that. What do I have to do? Look that up in the web site.
      * Found in code `move.flags & BITS.KSIDE_CASTLE`
      seems to be the same as "castling king side allowed"
      * Ditto for move.flags & BITS.QSIDE_CASTLE. Do I
      have access to the move flags? And how to decide (without any move) if castling is allowed or not? Does not work ...

## Restructure Code

The code at the moment is not easy to understand, and parts of it lays in the mis-structure that happened over time.
Try to restructure the code to get the following:

* functions are only inside that scope available where they should be used.
* functions that are only used once could be "inlined" in some way.
* Extract common parameters that go everywhere (constant!) or are part of the configuration (could be computed all time), and see what to do with it.

 * Use Font Awesome in a local copy, not the net version. This is used for all other resources, so why not here ...

### Avoid hide HTML

Instead, implement for each function exactly what is neeeded:

* board: Board only
* view: Viewer including pgn display, buttons for moving
* print: Board only as part of pgn display, no buttons
* edit: as view, additional edit and comment buttons

This means that the whole `generateHTML` has to be broken in different parts, that may be added or not (on demand).
And that the whole structure is more malleable, so anyone could construct their own structure. What are the parts
that have to be kepts so that everything works again?

### Add features to board

#### notation

notation should not only be true or false, but also possible outside of the board. Additionally, the position
could be signaled as well. The following is normal:

* combinations of N,S,E,W,C like N, NW, NC
* Meaning
  * N == NC
  * NC == top of the board, there the center
  * NW == top of the board, there the left
* This should be independent of the size of the board (and the fields) working.
* This would also allow to add a color to the board, which will shine through on the border (if you want).
  
## Documentation

* Add documentation how to create a base example: example HTML file for the 4 different cases (board, view, edit, print),
  link that file from the documentation, explain the base parts in it.

## Examples

* Try to find as minimal as possible examples so that it is easier to demonstrate the different features.
* Try to rename the example files, document (in HTML) what the purpose of each example is.
* Try to find one base example for each 'mode' like pgnBoard, pgnView, pgnEdit and pgnPrint. This will help debugging
  nasty problems, and find the reasons much easier.
* Try to find nice example games, and link them to the original source.
* Include in the example files the nice examples given somewhere, not the contrived ones I already have ...

## Tickets

#### Missing discriminator

* Check if there is a functionality to get the discriminator upfront (by using the chess.js library)
* See the function get_disambiguator in the library. So should work, find a test to check that (as unit test).
* Find at least the following examples for that:
  * Normal moves where no diammbiguator is needed.
  * Normal situation where the disambiguator has to be used.
  * Difficult situation where 2 moves could be possible, but one is not allowed (because the king is in check then).

#### Ticket 17: Edit Mode

This is the one ticket that is missing from version 1.0. Without that, PgnViewerJS is not feature complete.

What should be done here:

1. Cleanup the UI. It is ugly, and complicated to use. It does not fit well into the customization that is available for the other modes (see ticket #25).
2. Allow to cut variations and main lines.
3. Allow to promote variations:
   * 3rd to 2nd (only switching place)
   * 1st to main line, current main line gets first variation then.

Technically, the following has to  be done:

* Ensure that the inner PGN format is converted in the necessary ways. There are already some test cases available for that (see: when upvoting or deleting lines).
* Then recreate the HTML moves after each major change.

I was successful when working with the edit mode, which means entering one move of the current variation. But this is not so easy when doing that with whole variations. Recreating the moves again should be easier.

So startpoint here are the 2 functionalities:

* `deleteMove(id)`: all cases are known, they have just to be implemented.
* `promoteMove(id)`: cases are known as well, but is more difficult.

To understand what has to be done, I should start with some analysis:

* Take an example with some variations.
* Record  the JSON format of the PGN part of it.

base.getPgn() ==> Returns the pgn object
pgn.getMoves() ==> Returns an array of all moves, the index hold in each move is the index to the array.
move structure:
* commentAfter
* commentBefore
* commentMove
* fen: holds the position that is reached after making the move
* index: index to the array, pgn.getMove(index) returns just that
* moveNumber: (only for white) the move number
* nag
* next: next index of the  same line
* notation: object in itself
* prev: index of the previous move
* turn: "w" or "b"
* variationLevel: 0 for main line, ...
* variations: array of arrays, each variation is one array. Promoting variation (same level) just switches that

So here are the rules for the 2 functions:

* deleteMove
  * Ensure that them moves are deleted (from the array) so that the indices are intact
  * Delete all moves later (next and variations) as well
* promoteMove
  * Promoting one variation over one other: simple, must exchange. Nothing to change else
  * Promoting for the line above:
    * create a new array for the previous line above (from the current move up to the end)
    * Exchange the 2 arrays then  
    * Add the moves of the previous variation to the line above

So in the current situation (indentation is for variation) the following is done (only indices shown)

0
1
2
  3 - 4 - 5
  6 - 7
8

Promote 3 will lead to

0
1
3
  2 - 8
  6 - 7
4
5

We have the problem that by holding whole variations as arrays, and the main line as array, we have to do a lot of book-keeping to ensure by switching variations everything works fine. It would be much easier to just rewire the moves in a different form if only next and prev would be  used, and the variations array would have just the first move (and the rest would be found by using next). I will analyse how much changes I have to make to ensure that everything works again, and refactor then the code to switch to that scheme. 

#### Ticket 25: Custom HTML

It is necessary to restructure the current creation of the HTML sources. the reasons for it are:

* To get rid of the (current necessary) `hideHTML` calls.
* To allow styling on the fly by others.

The base algorithm should be changged to:

1. Create HTML in the usual structure.
2. Allow each time a part of HTML is created, that an existing DIV is used (given by the configuration). So instead of 
using a new created DIV, use the DIV given by the ID and generate the code inside that.

What has to change so that is possible?

* There is not all the time the one main DIV, but there could be different ones. This will work only, if for all of them
the container is clear.
* Only create what is necessary for that. So add the information about the mode to the generation.
+ As modes, there is possible:
  * print: board and moves
  * board: board only
  * view: header, board, moves and view buttons
  * edit: header, board, moves, view and edit buttons.
* If some DIVs are missing, the part of the UI will not be generated. That is only possible if we decide what is
mandatory and what is optional.
* The algorithm has to be changed so that
  * if the board ID is given, we  have the normal mode where everything has to be created inside the corresponding DIV.
  * if a map with
    * key: key that maps to a part of the UI
    * value: the ID of the DIV that stands for that part
    is given, the algorithm has to check everytime, if it should create the part or use an existing one.



Here is the collection of DIVs that are used in a "normal" board (edit, which is the one with the most elements):

* headers: Includes white and black header, not really well implemented yet. Could be moved to somewhere else, or just skipped.
  Is not necessary for the function of the different modes.
* inner: the board (only) including the symbols (1-8, a-h). May be optional in print mode, else it is mandatory.
* button: view buttons, needed for view and edit mode, not for board and print.
* editButton: edit buttons, needed only for edit mode.      
* outerpgn: additional DIV to allow display of changed PGN (source format), only needed in edit mode
* commentButton: section with buttons, and comment text editor to add or change comments in the PGN.
* moves: contains the generated PGN notation. Necessary in all modes but board.
* endBoard: additional DIV that allows stopping float (for example).

So a normal HTML layout depending on the modes will contain:

* board: (headers), inner, (endBoard)
* print: (headers), (inner), moves, (endBoard)
* view: (headers), inner, button, moves, (endBoard)
* edit: (headers), inner, button, editButton, outerpgn, commentButton, moves, (endBoard)

So if someone wants to provide a special layout for the use of PgnViewerJS, they have to provide (for each mode) all the 
elements that are not in parantheses. 

What is the main difference in algorith here?

1. Not all elements are created as part of the main element. I don't know what this will change, but we will see ...
2. If everything is in one DIV, the creation is easy. It is more complicated if parts exist, but the rest not.
  If someone wants to style it, they have to ensure to provide enough "around" it.
3. Not all configuration parameters will work in all circumstances.
   * size: does not make sense, because it is the size of everything. Style it on your own then.
   * theme: set for the whole board, not useful if done with your own styling.
   * scrollable: generates a complicated DIV, not easy to replace an existing one instead  
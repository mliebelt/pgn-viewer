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

### Show boards

* Transport the features of chessboardjs, so that the same configuration is possible.

### Add additional figure sets

* Add as figure sets the ones from chess.com and from ChessTempo Merida.
* Added as well case, condal, leipzig and maya from ChessTempo.

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
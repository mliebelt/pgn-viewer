# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

I don't do "releases" in Github any more, please use `npm pack @mliebelt/pgn-viewer@1.5.2` to get the "release" directly from NPM.

## Unknown version

### Changed

### Fixed

## 1.5.7 2021-05-23

### Changed

* Toggle orientation changed fonts of coords (why?), so ensure that it is not changing.

### Fixed

* [#213](https://github.com/mliebelt/PgnViewerJS/issues/213) Corrected wrong borders for gray buttons

## 1.5.6 2021-05-22

### Changed

### Fixed

* [#213](https://github.com/mliebelt/PgnViewerJS/issues/213) Fix CSS for grayed buttons (again)
* [#229](https://github.com/mliebelt/PgnViewerJS/issues/229) Adjust moves height not over max value
* [#236](https://github.com/mliebelt/PgnViewerJS/issues/236) Fixed layout problem for boards
* [#238](https://github.com/mliebelt/PgnViewerJS/issues/238) Ensure correct headers with orientation == black and manyGames == true
* [#239](https://github.com/mliebelt/PgnViewerJS/issues/239) Fixed layout problem for layout right
* [#240](https://github.com/mliebelt/PgnViewerJS/issues/240) Set color mark all the time correct

## 1.5.5 2021-05-21

### Changed

### Fixed

* [#219](https://github.com/mliebelt/PgnViewerJS/issues/219) Fix layout (again)
* [#227](https://github.com/mliebelt/PgnViewerJS/issues/227) Set default boardSize if needed
* [#229](https://github.com/mliebelt/PgnViewerJS/issues/229) Use movesHeight if there on layout top|bottom
* [#232](https://github.com/mliebelt/PgnViewerJS/issues/232) Toggle for play/pause works again
* [#234](https://github.com/mliebelt/PgnViewerJS/issues/234) Fixes bug with player names switched with orientation == black

## 1.5.4 2021-05-20

### Changed

### Fixed

* [#225](https://github.com/mliebelt/PgnViewerJS/issues/225) Fixes bug in Wordpress with Theme twenty-twenty-one
* [#226](https://github.com/mliebelt/PgnViewerJS/issues/226) Buttons are rendered correct when using Fontawesome with SVG
* [#230](https://github.com/mliebelt/PgnViewerJS/issues/230) Buttons are functional when using Fontawesome with SVG
* [#231](https://github.com/mliebelt/PgnViewerJS/issues/231) Hand cursor when hoovering over buttons

## 1.5.2 2021-05-02

Upgraded to newest versions of `pgn-parser`, `pgn-reader`, `Chessground` and some more libraries.

### Changed

* [#131](https://github.com/mliebelt/PgnViewerJS/issues/131)  All CSS rules are now namespaced by class `pgnvjs`
* [#212](https://github.com/mliebelt/PgnViewerJS/issues/212)  Restructured examples, documentation, api, ...
* [#217](https://github.com/mliebelt/PgnViewerJS/issues/217)  Rework on exception handling, to allow reader to be used from viewer and as library somewhere else

### Fixed

* [#30](https://github.com/mliebelt/PgnViewerJS/issues/30) [#165](https://github.com/mliebelt/PgnViewerJS/issues/165) [#206](https://github.com/mliebelt/PgnViewerJS/issues/206) fixed underpromotion in edit mode (again)
* [#108](https://github.com/mliebelt/PgnViewerJS/issues/108) fixed en passend on Chessground
* [#185](https://github.com/mliebelt/PgnViewerJS/issues/185) showResult with many games fixed
* [#205](https://github.com/mliebelt/PgnViewerJS/issues/205)  fixed king in chess in start position (when the last move was a check or mate)
* [#209](https://github.com/mliebelt/PgnViewerJS/issues/209)  combination hideMovesBefore == true, startPlay now works as expected
* [#213](https://github.com/mliebelt/PgnViewerJS/issues/213)  fixed state of move buttons depending on the current move (thx to @Bebul)
* [#214](https://github.com/mliebelt/PgnViewerJS/issues/214)  fixed
* [#215](https://github.com/mliebelt/PgnViewerJS/issues/215)  fixed
* [#216](https://github.com/mliebelt/PgnViewerJS/issues/216)  fixed error in layout, that hided the print button
* [#220](https://github.com/mliebelt/PgnViewerJS/issues/220)  ensure that discriminator is added all the time for pawn paptures 
* [#221](https://github.com/mliebelt/PgnViewerJS/issues/221)  fixed lookup of endGame (when showResult == true)

## 1.5.1 2021-03-28

### Changed

* [#97](https://github.com/mliebelt/PgnViewerJS/issues/97) Implemented all commentary according to the spec

### Fixed

* [#198](https://github.com/mliebelt/PgnViewerJS/issues/198) Fixed (some) problems with comments in edit mode
* [#201](https://github.com/mliebelt/PgnViewerJS/issues/201) Upgraded to version 7.11.1 of chessground
* [#203](https://github.com/mliebelt/PgnViewerJS/issues/203) Allow eval actions in commments, ignore unknown actions

## 1.5.0 2021-03-20

### Changed

* [#194](https://github.com/mliebelt/PgnViewerJS/issues/194) Updated grammar to version 1.2.0 of pgn-parser


### Fixed

* [#195](https://github.com/mliebelt/PgnViewerJS/issues/195) Error fixed with 2 annotations in a row
* [#191](https://github.com/mliebelt/PgnViewerJS/issues/191) Made available again Merida with SVG

## 1.4.4 2021-02-11

### Changed

* [#180](https://github.com/mliebelt/PgnViewerJS/issues/180) All images now packaged in Javascript, no separat assets

### Fixed

* [#170](https://github.com/mliebelt/PgnViewerJS/issues/170) Assets shown on examples in mobile browser (Chrome)
* [#189](https://github.com/mliebelt/PgnViewerJS/issues/189) Theme brown available again
 
### Fixed

## 1.4.2 2021-01-24

### Changed

* [#3](https://github.com/mliebelt/PgnViewerJS/issues/3) First try `notationLayout == list` (not fully working)

### Fixed

* [#182](https://github.com/mliebelt/PgnViewerJS/issues/182) First fix layout in edit mode

## 1.4.0 2020-09-09

### Changed

* [#177](https://github.com/mliebelt/PgnViewerJS/issues/177) Switched from `i18next` to `roddeh-i18n` and inline the defined locales. 

### Fixed

* [#165](https://github.com/mliebelt/PgnViewerJS/issues/165) Restructured `onSnapEnd` due to use or Promise in swal`.

## [1.3.1](https://github.com/mliebelt/PgnViewerJS/compare/v0.9.8...v1.3.1) 2020-08-16

I worked for some time on the refactoring of the whole: splitting the  application in 2 modules, and one separate project; versioning the whole with NPM (only); refactor the layout; ... and many more. So the following list is exhaustive.

### Changed

* [#148](https://github.com/mliebelt/PgnViewerJS/issues/148) Extracted pgn-parser as a separate project. See https://github.com/mliebelt/pgn-parser and the tickets there for the features done.
* [#147](https://github.com/mliebelt/PgnViewerJS/issues/147) Removed Grunt, replaced by NPM. Restructured the whole application to be built with Webpack instead.
* [#127](https://github.com/mliebelt/PgnViewerJS/issues/127) The application is now installed by using NPM.
* [#158](https://github.com/mliebelt/PgnViewerJS/issues/158) Redo the layout as grid layout. Supported are left|right and top|bottom. It is sufficient then to change the size / width, the rest will be computed.
* [#88](https://github.com/mliebelt/PgnViewerJS/issues/88) Fixed (most of) the edit mode for the 4 layouts.
* [#135](https://github.com/mliebelt/PgnViewerJS/issues/135) Allow long algebraic notation.
* [#62](https://github.com/mliebelt/PgnViewerJS/issues/62) Unit tests are now done using Mocha.
* [#12](https://github.com/mliebelt/PgnViewerJS/issues/12) Allow the display of many games at one place (one of the oldest tickets!).

### Fixed

https://github.com/mliebelt/PgnViewerJS/issues/158
* [$160](https://github.com/mliebelt/PgnViewerJS/issues/160) Fixed unprintable tags in notation. Reason was, that on Linux, you have to install a Math font to have them.
* [$129](https://github.com/mliebelt/PgnViewerJS/issues/129) Setup of FEN in the tag section is now recognized.

## [0.9.8](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.7...v0.9.8) 2019-06-10

### Changed

* [#46](https://github.com/mliebelt/PgnViewerJS/issues/46) Allow starting a game from a defined move.
* [#91](https://github.com/mliebelt/PgnViewerJS/issues/91) Added notation for circles and arrows, with creating them in editing mode.
* [#112](https://github.com/mliebelt/PgnViewerJS/issues/112) Add color marker for the player at move.
* [#114](https://github.com/mliebelt/PgnViewerJS/issues/114) Show result in move list: use option `showResult: true` for that.

### Fixed

* [#30](https://github.com/mliebelt/PgnViewerJS/issues/30) Underpromotion in a first simple mode.
* [#106](https://github.com/mliebelt/PgnViewerJS/issues/106) Ensure marks are unset before first move.
* [#109](https://github.com/mliebelt/PgnViewerJS/issues/109) Fixed nasty first move variation problem.
* [#117](https://github.com/mliebelt/PgnViewerJS/issues/117) Makes defining FEN more resilient.

## [0.9.7](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.6...v.0.9.7) 2018-06-01

### Change

* Moved to Chessground as implementation for the chess board.
* Got rid of jQuery dependency.
* Used in parts ES6, so PGNViewerJS does not work any more with IE11.
* [#77](https://github.com/mliebelt/PgnViewerJS/issues/77) Allow definition of function `localPath()`.
* [#78](https://github.com/mliebelt/PgnViewerJS/issues/78) Use chessground (lichess.org UI) as back-end.
* [#79](https://github.com/mliebelt/PgnViewerJS/issues/79) Chessground: allow positioning of coordinates
* [#80](https://github.com/mliebelt/PgnViewerJS/issues/80) Chessground: Size the coordinates according to the board size.
* [#82](https://github.com/mliebelt/PgnViewerJS/issues/82) Implement NAG menu native.
* [#90](https://github.com/mliebelt/PgnViewerJS/issues/90) Upgrade i18next to newest version.

### Fixed

* [#81](https://github.com/mliebelt/PgnViewerJS/issues/81) Fixed promotion with new UI (Chessground)
* [#84](https://github.com/mliebelt/PgnViewerJS/issues/84) Show move number for start of variation
* [#87](https://github.com/mliebelt/PgnViewerJS/issues/87) Ensure move numbers after end of variation
* [#89](https://github.com/mliebelt/PgnViewerJS/issues/89) Fixed promotion with new UI (Chessground)
* [#93](https://github.com/mliebelt/PgnViewerJS/issues/93) Game with color annotation from lichess could lnot be read

## [0.9.6](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.5...v.0.9.6) 2017-12-29

### Changed

* Added parameter layout (top, left, bottom, right, top-left, top-right, bottom-left, bottom-right) to define relation of board to moves.
* [#53](https://github.com/mliebelt/PgnViewerJS/issues/53) Added all NAGs with symbols, changed display and print of NAGs
* [#66](https://github.com/mliebelt/PgnViewerJS/issues/66) Allow pgn with line breaks in it
* [#67](https://github.com/mliebelt/PgnViewerJS/issues/67) Restructured the README to follow the conventions
* [#68](https://github.com/mliebelt/PgnViewerJS/issues/68) Added @media print to config, to allow easier print out

### Fixed

* [#42](https://github.com/mliebelt/PgnViewerJS/issues/42) Fixed (again) reading from file
* [#43](https://github.com/mliebelt/PgnViewerJS/issues/43) Fixed ugly display to tags
* [#47](https://github.com/mliebelt/PgnViewerJS/issues/47) Fixed various problems with move numbers
* [#54](https://github.com/mliebelt/PgnViewerJS/issues/54) Corrected FEN when playing first moves in edit mode
* [#55](https://github.com/mliebelt/PgnViewerJS/issues/55) Fixed documentation error
* [#56](https://github.com/mliebelt/PgnViewerJS/issues/56) Added example game to configuration builder
* [#58](https://github.com/mliebelt/PgnViewerJS/issues/58) Playing first move in edit mode
* [#59](https://github.com/mliebelt/PgnViewerJS/issues/59) Playing first move as variant of first move in edit mode
* [#60](https://github.com/mliebelt/PgnViewerJS/issues/60) Parsing variations on first move
* [#61](https://github.com/mliebelt/PgnViewerJS/issues/61) Playing variations on the first move
* [#71](https://github.com/mliebelt/PgnViewerJS/issues/71) Ensure that display symbol (D) is not written in PGN output
* [#72](https://github.com/mliebelt/PgnViewerJS/issues/72) Fixed scrolling of moves (again)
* [#73](https://github.com/mliebelt/PgnViewerJS/issues/73) Added missing NPM dependencies

## [0.9.5](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.4...v.0.9.5) 2017-05-12

### Changed

* Restructured some code, to allow catching all errors in the UI.
* Added a lot of locales with their corresponding files for buttons and figures.
* A lot of small bug fixes (see below).
* Removed unnecessary documentation.
* Moved distributions to S3, removed them from the repository.

### Fixed

* [#16](https://github.com/mliebelt/PgnViewerJS/issues/16): Made import of PGN more robust
* [#31](https://github.com/mliebelt/PgnViewerJS/issues/31): Logs now the error to the UI, so that the PGN could be fixed more easily
* [#36](https://github.com/mliebelt/PgnViewerJS/issues/36): Added UI for FEN (optional in view mode) and PGN
* [#37](https://github.com/mliebelt/PgnViewerJS/issues/37): Added the following locales: cs, da, es, et, fi, hu, is, it, nb, nl, pl, pt, ro, sv. Translated at least the button tooltips and the figures. If anyone could help, I could translate the NAGs as well.
* [#39](https://github.com/mliebelt/PgnViewerJS/issues/39): Allow opening of the examples as separate pages.
* [#42](https://github.com/mliebelt/PgnViewerJS/issues/42): Added the parameter pgnFile to the configuration, file has to come from the same site, though (due to CORS)
* [#44](https://github.com/mliebelt/PgnViewerJS/issues/44): Ensure that NAGs from the current notation are reflected in the NAG drop-down
* [#48](https://github.com/mliebelt/PgnViewerJS/issues/48): Fixed broken green and blue themes (no more separate icons, uses FontAwesome)
* [#49](https://github.com/mliebelt/PgnViewerJS/issues/49): Ensure that the buttons look in the example section of documentation the same
* [#50](https://github.com/mliebelt/PgnViewerJS/issues/50): Pawn captures (by pawns) are shown now in the edit mode

## [0.9.4](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.3...v.0.9.4) 2016-12-11

### Changed

* Implemented deletion of moves (main line and variations) and upvoting of variations. Refactored whole variation handling to make the code a little bit easier to understand.
* Finished the long outstanding "edit" mode, that should be now feature complete.
* Ensured that pgnReader is known from the beginning inside the pgnBase, so changes to the configuration are shared.
* Replaced former keyboard library by Mousetrap, works now again in all examples.

### Fixed

* [#17](https://github.com/mliebelt/PgnViewerJS/issues/17): Implemented promotion and deletion of moves, cleanup of the UI
* [#23](https://github.com/mliebelt/PgnViewerJS/issues/23): Interpretation of tag "SetUp" from the headers
* [#33](https://github.com/mliebelt/PgnViewerJS/issues/33): Button "first" goes to inital position

## [0.9.3](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.2...v.0.9.3) 2016-11-02

### Changed

* Added example `pgnAddMoves.html` that shows how to use the viewer in a context where the moves come from the outside.
* Switched to version 0.10.2 of [chess.js](https://github.com/jhlywa/chess.js) to add sloppy flag when reading moves.
* Added additional format for calling the different modes. Instead of using the board ID (only), it is now possible to
  give a map of IDs for header, inner (for the board), button and moves. Edit mode is not supported (yet). See the example file
  ticket25.html for an example how to use it.

### Fixed

* [#25](https://github.com/mliebelt/PgnViewerJS/issues/25): Allow additional markup instead of the predefined layout of board, buttons, moves, ...
* [#26](https://github.com/mliebelt/PgnViewerJS/issues/26): Ensure that the SAN from chess.js is used instead of the original notation. So chess and mate symbols are used independent of if they are included in the original notation or not. See the example `ticket26.html` in the sources.
* [#27](https://github.com/mliebelt/PgnViewerJS/issues/27): Ensure that the sloppy mode is used to read PGN, so check and mate symbols don't make a difference then.
* [#28](https://github.com/mliebelt/PgnViewerJS/issues/28): Added Long Algebraic Notation  to the parser, as well as some test cases. Fixed a bug in using san without having initialized i18n.
* [#32](https://github.com/mliebelt/PgnViewerJS/issues/32): Internationalization for buttons does not work. Has to do with the local testing, so start a local web server to avoid this.
* [#34](https://github.com/mliebelt/PgnViewerJS/issues/34): Added `reamde.html`, added links to `readme.md`, ensure that examples files are included.
* [#35](https://github.com/mliebelt/PgnViewerJS/issues/35): Font Awesome icons don't work on Firefox when used locally. Similar workaround, start a local web server.

## [0.9.2](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.1...v.0.9.2) 2016-08-22

### Changed

* Tried to restructure some code, to minimize the API published, allowing creating new functionality.
* One convention used everywhere: use API functions, and publish as part of those functions the ones that could be used by others.
* Use `font-awesome` as a local copy, so no internet connection is needed.

### Fixed

* [#18](https://github.com/mliebelt/PgnViewerJS/issues/18): Added a changelog (this file)
* [#19](https://github.com/mliebelt/PgnViewerJS/issues/19): Added some functions to allow adding moves from a backend interactively
* [#20](https://github.com/mliebelt/PgnViewerJS/issues/20): Corrected variation UI (event handling) for Firefox
* [#21](https://github.com/mliebelt/PgnViewerJS/issues/21): Added rules for "1-0" and "0-1" to avoid errors

## [0.9.1](https://github.com/mliebelt/PgnViewerJS/compare/v.0.9.0...v.0.9.1) 2016-02-09

### Added

* [#15](https://github.com/mliebelt/PgnViewerJS/issues/15): Added example that allows to "construct" a configuration

### Changed

* [#7](https://github.com/mliebelt/PgnViewerJS/issues/7): Upgraded to PEG version 0.9.0 (with `strict`)

### Fixed

* [#4](https://github.com/mliebelt/PgnViewerJS/issues/4): Added  [FontAwesome](https://fortawesome.github.io/Font-Awesome/) as alternative icons for the ones used already.
* [#5](https://github.com/mliebelt/PgnViewerJS/issues/5): Fixed missing capture symbol under some circumstances.
* [#8](https://github.com/mliebelt/PgnViewerJS/issues/8): Fixed version download
* [#9](https://github.com/mliebelt/PgnViewerJS/issues/9): Spaces between moves and NAGs don't hurt any more.
* [#10](https://github.com/mliebelt/PgnViewerJS/issues/10): More robust with repeating move numbers.
* [#11](https://github.com/mliebelt/PgnViewerJS/issues/11): Disambiguation from the source is kept.
* [#13](https://github.com/mliebelt/PgnViewerJS/issues/13): FEN positions for black are recognized as those.

## [0.9.0](https://github.com/mliebelt/PgnViewerJS/commit/b6726ae1c3540410a23f5eb9e8462f6bb453b0c9) 2016-02-09

First published version, so the sections changed and added don't make sense. Rough version, was mostly workable, with not too much glitches known.
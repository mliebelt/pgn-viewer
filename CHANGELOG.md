# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

I don't do "releases" in Github any more, please use `npm pack @mliebelt/pgn-viewer@1.6.0` to get the "release" directly from NPM.

## Unknown version

### Changed

### Fixed

## 1.6.8 2024-04-15

### Changed

### Fixed

* [#534](https://github.com/mliebelt/pgn-viewer/issues/534) Fixed problem with integration into React

## 1.6.7 2024-03-29

### Changed

* [#2](https://github.com/mliebelt/pgn-viewer/issues/2) First implementation of "Guess the move" (== puzzle)
* [#461](https://github.com/mliebelt/pgn-viewer/issues/461) Update of all banners
* [#482](https://github.com/mliebelt/pgn-viewer/issues/482) Quick hack to allow jumping to move with number (ignoring everything else)
* [#487](https://github.com/mliebelt/pgn-viewer/issues/487) Migrated unit tests from Mocha/Chai to uvu
* [#488](https://github.com/mliebelt/pgn-viewer/issues/488) Split repository for `pgn-viewer` and `pgn-reader`
* [#513](https://github.com/mliebelt/pgn-viewer/issues/513) Added file `roadmap.md` to give orientation

### Fixed

* [#452](https://github.com/mliebelt/pgn-viewer/issues/452) Fix special case with headers == true, coordsInner == false

## 1.6.6 2023-05-21

### Fixed

* [#448](https://github.com/mliebelt/pgn-viewer/issues/448) wrong notation same-line rooks
* [#436](https://github.com/mliebelt/pgn-viewer/issues/436) similar to #448

## 1.6.5 2023-05-14

### Fixed

* [#338](https://github.com/mliebelt/pgn-viewer/issues/338) Game comment in edit and view mode
* [#443](https://github.com/mliebelt/pgn-viewer/issues/443) Arrows / circles in starting position

## 1.6.4 2023-05-07

### Changed

* [#413](https://github.com/mliebelt/pgn-viewer/issues/413) pgn-writer now dependency

### Fixed

* [#436](https://github.com/mliebelt/pgn-viewer/issues/436) disambiguation in edit mode (generation of SAN) fixed
* [#412](https://github.com/mliebelt/pgn-viewer/issues/412) try to fix issue in list mode with first move black

## 1.6.3 2023-01-25

### Fixed

* [#351](https://github.com/mliebelt/pgn-viewer/issues/351) Fixed additional ellipse
* [#411](https://github.com/mliebelt/pgn-viewer/issues/411) Oposite pawn removed on e.p.
* [#412](https://github.com/mliebelt/pgn-viewer/issues/412) Fix additional ellipse in layout mode == left, list mode

### Changed

* [#410](https://github.com/mliebelt/pgn-viewer/issues/410) should.js --> mocha

## 1.6.2 2023-01-03

### Fixed

* [#348](https://github.com/mliebelt/pgn-viewer/issues/348) Ignore unnecessary disambiguator
* [#358](https://github.com/mliebelt/pgn-viewer/issues/358) Avoid hoizontal scrollbar in layout==left, notationLayout==list
* [#395](https://github.com/mliebelt/pgn-viewer/issues/395) Ensure filler in layout==left, notationLayout==list, first move black
* [#409](https://github.com/mliebelt/pgn-viewer/issues/409) More robustness when entering moves

## 1.6.1 2022-11-05

### Changed

* [#387](https://github.com/mliebelt/pgn-viewer/discussions/387) Allow to disable on-board annotations

## 1.6.0 2022-03-15

Fix the wrong declaration if pgn-viewer should be used in Typescript.

### Changed

* [#357](https://github.com/mliebelt/pgn-viewer/issues/357) New modal dialog for promotion (pieces as graphics)

### Fixed

* [#356](https://github.com/mliebelt/pgn-viewer/issues/356) Ensure that pgn-viewer can be used in Typescript

## 1.5.14 2022-02-26

### Changed

* [#310](https://github.com/mliebelt/pgn-viewer/issues/310) Migrated pgn-reader to Typescript
* [#336](https://github.com/mliebelt/pgn-viewer/issues/336) Migrated pgn-viewer to Typescript
* [#340](https://github.com/mliebelt/pgn-viewer/issues/340) First unit tests for viewer (tbc)
* [#343](https://github.com/mliebelt/pgn-viewer/issues/343) Created many examples for all configuration parameter isolated
* [#345](https://github.com/mliebelt/pgn-viewer/issues/345) Demonstrates problems in setting pieceStyle in CSS AND configuration
* [#346](https://github.com/mliebelt/pgn-viewer/issues/346) Demonstrates problems in setting theme in CSS AND configuration

### Fixed

* [#337](https://github.com/mliebelt/pgn-viewer/issues/337) Allows locale like de_DE
* [#352](https://github.com/mliebelt/pgn-viewer/issues/352) Fixed toggleColor problem in view mode
* [#354](https://github.com/mliebelt/pgn-viewer/issues/354) Fixed error in editMode with black to start

## 1.5.13 2022-01-06

### Changed

* [#45](https://github.com/mliebelt/pgn-viewer/issues/45) Added example
* [#126](https://github.com/mliebelt/pgn-viewer/issues/126) Add resize for boards in pgnView/pgnEdit/pbnBoard mode
* [#218](https://github.com/mliebelt/pgn-viewer/issues/218) Allow circles and arrows at the beginning of the game
* [#303](https://github.com/mliebelt/pgn-viewer/issues/303) Examples for usage of global defaults
* [#315](https://github.com/mliebelt/pgn-viewer/issues/315) Added more NAGs, including needed fonts
* [#318](https://github.com/mliebelt/pgn-viewer/issues/318) Adjusted ranks files for resizing on coordsInner == false

### Fixed

* [#253](https://github.com/mliebelt/pgn-viewer/issues/253) Upgrade of Chessground to version 8.1.7

## 1.5.12 2021-09-29

### Changed

* [#183](https://github.com/mliebelt/pgn-viewer/issues/183) Resize of layout on every entered move
* [#183](https://github.com/mliebelt/pgn-viewer/issues/183) Resize of layout on every entered move
* [#267](https://github.com/mliebelt/pgn-viewer/issues/267) More unit tests for promoteMove (and fixes)
* [#271](https://github.com/mliebelt/pgn-viewer/issues/271) Switch license to GPL due to dependency on Chessground

### Fixed

* [#111](https://github.com/mliebelt/pgn-viewer/issues/111) Promote variation of first move works
* [#247](https://github.com/mliebelt/pgn-viewer/issues/247) Allow to define strings for NAGs fixed
* [#263](https://github.com/mliebelt/pgn-viewer/issues/263) NAG editing broken fixed
* [#265](https://github.com/mliebelt/pgn-viewer/issues/265) Adding moves in variations fixed (mostly)

## 1.5.11 2021-06-21

### Changed

* [#247](https://github.com/mliebelt/pgn-viewer/issues/247) Allow to define strings for NAGs


### Fixed

* [#224](https://github.com/mliebelt/pgn-viewer/issues/224) Fix layout for coordsInner == false, and big factor
* [#259](https://github.com/mliebelt/pgn-viewer/issues/259) Combination locale != en && figurine set fixed
* [#261](https://github.com/mliebelt/pgn-viewer/issues/261) Fix missing number after end of variation
* [#262](https://github.com/mliebelt/pgn-viewer/issues/262) Highlight again current move

## 1.5.10 2021-06-16

### Changed

* [#247](https://github.com/mliebelt/pgn-viewer/issues/247) Allow additional CSS to define display of NAGs

### Fixed

* [#224](https://github.com/mliebelt/pgn-viewer/issues/224) innerCoors == false working with different font sizes and layouts
* [#261](https://github.com/mliebelt/pgn-viewer/issues/261) Corrections to different flaws of move numbers
* [#262](https://github.com/mliebelt/pgn-viewer/issues/262) Fixed highlighting of moves

## 1.5.10 2021-06-13

### Changed

### Fixed

* [#259](https://github.com/mliebelt/pgn-viewer/issues/259) Fixed broken combination `locale != en && figurine` set

## 1.5.9 2021-06-13

### Changed

* [#248](https://github.com/mliebelt/pgn-viewer/issues/248) Adds figurine notation: alpha (default), merida, berlin, noto
* [#254](https://github.com/mliebelt/pgn-viewer/issues/254) French translation completed (thx @braoult)
* [#257](https://github.com/mliebelt/pgn-viewer/issues/257) Add title attribute for NAGs

### Fixed

* [#235](https://github.com/mliebelt/pgn-viewer/issues/235) Shows how FontAwesome may be used
* [#241](https://github.com/mliebelt/pgn-viewer/issues/241) CoordsInner == false kept when switching orientation
* [#242](https://github.com/mliebelt/pgn-viewer/issues/242) Fixed
* [#244](https://github.com/mliebelt/pgn-viewer/issues/244) Fixed notation layout problems
* [#245](https://github.com/mliebelt/pgn-viewer/issues/245) Fixed notation layout problems
* [#246](https://github.com/mliebelt/pgn-viewer/issues/246) Fixed CSS problem
* [#255](https://github.com/mliebelt/pgn-viewer/issues/255) Script is working again

## 1.5.8 2021-05-23

### Changed

* Toggle orientation changed fonts of coords (why?), so ensure that it is not changing.

### Fixed

* [#213](https://github.com/mliebelt/pgn-viewer/issues/213) Corrected wrong borders for gray buttons

## 1.5.6 2021-05-22

### Changed

### Fixed

* [#213](https://github.com/mliebelt/pgn-viewer/issues/213) Fix CSS for grayed buttons (again)
* [#229](https://github.com/mliebelt/pgn-viewer/issues/229) Adjust moves height not over max value
* [#236](https://github.com/mliebelt/pgn-viewer/issues/236) Fixed layout problem for boards
* [#238](https://github.com/mliebelt/pgn-viewer/issues/238) Ensure correct headers with orientation == black and manyGames == true
* [#239](https://github.com/mliebelt/pgn-viewer/issues/239) Fixed layout problem for layout right
* [#240](https://github.com/mliebelt/pgn-viewer/issues/240) Set color mark all the time correct

## 1.5.5 2021-05-21

### Changed

### Fixed

* [#219](https://github.com/mliebelt/pgn-viewer/issues/219) Fix layout (again)
* [#227](https://github.com/mliebelt/pgn-viewer/issues/227) Set default boardSize if needed
* [#229](https://github.com/mliebelt/pgn-viewer/issues/229) Use movesHeight if there on layout top|bottom
* [#232](https://github.com/mliebelt/pgn-viewer/issues/232) Toggle for play/pause works again
* [#234](https://github.com/mliebelt/pgn-viewer/issues/234) Fixes bug with player names switched with orientation == black

## 1.5.4 2021-05-20

### Changed

### Fixed

* [#225](https://github.com/mliebelt/pgn-viewer/issues/225) Fixes bug in Wordpress with Theme twenty-twenty-one
* [#226](https://github.com/mliebelt/pgn-viewer/issues/226) Buttons are rendered correct when using Fontawesome with SVG
* [#230](https://github.com/mliebelt/pgn-viewer/issues/230) Buttons are functional when using Fontawesome with SVG
* [#231](https://github.com/mliebelt/pgn-viewer/issues/231) Hand cursor when hoovering over buttons

## 1.5.2 2021-05-02

Upgraded to newest versions of `pgn-parser`, `pgn-reader`, `Chessground` and some more libraries.

### Changed

* [#131](https://github.com/mliebelt/pgn-viewer/issues/131)  All CSS rules are now namespaced by class `pgnvjs`
* [#212](https://github.com/mliebelt/pgn-viewer/issues/212)  Restructured examples, documentation, api, ...
* [#217](https://github.com/mliebelt/pgn-viewer/issues/217)  Rework on exception handling, to allow reader to be used from viewer and as library somewhere else

### Fixed

* [#30](https://github.com/mliebelt/pgn-viewer/issues/30) [#165](https://github.com/mliebelt/pgn-viewer/issues/165) [#206](https://github.com/mliebelt/pgn-viewer/issues/206) fixed underpromotion in edit mode (again)
* [#108](https://github.com/mliebelt/pgn-viewer/issues/108) fixed en passend on Chessground
* [#185](https://github.com/mliebelt/pgn-viewer/issues/185) showResult with many games fixed
* [#205](https://github.com/mliebelt/pgn-viewer/issues/205)  fixed king in chess in start position (when the last move was a check or mate)
* [#209](https://github.com/mliebelt/pgn-viewer/issues/209)  combination hideMovesBefore == true, startPlay now works as expected
* [#213](https://github.com/mliebelt/pgn-viewer/issues/213)  fixed state of move buttons depending on the current move (thx to @Bebul)
* [#214](https://github.com/mliebelt/pgn-viewer/issues/214)  fixed
* [#215](https://github.com/mliebelt/pgn-viewer/issues/215)  fixed
* [#216](https://github.com/mliebelt/pgn-viewer/issues/216)  fixed error in layout, that hided the print button
* [#220](https://github.com/mliebelt/pgn-viewer/issues/220)  ensure that discriminator is added all the time for pawn paptures 
* [#221](https://github.com/mliebelt/pgn-viewer/issues/221)  fixed lookup of endGame (when showResult == true)

## 1.5.1 2021-03-28

### Changed

* [#97](https://github.com/mliebelt/pgn-viewer/issues/97) Implemented all commentary according to the spec

### Fixed

* [#198](https://github.com/mliebelt/pgn-viewer/issues/198) Fixed (some) problems with comments in edit mode
* [#201](https://github.com/mliebelt/pgn-viewer/issues/201) Upgraded to version 7.11.1 of chessground
* [#203](https://github.com/mliebelt/pgn-viewer/issues/203) Allow eval actions in commments, ignore unknown actions

## 1.5.0 2021-03-20

### Changed

* [#194](https://github.com/mliebelt/pgn-viewer/issues/194) Updated grammar to version 1.2.0 of pgn-parser


### Fixed

* [#195](https://github.com/mliebelt/pgn-viewer/issues/195) Error fixed with 2 annotations in a row
* [#191](https://github.com/mliebelt/pgn-viewer/issues/191) Made available again Merida with SVG

## 1.4.4 2021-02-11

### Changed

* [#180](https://github.com/mliebelt/pgn-viewer/issues/180) All images now packaged in Javascript, no separat assets

### Fixed

* [#170](https://github.com/mliebelt/pgn-viewer/issues/170) Assets shown on examples in mobile browser (Chrome)
* [#189](https://github.com/mliebelt/pgn-viewer/issues/189) Theme brown available again
 
### Fixed

## 1.4.2 2021-01-24

### Changed

* [#3](https://github.com/mliebelt/pgn-viewer/issues/3) First try `notationLayout == list` (not fully working)

### Fixed

* [#182](https://github.com/mliebelt/pgn-viewer/issues/182) First fix layout in edit mode

## 1.4.0 2020-09-09

### Changed

* [#177](https://github.com/mliebelt/pgn-viewer/issues/177) Switched from `i18next` to `roddeh-i18n` and inline the defined locales. 

### Fixed

* [#165](https://github.com/mliebelt/pgn-viewer/issues/165) Restructured `onSnapEnd` due to use or Promise in swal`.

## [1.3.1](https://github.com/mliebelt/pgn-viewer/compare/v0.9.8...v1.3.1) 2020-08-16

I worked for some time on the refactoring of the whole: splitting the  application in 2 modules, and one separate project; versioning the whole with NPM (only); refactor the layout; ... and many more. So the following list is exhaustive.

### Changed

* [#148](https://github.com/mliebelt/pgn-viewer/issues/148) Extracted pgn-parser as a separate project. See https://github.com/mliebelt/pgn-parser and the tickets there for the features done.
* [#147](https://github.com/mliebelt/pgn-viewer/issues/147) Removed Grunt, replaced by NPM. Restructured the whole application to be built with Webpack instead.
* [#127](https://github.com/mliebelt/pgn-viewer/issues/127) The application is now installed by using NPM.
* [#158](https://github.com/mliebelt/pgn-viewer/issues/158) Redo the layout as grid layout. Supported are left|right and top|bottom. It is sufficient then to change the size / width, the rest will be computed.
* [#88](https://github.com/mliebelt/pgn-viewer/issues/88) Fixed (most of) the edit mode for the 4 layouts.
* [#135](https://github.com/mliebelt/pgn-viewer/issues/135) Allow long algebraic notation.
* [#62](https://github.com/mliebelt/pgn-viewer/issues/62) Unit tests are now done using Mocha.
* [#12](https://github.com/mliebelt/pgn-viewer/issues/12) Allow the display of many games at one place (one of the oldest tickets!).

### Fixed

https://github.com/mliebelt/pgn-viewer/issues/158
* [$160](https://github.com/mliebelt/pgn-viewer/issues/160) Fixed unprintable tags in notation. Reason was, that on Linux, you have to install a Math font to have them.
* [$129](https://github.com/mliebelt/pgn-viewer/issues/129) Setup of FEN in the tag section is now recognized.

## [0.9.8](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.7...v0.9.8) 2019-06-10

### Changed

* [#46](https://github.com/mliebelt/pgn-viewer/issues/46) Allow starting a game from a defined move.
* [#91](https://github.com/mliebelt/pgn-viewer/issues/91) Added notation for circles and arrows, with creating them in editing mode.
* [#112](https://github.com/mliebelt/pgn-viewer/issues/112) Add color marker for the player at move.
* [#114](https://github.com/mliebelt/pgn-viewer/issues/114) Show result in move list: use option `showResult: true` for that.

### Fixed

* [#30](https://github.com/mliebelt/pgn-viewer/issues/30) Underpromotion in a first simple mode.
* [#106](https://github.com/mliebelt/pgn-viewer/issues/106) Ensure marks are unset before first move.
* [#109](https://github.com/mliebelt/pgn-viewer/issues/109) Fixed nasty first move variation problem.
* [#117](https://github.com/mliebelt/pgn-viewer/issues/117) Makes defining FEN more resilient.

## [0.9.7](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.6...v.0.9.7) 2018-06-01

### Change

* Moved to Chessground as implementation for the chess board.
* Got rid of jQuery dependency.
* Used in parts ES6, so PGNViewerJS does not work any more with IE11.
* [#77](https://github.com/mliebelt/pgn-viewer/issues/77) Allow definition of function `localPath()`.
* [#78](https://github.com/mliebelt/pgn-viewer/issues/78) Use chessground (lichess.org UI) as back-end.
* [#79](https://github.com/mliebelt/pgn-viewer/issues/79) Chessground: allow positioning of coordinates
* [#80](https://github.com/mliebelt/pgn-viewer/issues/80) Chessground: Size the coordinates according to the board size.
* [#82](https://github.com/mliebelt/pgn-viewer/issues/82) Implement NAG menu native.
* [#90](https://github.com/mliebelt/pgn-viewer/issues/90) Upgrade i18next to newest version.

### Fixed

* [#81](https://github.com/mliebelt/pgn-viewer/issues/81) Fixed promotion with new UI (Chessground)
* [#84](https://github.com/mliebelt/pgn-viewer/issues/84) Show move number for start of variation
* [#87](https://github.com/mliebelt/pgn-viewer/issues/87) Ensure move numbers after end of variation
* [#89](https://github.com/mliebelt/pgn-viewer/issues/89) Fixed promotion with new UI (Chessground)
* [#93](https://github.com/mliebelt/pgn-viewer/issues/93) Game with color annotation from lichess could lnot be read

## [0.9.6](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.5...v.0.9.6) 2017-12-29

### Changed

* Added parameter layout (top, left, bottom, right, top-left, top-right, bottom-left, bottom-right) to define relation of board to moves.
* [#53](https://github.com/mliebelt/pgn-viewer/issues/53) Added all NAGs with symbols, changed display and print of NAGs
* [#66](https://github.com/mliebelt/pgn-viewer/issues/66) Allow pgn with line breaks in it
* [#67](https://github.com/mliebelt/pgn-viewer/issues/67) Restructured the README to follow the conventions
* [#68](https://github.com/mliebelt/pgn-viewer/issues/68) Added @media print to config, to allow easier print out

### Fixed

* [#42](https://github.com/mliebelt/pgn-viewer/issues/42) Fixed (again) reading from file
* [#43](https://github.com/mliebelt/pgn-viewer/issues/43) Fixed ugly display to tags
* [#47](https://github.com/mliebelt/pgn-viewer/issues/47) Fixed various problems with move numbers
* [#54](https://github.com/mliebelt/pgn-viewer/issues/54) Corrected FEN when playing first moves in edit mode
* [#55](https://github.com/mliebelt/pgn-viewer/issues/55) Fixed documentation error
* [#56](https://github.com/mliebelt/pgn-viewer/issues/56) Added example game to configuration builder
* [#58](https://github.com/mliebelt/pgn-viewer/issues/58) Playing first move in edit mode
* [#59](https://github.com/mliebelt/pgn-viewer/issues/59) Playing first move as variant of first move in edit mode
* [#60](https://github.com/mliebelt/pgn-viewer/issues/60) Parsing variations on first move
* [#61](https://github.com/mliebelt/pgn-viewer/issues/61) Playing variations on the first move
* [#71](https://github.com/mliebelt/pgn-viewer/issues/71) Ensure that display symbol (D) is not written in PGN output
* [#72](https://github.com/mliebelt/pgn-viewer/issues/72) Fixed scrolling of moves (again)
* [#73](https://github.com/mliebelt/pgn-viewer/issues/73) Added missing NPM dependencies

## [0.9.5](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.4...v.0.9.5) 2017-05-12

### Changed

* Restructured some code, to allow catching all errors in the UI.
* Added a lot of locales with their corresponding files for buttons and figures.
* A lot of small bug fixes (see below).
* Removed unnecessary documentation.
* Moved distributions to S3, removed them from the repository.

### Fixed

* [#16](https://github.com/mliebelt/pgn-viewer/issues/16): Made import of PGN more robust
* [#31](https://github.com/mliebelt/pgn-viewer/issues/31): Logs now the error to the UI, so that the PGN could be fixed more easily
* [#36](https://github.com/mliebelt/pgn-viewer/issues/36): Added UI for FEN (optional in view mode) and PGN
* [#37](https://github.com/mliebelt/pgn-viewer/issues/37): Added the following locales: cs, da, es, et, fi, hu, is, it, nb, nl, pl, pt, ro, sv. Translated at least the button tooltips and the figures. If anyone could help, I could translate the NAGs as well.
* [#39](https://github.com/mliebelt/pgn-viewer/issues/39): Allow opening of the examples as separate pages.
* [#42](https://github.com/mliebelt/pgn-viewer/issues/42): Added the parameter pgnFile to the configuration, file has to come from the same site, though (due to CORS)
* [#44](https://github.com/mliebelt/pgn-viewer/issues/44): Ensure that NAGs from the current notation are reflected in the NAG drop-down
* [#48](https://github.com/mliebelt/pgn-viewer/issues/48): Fixed broken green and blue themes (no more separate icons, uses FontAwesome)
* [#49](https://github.com/mliebelt/pgn-viewer/issues/49): Ensure that the buttons look in the example section of documentation the same
* [#50](https://github.com/mliebelt/pgn-viewer/issues/50): Pawn captures (by pawns) are shown now in the edit mode

## [0.9.4](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.3...v.0.9.4) 2016-12-11

### Changed

* Implemented deletion of moves (main line and variations) and upvoting of variations. Refactored whole variation handling to make the code a little bit easier to understand.
* Finished the long outstanding "edit" mode, that should be now feature complete.
* Ensured that pgnReader is known from the beginning inside the pgnBase, so changes to the configuration are shared.
* Replaced former keyboard library by Mousetrap, works now again in all examples.

### Fixed

* [#17](https://github.com/mliebelt/pgn-viewer/issues/17): Implemented promotion and deletion of moves, cleanup of the UI
* [#23](https://github.com/mliebelt/pgn-viewer/issues/23): Interpretation of tag "SetUp" from the headers
* [#33](https://github.com/mliebelt/pgn-viewer/issues/33): Button "first" goes to inital position

## [0.9.3](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.2...v.0.9.3) 2016-11-02

### Changed

* Added example `pgnAddMoves.html` that shows how to use the viewer in a context where the moves come from the outside.
* Switched to version 0.10.2 of [chess.js](https://github.com/jhlywa/chess.js) to add sloppy flag when reading moves.
* Added additional format for calling the different modes. Instead of using the board ID (only), it is now possible to
  give a map of IDs for header, inner (for the board), button and moves. Edit mode is not supported (yet). See the example file
  ticket25.html for an example how to use it.

### Fixed

* [#25](https://github.com/mliebelt/pgn-viewer/issues/25): Allow additional markup instead of the predefined layout of board, buttons, moves, ...
* [#26](https://github.com/mliebelt/pgn-viewer/issues/26): Ensure that the SAN from chess.js is used instead of the original notation. So chess and mate symbols are used independent of if they are included in the original notation or not. See the example `ticket26.html` in the sources.
* [#27](https://github.com/mliebelt/pgn-viewer/issues/27): Ensure that the sloppy mode is used to read PGN, so check and mate symbols don't make a difference then.
* [#28](https://github.com/mliebelt/pgn-viewer/issues/28): Added Long Algebraic Notation  to the parser, as well as some test cases. Fixed a bug in using san without having initialized i18n.
* [#32](https://github.com/mliebelt/pgn-viewer/issues/32): Internationalization for buttons does not work. Has to do with the local testing, so start a local web server to avoid this.
* [#34](https://github.com/mliebelt/pgn-viewer/issues/34): Added `reamde.html`, added links to `readme.md`, ensure that examples files are included.
* [#35](https://github.com/mliebelt/pgn-viewer/issues/35): Font Awesome icons don't work on Firefox when used locally. Similar workaround, start a local web server.

## [0.9.2](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.1...v.0.9.2) 2016-08-22

### Changed

* Tried to restructure some code, to minimize the API published, allowing creating new functionality.
* One convention used everywhere: use API functions, and publish as part of those functions the ones that could be used by others.
* Use `font-awesome` as a local copy, so no internet connection is needed.

### Fixed

* [#18](https://github.com/mliebelt/pgn-viewer/issues/18): Added a changelog (this file)
* [#19](https://github.com/mliebelt/pgn-viewer/issues/19): Added some functions to allow adding moves from a backend interactively
* [#20](https://github.com/mliebelt/pgn-viewer/issues/20): Corrected variation UI (event handling) for Firefox
* [#21](https://github.com/mliebelt/pgn-viewer/issues/21): Added rules for "1-0" and "0-1" to avoid errors

## [0.9.1](https://github.com/mliebelt/pgn-viewer/compare/v.0.9.0...v.0.9.1) 2016-02-09

### Added

* [#15](https://github.com/mliebelt/pgn-viewer/issues/15): Added example that allows to "construct" a configuration

### Changed

* [#7](https://github.com/mliebelt/pgn-viewer/issues/7): Upgraded to PEG version 0.9.0 (with `strict`)

### Fixed

* [#4](https://github.com/mliebelt/pgn-viewer/issues/4): Added  [FontAwesome](https://fortawesome.github.io/Font-Awesome/) as alternative icons for the ones used already.
* [#5](https://github.com/mliebelt/pgn-viewer/issues/5): Fixed missing capture symbol under some circumstances.
* [#8](https://github.com/mliebelt/pgn-viewer/issues/8): Fixed version download
* [#9](https://github.com/mliebelt/pgn-viewer/issues/9): Spaces between moves and NAGs don't hurt any more.
* [#10](https://github.com/mliebelt/pgn-viewer/issues/10): More robust with repeating move numbers.
* [#11](https://github.com/mliebelt/pgn-viewer/issues/11): Disambiguation from the source is kept.
* [#13](https://github.com/mliebelt/pgn-viewer/issues/13): FEN positions for black are recognized as those.

## [0.9.0](https://github.com/mliebelt/pgn-viewer/commit/b6726ae1c3540410a23f5eb9e8462f6bb453b0c9) 2016-02-09

First published version, so the sections changed and added don't make sense. Rough version, was mostly workable, with not too much glitches known.
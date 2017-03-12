# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Changed

### Fixed

## [0.9.5]

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

## [0.9.4]

### Changed

* Implemented deletion of moves (main line and variations) and upvoting of variations. Refactored whole variation handling to make the code a little bit easier to understand.
* Finished the long outstanding "edit" mode, that should be now feature complete.
* Ensured that pgnReader is known from the beginning inside the pgnBase, so changes to the configuration are shared.
* Replaced former keyboard library by Mousetrap, works now again in all examples.

### Fixed

* [#17](https://github.com/mliebelt/PgnViewerJS/issues/17): Implemented promotion and deletion of moves, cleanup of the UI
* [#23](https://github.com/mliebelt/PgnViewerJS/issues/23): Interpretation of tag "SetUp" from the headers
* [#33](https://github.com/mliebelt/PgnViewerJS/issues/33): Button "first" goes to inital position


## [0.9.3]

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


## [0.9.2]

### Changed

* Tried to restructure some code, to minimize the API published, allowing creating new functionality.
* One convention used everywhere: use API functions, and publish as part of those functions the ones that could be used by others. 
* Use `font-awesome` as a local copy, so no internet connection is needed.  

### Fixed

* [#18](https://github.com/mliebelt/PgnViewerJS/issues/18): Added a changelog (this file)
* [#19](https://github.com/mliebelt/PgnViewerJS/issues/19): Added some functions to allow adding moves from a backend interactively
* [#20](https://github.com/mliebelt/PgnViewerJS/issues/20): Corrected variation UI (event handling) for Firefox
* [#21](https://github.com/mliebelt/PgnViewerJS/issues/21): Added rules for "1-0" and "0-1" to avoid errors

## [0.9.1] 

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

## [0.9.0]

First published version, so the sections changed and added don't make sense. Rough version, was mostly workable,
with not too much glitches known. 
# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Changed

### Fixed

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
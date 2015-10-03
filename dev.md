## Development documentation

The following is the (rough) development documentation. When do you need it:

* When you don't want to use the whole package, but want to tweak it.
* When you want to base your implementation on PgnViewerJS.
* When you want to understand how the whole development process works.
* When you are mliebelt and have to remember all the little things.

### Overview

The following gives an overview over the parts that are relevant for development:

* Used libraries: which library comes from where, which version is used, why, how is the library integrated?
* Javascript structure: which directory has which content, what is source, what is produced by the build process
* gh-pages: How to publish the documentation, examples, ... (without removing anything)
* Testing: how are the tests done, what to expect, what does not work, ...

### Used Libraries

#### Chess.js

* Library found on GitHub
* Including  some documentation (from chessboard.js, see below) how to constuct some working Javascript UI with those
libraries

##### TODOs

* Find and document the version
* Are there any known discrepancies (I have to address)
* How to test it?
* Why do I need `pgn.js` on top of it?
* Could `pgn.js` a wrapper for everything, so that `pgnv.js` does not need `chess.js` directly.

#### chessboardjs

* Version: 0.3.0
* Provides most of the things I need for the UI, including the kind of construction
  * HTML part: `<div id="something"></div>`
  * Javascript part: `<script>pgnView("something", {pgn: "1. e4 e5"}")</script>`
* Includes some CSS that I have to use, sometimes to adjust. This is the reason for the special class selectors ...

##### TODOs

* Check if there is a newer version available (checked)

#### PEG.js

I found this library when searching for something to build a parser (for PGN == Portable Game Notation), and found
this beast. It is a little bit more complicated, and you have to understand what a parser is, a grammar and all
those things. But then you are able to construct your grammar "on the fly" without any pain.

I have done this to do it:

* Started with the [online version of PEG.js](http://pegjs.org/online).
* Defined there some rules in a simple format.
* Entered interactively the input (in PGN format) I wanted to check.
* If it did not break, added some more rules.
* Then I added the creation part (in curly  braces) to construct at the end some JSON format of the moves.
* The result was then saved in `js/pgn-rules.peg`
* The resulting parser (created online) was then added as copy to the file `js/pgn-parser.js`.

##### TODOs

* Update to version 0.9.0, so that `strict` is now supported by the parser. (/)
* Recreate the file `pgn-parser.js` by the online PEG tool. (/)
* Create some test cases for checking that the peg-rules do work well, additional to the existing ones.
* Create for that purpose the file `pgn-parser.js` anew each time by using the Grunt build.
* Create a Gruntfile task for that purpose, so changing the rules, and then pressing the test button should be
sufficient.
* Is it wise to use Jasemine for that job? At least it works at the moment ...
* Try to read all tickets to the robustness of parsing, and try to match each one by creating a test case for it.

#### i18next-1.7.3.js

* Copy of i18next.com (from the comment in that file)
* Initialize it (`i18n.init`) inside an anonymous function.
* Use `$.t("...")` to translate something in the natural language set.
* Works well for parsing PGN, but not so well when used in edit mode. Do not understand the difference here ...

##### TODOS

* Understand the library
* Provide some test cases with different locales, on the same page. Check what that is translated to Jasemine.

#### jquery.hotkeys

* Allows to map keys to functions.
* Does work well in the browser, when pressing first buttons.
* Does not work well under all other circumstances, but may be the problem of my usage ...

##### TODOs

* Check if there is a better way to call it
* Check if there is a better, simpler library to use
* Understand the constraints in using it.
* Understand why it does not work in my context (it worked at least, when first a button was pressed).

#### jquery.multiselect

* Allows to use the multiselectd widget of JQuery UI (if installed)
* Works ok (more or less), but there are some subtleties that lead to wrong tests,
display of UI, ...

#### jquery.timer

* Used for automatic play of the moves.
* Allows to be manipulated by setting the timerTime (in milliseconds)
* Default is 700 milliseconds (due to the documentation), which is true

#### jquery-ui.js

* Customized version, that contains only the following:
  * core.js
  * widget.js
* Has to be regenerated anew if some other additions are needed.
* Reduced the size of the library a lot (some 15.000 lines).

#### pgn.js

* Originally the reader function, should also be used as a writer
(in all cases, even for the UI).
* Uses the base functionality of `chess.js` and `pgn-parser` (created by PEG)
alot.

##### TODOs

* Provide a clean API that could then be used (only) by the UI.
* The UI should not use the internal structure (alot), but the
API functions.

### Project structure

The following gives some hints, what the different directories and files (besides Javascript files) are for.

    /chess.js: Library used, content not explained here.
    /chessboardjs: Library used for display, not explained here. Current version is up-to-date.
    /css: CSS files as source, partly taken from others.
        /images: Images from the JQuery-UI part
        jquery.multiselect.css: Styles the multi select widget
        jquery-ui.css: Base style
        jquery-ui.theme.css: Don't remember the theme I have taken
        pgnvjs.css: One file for all styling (on top of the others). 
        templ.css: documentation how to create and embedd a new style. Not sure if that works.
    /dist: Will be generated on the master / gh-pages for a new release
    /dist-nojq: Variation that does not contain jquery (to minimize the distribution)
    /docu: Provides the base for the documentation on github pages. Uses the (then created) dist directory.
        /css: Additional styling
        /img: 
        /js
            examples.js: Examples for the documentation (as Javascript array)
            prettify.js: Uses prettify to render the (HTML and Javascript) source code.
        docu2.html: Used documentation
        examples2.html: Provide example HTML frame, uses examples.js
    /examples: see the different section about examples
    /img: Collection of images for different things, has to be documented.
    /js: Javascript files documented in detail above
        
    
##### TODOs
    
* Create jquery-ui new (for the current version)
* Document the decisions for jquery-ui (widgets, themes)
    
### gh-pages publishing

### Testing

* Upgraded to the latest Jasmine version (2.3.4)
* Checked that all unit tests work again (without any change).

### Build Process
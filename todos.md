# TODOs

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
  * :white_check_mark: chess.js should know when to castle

## Restructure Code

The code at the moment is not easy to understand, and parts of it lays in the mis-structure that happened over time.
Try to restructure the code to get the following:

* functions are only inside that scope available where they should be used.
* functions that are only used once could be "inlined" in some way.
* Extract common parameters that go everywhere (constant!) or are part of the configuration (could be computed all time), and see what to do with it.
* :white_check_mark: Use Font Awesome in a local copy, not the net version. This is used for all other resources, so why not here ...

### :white_check_mark: Avoid hide HTML

### Add features to board

#### notation

Current state:

* `showNotation` true|false --> Display coordinates
* `coordsInner`  true|false --> Show the coordinates inside the board (driven by a CSS class)
* `coordsFactor` float --> Factor to multiply the coordinate font size with, default is 1.0
* `rankFontSize` int --> Number in pixels

notation should not only be true or false, but also possible outside of the board. Additionally, the position could be signaled as well. The following is normal:

* combinations of N,S,E,W,C like N, NW, NC
* Meaning
  * N == NC
  * NC == top of the board, there the center
  * NW == top of the board, there the left
* This should be independent of the size of the board (and the fields) working.
* This would also allow to add a color to the board, which will shine through on the border (if you want).

## Documentation

* :white_check_mark: (included in the distribution only) Add documentation how to create a base example: example HTML file for the 4 different cases (board, view, edit, print), link that file from the documentation, explain the base parts in it.

### :white_check_mark: Changelog.md

Follow the conventions as good as possible:

* Add dates to the tags. :white_check_mark:
* Add a link to each tag that links to the diff. :white_check_mark:

## Examples

* Try to find as minimal as possible examples so that it is easier to demonstrate the different features.
* Try to rename the example files, document (in HTML) what the purpose of each example is.
* Try to find one (and only one) base example for each 'mode' like pgnBoard, pgnView, pgnEdit and pgnPrint. This will help debugging nasty problems, and find the reasons much easier.
* Try to find nice example games, and link them to the original source.
* Include in the example files the nice examples given somewhere, not the contrived ones I already have ...

### Docu Examples

* Add for all tickets that are demonstrable an example.
* :white_check_mark: Use as name `ticket\d{3}.html` (like `ticket004.html`)
* Ensure that all features are documented as well. Missing are at the moment:
  * :bangbang: Layout of the board relative to the moves: top, bottom, left, right, top-left, top-right
  * :bangbang: Coordinate positioning and layout

## Tickets

### :white_check_mark: Missing discriminator

* Check if there is a functionality to get the discriminator upfront (by using the chess.js library)
* See the function get_disambiguator in the library. So should work, find a test to check that (as unit test).
* Find at least the following examples for that:
  * Normal moves where no diammbiguator is needed.
  * Normal situation where the disambiguator has to be used.
  * Difficult situation where 2 moves could be possible, but one is not allowed (because the king is in check then).

:bangbang: Have implemented that now, and this has a (small) performance impact. I have to revisit that from time to time.

### Examples for development

Examples are for development only, and they have all the same structure:

* Head with minimal inclusions: `third.(js|css)`, `pgnvjs.(js|css)`, `pgn.js`, `theme.css`
  * `third` are all third party libraries, they are most of the time fixed.
  * The others are my code, that will be changed a lot.
* Have a title, a small description, and if possible only one example with minimal configuration relevant for that example.
* :bangbang: Your have to run `grunt default; grunt dev` at least once so that the examples are running ok.

### Cleanup examples

Currently the example directory is a mess. I should cleanup that and structure it in some way. Here is a draft that may work (indentation is sub-directory).

    examples/
      base/
        configuration/  Other topics that are directly shown, depending on the configuration the relevant mode that shows it.
          orientation, position, showNotation,
          scrollable, movesWidth, movesHeight,
          headers
        figures/    Show the different figures in the configuration, so that it is easy to see the difference. Mode should pgnBoard
        themes/     Show the different themes, each one in a different example
      modes/    Ensure that one simple example for each mode
        board/    Show different examples for the board, combining some elements from base
        view/     Show different examples for the viewer, combining some elements from base
        print/    Show different examples for the print mode, combining some elements from base
        edit/     Show different examples for the edit mode, combining some elements from base
      tickets/    Show for each ticket on example that shows that the ticket is solved (or not solved).
                  May be used (simplified) in the documentation. Try to find for each ticket an example in that folder.

Clarify what the other directories are currently doing:

* books: Examples from books, not really sure if I need that any more
* img: Examples from web sites (I think). Those examples may be implemented, but it would be more nice to show the examples online by providing a link.
* pgn: Examples of games that may be used (if needed). Only for development, should be included into the player examples (or provided as source for the ticket below).

All examples(most of them) have to be  modified after they have been moved to a new directory, because the paths won't work any more. Try to use only relative paths here, so moving on the same level is not a problem any more.

Try to give the existing examples better names (filenames), so it is easier to find an example that may help to debug some code.

### Use Mousetrap

I had problems lately in using the old key binding mechanism, so I switched to mousetrap. Easy to use, have to find a way how to define when it should be used. Currently, it works only for the last board that was created. So if more than one board is on a page, I have to find a way to switch focus from here to there.

When using the Mousetrap, I have the problem that I cannot enter any comment in edit modus any more. The keyboard press (that results in the key entered) is not consumed, so the SPACE key triggers the start / stop of the play modus.

I commented  out the start and stop by the SPACE key, but have to find a solution for the other things as well. There should be examples how to integrate Mousetrap without loosing the editing of editor and text fields.

### :white_check_mark: Allow central configuration

Using a generic configuration could be useful, so that the code for defining new boards, ... would be minimal. After having studied the code of the used libraries, I have found the following

* chess.js does not use a configuration at all. Everything is a parameter to the call. Example here is the sloppy parameter for parsing PGN.
* chessground uses a kind of configuration.
* I have included a `default` object that contains  the configuration used as default. Those values are overwritten by the given configuration by the user.

### #83: abstractions in NAG from colors

* This may be appropriate (from a user perspective), but is that doable all the time?
* There may be situations when e.g. "White has a clear time advantage" (§30) may be appropriate as annotion after a move of black.

#### Alternative approach

* Take only the clear things that are white and black annotations (like zugzwang) after the move in the menu.
* Add to the menu a text box that allows to enter some search text, that is then used to filter all NAGs, to select one, and integrate that then into the NAGs.

### #80: Rank font size and position

* Was easy to set, but there are some other parts that should go together. Those are
  * ranks.right: Default -2px, depends heavily on the size of the rank fonts.
  * ranks.top: Default 0px, may be adjusted as well.
  * files.left: Default 2px, so moved mostly tot the left.
  * files.bottom: Default -3px, so moved mostly to the bottom.
* Possibility as well: 2 ranks and files (instead of one)

If would be nice to have the option to style all of that. So reasonable are the following options:

    { rankFont: 20 }

This just adjusts the font size of the ranks (and files).

    { rankFont:
      { size: 20,
        ranks: { right: 4, top: -4 },
        files: { left: 0, bottom: -3}
      }
    }

This is the most complicated structure, but very concrete, and therefore easy to implement.

We should then provide some examples how to use that so that different coordinate locations are easy to do.

`coordsInnner` and `coordsFactor` should be taken into consideration as well. Not sure what is the best approach here.
The upper one is the most flexible, and allows to build `coordsInner` and `coordsFactor` with it. Perhaps I have to get rid of `coordsInner` and `coordsFactor` all together. Or build some logic with reasonable defaults around it.

How about the measures that are taken here? top, right, left, and bottom may be relative as well, most are used as pixel values. And the font size may be a factor, a size in pixel or a size in em??

## #90: i18next new version

The new version works only asynchronous, which means, that the resources are only loaded when the (optional) function callback of the `init` function is called. I have to move the functionality completely inside that call then.

Base idea ist the following:

1. Ensure that all base calls are stored by `scheduling` them.
1. Ensure that this holds
   * The function call
   * The parameters
1. Only when the needed resources are loaded, the functions are then applied (without a first argument).

So I need:

* a scheduler, that stores the scheduled calls.
* that is registered them in the init callback
* that goes through all calls and applies them.

At the end, it seemed pretty simple. I have the impression, that the performance is worse then before, and I have to define the languages that have to be preloaded. There should be a check if a schedule is necessary, so that later it may just be displayed without a schedule then.

A more elaborate solution would do the following:

* schedule: check if a language is loaded, if yes, call immediate, if no, wait until loaded.
* Hold the languages loaded (or ask again all the times)
* So no preload would be done, init would do nothing, but calling schedule would then load the language (if necessary) lazy.
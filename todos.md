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
  
### Use Less for css

From here to there, I wish I had the chance to use Less (or Sass) for CSS. Reasons are the following:

* Variables: I want to use the same value at different places. Real variables, that will then be used.
* Computation: It would be nice to compute sometimes values. Something like depending on a value, remove or add something. Don't have an example, but will find one.
* I dream of making the code much simpler. The CSS looks bloated (in my opinion), and this has partly to do with the duplication.

Look up Less / Sass to see what is in there. And try to find places  in `pgnvjs.css` where it would help.

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

#### Cleanup examples

Currently the example directory is a mess. I should cleanup that and structure it in some way. Here is a draft that may work (indentation is sub-directory). 

examples/
  base/
    configuration/  Other topics that are directly shown, depending on the configuration the relevant mode that shows it.
      config.chessboardjs: orientation, position, showNotation, (and a lot of others not made public)
        scrollable, movesWidth, movesHeight, 
        headers: if false, don't diplay the headers, default is true
    figures/    Show the different figures in the configuration, so that it is easy to see the difference. Mode should pgnBoard
    themes/     Show the different themes, each one in a different example  
  modes/
    board/    Show different examples for the board, combining some elements from base
    view/     Show different examples for the viewer, combining some elements from base
    print/    Show different examples for the print mode, combining some elements from base
    edit/     Show different examples for the edit mode, combining some elements from base
  tickets/    Show for each ticket on example that shows that the ticket is solved (or not solved). 
              May be used (simplified) in the documentation. Try to find for each ticket an example in that folder.

Clarify what the other directories are currently doing:

* css: Deleted, not referenced any where
* books: Examples from books, not really sure if I need that any more
* img: Examples from web sites (I think). Those examples may be implemented, but it would be more nice to show the examples online by providing a link. 
* pgn: Examples of games that may be used (if needed). Only for development, should be included into the player examples (or provided as source for the ticket below).

All examples(most of them) have to be  modified after they have been moved to a new directory, because the paths won't work any more. Try to use only relative paths here, so moving on the same level is not a problem any more.

Try to give the existing examples better names (filenames), so it is easier to find an example that may help to debug some code.


###### Use Mousetrap

I had problems lately in using the old key binding mechanism, so I switched to mousetrap. Easy to use, have to find a way how to define when it should be used. Currently, it works only for the last board that was created. So if more than one board is on a page, I have to find a way to switch focus from here to there.

When using the Mousetrap, I have the problem that I cannot enter any comment in edit modus any more. The keyboard press (that results in the key entered) is not consumed, so the SPACE key triggers the start / stop of the play modus.

I commented  out the start and stop by the SPACE key, but have to find a solution for the other things as well. There should be examples how to integrate Mousetrap without loosing the editing of editor and text fields.

###### Allow central configuration

Using a generic configuration could be useful, so that the code for defining new boards, ... would be minimal. After having studied the code of the used libraries, I have found the following

* chess.js does not use a configuration at all. Everything is a parameter to the call. Example here is the sloppy parameter for parsing PGN.
* chessboardjs uses a kind of default configuration, but only in code. The function `expandConfig` does that, it checks every parameter, and sets the default value, if it is not already set.
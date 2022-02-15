# Development documentation

The following is the (rough) development documentation. When do you need it:

* When you don't want to use the whole package, but want to tweak it.
* When you want to base your implementation on PgnViewerJS.
* When you want to understand how the whole development process works.
* When you are mliebelt and have to remember all the little things.

## In a Nutshell

If you don't want to read a lot of documentation, here is the shortest form possible.

### Pre-requisits

* You have to have installed node.js (any version)
* You have to have cloned the repository, or downloaded a zip file of its content locally. This is contained in the folder `/PgnViewerJS` if we need a reference.

### Boot-strapping

Do the following steps to have PgnViewerJS build:

* Run `npm install` to have all the additional libraries downloaded and installed locally.
* Run `npm build` in the 2 modules directories to build a development distribution. This will create the library part of PgnViewerJS only.
  * `modules/pgn-viewer/lib/pgnv.js`.

### Running examples

* Open a shell and go to `/PgnViewerJS/modules/pgn-viewer`.
* Run a local web server on that directory or run `npm start` (which starts a local web server on port 8080 in the development version).
* Open in a web browser (preferred Chrome or Firefox) the URL `http://localhost:8080/examples`. Navigate to the directory and open the example files locally.

### Running Unit Tests

* Use `npm test` in the directory `modules/pgn-reader (I don have UI tests yet, I use the examples directory for that purpose).

### Adding Locales

This is only necessary if you want to add a locale, or change the list of locales in `PgnViewerJS/modules/pgn-viewer/.npmrc`.

* Go to the file `.npmrc` and change the list of locales.
* Ensure that you have created local files named `<locale>.ts`. Copy to do that the file `locales/en.ts`. Essential are the strings beginning with `chess` for the figure names, and `buttons` for the button title. NAGs are currently only used in the editor.
* Run at the end `npm run gen_i18n` in directory `modules/pgn-viewer` before running `npm run build` to create a new version.

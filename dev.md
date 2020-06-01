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

* Open a shell and go to `/PgnViewerJS`.
* Run a local web server on that directory.
* Open in a web browser (preferred Chrome or Firefox) the URL `http://localhost:5001/examples`. Navigate to the directory and open the example file locally.

### Running Unit Tests

* Use `npm test` in the directory `modules/pgn-reader (I don have UI tests yet, I use the examples directory for that purpose).

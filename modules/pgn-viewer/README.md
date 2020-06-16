# In a Nutshell

You will find the detailed documentation about pgn-viewer (formerly named PgnViewerJS, which is a bad name for NPM) in the [top-level directory](https://github.com/mliebelt/PgnViewerJS/blob/master/readme.md).

## How to Install

`npm install` to get all dependencies resolved. It has as dependency the other module `pgn-reader` which is separately published on NPM.

## How to Build and Test

* `npm build`: Creates a new bundle `lib/pgnv.js` including the necessary `img` files copied to that directory.

There are currently no UI tests available, I use the top-level directory `examples` to "test" changes in the application.

## How to Use

You may include the viewer into an HTML page with roughly the following code.

    <html>
    <head>
      <script src="/lib/pgnv.js" type="text/javascript" ></script>
      <script src="https://use.fontawesome.com/4cf2a2bf7b.js"></script>
    </head>
    <body class="merida zeit">
      <div id="board"/>
      <script>
        PGNV.pgnView('board', {pgn: '1. e4 e5', locale: 'fr', width: '200px'});
      </script>
    </body>
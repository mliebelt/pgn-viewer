# In a Nutshell

You will find the detailed documentation about pgn-viewer (formerly named PgnViewerJS, which is a bad name for NPM) in the [top-level directory](https://github.com/mliebelt/PgnViewerJS/blob/master/readme.md).

## License

pgn-viewer is distributed under the **GPL-3.0 license** (or any later version, at your option), due to its use of [Chessground](https://github.com/ornicar/chessground).
When you use pgn-viewer for your website, your combined work may be distributed only under the GPL. **You must release your source code** to the users of your website.

Please read more about GPL for JavaScript on [greendrake.info/#nfy0](http://greendrake.info/#nfy0).

## How to Install

`npm install` to get all dependencies resolved. It has as dependency the other module `pgn-reader` which is separately published on NPM.

## How to Build and Test

* `npm build`: Creates a new bundle `lib/dist.js` including a compressed version of it.
* If you want to remove some locales, make a custom build by
  * first adjusting the list of locales in `.npmrc`
  * call locally first the script `gen_i18n`
  * then build the distribution

There are currently no UI tests available, I use the top-level directory `examples` to "test" changes in the application. You have to run a web server in the root directory of the module then.

## How to Use

You may include the viewer into an HTML page with roughly the following code.

    <html>
    <head>
      <script src="/lib/dist.js" type="text/javascript" ></script>
    </head>
    <body class="merida zeit">
      <div id="board"/>
      <script>
        PGNV.pgnView('board', {pgn: '1. e4 e5', locale: 'fr', width: '200px'});
      </script>
    </body>
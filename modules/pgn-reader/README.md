[![GitHub Workflow Status](https://github.com/mliebelt/PgnViewerJS/actions/workflows/nodejs.yml/badge.svg)](https://github.com/mliebelt/PgnViewerJS/actions[)
[![npm (tag)](https://img.shields.io/npm/v/@mliebelt/pgn-reader)](https://www.npmjs.com/package/@mliebelt/pgn-reader)](https://www.npmjs.com/package/@mliebelt/pgn-reader)
[![npm](https://img.shields.io/npm/dm/@mliebelt/pgn-reader)](https://www.npmjs.com/package/@mliebelt/pgn-reader)
[![NPM](https://img.shields.io/npm/l/@mliebelt/pgn-reader)](https://github.com/mliebelt/PgnViewerJS/blob/main/modules/pgn-reader/LICENSE.md)

# In a Nutshell

pgn-reader is up to now only used by pgn-viewer. You will find the detailed documentation about pgn-viewer (formerly named PgnViewerJS, which is a bad name for NPM) in the [top-level directory](../../readme.md).

## How to Install

`npm install` to get all dependencies resolved. It has as dependency the parser `pgn-parser` which is separately published on NPM.

## How to Build and Test

* `npm build`: Creates a new bundle `lib/pgn.ts`.
* `npm test`: Runs the whole test suite to check the whole API.

## How to Use

See `pgn-viewer` how to use it.
# pgn-viewer public roadmap

The goal of that  file is to show prominently what my expectations are about the roadmap of the `pgn-viewer`. The the [discussion 513](https://github.com/mliebelt/pgn-viewer/discussions/513) for the trigger.

I will concentrate here on the functionality that will be ready and released in which release. I am working mostly alone on the viewer, and things may be delayed without explanation. My goal is to give some insight and tranparency what the high level goals are, and in which order by which project / ticket I want to fulfill that.

## Goals of `pgn-viewer`

* Provide a rich UI to allow people to have PGN games shown/played by providing different modes. :heavy_check_mark:
* Add additional features and release them, when they are ready to be used.
* Fix the obvious bugs that hinder people in using the UI. Ensure that releases are done from time to time, depending on the criticality/priority of bugs fixed. :heavy_exclamation_mark:
* :question: Allow people to enhance and integrate the viewer in various ways
  * by having notifications from the viewer, to add functionality then.
  * by having hooks available, to influence working of the viewer.
  * by having an API that allows to steer the viewer from the outside, to do the main functionality.
* :question: Restructure the viewer source code, so that it is easier to maintain, and is a better fit for the target environment (pure functional, based on Typescript). 

The goals should give us the direction, and give some indication when releases should be done.

## Roadmap (Idea)

* 1.6.6: Current version (2024-03-20)
* 1.6.x: Additional versions, fixing bugs
* 1.7.0: #510 new mode, therefore a new minor version (goal: 2024-03-31)
* 1.7.x: Patch versions, that implement first steps in refactoring to better API, better structure, less dependencies (goal: 2024-05-31)
* 1.8.0 XOR 2.0.0: Finished refactoring, depending on the changes a new major/minor version. Ensure that the configuration of the viewer and the main integration points are the same. (goal: autumn 2024)
* 1.9.0 XOR 2.1.0: Stockfish integration, including a very simple UI to start/stop/configure Stockfish.


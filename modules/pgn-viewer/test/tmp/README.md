# What is is this directory about?

I want to test the delivery of PgnViewerJS, and here are some of the circumstances I expect to see on the net.

Each one should be tried individually. To test them, I have first to copy / paste the whole `/dist` directory to each one of the `exp<nr>` directories.

Then I have to start a web server locally in each root directory, and see, if the located index.html file works as expected. See the individual directories for different cases:

* `exp1`: `index.html`, bundle and resources are located directly here. This should work all the time (default usage).
* `exp2`: Have the `index.html` file directly here, but the other resources located somewhere else.
* `exp3` Have the `index.html` somewhere else, referencing relative the `bundle.js` file.
* `exp4`: Have `index.html` somewhere else, referencing the bundle with an absolute (local) path.
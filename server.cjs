var express = require('express');
var app = express();

app.use(function(req, res, next) {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

app.use(express.static('.')); // serve files from current directory

app.listen(8080); // listen on port 8080
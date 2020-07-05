const gen_examples = function() {
    var htmlEscape = function(str) {
        return (str + '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;');
    };
    console.log("Will generate examples in directory: " + __dirname + '\\docs\\examples');
    var fs = require('fs');
    require('../docs/js/examples.js');
    console.log("Available keys: " + Object.keys(examples));
    var exKeys = Object.keys(examples);
    // Loop through all examples
    for (var i=0; i < exKeys.length; i++) {
        var ex = examples[exKeys[i]];
        var buf = "";
        buf += '<!DOCTYPE html>' + "\r\n";
        buf += '<html>' + "\r\n";
        buf += '<head>' + "\r\n";
        buf += '<meta charset="utf-8" />' + "\r\n";
        buf += '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' + "\r\n";
        buf += '<title>' + ex.name + '</title>' + "\r\n";
        buf += '<link rel="stylesheet" href="../css/prettify.css" />' + "\r\n";
        buf += '<link rel="stylesheet" href="../css/layout.css" />' + "\r\n";
        buf += '<script>__globalCustomDomain = "/PgnViewerJS/js/";</script>' + "\r\n";
        buf += '<script src="../js/pgnv.js" type="text/javascript" ></script>' + "\r\n";
        buf += '<script src="../js/prettify.js" type="text/javascript" ></script>' + "\r\n";
        buf += '</head>' + "\r\n";
        buf += '<body class="merida zeit">' + "\r\n";
        buf += '<h2>' + ex.name + '</h2>' + "\r\n";
        buf += '<h3>Javascript part</h3>' + "\r\n";
        buf += '<pre class="prettyprint lang-js">' + ex.jsStr + '</pre>' + "\r\n";
        buf += '<h3>HTML part</h3>' + "\r\n";
        buf += '<pre class="prettyprint lang-html">' + htmlEscape(ex.html) + '</pre>' + "\r\n";
        buf += '<p>See the <a href="../examples.html#' + exKeys[i] + '">back link</a> to the original examples page.</p>' + "\r\n";
        buf += '<div>' + ex.desc + '</div>' + "\r\n";
        buf += ex.html + "\r\n";
        buf += '<script>' + "\r\n";
        buf += ex.jsStr + "\r\n";
        buf += '</script>' + "\r\n";
        buf += '<script>prettyPrint();</script>' + "\r\n";
        buf += '</body>' + "\r\n";
        buf += '</html>' + "\r\n";
        fs.writeFileSync('docs/examples/' + exKeys[i] + ".html", buf);
    }
};

gen_examples();

module.exports = {
    gen_examples
};

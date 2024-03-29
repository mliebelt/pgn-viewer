import examples from '../docs/js/examples.mjs'
import fs from 'fs'

console.log("Read Examples: " + examples)
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
    console.log("Will generate examples in directory: " + 'docs/examples');
    console.log("Available keys: " + Object.keys(examples));
    var exKeys = Object.keys(examples);
    // Loop through all examples
    for (var i=0; i < exKeys.length; i++) {
        var ex = examples[exKeys[i]];
        var buf = "";
        buf += '<!DOCTYPE html>' + "\n";
        buf += '<html>' + "\n";
        buf += '<head>' + "\n";
        buf += '<meta charset="utf-8" />' + "\n";
        buf += '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' + "\n";
        buf += '<title>' + ex.name + '</title>' + "\n";
        buf += '<link rel="stylesheet" href="../css/prettify.css" />' + "\n";
        buf += '<link rel="stylesheet" href="../css/layout.css" />' + "\n";
        buf += '<script src="../lib/dist.js" type="text/javascript" ></script>' + "\n";
        buf += '<script src="../js/prettify.js" type="text/javascript" ></script>' + "\n";
        buf += '</head>' + "\n";
        buf += '<body class="merida zeit">' + "\n";
        buf += '<h2>' + ex.name + '</h2>' + "\n";
        buf += '<h3>Javascript part</h3>' + "\n";
        buf += '<pre class="prettyprint lang-js">' + ex.jsStr + '</pre>' + "\n";
        buf += '<h3>HTML part</h3>' + "\n";
        buf += '<pre class="prettyprint lang-html">' + htmlEscape(ex.html) + '</pre>' + "\n";
        buf += '<p>See the <a href="../examples.html#' + exKeys[i] + '">back link</a> to the original examples page.</p>' + "\n";
        buf += '<div>' + ex.desc + '</div>' + "\n";
        buf += ex.html + "\n";
        buf += '<script>' + "\n";
        buf += ex.jsStr + "\n";
        buf += '</script>' + "\n";
        buf += '<script>prettyPrint();</script>' + "\n";
        buf += '</body>' + "\n";
        buf += '</html>' + "\n";
        fs.writeFileSync('docs/examples/' + exKeys[i] + ".html", buf);
    }
};

gen_examples();

export { gen_examples }
var examples = {};

examples["1000"] = {
    desc: "ChessBoard initializes to the starting position on board with an empty configuration.",
    html: "<div id=\"board\" style=\"width: 400px\"><\/div>",
    name: "Starting Board",
    jsStr: "var board = pgnBoard('board', {});",
    jsFn: function() {
        var board = pgnBoard('board', {});
    }
};
examples["1001"] = {
    desc: "ChessBoard with theme 'zeit' / 'green' and pieceStyle 'merida' / 'case'.",
    html: "<div id=\"board\" style=\"width: 300px\"><\/div>\n<div id=\"board2\" style=\"width: 300px\"><\/div>",
    name: "Theme: Zeit and Style: Merida",
    jsStr: "var board = pgnBoard('board', {" +
        "\n     pieceStyle: 'merida', " +
        "\n     theme: 'zeit'});" +
"\nvar board2 = pgnBoard('board2', " +
        "\n     {pieceStyle: 'case', theme: 'green'});",
    jsFn: function() {
        var board = pgnBoard('board', {pieceStyle: 'merida', theme: 'zeit'});
        var board2 = pgnBoard('board2', {pieceStyle: 'case', theme: 'green'});
    }
};

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

var highlightGroupHeader = function(groupIndex) {
    $('div#examples_list_container h4').removeClass('active');
    $('h4#group_header_' + groupIndex).addClass('active');
};

var highlightExample = function(id) {
    $('div#examples_list_container li').removeClass('active');
    $('li#example_' + id).addClass('active');
};

var showExample = function(number) {
//    var groupIndex = parseInt($('li#example_' + number)
//        .parent('ul').attr('id').replace('group_container_', ''), 10);
//
//    $('ul#group_container_' + groupIndex).css('display', '');
//    highlightGroupHeader(groupIndex);
    highlightExample(number);

    $('#example_name').html(examples[number].name);
    $('#example_single_page_link').attr('href', 'examples/' + number);
    $('#example_desc_container').html(examples[number].desc);
    $('#example_html_container').html(examples[number].html);
    $('#example_js_container').html('<pre class="prettyprint">' + examples[number].jsStr + '</pre>');
    $('#example_show_html_container').html('<pre class="prettyprint">' + htmlEscape(examples[number].html) + '</pre>');
    examples[number].jsFn();
    prettyPrint();
};

var clickExample = function() {
    var number = parseInt($(this).attr('id').replace('example_', ''), 10);
    if (examples.hasOwnProperty(number) !== true) return;

    window.location.hash = number;
    loadExampleFromHash();
};

var loadExampleFromHash = function() {
    var number = parseInt(window.location.hash.replace('#', ''), 10);
    if (examples.hasOwnProperty(number) !== true) {
        number = 1000;
        window.location.hash = number;
    }
    showExample(number);
};

var clickGroupHeader = function() {
    var groupIndex = parseInt($(this).attr('id').replace('group_header_', ''), 10);
    var examplesEl = $('ul#group_container_' + groupIndex);
    if (examplesEl.css('display') === 'none') {
        examplesEl.slideDown('fast');
    }
    else {
        examplesEl.slideUp('fast');
    }
};

var init = function() {
    $('#examples_list_container').on('click', 'li', clickExample);
    $('#examples_list_container').on('click', 'h4', null);
    loadExampleFromHash();
};
$(document).ready(init);
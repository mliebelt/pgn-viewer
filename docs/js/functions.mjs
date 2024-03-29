import examples from './examples.mjs';

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
    var groupIndex = parseInt($('li#example_' + number)
        .parent('ul').attr('id').replace('group_container_', ''), 10);

    $('ul#group_container_' + groupIndex).css('display', '');
    highlightGroupHeader(groupIndex);
    highlightExample(number);

    $('#example_name').html(examples[number].name);
    $('#example_single_page_link').attr('href', 'examples/' + number + ".html");
    $('#example_desc_container').html(examples[number].desc);
    $('#example_html_container').html(examples[number].html);
    $('#example_js_container').html('<pre class="prettyprint lang-src">' + examples[number].jsStr + '</pre>');
    $('#example_show_html_container').html('<pre class="prettyprint lang-html">' + htmlEscape(examples[number].html) + '</pre>');
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
    $('#examples_list_container').on('click', 'h4', clickGroupHeader);
    loadExampleFromHash();
};
$(document).ready(init);
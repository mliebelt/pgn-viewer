'use strict';

/*
 Defines the move function, to return an object that
 * knows the previous and next move
 * the comment (before and after)
 * the variants (an array of moves)
 */
var move = function(spec) {
    var that = {};
    function getNextMove() {
        return that.next ? that.next : null;
    }
    function getPrevMove() {
        return that.prev ? that.prev : null;
    }
    function setNextMove(_next) {
        that.next = _next;
    }

    /**
     * Read the spec, store the necessary parts in the receiver.
     * @param spec the spec object with the keys (mandatory) notation, prev and (optional)
     * beforeComment
     */
    function readSpec(spec) {
        that.prev = spec.prev;
        if (spec.beforeComment) {
            that.beforeComment = spec.beforeComment;
        }
        that.notation = spec.notation;
    }
    that.getNextMove = getNextMove();
    that.getPrevMove = getPrevMove();
    readSpec(spec);
    return that;
}
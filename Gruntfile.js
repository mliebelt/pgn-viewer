module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'chessboardjs/js/jquery-1.10.1.min.js',
                    'chessboardjs/js/chess.js',
                    'chessboardjs/js/chessboard.js',
                    'chessboardjs/js/json3.min.js',
                    'js/*.js'],
                dest: 'dist/pgnviewerjs.js'
            }
        },
        uglify: {
            dist: {
                src: ['dist/pgnviewerjs.js'],
                dest: 'dist/min/pgnviewerjs.js'
            }
        }
    });

    // Load the necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task.
    grunt.registerTask('default', ['concat',  'uglify']);

};
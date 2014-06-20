module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["dist/cs", 'dist/js', 'dist/img', 'dist/locales'],
        concat: {
            js: {
                src: [
                    'chessboardjs/js/jquery-1.11.1.js',
                    'chess.js/chess.js',
                    'chessboardjs/js/chessboard.js',
                    'chessboardjs/js/json3.min.js',
                    'js/*.js'],
                dest: 'dist/js/pgnviewerjs.js'
            }
        },
        uglify: {
            js: {
                src: ['dist/js/pgnviewerjs.js'],
                dest: 'dist/js/min/pgnviewerjs.js'
            }
        },
        copy: {
            all: {
                files: [
                    {
                        src: [
                            'locales/**',
                            'img/buttons/**',
                            'img/chesspieces/**',
                            'img/pattern/**',
                            'img/*.png',
                            'css/**'],
                        dest: 'dist',
                        expand: true
                    }
                ]
            },
            chessboardjs: {
                files: [
                    {
                        expand: true,
                        cwd: 'chessboardjs/',
                        src: ['img/chesspieces/**', 'css/chessboard.css'],
                        dest: 'dist/'}
                ]
            },
            markdown: {
                files: [
                    {
                        expand: true,
                        cwd: 'docu',
                        src: ['css/**', 'img/**'],
                        dest: 'dist/doc'
                    }
                ]
            }
        },
        markdown: {
            all: {
                files: [
                    {
                        expand: true,
                        src: '*.md',
                        dest: 'dist/doc/',
                        ext: '.html'
                    }
                ],
                options: {
                    template: 'template.jst'}
            }
        }
    });

    // Load the necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-markdown');

    // Default task.
    grunt.registerTask('default', ['clean', 'concat',  'uglify', 'copy']);

};
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["dist/css", 'dist/js', 'dist/img', 'dist/locales', 'dist/doc', "docu/dist/css",
            'docu/dist/js', 'docu/dist/img', 'docu/dist/locales', 'docu/dist/doc'],
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
            },
            docu: {
                files: [
                    {
                        src: ['dist/**'],
                        dest: 'docu',
                        expand: true
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
        },
        'ftp-deploy': {
            docu: {
                auth: {
                    host: 'mliebelt.bplaced.net',
                    port: 21,
                    authKey: 'my-key'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'docu/',
                        src: '**',
                        dest: 'pgnvjs'
                    }]
            }
        },
        ftp_push: {
            docu_all: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'docu',
                        src: [
                            "**"
                        ]
                    }
                ]
            },
            docu_min: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'docu',
                        src: ["*.html"]
                    }
                ]
            },
            dist_min: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/dist/js",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/js/min',
                        src: ["pgnviewerjs.js"]
                    }
                ]
            }
        }
    });

    // Load the necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-ftp-push');

    // Default task.
    grunt.registerTask('default', ['clean', 'concat',  'uglify', 'copy']);

};
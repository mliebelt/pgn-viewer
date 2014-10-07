module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["dist/css", 'dist/js', 'dist/img', 'dist/locales', 'dist/doc', "docu/dist/css",
            'docu/dist/js', 'docu/dist/img', 'docu/dist/locales', 'docu/dist/doc',
            'dist-nojq/css', 'dist-nojq/js'],
        concat: {
            all: {
                src: [
                    'chessboardjs/js/jquery-1.11.1.js',
                    'chess.js/chess.js',
                    'chessboardjs/js/chessboard.js',
                    'chessboardjs/js/json3.min.js',
                    'js/*.js'],
                dest: 'dist/js/pgnviewerjs.js'
            },
            nojq: {
                src: [
                    'chess.js/chess.js',
                    'chessboardjs/js/chessboard.js',
                    'chessboardjs/js/json3.min.js',
                    'js/*.js'],
                dest: 'dist-nojq/js/pgnviewerjs.js'
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
                            'css/images/**'],
                        dest: 'dist',
                        expand: true
                    }
                ]
            },
            nojq: {
                files: [
                    {
                        src: [
                            'locales/**',
                            'img/buttons/**',
                            'img/chesspieces/**',
                            'img/pattern/**',
                            'img/*.png',
                            'css/images/**'],
                        dest: 'dist-nojq',
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
        },
        compress: {
            main: {
                options: {
                    archive: 'PgnViewerJS.zip'
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*'],
                dest: ''
            }
        },
        concat_css: {
            options: {
                // Task-specific options go here.
            },
            all: {
                src: [
                    "chessboardjs/css/chessboard.css",
                    "css/jquery-ui.css",
                    "css/jquery.multiselect.css",
                    "css/pgnvjs.css"
                ],
                dest: "dist/css/pgnvjs.css"
            },
            nojq: {
                src: [
                    "chessboardjs/css/chessboard.css",
                    "css/jquery-ui.css",
                    "css/jquery.multiselect.css",
                    "css/pgnvjs.css"
                ],
                dest: "dist-nojq/css/pgnvjs.css"
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
            docu_js: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/js",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'docu/js',
                        src: ["*.js"]
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
            },
            dist_debug: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/dist/js",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/js',
                        src: ["pgnviewerjs.js"]
                    }
                ]
            },
            dist_locales: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/dist/locales",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/locales',
                        src: ["*.json"]
                    }
                ]
            },
            dist_css: {
                options: {
                    authKey: "bplaced",
                    host: "mliebelt.bplaced.net",
                    dest: "/pgnvjs/dist/css",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/css',
                        src: ["*.css"]
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
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-concat-css');

    // Default task.
    grunt.registerTask('default', ['clean', 'concat:all', 'concat_css',  'uglify', 'copy:all']);
    grunt.registerTask('debug', ['clean', 'concat:all', 'copy:all']);
    grunt.registerTask('nojq', ['clean', 'concat:nojq', 'concat_css:nojq', 'copy:nojq' ]);
    grunt.registerTask('deploy-all', ['ftp_push:dist_min', 'ftp_push:docu_min',
        'ftp_push:dist_locales', 'ftp_push:dist_css', 'ftp_push:docu_js']);

};
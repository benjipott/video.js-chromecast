'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= pkg.license %> */\n',
        clean: {
            files: ['dist']
        },

        concat: {
            options: {
                separator: ''
            },
            dist: {
                src: ['src/videojs.pluginBase.js','src/videojs.chromeCast.js', 'src/component/**/*.js'],
                dest: 'dist/videojs.chromeCast.js'
            }
        },

        uglify: {
            dist: {
                src: 'dist/videojs.chromeCast.js',
                dest: 'dist/videojs.chromeCast.min.js'
            },
        },
        copy: {
            dist: {
                src: 'src/videojs.chromeCast.css',
                dest: 'dist/videojs.chromeCast.css'
            }
        },
        cssmin: {
            dist: {
                src: 'src/videojs.chromeCast.css',
                dest: 'dist/videojs.chromeCast.min.css'
            }
        },
        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: [
                        'dist/videojs.chromeCast.js',
                        'dist/videojs.chromeCast.min.js',
                        'dist/videojs.chromeCast.min.css',
                        'dist/videojs.chromeCast.css'
                    ]
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-banner');

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'copy', 'cssmin', 'usebanner']);

};

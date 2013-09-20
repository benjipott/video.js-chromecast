/*
 * grunt-banner
 * https://github.com/mattstyles/grunt-banner
 *
 * Copyright (c) 2013 Matt Styles
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        appConfig: {
            def: 'STRING'
        },

        // Configuration to be run (and then tested).
        usebanner: {
            bannerTop: {
                options: {
                    position: 'top',
                    banner: '// the banner'
                },
                files: {
                    src: [ 'test/fixtures/some.js' ]
                }
            },

            bannerBottom: {
                options: {
                    position: 'bottom',
                    banner: '// the banner'
                },
                files: {
                    src: [ 'test/fixtures/someBottom.js' ]
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'usebanner', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};

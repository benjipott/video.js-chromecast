'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.banner = {

    setUp: function( done ) {
        // setup here if necessary
        done();
    },

    tearDown: function( done ) {
        // tear down here if necessary
        // tear down currently happens after the last test (bannerBottom) @todo fix this

        done();
    },

    bannerTop: function( test ) {
        test.expect( 1 );

        var actual = grunt.file.read( 'test/fixtures/some.js' );
        var expected = grunt.file.read( 'test/expected/some-banner.js' );

        test.equal( actual, expected, 'should add a banner to the top of a file' );

        test.done();
    },

    bannerBottom: function( test ) {
        test.expect( 1 );

        var actual = grunt.file.read( 'test/fixtures/someBottom.js' );
        var expected = grunt.file.read( 'test/expected/some-bottom.js' );

        test.equal( actual, expected, 'should add a banner to the bottom of a file' );

        test.done();

        // @todo fix this tear down
        var filePath = [
            'test/fixtures/some.js',
            'test/fixtures/someBottom.js'
        ];

        filePath.forEach( function( file ) {
            // delete test file if it currently exists
            if ( grunt.file.exists( file ) ) {
                grunt.file.delete( file );
            }

            // Write the post-test file
            grunt.file.write( file, 'var variable = "this is a variable"' );
        });
    }
};

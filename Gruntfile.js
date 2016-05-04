/*
 * grunt-htmlcpr
 * https://github.com/PlanitarInc/grunt-htmlcpr
 *
 * Copyright (c) 2016 PlanitarInc
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

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

    // Configuration to be run (and then tested).
    htmlcpr: {

      src_is_dir: {
        files: {
          'tmp/src_is_dir/': ['test/fixtures/'],
        },
      },

      copy_unknown_sources: {
        files: {
          'tmp/copy_unknown_sources/': [
            'test/fixtures/images/bed.jpg',
            'test/fixtures/fonts/fontawesome-webfont.ttf',
            'test/fixtures/misc/readdir.txt',
            'test/fixtures/images/almond.jpg',
          ],
        },
      },

      enforced_cwd: {
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['images/bed.jpg', 'fonts/fontawesome-webfont.ttf',
            'misc/readdir.txt', 'images/almond.jpg'],
          dest: 'tmp/enforced_cwd/',
        }],
      },

      enforced_root_dir: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/enforced_root_dir/': ['test/fixtures/images/christmas.jpg'],
        },
      },

      page_no_links: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_no_links/': ['test/fixtures/page_no_links.html'],
        },
      },

      page_simple: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_simple/': ['test/fixtures/page_simple.html'],
        },
      },

      page_remote_links: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_remote_links/': ['test/fixtures/page_remote_links.html'],
        },
      },

      page_with_css_url: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_with_css_url/': ['test/fixtures/page_with_css_url.html'],
        },
      },

      page_norec_urls: {
        options: {
          rootDir: 'test/fixtures',
          // Files withing the directory are copied but the links in these files
          // are not.
          norecDir: 'css',
        },
        files: {
          'tmp/page_norec_urls/': ['test/fixtures/page_norec_urls.html'],
        },
      },

      page_subdir: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_subdir/': ['test/fixtures/subdir/index.html'],
        },
      },

      page_complex: {
        options: {
          rootDir: 'test/fixtures',
        },
        files: {
          'tmp/page_complex/': ['test/fixtures/page_complex.html'],
        },
      },

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
  grunt.registerTask('test', ['clean', 'htmlcpr', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

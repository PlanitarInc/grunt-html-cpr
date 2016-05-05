'use strict';

let grunt = require('grunt');
let fs = require('fs');
let dirTree = require('directory-tree');
let walk = require('walkdir');
let path = require('path');

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

exports.htmlcpr = {
  setUp: (done) => {
    // setup here if necessary
    done();
  },

  src_is_dir: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/src_is_dir');
    let expected = [];
    test.deepEqual(actual, expected, 'should be empty');

    test.done();
  },

  copy_unknown_sources: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/copy_unknown_sources');
    let expected = getDirFiles('test/expected/copy_unknown_sources');
    test.deepEqual(actual, expected, 'should copy all unknown files as is');

    test.done();
  },

  enforced_cwd: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/enforced_cwd');
    let expected = getDirFiles('test/expected/enforced_cwd');
    test.deepEqual(actual, expected);

    test.done();
  },

  enforced_root_dir: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/enforced_root_dir');
    let expected = getDirFiles('test/expected/enforced_root_dir');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_no_links: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_no_links');
    let expected = getDirFiles('test/expected/page_no_links');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_simple: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_simple');
    let expected = getDirFiles('test/expected/page_simple');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_remote_links: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_remote_links');
    let expected = getDirFiles('test/expected/page_remote_links');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_with_css_url: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_with_css_url');
    let expected = getDirFiles('test/expected/page_with_css_url');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_norec_urls: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_norec_urls');
    let expected = getDirFiles('test/expected/page_norec_urls');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_filter_fn: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_filter_fn');
    let expected = getDirFiles('test/expected/page_filter_fn');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_subdir: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_subdir');
    let expected = getDirFiles('test/expected/page_subdir');
    test.deepEqual(actual, expected);

    test.done();
  },

  page_complex: (test) => {
    test.expect(1);

    let actual = getDirFiles('tmp/page_complex');
    let expected = getDirFiles('test/expected/page_complex');
    test.deepEqual(actual, expected);

    test.done();
  },

};

let getDirFiles = (dir) => {
  let res = [];
  grunt.file.recurse(dir, (abspath, rootdir, subdir, filename) => {
    // Skip hidden files
    if (filename.charAt(0) === '.') { return; }
    res.push({
      filepath: path.join(subdir || '', filename),
      size: fs.statSync(abspath).size,
    });
  });
  res.sort((a, b) => a.filepath < b.filepath);
  return res;
};

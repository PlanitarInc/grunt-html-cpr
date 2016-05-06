/*
 * grunt-htmlcpr
 * https://github.com/PlanitarInc/grunt-htmlcpr
 *
 * Copyright (c) 2016 PlanitarInc
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var multiline = require('multiline');

var grunt;

module.exports = function(_grunt) {

  grunt = _grunt;

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('htmlcpr',
    multiline.stripIndent(function () {/*
      Copies HTML files and all resources included in that files;
      e.g. css styles and js scripts.
    */}),
    function HtmlCprTask()
  {
    var options = this.options();

    this.files.forEach(function (file) {
      var rootDir = options.rootDir || file.orig.cwd || '';
      var dstDir = file.orig.dest;
      var norecDir = options.norecDir;

      var traverser = new LinkTraverser(rootDir, dstDir, norecDir);
      traverser.blacklistFn = options.blacklistFn || null;

      if (typeof options.schemelessUrlFix === 'string') {
        var scheme = options.schemelessUrlFix;
        if (scheme.charAt(scheme.length - 1) !== ':') {
          scheme += ':';
        }
        traverser.schemelessUrlFix = function (url) {
          return scheme + url;
        };
      } else if (typeof options.schemelessUrlFix === 'function') {
        traverser.schemelessUrlFix = options.schemelessUrlFix;
      }

      grunt.file.mkdir(dstDir);

      file.src.forEach(function (src) {
        if (!grunt.file.exists(src)) {
          grunt.log.warn('Source file "' + src + '" not found.');
        }

        traverser.processPath(src);
      });

    });
  });

};

function LinkTraverser(rootDir, dstDir, norecDir) {
  this.rootDir = rootDir;
  this.dstDir = dstDir;
  this.norecDir = norecDir || '../';
  if (this.norecDir[this.norecDir.length - 1] !== '/') {
    this.norecDir += '/';
  }
  this.blacklistFn = null;
  this.schemelessUrlFix = null;
}

// XXX handle inifinite recursion
LinkTraverser.prototype.processPath = function (src, dst) {
  grunt.verbose.writeln(' .. Processing', chalk.cyan(src));

  if (grunt.file.isDir(src)) {
    grunt.verbose.writeln('Skipping dir', chalk.yellow(src));
    return;
  }

  dst = dst || path.join(this.dstDir, relativePath(this.rootDir, src));

  if (this.isExternalPath(src)) {
    grunt.fail.warn('Cannot copy external path', chalk.yellow(src));
    return;
  }

  if (this.isNorecPath(src)) {
    grunt.verbose.writeln('Copying excluded file as is', chalk.yellow(src));
    copyFile(src, dst);
    return;
  }

  switch (getFileType(src)) {
  case 'html':
    grunt.verbose.writeln('Processig HTML file', chalk.yellow(src));

    var newContent = replaceHtmlUrls(grunt.file.read(src), function (url) {
      return this.processUrl(src, dst, url);
    }.bind(this));
    grunt.file.write(dst, newContent);
    return;

  case 'css':
    grunt.verbose.writeln('Processig CSS file', chalk.yellow(src));
    var newContent = replaceCssUrls(grunt.file.read(src), function (url) {
      return this.processUrl(src, dst, url);
    }.bind(this));
    grunt.file.write(dst, newContent);
    return;

  default:
    grunt.verbose.writeln('Copying unknown file as is', chalk.yellow(src));
    copyFile(src, dst);
    return;
  }
};

LinkTraverser.prototype.processUrl = function (src, dst, url) {
  if (this.blacklistFn && this.blacklistFn(url, relativePath(this.rootDir, src))) {
    grunt.log.writeln('Ignoring user-blacklisted url: ' + chalk.yellow(url) + '...');
    return '';
  }

  if (isSchemeLess(url) && this.schemelessUrlFix) {
    url = this.schemelessUrlFix(url);
  }

  if (isRemoteUrl(url)) {
    grunt.log.writeln('Skipping remote url: ' + chalk.yellow(url) + '...');
    return url;
  }

  if (isDataUri(url)) {
    var uriPrefix = url.substring(0, 12) + '...';
    grunt.log.writeln('Skipping data uri: ' + chalk.yellow(uriPrefix) + '...');
    return url;
  }

  var strippedPath = getUrlPath(url);
  if (!url) {
    grunt.log.writeln('Skipping empty url: ' + chalk.yellow(url) + '...');
    return url;
  }

  var srcFile = getPath(strippedPath, path.dirname(src), this.rootDir);
  var dstFile = getPath(strippedPath, path.dirname(dst), this.dstDir);

  this.processPath(srcFile, dstFile);

  // Return the relative path in the destination dir.
  return relativePath(path.dirname(dst), dstFile);
};

LinkTraverser.prototype.isExternalPath = function (path) {
  return relativePath(this.rootDir, path).substring(0, 3) === '../';
};

LinkTraverser.prototype.isNorecPath = function (path) {
  var pathFromRoot = relativePath(this.rootDir, path);

  return pathFromRoot.substring(0, this.norecDir.length) === this.norecDir;
};

var getFileType = function (filepath) {
  switch (path.extname(filepath)) {
    case '.html':
    case '.htm':
      return 'html';

    case '.css':
      return 'css';
  }
};

var copyFile = function (src, dst) {
  grunt.log.writeln('Copying ' + chalk.cyan(src) + ' -> ' + chalk.cyan(dst) + ' ');
  grunt.file.copy(src, dst);
  grunt.log.ok();
};

var replaceUrlLogWrapper = function (type, replaceUrl) {
  return function (_, prefix, url, suffix) {
    if (!url) {
      grunt.verbose.writeln('empty url stays empty');
      return _;
    }

    var newurl = replaceUrl(url);

    if (newurl === url) {
      grunt.verbose.writeln(type + ' url did not change:', chalk.cyan(url));
      return _;
    }

    grunt.verbose.writeln(type + ' url was replaced:',
      chalk.cyan(url), '->', chalk.cyan(newurl));
    return prefix + newurl + suffix;
  };
};

var replaceHtmlUrls = function (content, replaceUrl) {
  // According to http://www.ecma-international.org/ecma-262/5.1/#sec-15.10.2.6:
  // a word boundary `\b` is defined as `[^a-zA-Z0-9_]`.
  // For better HTML parsing, we define the word boundary as `[^-a-zA-Z0-9_]`,
  // that is `-` is a word character
  return content
    .replace(/(<script[^>]*?[^-a-zA-Z0-9_]src=["'])([^"']+?)(["'][^>]*?>(.|\n)*?<\/script>)/g,
      replaceUrlLogWrapper('script', replaceUrl))
    .replace(/(<link[^>]*?[^-a-zA-Z0-9_]href=["'])([^"']+?)(["'][^>]*?\/?>)/g,
      replaceUrlLogWrapper('link', replaceUrl))
    .replace(/(<img[^>]*?[^-a-zA-Z0-9_]src=["'])([^"']+?)(["'][^>]*?\/?>)/g,
      replaceUrlLogWrapper('image', replaceUrl))
    ;
};

var replaceCssUrls = function (content, replaceUrl) {
  return content
    .replace(/([^-a-zA-Z0-9_]url\([ '"]*)([^)'"]*)([ '"]*\))/g,
      replaceUrlLogWrapper('in-CSS', replaceUrl))
    ;
};

var getPath = function (url, srcDir, rootDir) {
  if (url.charAt(0) === '/') {
    url = path.join(rootDir, url);
  } else {
    url = path.join(srcDir, url);
  }
  return relativePath('.', url);
};

var isRemoteUrl = function (url) {
  return /^([a-z]+:)?\/\//.test(url);
};

var isSchemeLess = function (url) {
  return url.charAt(0) === '/' && url.charAt(1) === '/';
};

var getUrlPath = function (url) {
  return url.replace(/\?.*$/, '').replace(/#.*$/, '');
};

var relativePath = function (from, to) {
  return path.relative(path.resolve(from), path.resolve(to));
};

var isDataUri = function (url) {
  // data-uri scheme
  // data:[<media type>][;charset=<character set>][;base64],<data>
  return /^(data:)([\w\/\+]+);(charset=[\w-]+|base64).*,/gi.test(url);
};

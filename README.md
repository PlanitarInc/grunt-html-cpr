# grunt-htmlcpr

> A grunt task to copy HTML files with all the local assets (images, scripts, style files, etc.) that it needs.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-htmlcpr --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-htmlcpr');
```

## The "htmlcpr" task

### Overview
In your project's Gruntfile, add a section named `htmlcpr` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  htmlcpr: {
    options: {
      // Files withing the directory are copied but the links in these files
      // are not followed..
      norecDir: 'vendor',
    },
    files: [{
      expand: true,
      cwd: 'src',
      src: ['index.html', 'images/**/*.jpg', 'fonts/**', 'misc/**'],
      dest: 'build',
    }],
  },
});
```

### Options

#### options.rootDir
Type: `string`
Default value: `''`

A directory overriding `cwd`.

#### options.noRec
Type: `string`
Default value: `''`

Files in the `noRec` directory will be copied, but the links in these files
won't be followed.

#### options.blacklistFn
Type: `function (url: string, src: string): bool`
Default value: `null`

The function is called for every URL detected by the plugin.
First parameter `url` is the detected URL and the second parameter `src`
is the path of the currently processed file.

If the function returns truthy value the link is replaced with `''`
and the file referenced by the link is not copied to the destination dir.

### options.schemelessUrlFix
Type: `string|function (url: string, src: string): bool`
Default value: `null`

The function is called when a schemeless url is detected
(e.g.  `//cdn.superfast.com/myself.png`). If the value of the option is a
string, that string is considered to be the protocol and is appended to the URL.
If the value is the function, that function is being called and the URL is
replaced with its return value.

### Usage Examples

#### Basic Use Case

Let's say you have a directory with the following structure:

```
├── app
│   ├── index.html
│   ├── css
│   │   ├── ... CSS files ...
│   │   └── 
│   ├── images
│   │   ├── ... images ...
│   │   └── 
│   ├── js
│   │   ├── ... javascript ...
│   │   └── 
│   ├── fonts
│   │   ├── ... fonts ...
│   │   └── 
│   └── vendor
│       ├── ... vendor files ...
│       └── 
└── build
```

You want to copy `index.html` and any local files required by this file (images,
scripts, etc.). You need to copy only the files required by `index.html` and no
more.

`htmlcpr` comes to the rescue!

The following configuration would do exactly what you want:

```js
grunt.initConfig({
  htmlcpr: {
    options: {
      norecDir: 'vendor',
    },
    files: [{
      expand: true,
      cwd: 'app',
      src: ['index.html', 'fonts/**'],
      dest: 'build',
    }],
  },
});
```

If the only files included from `index.html` are `css/main.css`,
`js/main.js` and `vendor/fancy.css`;
in thier turns,`css/main.css` turn includes `images/logo.png`
and `vendor/fancy.css` includes `vendor/fancy-spinner.png`.
Then the contents of `build` directory after an execution of `grun htmlcpr` would be:


```sh
└── build
    ├── index.html
    ├── css
    │   └── main.css          # included by index.html
    ├── images
    │   └── logo.png          # included by main.css
    ├── js
    │   └── main.js           # included by index.html
    ├── fonts
    │   ├── ... all fonts ... # the fonts are explicitly specified
    │   ├── ... from app/ ... # in task object, hence they were
    │   └── ...    dir    ... # copied as is.
    └── vendor
        └── fancy.css
```

NOTE: since `vendor` was set as `norecDir`, any links in the `vendor/fancy.css`
file were not followed and hence `vendor/fancy-spinner.png` was not copied.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 2016-05-06 – v0.1.2 – Support `options.schemelessUrlFix`
- 2016-05-03 – v0.1.1 – Support `options.blacklistFn`
- 2016-05-03 – v0.1.0 – Basic implementation

# PostCSS UUID Obfuscator

|言語|Language|
|---|---|
|[<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵"> 日本語](README.md)|[<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸"> English](README_EN.md)|
<!-- <style>.x--hr{height:1.5em}</style> -->

## Revision: in v1.3.0

- Back to algorism similar to v1.2.8.
- Added an opion `pathIgnore` that is using for exclusion procession by per-filepath basis.
- Update dependencies to latest version.

---

This is a [PostCSS] plugin which works to hash-nization (randomizing) class-name with [UUID].

And also applying to HTML class-attribute, Javascript string and PHP string replacing.

There are range limitation about hash-nization, so variable name will not be replaced.

<div class="x--hr"></div>

I think primary usage is [gulp-postcss] with [gulp] (gulpfile.mjs) pipeline. However it also working in JS-API of the PostCSS.

This plugin is very inspired from [postcss-obfuscator], and thank you so much.

<div class="x--hr"></div>

If you want to apply to PHP files, please refer to ([notice 2](#notice-2-replacing-php-string)).

[PostCSS]: https://github.com/postcss/postcss
[UUID]: https://github.com/uuidjs/uuid
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[gulp]: https://gulpjs.com/
[postcss-obfuscator]: https://github.com/n4j1Br4ch1D/postcss-obfuscator
[@noble/hashes]: https://github.com/paulmillr/noble-hashes

<div class="x--hr"></div>


## Indexes

- [PostCSS UUID Obfuscator](#postcss-uuid-obfuscator)
  - [Revision: in v1.3.0](#revision-in-v130)
  - [Indexes](#indexes)
  - [Where are differences](#where-are-differences)
    - [Generating algorism](#generating-algorism)
    - [Replacing characters, less and over](#replacing-characters-less-and-over)
  - [Installation](#installation)
  - [How to use with gulp](#how-to-use-with-gulp)
    - [package.json](#packagejson)
    - [Install npm package](#install-npm-package)
    - [Load packages](#load-packages)
    - [Variables](#variables)
    - [Task: main](#task-main)
      - [Important 1: target property](#important-1-target-property)
    - [Export functions to npm.scripts](#export-functions-to-npmscripts)
    - [Task: apply](#task-apply)
    - [Task: clean](#task-clean)
  - [How to use wit JS-API](#how-to-use-wit-js-api)
    - [package.json](#packagejson-1)
    - [Install npm package](#install-npm-package-1)
    - [Load packages](#load-packages-1)
    - [Variables](#variables-1)
    - [Task: main](#task-main-1)
      - [Important 1: target property](#important-1-target-property-1)
      - [Important 2: single entrypoint](#important-2-single-entrypoint)
  - [API](#api)
    - [options.enable](#optionsenable)
    - [options.length](#optionslength)
    - [options.retryCount](#optionsretrycount)
    - [options.classPrefix](#optionsclassprefix)
    - [options.classSuffix](#optionsclasssuffix)
    - [options.classIgnore](#optionsclassignore)
    - [options.fileIgnore](#optionsfileignore)
    - [options.pathIgnore](#optionspathignore)
    - [options.jsonsPath](#optionsjsonspath)
    - [options.targetPath](#optionstargetpath)
    - [options.extensions](#optionsextensions)
    - [options.outputExcludes](#optionsoutputexcludes)
    - [options.scriptType](#optionsscripttype)
    - [options.keepData](#optionskeepdata)
    - [options.applyClassNameWithoutDot](#optionsapplyclassnamewithoutdot)
    - [options.preRun](#optionsprerun)
    - [options.callBack](#optionscallback)
      - [Notice 1: hash-nated className](#notice-1-hash-nated-classname)
      - [Notice 2: replacing PHP string](#notice-2-replacing-php-string)

<div class="x--hr"></div>


## Where are differences

Original package -- "postcss-obfuscator" -- is very excellent, but I faced to some fatal problems.

So I forks this package that named "PostCSS UUID Obfuscator".

<div class="x--hr"></div>


### Generating algorism

"postcss-obfuscator" uses `Math.random()` for generating a new class-name hash-nized.

<div class="x--hr"></div>

This method is not good at random number collisions unfortunately, and I could not find that it took especially measures.

<div class="x--hr"></div>


### Replacing characters, less and over

```css
.hoge{
  color: red;
}
.fuga{
  text-decoration: underline;
}
```

"postcss-obfuscator" replaces all effective characters in a lump, by CSS syntax analyzing, by CSS selectors extracting.

<div class="x--hr"></div>

In the case there are CSS like a above, so it might replace **all effective characters** like belows.

1. Example 1

```html
<hr class="hoge fuga" />
```

<div class="x--hr"></div>

2. Example 2

```javascript
document.body.classList.add("hoge")
```

<div class="x--hr"></div>

3. Example 3

```html
<div>The "hoge" word should not be changed!</div>
```

In the 3rd case, there are no class attributes in documents.
Nothing but it contains a character similar class-name with quote symbols in text-node area.
Replacement is executed, that is in spite of unwanted.

<div class="x--hr"></div>

4. Example 4

```javascript
document.querySelector('.hoge')?.classList.length
```

And above sample (ex. 4) does not work also.

<div class="x--hr"></div>

This syntax -- connected name with prefix `.` (dot character) and class-name -- might not collect by RegExp patterns "postcss-obfuscator" uses, but some functions require this syntax for example querySelector, querySelectorAll, closest, etc.

<div class="x--hr"></div>

This package executes after parsing HTML, Javascript and PHP grammer analyzing.

In the case of HTML file, It target to replace only class attributes.

<div class="x--hr"></div>


## Installation

```
npm install postcss-uuid-obfuscator
```

<div class="x--hr"></div>


## How to use with gulp

I will prepare for workable sample in test/gulp folder.

<div class="x--hr"></div>


### package.json

```json
{
  "scripts": {
    "clean": "gulp clean",
    "build": "gulp",
    "dev": "gulp dev"
  }
}
```

Define scripts property above in a package.json.

<div class="x--hr"></div>


### Install npm package

```
npm install autoprefixer dotenv fs-extra gulp gulp-connect-php gulp-if gulp-postcss gulp-rename gulp-sass postcss-csso postcss-uuid-obfuscator sass tailwindcss@3
```

Install npm packages above.

There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer] and [postcss-csso].

> This sample is still in v3 what will not upgrade to v4 about TailwindCSS because that couldn't become to conform to be a plugins

Please should finish initializing a `npx tailwindcss init`.

[TailwindCSS]: https://tailwindcss.com/
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso

<div class="x--hr"></div>


### Load packages

```javascript
// Stream
import { src, dest, series } from 'gulp'
import fs from 'fs-extra'

// SCSS
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)

// PostCSS
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import csso from 'postcss-csso'

import { cleanObfuscator, obfuscator, applyObfuscated } from 'postcss-uuid-obfuscator'
```

Only ESModule (import declaration) supports.
This might not be work by CommonJS (require function).

Please load these functions -- `cleanObfuscator`, `obfuscator`, `applyObfuscated` -- from "PostCSS UUID Obfuscator" package.

<div class="x--hr"></div>


### Variables

```javascript
// 1. npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// 2. PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'
```

1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.
So pre-define a variable for executing or not.

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition; like a NODE_ENV or etc.
You need not to use in same with above sample.

<div class="x--hr"></div>

2. Save JSON file a result hash-nizaton.
Decide a name of folder that contains JSON file.

<div class="x--hr"></div>


### Task: main

```javascript
// CSS <= SCSS
const task_css = done => {
  cleanObfuscator(jsonsPath)

  src('src/**/!(_)*.scss', {
    allowEmpty: true,
  })
  .pipe(sass())
  .pipe(postcss([
    tailwindcss(),
    autoprefixer(),
    csso(),
    obfuscator({
      enable: !isDev,
      length: 3,
      targetPath: 'dist',
      jsonsPath: jsonsPath,
      applyClassNameWithoutDot: true,
      classIgnore: ['scrollbar-track', 'scrollbar-thumb'],
    })
  ]))
  .pipe(dest('dist'))

  done()
}
```

Before starting a task for PostCSS, initialized by `cleanObfuscator(jsosPath)`.

It is removing a JSON files the previous execution, strictly speaking.

<div class="x--hr"></div>

I will describe later about `obfuscator({})` options.

Important thing is only below in this secion notice.

<div class="x--hr"></div>


#### Important 1: target property

Please designate a name of output folder by gulp in the `targetPath` property.

<div class="x--hr"></div>

In above case, gulp task outputted result files to `dist` folder from `src` folder where stores resource files.

After finished it, this package will try to replace characters on files located in `dist` folder.

<div class="x--hr"></div>


### Export functions to npm.scripts

```javascript
// npm run build
export default series(
  // task_html,
  // task_js,
  task_css,
  task_applyObfuscate,
)

// npm run dev
export const dev = series(
  // task_html,
  // task_js,
  task_css,
)
```

Before describing about `applyObfuscated()` function, I will guide a order that calling tasks.

Please sort to locate the CSS task at rear against HTML and Javascript tasks.

<div class="x--hr"></div>

This package is replacing characters in HTML, Javascript and PHP files by using JSON file that saved hash-nizated CSS selectors created through a CSS parser.

If this order are upside-down, replacer refer to JSON file that created in previous session; so obfuscation is failure.

<div class="x--hr"></div>


### Task: apply

```javascript
const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}
```

After PostCSS execution, call a task that defines `applyObfuscated()`.

At final, please code about HTML, Javascript and PHP characters replacement.

<div class="x--hr"></div>


### Task: clean

```javascript
// npm run clean
export const clean = series(
  task_clean,
)
```

```javascript
const task_clean = done => {
  if(fs.existsSync('dist')){
    fs.rmSync('dist', {recursive: true})
  }

  if(fs.existsSync(jsonsPath)){
    fs.rmSync(jsonsPath, {recursive: true})
  }

  done()
}
```

This package create intermediate files, and also might remain files at previous sessions.

For the convenient, prepare task for cleaning these, I recommended.

<div class="x--hr"></div>


## How to use wit JS-API

I will prepare for workable sample in test/postcss folder.

<div class="x--hr"></div>


### package.json

```json
{
  "scripts": {
    "clean": "node build-clean.mjs",
    "common:html": "node build-html.mjs",
    "common:js": "node build-js.mjs",
    "build:css": "node build-css.mjs -- build",
    "dev:css": "node build-css.mjs -- build",
    "build": "run-s common:* build:*",
    "dev": "run-s common:* dev:*"
  }
}
```

Define scripts property above in a package.json.

<div class="x--hr"></div>

Almost tasks are used by other tasks.

There are only 3 tasks actually; `clean`, `build` and `dev`.

It seems to be same as gulp.

<div class="x--hr"></div>

Please set CSS task to order in the last.

<div class="x--hr"></div>


### Install npm package

```
npm install autoprefixer dotenv fs-extra glob npm-run-all2 path postcss postcss-csso postcss-uuid-obfuscator sass tailwindcss@3
```

Install npm packages above.

There are written in SCSS syntax.

And using with [TailwindCSS], [autoprefixer] and [postcss-csso].

> This sample is still in v3 what will not upgrade to v4 about TailwindCSS because that couldn't become to conform to be a plugins

Please should finish initializing a `npx tailwindcss init`.

<div class="x--hr"></div>


### Load packages

```javascript
// Files
import { glob } from 'glob'
import fs from 'fs-extra'
import path from 'path'

// SCSS
import * as dartSass from 'sass'

// PostCSS
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import csso from 'postcss-csso'

import { cleanObfuscator, obfuscator, applyObfuscated } from 'postcss-uuid-obfuscator'
```

Only ESModule (import declaration) supports.

This might not be work by CommonJS (require function).

<div class="x--hr"></div>

Please load these functions -- `cleanObfuscator`, `obfuscator`, `applyObfuscated` -- from "PostCSS UUID Obfuscator" package.

<div class="x--hr"></div>


### Variables

```javascript
// 1. npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev:css/.test(process.title)

// 2. PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'

// 3. counts task processed files
let taskedFileCount = 0
let taskFiles = 0
```

1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.

So pre-define a variable for executing or not.

<div class="x--hr"></div>

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition; like a NODE_ENV or etc.

You need not to use in same with above sample.

<div class="x--hr"></div>

2. Save JSON file a result hash-nizaton.

Decide a name of folder that contains JSON file.

<div class="x--hr"></div>

3. Let loop PostCSS function by each files.

This variable is counting for condition to proceed to next.

<div class="x--hr"></div>


### Task: main

```javascript
// 3. apply obfuscated data to HTML, JS
const apply = () => {
  taskedFileCount ++

  if(taskedFileCount === taskFiles){
    applyObfuscated()
  }
}


// PostCSS
const task = async () => {
  // 1. initialize
  cleanObfuscator(jsonsPath)

  const files = await glob('src/css/**/!(_)*.scss', {
    ignore: 'node_modules/**',
  })

  taskFiles = files.length

  // 2. PostCSS
  files.forEach(file => {
    const distPath = path.dirname(file).replace(/^src/, 'dist') + path.sep + path.basename(file).replace(/\.scss$/, '.css')

    let body = fs.readFileSync(file, {
      encoding: 'utf-8',
    })

    body = dartSass.compile(file).css.replace(/[\t\r\n\s]+/g, ' ')

    postcss([
      tailwindcss(),
      autoprefixer(),
      csso(),
      obfuscator({
        enable: !isDev,
        length: 3,
        targetPath: 'dist',
        jsonsPath: jsonsPath,
        applyClassNameWithoutDot: true,
        classIgnore: ['scrollbar-track', 'scrollbar-thumb'],
      })
    ])
    .process(body, {from: file, to: distPath})
    .then(res => {
      fs.ensureFileSync(res.opts.to)
      fs.writeFileSync(res.opts.to, res.css)

      apply()
    })
  })
}

task()
```

1. Before starting a task for PostCSS, initialized by `cleanObfuscator(jsosPath)`.

It is removing a JSON files the previous execution, strictly speaking.

<div class="x--hr"></div>

I will describe later about `obfuscator({})` options.

Important thing is only below in this secion notice.

<div class="x--hr"></div>


#### Important 1: target property

Please designate a name of output folder by gulp in the `targetPath` property.

<div class="x--hr"></div>

2. In above case, build-css.mjs task outputted result files to `dist` folder from `src` folder where stores resource files.

After finished it, this package will try to replace characters on files located in `dist` folder.

<div class="x--hr"></div>


#### Important 2: single entrypoint

There are no problems while the package might be disabling by developping mode (`npm run dev`).

But in build mode case (`npm run build`) and then the package will be availabled, so final processing SCSS files will overwrite all.

Please let exist an only one entrypoint SCSS file, like a 'index.scss'.

<div class="x--hr"></div>

3. After PostCSS execution, call a task that defines `applyObfuscated()`.

At final, please code about HTML, Javascript and PHP characters replacement.

<div class="x--hr"></div>


## API

There are no optional variables in `cleanObfuscator()` and `applyObfuscated()`.

It has only in the `obfuscator({})`, that's all.

```javascript
const options = {
  enable,
  length,
  retryCount,
  classPrefix,
  classSuffix,
  classIgnore,
  fileIgnore,
  pathIgnore,
  jsonsPath,
  targetPath,
  extensions,
  outputExcludes,
  scriptType,
  keepData,
  applyClassNameWithoutDot,
  preRun,
  callBack,
}

obfuscator(options)
```


### options.enable

Does execute hash-nization about class names.

Default value: true (boolean)

<div class="x--hr"></div>


### options.length

Character length a hash-nated about class name. ([notice 1](#notice-1-hash-nated-classname))

Default value: 5 (number)

<div class="x--hr"></div>


### options.retryCount

Upper limitation counts for re-generate a hash-nized class name when it occurs random number collisions. ([notice 1](#notice-1-hash-nated-classname))

Default value: 25 (number)

<div class="x--hr"></div>


### options.classPrefix

A prefix word that appends to hash-nized class name. ([notice 1](#notice-1-hash-nated-classname))

Default value: 'x--' (string)

<div class="x--hr"></div>


### options.classSuffix

A suffix word that appends to hash-nized class name. ([notice 1](#notice-1-hash-nated-classname))

Default value: '' (string)

<div class="x--hr"></div>


### options.classIgnore

These class names would not be executing to hash-nization work flow.

Default value: [] (Array &lt;string&gt;)

<div class="x--hr"></div>

This option uses to prevent to involute in obfuscator which class names are reserved by another packagers or plugins.

If you want to designate class names, then please set like `['scrollbar-track', 'scrollbar-thumb']`.

Must not be included a leading `.` (dot) character.

<div class="x--hr"></div>


### options.fileIgnore

These files would not be executing to hash-nization work flow.

`options.outputExcludes` does designate to exclude files in file-extension units. But `options.fileIgnore` does exclude files in file-name units.

Default value: [] (Array &lt;string&gt;)

<div class="x--hr"></div>

This option uses to designate packages or plugins files which ought not to include in obfuscating process into whom remain standalone files. These files would be stored in locals (the case of unuse CDN or import declaration).

If you want to designate files, then please set like `['plugins.min.js']`.

Must be only a file name without file paths.

<div class="x--hr"></div>


### options.pathIgnore

If there is a part of file path which matches string between `option.pathIgnore`, these files would not be executed to hash-nization work flow.

Default value: [] (Array &lt;string&gt;)

<div class="x--hr"></div>

In the case of not executing hash-nization about all files belonging to specify folders -- you want to apply this option, might be good to code like below.

```javascript
import path from 'node:path'
const sep = path.sep

obfuscator({
  pathIgnore: [`parentFolder${sep}targetFolder${sep}`],
})
```

<div class="x--hr"></div>


### options.jsonsPath

There is folder which named by this option's value which contains JSON files that saved a list table to connect between original class name and hash-nized one.

Default value: 'css-obfuscator' (string)

<div class="x--hr"></div>


### options.targetPath

Set to name of **output folder** which contains HTML, CSS, Javascript, etc. files made by output process of task runner.

This package runs after outputting of task runner, character will replace to obfuscated one for each files in this folder.

In bad case: if set a name of **input folder** in this value, this package might destruct characters in original files unfortunately. Don't be forget.

Default value: 'out' (string)

<div class="x--hr"></div>


### options.extensions

It defines extensions of file that will be target by this package. ([notice 2](#notice-2-replacing-php-string))

> I recommend you do NOT change this value, excluding without especially reasons.

Default value: {html: ['.html', '.htm'], javascript: ['.js'], php: ['.php']}

```typescript
interface T {
  html: Array <string>,
  javascript: Array <string>,
  php: Array <string>,
}
```

<div class="x--hr"></div>

In available version of "PostCSS UUID Obfuscator" that ONLY implements [node-html-parser] as HTML parser, [espree] as Javascript parser and [gyros] as PHP parser.

Even if you set a value like a `{html: ['.xml'], javascript: ['.ts', '.jsx']}` (if you want to add target files -- .xml, .ts and .jsx); these are ignored because the package does not deal with some one yet. Best regards, thank you.

[node-html-parser]: https://github.com/taoqf/node-html-parser
[espree]: https://github.com/eslint/espree
[gyros]: https://github.com/loilo/gyros

<div class="x--hr"></div>


### options.outputExcludes

If these file includes designated extensions, this package would not be executing to hash-nization work flow.

`options.fileIgnore` does designate to exclude files in file-name units.

But `options.outputExcludes` does exclude files in file-extension units.

Default value: ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.map', '.webmanifest', '.mp4', '.webm', '.ogg'] (Array &lt;string&gt;)

<div class="x--hr"></div>

Detailed speaking about inside processing, this package scans every files in the fact.

This value is used to refuse from scanning targets.

<div class="x--hr"></div>

If you want to designate file name extensions, set like a `['.js', '.html']`.

Ought to be including a leading `.` (dot) character.

<div class="x--hr"></div>


### options.scriptType

Designate about module type of Javascript.

Default value: 'script' (string)

<div class="x--hr"></div>

Need not to change the value in case of ESModule.

Generally speaking, there is a bit of needlessness to change this value including with using TypeScript. Because this package target a Javascript which runs on browser mainly.

<div class="x--hr"></div>

But, using module type (.mjs file) case, set the value as 'module'.

And, using CommonJS type (.cjs file) case, set the value as 'commonjs'.

Must not mix to use difference module types.

<div class="x--hr"></div>


### options.keepData

After processed this package, you want to remove intermediate JSON files or not.

Default value: true (boolean)

<div class="x--hr"></div>


### options.applyClassNameWithoutDot

In the case of using on Javascript.

Normally process; let replace from original class name (for example `.c-className`) to hash-nized class name because these are leaded with prefix `.` (dot) character.

If you turn on true this value, so execute replacing also class names without `.` (dot) character. (for example `c-className`)

Default value: false (boolean)

<div class="x--hr"></div>

In the default settings, this value is false.

So this package applies ONLY to class name character that leaded by prefix `.` (dot) character.

This style can use convinient in functions about `document.querySelector()`, `document.querySelectorAll()` and `document.closest()`; and it always have a prefix `.` (dot) character, so to be easy to recognize "This is a class name!"

<div class="x--hr"></div>

In the case of turn to true this value, there are available scenes increasing like a `document.getElementsByClassName()`, `document.body.classList.add()`, etc. functions which are without prefix `.` (dot) character too.

<div class="x--hr"></div>

By another word, there are increased risks to over-replace characters you unwanted.

It is easy to be happened with naming simple class name like a `.dark`, `.red`, etc. especially.

Inner RegExp pattern is `(beginning of sentence | white spaces | quotation marks) (class name without dot character) (ending of sentence | white spaces | quotation marks)`.

I think the pattern reducts a obfuscator's greedy replacement by seplarator (white spaces and quotation marks), but do not rely too much that is a overconfidence.

<div class="x--hr"></div>


### options.preRun

This value of function is inserted to run before `obfuscator()`.

Default value: () => Promise.resolve() (Promise)

<div class="x--hr"></div>

If you want to insert a waiting 500 milliseconds, can code like below example.

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```

<div class="x--hr"></div>


### options.callBack

This function will insert to run after `cleanObfuscator()` which executes replaces about HTML, Javascript and PHP files.

Default value: () => {} (function)

<div class="x--hr"></div>

If you want to insert logs about finish message, can code like below example.

```javascript
callBack: () => {console.log('obfuscated!')}
```

<div class="x--hr"></div>


#### Notice 1: hash-nated className

There are not only simple hash-nizations to generate new class names.

1. Generate a seed of randomizer by [UUID] v4 (random value); if there is already generated, so re-generate it.
2. Combine seed value with class name of target as string, hash-nizing into SHA512 method by [@noble/hashes], converting number into binary, adding prefix '111', and then it generate a hash-nated value which a syntax of base32.
3. Truncate that length of character by options.length.
4. When occurring a collision of randomizer, back to the No. 1.
   > However, in the case of re-generation's count that reach to options.retryCount, display warning and go next.
5. Combine with truncated hash-nated value, options.prefix and options.suffix.

<div class="x--hr"></div>

I can not vouch a length of hash-nated value as equal to options.length.

Because it works a function about No. 5.

[hasha]: https://github.com/sindresorhus/hasha

<div class="x--hr"></div>


#### Notice 2: replacing PHP string

You can see PHP samples which output workable results that located in test/gulp and test/postcss folders, if set to "true" about IS_PHP variable in .env file.

<div class="x--hr"></div>

For to be available a hash-nization about PHP files, please set to `true` about `options.applyClassNameWithoutDot`.

Why you should to do that, because PHP parser treats as inline types about all strings who can not recognize any HTML structure (DOM model).

Meanwhile it treats replacing about PHP strings of all inline type by parsing grammar analysis.

1. Example 1

```html
<div class="absolute">This is a "absolute" text.</div>
```

In the case of example 1, replacements to hash-nated strings are execute which words "absolute" in both class name and text node.

<div class="x--hr"></div>

2. Example 2

```php
$absolute = "absolute";
```

In the case of example 2, replacements to hash-nated strings are execute which words "absolute" only right-side strings excludes left-side variable name.

<div class="x--hr"></div>

3. Example 3

```php
echo "<div class='absolute'>" . "abso" . "lute" . "</div>";
```

In the case of example 3, PHP parser can not recognize strings which words "absolute", because word is splitted.

It does not work a hash-nizing.

<div class="x--hr"></div>

4. Example 4

```php
$absolute = "abso" . "lute";
echo "<div class='absolute'>This is {$absolute} absolute text.</div>";
```

In the case of example 4, PHP code is evading to recognize in line 1 so un-replaced.

There is inline type with class attribute that will be replaced in line 2, and also text node too.

But PHP variable which surrounded with curly brackets is not a inline type in line 2, will be replaced.

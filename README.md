# PostCSS UUID Obfuscator

> State in Draft (2024-07-22 15:45 JST)
> 
> **update**
> - changed hash-nization algorism
> 
> **remaining task**
> - write README.md: en.ja
> - finalize

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
This is a [PostCSS] plugin which works to hash-nization (randomizing) class-name with [UUID].
And also applying to HTML class-attribute, Javascript string replacing.

I think primary usage is [gulp-postcss] with [gulp] (gulpfile.mjs) pipeline. But this is also working in JS-API of the PostCSS.
This plugin is very inspired a [postcss-obfuscator], and thank you so much.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
この[PostCSS]プラグインはクラス名を[UUID]などでハッシュ化します。
そしてハッシュ化したクラス名を、HTMLファイルのclass属性やJavascriptの文字列に対して置換処理を適用します。

基本的には[gulp-postcss]によって読み込まれ、[gulp] (gulpfile.mjs) パイプラインでの動作を想定していますがJS-APIでのPostCSSでも動作します。
このプラグイン作成には[postcss-obfuscator]から多くの影響を受けています。

[PostCSS]: https://github.com/postcss/postcss
[UUID]: https://github.com/uuidjs/uuid
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[gulp]: https://gulpjs.com/
[postcss-obfuscator]: https://github.com/n4j1Br4ch1D/postcss-obfuscator


---

## Contents / 目次

- [PostCSS UUID Obfuscator](#postcss-uuid-obfuscator)
  - [Contents / 目次](#contents--目次)
  - [Where are differences / 特徴](#where-are-differences--特徴)
    - [Generating algorism / 生成アルゴリズム](#generating-algorism--生成アルゴリズム)
    - [Replacing characters, less and over / 文字置換の過剰と過小](#replacing-characters-less-and-over--文字置換の過剰と過小)
  - [Installation / インストール](#installation--インストール)
  - [How to use with gulp / gulpでの使い方](#how-to-use-with-gulp--gulpでの使い方)
    - [package.json](#packagejson)
    - [Install npm package](#install-npm-package)
    - [Load packages](#load-packages)
    - [Variables](#variables)
    - [Task: main](#task-main)
      - [Important 1.: targetPath method](#important-1-targetpath-method)
    - [Export functions to npm scripts / npm.scriptsへのエクスポート](#export-functions-to-npm-scripts--npmscriptsへのエクスポート)
    - [Task: apply](#task-apply)
    - [Task: clean](#task-clean)
  - [How to use with JS-API / JS-APIでの使い方](#how-to-use-with-js-api--js-apiでの使い方)
    - [package.json](#packagejson-1)
    - [Install npm package](#install-npm-package-1)
    - [Load packages](#load-packages-1)
    - [Variables](#variables-1)
    - [Task: main](#task-main-1)
      - [Important 1.: targetPath method](#important-1-targetpath-method-1)
      - [Important 2.: Single entrypoint](#important-2-single-entrypoint)
  - [API](#api)
    - [options.enable](#optionsenable)
    - [options.length](#optionslength)
    - [options.retryCount](#optionsretrycount)
    - [options.classPrefix](#optionsclassprefix)
    - [options.classSuffix](#optionsclasssuffix)
    - [options.classIgnore](#optionsclassignore)
    - [options.jsonsPath](#optionsjsonspath)
    - [options.targetPath](#optionstargetpath)
    - [options.extensions](#optionsextensions)
    - [options.outputExcludes](#optionsoutputexcludes)
    - [options.keepData](#optionskeepdata)
    - [options.applyClassNameWithoutDot](#optionsapplyclassnamewithoutdot)
    - [options.preRun](#optionsprerun)
    - [options.callBack](#optionscallback)
      - [Notice 1.: hashed className](#notice-1-hashed-classname)


---

## Where are differences / 特徴

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Original package -- postcss-obfuscator -- is very excellent, but I faced to some fatal probrems. So I made this package that named PostCSS UUID Obfuscator.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
元となったpostcss-obfuscatorはとても素晴らしいパッケージですが、いくつかの重大な問題に直面したためにPostCSS UUID Obfuscatorを作成しました。


### Generating algorism / 生成アルゴリズム

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
postcss-obfuscator uses `Math.random()` for generating a new class-name hash-nized.

This method is not good at random number collisions unfortunally, and I could not find that it took especially measures.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
postcss-obfuscatorでは新しいクラス名を得るために`Math.random()`を使っています。

乱数衝突の観点からこれは好ましいものではありませんし、実際に衝突が発生した場合の特別な処理が行われているとは思えませんでした。


### Replacing characters, less and over / 文字置換の過剰と過小

```css
.hoge{
  color: red;
}
.fuga{
  text-decoration: underline;
}
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
postcss-obfuscator replaces all effective characters in a lump, by CSS syntax analyzing, by CSS selectors extracting.

In the case there are CSS like a above, so it might replace **all effective characters** like belows.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
CSSの文法からクラス名となるセレクタを抽出し、一括して置換処理を行います。

上例のCSSがあったなら、下例のクラス名に一致した文字を**全て**変換するでしょう。

```html
<hr class="hoge fuga" />
```

```javascript
document.body.classList.add("hoge")
```

```html
<div>The "hoge" word should not be changed!</div>
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
In the 3rd case, there are no classes in documents.
Nothing but it contains a character similar class-name with quote symbols in plain text area.
But replacement is executed, that is unwanted.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
3例目。クラス名ではない文字列も、正規表現パターンにマッチしてしまった場合には変換されてしまいますがこの動作は望みません。

```javascript
document.querySelector('.hoge')?.classList.length
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
And above sample does not work also.

This syntax -- connected name with prefix `.` and class-name -- might not collect by RegExp patterns postcss-obfuscator uses, but some functions require this syntax for example querySelector, querySelectorAll, closest, etc..


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
そして上例もまた機能しません。

querySelector, querySelectorAll, closest関数などではクラス名の前にピリオドを使うのに対して、この書式はpostcss-obfuscatorの正規表現パターンから漏れ落ちてしまいます。

このPostCSS UUID Obfuscatorでは、HTMLとJavascriptの文法解析を行ってから処理します。
HTMLではclass属性だけを置換対象とします。


---

## Installation / インストール

```
npm install postcss-uuid-obfuscator
```


---

## How to use with gulp / gulpでの使い方

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
I will prepare for workable sample in test/gulp folder.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
動作サンプルをtest/gulpフォルダに用意してあります。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Define scripts above in a package.json.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
上記のscriptsがpackage.jsonに用意されているものとします。


### Install npm package

```
npm install autoprefixer fs-extra gulp gulp-postcss gulp-sass postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Install npm packages above.

There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer], [postcss-csso].

Please should finish initalizing a `npx tailwindcss init`.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。

[TailwindCSS]: https://tailwindcss.com/
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Only ESModule (import declation) supports.
This might not be work by CommonJS (require function).

Please load these functions -- cleanObfuscator, obfuscator, applyObfuscated -- from PostCSS UUID Obfuscator package.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
ESModule形式のみ。
CommonJS (require関数) による動作は保証しません。

PostCSS UUID ObfuscatorからはcleanObfuscator・obfuscator・applyObfuscatedを読み込んでください。


### Variables

```javascript
// 1. npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// 2. PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.
So pre-define a variable for executing or not.

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition. For example, NODE_ENV, etc..
You need not to use in same with above sample.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。

上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。


<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
2. Save JSON file a result hash-nization.
Decide a name of folder that contains JSON file.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
2. ハッシュ化処理の結果をJSON形式で保存します。
そのためのフォルダ名を変数として定義します。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Before starting a task for PostCSS, initialized by `cleanObfuscator(jsonsPath)`.
It is removing a JSON files the previous execution, strictly speaking.

I will describe later about `obfuscator({})` options.
Important things is only below in this section notice.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは1点。


#### Important 1.: targetPath method

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Please designate the output folder's name by gulp in the `targetPath`.

In above case, gulp task outputted result files to `dist` folder from `src` folder where are resource files.
After finished it, PostCSS UUID Obfuscator will try to replace characters in dist folder's files.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
`targetPath`にgulpの出力先フォルダを指定してください。

上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


### Export functions to npm scripts / npm.scriptsへのエクスポート

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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Before describing about `applyObfuscated()` function, I will guide a order that calling tasks.
Please sort to locate the CSS task at rear against HTML and Javascript task.

This package is replacing characters in HTML, Javascript files by using JSON file that saved hash-nizated CSS selectors created through a CSS parser.
If this orders are upside-down, replacer refer to JSON file that created in previous session; so obfuscation is failure.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
`applyObfuscated()`関数について述べる前に、タスクの呼び出し順を指定します。
CSSの処理は必ずHTMLやJavascriptの処理よりも後に並び替えてください。

クラス名のハッシュ化処理ではCSSで処理して得た結果を利用して、HTMLやJavascriptの文字置換を行います。
この順序が前後すると正常な動作は期待できません。


### Task: apply

```javascript
const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
After PostCSS execution, call a task that defines `applyObfuscated()`.
At final, please code about HTML and Javascript characters replacement.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
This package create intermediate files, and also might remain files at previous sessions.

For the convenient, prepare task for cleaning these, I recommended.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
このパッケージでは中間ファイルが発生するほか、以前の出力結果が不必要なファイルとして取り残されたままになることもあります。

それらを一掃するためのタスクも用意しておくと便利になることでしょう。


---

## How to use with JS-API / JS-APIでの使い方

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
I will prepare for workable sample in test/postcss folder.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
動作サンプルをtest/postcssフォルダに用意してあります。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Define scripts above in a package.json.

Almost tasks are used by other tasks.
There are only 3 tasks actually. clean, build, dev.
It seems to be same as gulp.

Please set CSS task to order in the last.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
上記のscriptsがpackage.jsonに用意されているものとします。

ほとんどがタスクの定義のためのscriptで、実際に使うのはclean・build・devの3つだけですのでgulpとやっていることは大差ありません。

タスクの順番は、必ずCSS処理を最後にしてください。


### Install npm package

```
npm install autoprefixer fs-extra glob npm-run-all2 path postcss postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Install npm packages above.

There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer], [postcss-csso].

Please should finish initalizing a `npx tailwindcss init`.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Only ESModule (import declation) supports.
This might not be work by CommonJS (require function).

Please load these functions -- cleanObfuscator, obfuscator, applyObfuscated -- from PostCSS UUID Obfuscator package.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
ESModule形式のみ。
CommonJS (require関数) による動作は保証しません。

PostCSS UUID ObfuscatorからはcleanObfuscator・obfuscator・applyObfuscatedを読み込んでください。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.
So pre-define a variable for executing or not.

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition. For example, NODE_ENV, etc..
You need not to use in same with above sample.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。

上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。


<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
2. Save JSON file a result hash-nization.
Decide a name of folder that contains JSON file.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
2. ハッシュ化処理の結果をJSON形式で保存します。
そのためのフォルダ名を変数として定義します。


<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
3. Let loop PostCSS function by each files.
This variable is counting for condition to proceed to next.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
3. ファイルごとにPostCSSをループさせています。
処理済みファイルの数をカウントし、次の処理へ進んでいいかの条件分岐に使います。


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

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
1. Before starting a task for PostCSS, initialized by `cleanObfuscator(jsonsPath)`.
It is removing a JSON files the previous execution, strictly speaking.

I will describe later about `obfuscator({})` options.
Important things is only below in this section notice.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
1. PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは2点。


#### Important 1.: targetPath method

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Please designate the output folder's name by build-css.mjs in the `targetPath`.

In above case, build-css.mjs task outputted result files to `dist` folder from `src` folder where are resource files.
After finished it, PostCSS UUID Obfuscator will try to replace characters in dist folder's files.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
`targetPath`にbuild-css.mjsの出力先フォルダを指定してください。

上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


#### Important 2.: Single entrypoint

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
There are no problems while the package might be disabling by developping mode (`npm run dev`).
But in build mode case ('npm run build') and then the package will be availabled, so final processing SCSS file will overwrite all.

Please let exist an only one entrypoint SCSS file, like a 'index.scss'.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
開発モード (`npm run dev`) でPostCSS UUID Obfuscatorを無効化している間は問題ありません。
しかしビルドモード (`npm run build`) でこのパッケージを有効にした場合、最後に処理したSCSSファイルが以前のハッシュ化処理を上書きしてしまいます。

必ず'index.scss'など、エントリポイントとなるファイルは1つだけにしてください。



<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
3. After PostCSS execution, call a task that defines `applyObfuscated()`.
At final, please code about HTML and Javascript characters replacement.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
3. CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


---

## API

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
There are no optional variables in `cleanObfuscator()` and `applyObfuscated()`.
It has only in the `obfuscator({})`.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
cleanObfuscatorとapplyObfuscatedには設定すべきオプション引数は存在しません。
obfuscatorの設定で全ては完結しています。

```javascript
const options = {
  enable,
  length,
  retryCount,
  classPrefix,
  classSuffix,
  classIgnore,
  jsonsPath,
  targetPath,
  extensions,
  outputExcludes,
  multi,
  differMulti,
  formatJson,
  keepData,
  applyClassNameWithoutDot,
  preRun,
  callBack,
}

obfuscator(options)
```


### options.enable

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Does execute hash-nization class-names.

Default value: true (boolean)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
クラス名のハッシュ化処理を行うか否か。

初期値: true (boolean)


### options.length

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Character length a hash-nized class-name. [notice 1](#notice-1-hashed-classname)

Default value: 5 (number)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
ハッシュ化クラス名の文字数。[注釈1](#notice-1-hashed-classname)

初期値: 5 (number)


### options.retryCount

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Upper limitation counts for re-generate a hash-nized class-name when it occurs random number collisions.

Default value: 100 (number)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
乱数衝突が発生した場合の再生成を行う回数上限。[注釈1](#notice-1-hashed-classname)

初期値: 100 (number)


### options.classPrefix

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
A prefix word that appends to hash-nized class-name. [notice 1](#notice-1-hashed-classname)

Default value: '' (string)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
クラス名の接頭語。[注釈1](#notice-1-hashed-classname)

初期値: '' (string)


### options.classSuffix

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
A suffix word that appends to hash-nized class-name. [notice 1](#notice-1-hashed-classname)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
クラス名の接尾語。[注釈1](#notice-1-hashed-classname)

初期値: '' (string)


### options.classIgnore

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
These class-name would not be executing to hash-nization work flow.

Default value: [] (string[])

This option uses to prevent to involute in obfuscator which class-name is reserved by another packages or plugins.
If you want to designate class-names, set like a `['scrollbar-track', 'scrollbar-thumb']`.
Must not be included a leading period character.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
ハッシュ化処理に含めないクラス名。

初期値: [] (string[])

別のプラグインが指定しているなど、特定のクラス名でなければ動作できない場合に使います。
指定するには`['scrollbar-track', 'scrollbar-thumb']`のように記述して、先頭のピリオドを含めないようにしてください。


### options.jsonsPath

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
There is folder so named which contains JSON file that saved a list table to connect between original class-names and hash-nized class-names.

Default value: 'css-obfuscator' (string)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
クラス名とハッシュ化クラス名の対照表を記録したJSONファイルのフォルダ名。

初期値: 'css-obfuscator' (string)


### options.targetPath

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Set to name of **output folder** which contains HTML, CSS, Javascript etc. files by the output of task runner process.
This package runs after task runner's outputting, character replaces to each files in this folder.

Bad case: if set a **input folder** to this option, this package might disrupt original files unfortunally. Don't be forget.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
タスクランナーなどによってHTML・CSS・Javascriptなど各ファイルを出力するフォルダの名前を指定します。
ファイルの出力が終わった後で、このフォルダに格納されるファイルの文字置換を行います。

変換元となるフォルダを指定してしまった場合、最悪の可能性としては元ファイルを破壊してしまうため注意してください。

初期値: 'out' (string)


### options.extensions

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
It defines filename extensions that is target by this package.

Default value: {html: ['.html', '.htm'], javascript: ['.js']}

> I recommend you do NOT change this setting, excluding without especially reasons.

In available version of the PostCSS UUID Obfuscator that ONLY implements [node-html-parser] as HTML parser and [espree] as Javascript parser.
Even if you set a value like `{html: ['.php'], javascript['.ts', '.jsx']}` (even if you wish other files to be enabled as same about PHP, TypeScript, and JSX.); but these are ignored because the parser does not implement yet. Best regards, thank you.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
変換対象のファイル拡張子を定義しています。

初期値: {html: ['.html', '.htm'], javascript: ['.js']}


> 特別な理由がない場合は設定変更しないことを強く推奨します。

現段階ではHTMLパーサの[node-html-parser]と、Javascriptパーサの[espree]のみ実装しています。
JSXやTypeScript、PHPなどを読み込ませようと`html: ['.php']`のように設定したとしても動作しません。

[node-html-parser]: https://github.com/taoqf/node-html-parser
[espree]: https://github.com/eslint/espree


### options.outputExcludes

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
Set filename extensions not to replace characters.

Default value: [] (string[])

Detailed speaking about inside program, this package scans every files in the fact.
This option is used to refuse from scanning targets.

If you want to designate filename extensions, set like a `['.js', '.htm']`.
Ought to be including a leading period character.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
変換対象にしないファイル拡張子を定義します。

初期値: [] (string[])

内部的には全ファイルを走査しているため、その対象から外す処理が行われます。
`['.js', '.html']`のように、ピリオド付きのファイル拡張子を指定してください。


### options.keepData

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
After processed this package, you want to remove intermediate JSON files or not.

Default value: true (boolean)


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
一連の処理が終了したらJSONファイルを削除するか否か。

初期値: true (boolean)


### options.applyClassNameWithoutDot

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
In Javascript case.
In normally process, let replace class-name leaded by prefix `.` characters (for example: `.c-className`) to hash-nized characters (with leading prefix `.`).
If you turn to true this option, and also let replace class-name character without prefix `.` (for example: `c-className`).

Default value: false (boolean)


In the default settings, this options is false. So this package applies ONLY to characters that is equal to class-name leaded by prefix `.`.
This style can use to convinient in functions about `document.querySelector()`, `document.querySelectorAll()`, and `document.closest()`.
And it always have a prefix `.`, so to be easy to recognize 'This is a class-name!'.

In the case of turn to true this option, there are increasing available scenes like a `document.getElementsByClassName()`, `document.body.classList.add()`, etc.. It is a without prefix `.` case.

By another word, there are increased risks to over-replace characters you unwanted.
It is easy to be happened with naming simple class-name like a `.dark`, `.red`, etc. especially.
RegExp pattern is `(beginning of sentence | white space | quotation marks) (class-name without period character) (ending of sentence | white space | quotation marks)`.
I think the pattern reducts a obfuscator's greedy replacement by separator (white spaces and quotation marks), but do not rely too much that is a overconfidence.


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
Javascriptでの文字置換処理において、`.c-className`のような先頭にピリオドが付いたものだけでなく、`c-className`のようなピリオドを伴わない文字列もハッシュ化クラス名に置き換えるか否か。

初期値: false (boolean)


デフォルトではfalseになっているため、ピリオド付きのクラス名にしか適用されません。
`document.querySelector()`・`document.querySelectorAll()`・`document.closest()`関数で使いやすい上に、ピリオドを必ず伴うところからクラス名を置換しようとしていることが明確です。

設定をtrueに変更することで、`document.getElementsByClassName()`や`document.body.classList.add()`などのピリオドを付けずにクラス名を扱う場面でも使えるようになります。

置換規則を「クラス名の前後にクォート記号・空白記号・文頭・文末のいずれかが存在すること」としていますので「何が文字置換されるか」の推測はある程度予見可能ですが意図せず条件に当てはまって過剰置換を行う危険性もあります。
特に「dark」「red」などの単純な命名を行った場合は非常に危険ですのでご注意ください。


### options.preRun

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
This function is inserted to run before obfuscator().

Default value: () => Promise.resolve() (Promise.<Object>)


If you want to insert a waiting 500 milliseconds, can code like below example.

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
obfuscator関数 (PostCSS内部で実行される) が実行される直前に挿入される処理です。

初期値: () => Promise.resolve() (Promise.<Object>)


例えば500ミリ秒のウェイトを挟みたい場合は次のように記述すれば可能です。

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```


### options.callBack

<img width="36" height="36" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">
This function is inserted to run after cleanObfuscator() which executes replaceing about HTML or Javascript files.

Default value: () => {} (function)


If you want to insert logs about finish message, can code like below example.

```javascript
callBack: () => {console.log('obfuscated!')}
```


<img width="36" height="36" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">
cleanObfuscator関数 (HTMLやJavascriptファイルの書き換え) が実行された後に挿入される処理です。

初期値: () => {} (function)


例えば処理完了のメッセージを表示したい場合は次のように記述すれば可能です。

```javascript
callBack: () => {console.log('obfuscated!')}
```


---

#### Notice 1.: hashed className

クラス名は単純なハッシュ化処理だけではありません。

[UUID]v4 (ランダムな値)をシード値として作成。
クラス名とシード値を文字列結合した上で[hasha]のSHA512でハッシュ化したものをbase64形式で出力し、クラス名として使えない文字を置き換えた上で全て小文字に揃える。
ここからoptions.lengthの文字数だけ切り出します。

もし乱数衝突により同じハッシュ化クラス名が生成されてしまった場合はシード値を更新して、options.retryCountの再探索回数の上限に引っかからないまで処理を行います。

> 上限回数を超えてしまった場合は警告文を表示します。

[hasha]: https://github.com/sindresorhus/hasha


数字で始まる文字列はクラス名に使用できないため、先頭に`_` (アンダースコア)を追加します。

そして最後にoptions.prefixとoptions.suffixを前後に付け足すため、options.lengthとハッシュ化クラス名の文字数は**絶対に**一致しません。

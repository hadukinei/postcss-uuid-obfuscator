# PostCSS UUID Obfuscator

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

This is a [PostCSS] plugin which works to hash-nization (randomizing) class-name with [UUID].
And also applying to HTML class-attribute, Javascript and PHP string replacing.
Limiting where are targeted, so this will NOT replace characters like a variable name.

I think primary usage is [gulp-postcss] with [gulp] (gulpfile.mjs) pipeline. But this is also working in JS-API of the PostCSS.
This plugin is very inspired a [postcss-obfuscator], and thank you so much.

Please check about [notice 2](#notice-2-about-php--php処理について) if you output PHP files.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

この[PostCSS]プラグインはクラス名を[UUID]などでハッシュ化します。
そしてハッシュ化したクラス名を、HTMLファイルのclass属性・JavascriptやPHPの文字列などに対して置換処理を適用します。
ハッシュ化する範囲を限定しているため変数名を置換することはありません。

基本的には[gulp-postcss]によって読み込まれ、[gulp] (gulpfile.mjs) パイプラインでの動作を想定していますがJS-APIでのPostCSSでも動作します。
このプラグイン作成には[postcss-obfuscator]から多くの影響を受けています。

PHPでの処理については[注釈2](#notice-2-about-php--php処理について)を参照してください。

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
    - [Install npm package / npmパッケージのインストール](#install-npm-package--npmパッケージのインストール)
    - [Load packages / パッケージの読み込み](#load-packages--パッケージの読み込み)
    - [Variables / 変数](#variables--変数)
    - [Task: main / メインタスク](#task-main--メインタスク)
      - [Important 1.: targetPath property / targetPathプロパティ](#important-1-targetpath-property--targetpathプロパティ)
    - [Export functions to npm scripts / npm.scriptsへのエクスポート](#export-functions-to-npm-scripts--npmscriptsへのエクスポート)
    - [Task: apply / HTML・Javascriptファイルへの適用タスク](#task-apply--htmljavascriptファイルへの適用タスク)
    - [Task: clean / 中間ファイルの削除タスク](#task-clean--中間ファイルの削除タスク)
  - [How to use with JS-API / JS-APIでの使い方](#how-to-use-with-js-api--js-apiでの使い方)
    - [package.json](#packagejson-1)
    - [Install npm package / npmパッケージのインストール](#install-npm-package--npmパッケージのインストール-1)
    - [Load packages / パッケージの読み込み](#load-packages--パッケージの読み込み-1)
    - [Variables / 変数](#variables--変数-1)
    - [Task: main / メインタスク](#task-main--メインタスク-1)
      - [Important 1.: targetPath property / targetPathプロパティ](#important-1-targetpath-property--targetpathプロパティ-1)
      - [Important 2.: Single entrypoint / エントリーポイントとなるファイルは必ず1個](#important-2-single-entrypoint--エントリーポイントとなるファイルは必ず1個)
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
      - [Notice 1.: hash-nated className / ハッシュ化したクラス名](#notice-1-hash-nated-classname--ハッシュ化したクラス名)
      - [Notice 2.: About PHP / PHP処理について](#notice-2-about-php--php処理について)


---

## Where are differences / 特徴

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Original package -- postcss-obfuscator -- is very excellent, but I faced to some fatal probrems. So I made this package that named PostCSS UUID Obfuscator.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

元となったpostcss-obfuscatorはとても素晴らしいパッケージですが、いくつかの重大な問題に直面したためにPostCSS UUID Obfuscatorを作成しました。


### Generating algorism / 生成アルゴリズム

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

postcss-obfuscator uses `Math.random()` for generating a new class-name hash-nized.

This method is not good at random number collisions unfortunally, and I could not find that it took especially measures.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

postcss-obfuscator replaces all effective characters in a lump, by CSS syntax analyzing, by CSS selectors extracting.

In the case there are CSS like a above, so it might replace **all effective characters** like belows.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

In the 3rd case, there are no classes in documents.
Nothing but it contains a character similar class-name with quote symbols in plain text area.
But replacement is executed, that is unwanted.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

3例目。クラス名ではない文字列も、正規表現パターンにマッチしてしまった場合には変換されてしまいますがこの動作は望みません。

```javascript
document.querySelector('.hoge')?.classList.length
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

And above sample does not work also.

This syntax -- connected name with prefix `.` and class-name -- might not collect by RegExp patterns postcss-obfuscator uses, but some functions require this syntax for example querySelector, querySelectorAll, closest, etc..


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

I will prepare for workable sample in test/gulp folder.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Define scripts above in a package.json.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

上記のscriptsがpackage.jsonに用意されているものとします。


### Install npm package / npmパッケージのインストール

```
npm install autoprefixer dotenv fs-extra gulp gulp-connect-php gulp-if gulp-postcss gulp-rename gulp-sass postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Install npm packages above.

There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer], [postcss-csso].

Please should finish initalizing a `npx tailwindcss init`.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。

[TailwindCSS]: https://tailwindcss.com/
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso


### Load packages / パッケージの読み込み

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Only ESModule (import declation) supports.
This might not be work by CommonJS (require function).

Please load these functions -- cleanObfuscator, obfuscator, applyObfuscated -- from PostCSS UUID Obfuscator package.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

ESModule形式のみ。
CommonJS (require関数) による動作は保証しません。

PostCSS UUID ObfuscatorからはcleanObfuscator・obfuscator・applyObfuscatedを読み込んでください。


### Variables / 変数

```javascript
// 1. npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// 2. PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.
So pre-define a variable for executing or not.

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition. For example, NODE_ENV, etc..
You need not to use in same with above sample.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。

上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。


<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

2. Save JSON file a result hash-nization.
Decide a name of folder that contains JSON file.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

2. ハッシュ化処理の結果をJSON形式で保存します。
そのためのフォルダ名を変数として定義します。


### Task: main / メインタスク

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Before starting a task for PostCSS, initialized by `cleanObfuscator(jsonsPath)`.
It is removing a JSON files the previous execution, strictly speaking.

I will describe later about `obfuscator({})` options.
Important things is only below in this section notice.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは1点。


#### Important 1.: targetPath property / targetPathプロパティ

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Please designate the output folder's name by gulp in the `targetPath`.

In above case, gulp task outputted result files to `dist` folder from `src` folder where are resource files.
After finished it, PostCSS UUID Obfuscator will try to replace characters in dist folder's files.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Before describing about `applyObfuscated()` function, I will guide a order that calling tasks.
Please sort to locate the CSS task at rear against HTML and Javascript task.

This package is replacing characters in HTML, Javascript files by using JSON file that saved hash-nizated CSS selectors created through a CSS parser.
If this orders are upside-down, replacer refer to JSON file that created in previous session; so obfuscation is failure.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

`applyObfuscated()`関数について述べる前に、タスクの呼び出し順を指定します。
CSSの処理は必ずHTMLやJavascriptの処理よりも後に並び替えてください。

クラス名のハッシュ化処理ではCSSで処理して得た結果を利用して、HTMLやJavascriptの文字置換を行います。
この順序が前後すると正常な動作は期待できません。


### Task: apply / HTML・Javascriptファイルへの適用タスク

```javascript
const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

After PostCSS execution, call a task that defines `applyObfuscated()`.
At final, please code about HTML and Javascript characters replacement.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


### Task: clean / 中間ファイルの削除タスク

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

This package create intermediate files, and also might remain files at previous sessions.

For the convenient, prepare task for cleaning these, I recommended.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

このパッケージでは中間ファイルが発生するほか、以前の出力結果が不必要なファイルとして取り残されたままになることもあります。

それらを一掃するためのタスクも用意しておくと便利になることでしょう。


---

## How to use with JS-API / JS-APIでの使い方

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

I will prepare for workable sample in test/postcss folder.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Define scripts above in a package.json.

Almost tasks are used by other tasks.
There are only 3 tasks actually. clean, and build, dev.
It seems to be same as gulp.

Please set CSS task to order in the last.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

上記のscriptsがpackage.jsonに用意されているものとします。

ほとんどがタスクの定義のためのscriptで、実際に使うのはclean・build・devの3つだけですのでgulpとやっていることは大差ありません。

タスクの順番は、必ずCSS処理を最後にしてください。


### Install npm package / npmパッケージのインストール

```
npm install autoprefixer dotenv fs-extra glob npm-run-all2 path postcss postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Install npm packages above.

There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer], [postcss-csso].

Please should finish initalizing a `npx tailwindcss init`.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。


### Load packages / パッケージの読み込み

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Only ESModule (import declation) supports.
This might not be work by CommonJS (require function).

Please load these functions -- cleanObfuscator, obfuscator, applyObfuscated -- from PostCSS UUID Obfuscator package.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

ESModule形式のみ。
CommonJS (require関数) による動作は保証しません。

PostCSS UUID ObfuscatorからはcleanObfuscator・obfuscator・applyObfuscatedを読み込んでください。


### Variables / 変数

```javascript
// 1. npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev:css/.test(process.title)

// 2. PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'

// 3. counts task processed files
let taskedFileCount = 0
let taskFiles = 0
```

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

1. In a developing mode will be disturbed by obfuscator which mode run with auto-reload. Hash-nization task requires some seconds.
So pre-define a variable for executing or not.

In the above sample uses `process.title`.

There are no limitation to decide a programmable condition. For example, NODE_ENV, etc..
You need not to use in same with above sample.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。

上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。


<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

2. Save JSON file a result hash-nization.
Decide a name of folder that contains JSON file.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

2. ハッシュ化処理の結果をJSON形式で保存します。
そのためのフォルダ名を変数として定義します。


<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

3. Let loop PostCSS function by each files.
This variable is counting for condition to proceed to next.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

3. ファイルごとにPostCSSをループさせています。
処理済みファイルの数をカウントし、次の処理へ進んでいいかの条件分岐に使います。
<img width="24" height="24" align="right" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">


### Task: main / メインタスク

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

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

1. Before starting a task for PostCSS, initialized by `cleanObfuscator(jsonsPath)`.
It is removing a JSON files the previous execution, strictly speaking.

I will describe later about `obfuscator({})` options.
Important things is only below in this section notice.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

1. PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは2点。


#### Important 1.: targetPath property / targetPathプロパティ

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Please designate the output folder's name by build-css.mjs in the `targetPath`.

In above case, build-css.mjs task outputted result files to `dist` folder from `src` folder where are resource files.
After finished it, PostCSS UUID Obfuscator will try to replace characters in dist folder's files.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

`targetPath`にbuild-css.mjsの出力先フォルダを指定してください。

上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


#### Important 2.: Single entrypoint / エントリーポイントとなるファイルは必ず1個

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

There are no problems while the package might be disabling by developping mode (`npm run dev`).
But in build mode case ('npm run build') and then the package will be availabled, so final processing SCSS file will overwrite all.

Please let exist an only one entrypoint SCSS file, like a 'index.scss'.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

開発モード (`npm run dev`) でPostCSS UUID Obfuscatorを無効化している間は問題ありません。
しかしビルドモード (`npm run build`) でこのパッケージを有効にした場合、最後に処理したSCSSファイルが以前のハッシュ化処理を上書きしてしまいます。

必ず'index.scss'など、エントリポイントとなるファイルは1つだけにしてください。


<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

3. After PostCSS execution, call a task that defines `applyObfuscated()`.
At final, please code about HTML and Javascript characters replacement.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

3. CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


---

## API

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

There are no optional variables in `cleanObfuscator()` and `applyObfuscated()`.
It has only in the `obfuscator({})`.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

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
  keepData,
  applyClassNameWithoutDot,
  preRun,
  callBack,
}

obfuscator(options)
```


### options.enable

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Does execute hash-nization class-names.

Default value: true (boolean)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

クラス名のハッシュ化処理を行うか否か。

初期値: true (boolean)


### options.length

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Character length a hash-nized class-name. [notice 1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

Default value: 5 (number)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

ハッシュ化クラス名の文字数。[注釈1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

初期値: 5 (number)


### options.retryCount

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Upper limitation counts for re-generate a hash-nized class-name when it occurs random number collisions.

Default value: 100 (number)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

乱数衝突が発生した場合の再生成を行う回数上限。[注釈1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

初期値: 100 (number)


### options.classPrefix

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

A prefix word that appends to hash-nized class-name. [notice 1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

Default value: '' (string)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

クラス名の接頭語。[注釈1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

初期値: '' (string)


### options.classSuffix

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

A suffix word that appends to hash-nized class-name. [notice 1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

クラス名の接尾語。[注釈1](#notice-1-hash-nated-classname--ハッシュ化したクラス名)

初期値: '' (string)


### options.classIgnore

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

These class-name would not be executing to hash-nization work flow.

Default value: [] (string[])

This option uses to prevent to involute in obfuscator which class-name is reserved by another packages or plugins.
If you want to designate class-names, set like a `['scrollbar-track', 'scrollbar-thumb']`.
Must not be included a leading period character.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

ハッシュ化処理に含めないクラス名。

初期値: [] (string[])

別のプラグインが指定しているなど、特定のクラス名でなければ動作できない場合に使います。
指定するには`['scrollbar-track', 'scrollbar-thumb']`のように記述して、先頭のピリオドを含めないようにしてください。


### options.jsonsPath

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

There is folder so named which contains JSON file that saved a list table to connect between original class-names and hash-nized class-names.

Default value: 'css-obfuscator' (string)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

クラス名とハッシュ化クラス名の対照表を記録したJSONファイルのフォルダ名。

初期値: 'css-obfuscator' (string)


### options.targetPath

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Set to name of **output folder** which contains HTML, CSS, Javascript etc. files by the output of task runner process.
This package runs after task runner's outputting, character replaces to each files in this folder.

Bad case: if set a **input folder** to this option, this package might disrupt original files unfortunally. Don't be forget.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

タスクランナーなどによってHTML・CSS・Javascriptなど各ファイルを出力するフォルダの名前を指定します。
ファイルの出力が終わった後で、このフォルダに格納されるファイルの文字置換を行います。

変換元となるフォルダを指定してしまった場合、最悪の可能性としては元ファイルを破壊してしまうため注意してください。

初期値: 'out' (string)


### options.extensions

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

It defines filename extensions that is target by this package.

Default value: {html: ['.html', '.htm'], javascript: ['.js'], php: ['.php']} [notice 2](#notice-2-about-php--php処理について)

> I recommend you do NOT change this setting, excluding without especially reasons.

In available version of the PostCSS UUID Obfuscator that ONLY implements [node-html-parser] as HTML parser, [espree] as Javascript parser, and [gyros] as PHP parser.
Even if you set a value like `{javascript['.ts', '.jsx']}` (even if you wish other files to be enabled as same about TypeScript, JSX, etc..); but these are ignored because the parser does not implement yet. Best regards, thank you.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

変換対象のファイル拡張子を定義しています。

初期値: {html: ['.html', '.htm'], javascript: ['.js'], php: ['.php']} [注釈2](#notice-2-about-php--php処理について)


> 特別な理由がない場合は設定変更しないことを強く推奨します。

現段階ではHTMLパーサの[node-html-parser]と、Javascriptパーサの[espree]、そしてPHPパーサの[gyros]のみ実装しています。
JSXやTypeScriptなど対象外の言語を読み込ませるために`javascript: ['.ts']`のような設定へ変更したとしても動作しません。

[node-html-parser]: https://github.com/taoqf/node-html-parser
[espree]: https://github.com/eslint/espree
[gyros]: https://github.com/loilo/gyros


### options.outputExcludes

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

Set filename extensions not to replace characters.

Default value: ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.map', '.webmanifest', '.mp4', '.webm', '.ogg'] (string[])

Detailed speaking about inside program, this package scans every files in the fact.
This option is used to refuse from scanning targets.

If you want to designate filename extensions, set like a `['.js', '.htm']`.
Ought to be including a leading period character.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

変換対象にしないファイル拡張子を定義します。

初期値: ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.map', '.webmanifest', '.mp4', '.webm', '.ogg'] (string[])

内部的には全ファイルを走査しているため、その対象から外す処理が行われます。
`['.js', '.html']`のように、ピリオド付きのファイル拡張子を指定してください。


### options.keepData

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

After processed this package, you want to remove intermediate JSON files or not.

Default value: true (boolean)


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

一連の処理が終了したらJSONファイルを削除するか否か。

初期値: true (boolean)


### options.applyClassNameWithoutDot

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

In Javascript and PHP case.
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


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

Javascript・PHPでの文字置換処理において、`.c-className`のような先頭にピリオドが付いたものだけでなく、`c-className`のようなピリオドを伴わない文字列もハッシュ化クラス名に置き換えるか否か。

初期値: false (boolean)


デフォルトではfalseになっているため、ピリオド付きのクラス名にしか適用されません。
`document.querySelector()`・`document.querySelectorAll()`・`document.closest()`関数で使いやすい上に、ピリオドを必ず伴うところからクラス名を置換しようとしていることが明確です。

設定をtrueに変更することで、`document.getElementsByClassName()`や`document.body.classList.add()`などのピリオドを付けずにクラス名を扱う場面でも使えるようになります。

置換規則を「クラス名の前後にクォート記号・空白記号・文頭・文末のいずれかが存在すること」としていますので「何が文字置換されるか」の推測はある程度予見可能ですが意図せず条件に当てはまって過剰置換を行う危険性もあります。
特に「dark」「red」などの単純な命名を行った場合は非常に危険ですのでご注意ください。


### options.preRun

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

This function is inserted to run before obfuscator().

Default value: () => Promise.resolve() (Promise.<Object>)


If you want to insert a waiting 500 milliseconds, can code like below example.

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

obfuscator関数 (PostCSS内部で実行される) が実行される直前に挿入される処理です。

初期値: () => Promise.resolve() (Promise.<Object>)


例えば500ミリ秒のウェイトを挟みたい場合は次のように記述すれば可能です。

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```


### options.callBack

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

This function is inserted to run after cleanObfuscator() which executes replaceing about HTML or Javascript files.

Default value: () => {} (function)


If you want to insert logs about finish message, can code like below example.

```javascript
callBack: () => {console.log('obfuscated!')}
```


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

cleanObfuscator関数 (HTMLやJavascriptファイルの書き換え) が実行された後に挿入される処理です。

初期値: () => {} (function)


例えば処理完了のメッセージを表示したい場合は次のように記述すれば可能です。

```javascript
callBack: () => {console.log('obfuscated!')}
```


---

#### Notice 1.: hash-nated className / ハッシュ化したクラス名

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

There are not only simple hash-nations to generate new class-name.

+ Generate a seed of randomizer by [UUID] v4 (random value); if there is already generated, so re-generate a it.
+ Connecting between seed value and target class-name, hash-nizing into SHA512 method by [hasha], converting number to binary, adding the prefix '111', and then it generate a hash-nated value which take a syntax of base32.
+ Truncate that character's length by options.length.
+ When occurring a collision of randomizer, back to No. 1.
  > However, in the case of re-generation's count that reach to options.retryCount, display warning and go next.
+ Convined with hash-nated value, options.prefix, and options.suffix.

By the function of No. 5, I can not vouch a length of hash-nated value as equal to option.length.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

新しいクラス名の生成方法は、単純な文字列のハッシュ化処理だけではありません。

+ [UUID] v4 (ランダムな値) をシード値として生成し、既に生成されている場合は生成し直す。
+ 変換したいクラス名とシード値を結合し、[hasha]のSHA512形式でハッシュ化し、2進数に変換し、先頭に'111'を追加して、base32形式で出力する。
+ options.lengthの文字数に従って文字列を切り詰める。
+ 変換済みのクラス名と乱数衝突を起こしていた場合は1番目に戻る
   > ただしoptions.retryCountで指定した再探索回数の上限に到達してしまった場合、警告文を表示して次に進みます。
+ options.prefixとoptions.suffixを変換後の文字列の前後に付け足す。

特に5番目の手順を行っているため、ハッシュ化されたクラス名の文字長はoptions.lenthと必ず一致するとは限りません。

[hasha]: https://github.com/sindresorhus/hasha

---

#### Notice 2.: About PHP / PHP処理について

<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸">

You can see what is acted in the test/gulp and test/postcss, when set in IS_PHP as "true" within the .env file.

You must set applyClassNameWithoutDot as "true", if  want to be apply an hash-ization in PHP files.
This is for what PHP parser cannot recognize about HTML syntax, which process as inline type it.
In another word, characters of string type in PHP are replaced correctly because the parser analyze whose syntax.

```html
<div class="absolute">This is a "absolute" text.</div>
```

In above case, this package will replace about class-name and paragraph-text both.

```php
$absolute = "absolute";
```

In above case, this only works about right-hand side (string type), will ignore about left-hand side (variable).

```php
echo "<div class='absolute'>" . "abso" . "lute" . "</div>";
```

In above case, there is splitted character in two. This package cannot recognize that is a target word.

```php
$absolute = "abso" . "lute";
echo "<div class='absolute'>This is {$absolute} absolute text.</div>";
```

In above case, wrote to evade from this package by word splitting in line 1. And the character held to stay by variable expansion in line 2.
By these workflows, will replace class-name and paragraph-text, but value in variable display as raw text.


<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵">

同梱したtest/gulp・test/postcssでは、.envファイルのIS_PHPを true に設定変更するとPHPでの動作を確認できます。

PHPでのハッシュ化処理を有効にするためには applyClassNameWithoutDot を true にする必要があります。
これはPHPパーサがHTML構造を理解できないため、まとめてinline型として扱うためです。
一方でPHPコードについては文法解析を行いますので、適切な文字列に対して置換処理が行われます。

```html
<div class="absolute">This is a "absolute" text.</div>
```

上例ではクラス名と文中、両方の「absolute」に対して文字置換処理が行われます。

```php
$absolute = "absolute";
```

上例では変数名に対しては置換処理を行わず、文字列型の右辺のみが処理対象となります。

```php
echo "<div class='absolute'>" . "abso" . "lute" . "</div>";
```

上例のように文字を分割してしまうと検知できません。

```php
$absolute = "abso" . "lute";
echo "<div class='absolute'>This is {$absolute} absolute text.</div>";
```

上例の場合、1行目では検知されないように回避しています。
2行目の波括弧による変数展開ではそのまま維持されるため、クラス名と文字列としての absolute は置換される一方で、$absolute はそのまま表示されます。

# PostCSS UUID Obfuscator

> State in Draft (2024-07-21 03:22 JST)
> 
> **update**
> - write README.ja.md
> 
> **remaining task**
> - write README.md
> - finalize

This is a [PostCSS] plugin which works to hashing (randomizing) class-name with [UUID].
And also applying to HTML class-attribute, Javascript string replacing.

I think primary usage is [gulp-postcss] with [gulp] (gulpfile.mjs) pipeline. But this is also working in JS-API of the PostCSS.
This plugin is very inspired a [postcss-obfuscator], and thank you so much.


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

元となったpostcss-obfuscatorはとても素晴らしいパッケージですが、いくつかの重大な問題に直面したためにPostCSS UUID Obfuscatorを作成しました。


### Generating algorism / 生成アルゴリズム

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

3例目。クラス名ではない文字列も、正規表現パターンにマッチしてしまった場合には変換されてしまいますがこの動作は望みません。

```javascript
document.querySelector('.hoge')?.classList.length
```

そして上例もまた機能しません。
querySelector, querySelectorAll, closest関数などではクラス名の前にピリオドを使うのに対して、この書式はpostcss-obfuscatorの正規表現パターンから漏れ落ちてしまいます。

このPostCSS UUID Obfuscatorでは、HTMLとJavascriptの文法解析を行ってから処理します。
HTMLではclass属性だけを置換対象とします。
Javascriptでは文字列を置換しますが、クラス名の前にピリオドが付くものもその対象とするか否かの設定を追加しました。


---

## Installation / インストール

```
npm install postcss-uuid-obfuscator
```


---

## How to use with gulp / gulpでの使い方

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

Define scripts above in a package.json.

上記のscriptsがpackage.jsonに用意されているものとします。


### Install npm package

```
npm install autoprefixer fs-extra gulp gulp-postcss gulp-sass postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

Install npm packages above.
There are written in SCSS syntax.
And using with [TailwindCSS], [autoprefixer], [postcss-csso].

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

1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。
上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。

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

PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは1点。


#### Important 1.: targetPath method

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

`applyObfuscated()`関数の前に、タスクの呼び出し順を指定します。

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

このパッケージでは中間ファイルが発生するほか、以前の出力結果が不必要なファイルとして取り残されたままになることもあります。
それらを一掃するためのタスクも用意しておくと便利になることでしょう。


---

## How to use with JS-API / JS-APIでの使い方

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

上記のscriptsがpackage.jsonに用意されているものとします。
ほとんどがタスクの定義のためのscriptで、実際に使うのはclean・build・devの3つだけですのでgulpとやっていることは大差ありません。

タスクの順番は、必ずCSS処理を最後にしてください。


### Install npm package

```
npm install autoprefixer fs-extra glob npm-run-all2 path postcss postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

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

1. オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。
上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。

2. ハッシュ化処理の結果をJSON形式で保存します。
そのためのフォルダ名を変数として定義します。

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

1. PostCSSの処理を始める前に、`cleanObfuscator(jsonsPath)`で初期化処理を実行します。
具体的には（前回に実行した）ハッシュ化処理の結果をJSONファイルを削除します。

2. `obfuscator({})`でハッシュ化処理を行います。
オプション引数について詳細は後述しますが、ここで重要なのは2点。


#### Important 1.: targetPath method

`targetPath`にgulpの出力先フォルダを指定してください。
上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


#### Important 2.: Single entrypoint

開発モード (`npm run dev`) でPostCSS UUID Obfuscatorを無効化している間は問題ありません。
しかしビルドモード (`npm run build`) でこのパッケージを有効にした場合、最後に処理したSCSSファイルが以前のハッシュ化処理を上書きしてしまいます。

必ずindex.scssなど、エントリポイントとなるファイルは1つだけにしてください。


3. そして最後に`applyObfuscated()`でHTML・Javascriptの文字置換処理を行います。


---

## API

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

クラス名のハッシュ化処理を行うか否か。

初期値: true (boolean)


### options.length

ハッシュ化クラス名の文字数。[注釈1](#notice-1-hashed-classname)

初期値: 5 (number)


### options.retryCount

乱数衝突が発生した場合の再生成を行う回数上限。[注釈1](#notice-1-hashed-classname)

初期値: 100 (number)


### options.classPrefix

クラス名の接頭語。[注釈1](#notice-1-hashed-classname)

初期値: '' (string)


### options.classSuffix

クラス名の接尾語。[注釈1](#notice-1-hashed-classname)

初期値: '' (string)


### options.classIgnore

ハッシュ化処理に含めないクラス名。

初期値: [] (string[])

別のプラグインが指定しているなど、特定のクラス名でなければ動作できない場合に使います。
指定するには`['scrollbar-track', 'scrollbar-thumb']`のように記述して、先頭のピリオドを含めないようにしてください。


### options.jsonsPath

クラス名とハッシュ化クラス名の対照表を記録したJSONファイルのフォルダ名。

初期値: 'css-obfuscator' (string)


### options.targetPath

HTML・CSS・Javascriptを出力したフォルダの名前であり、ハッシュ化処理を適用するフォルダでもあります。
HTML等のファイルを書き換えるため、srcフォルダなどコピーまたは変換元のファイルを格納するフォルダから対象フォルダへと出力するようにしてください。

初期値: 'out' (string)


### options.extensions

変換対象のファイル拡張子を定義しています。

初期値: {html: ['.html', '.htm'], javascript: ['.js']}


> 特別な理由がない場合は設定変更しないことを強く推奨します。

現段階ではHTMLパーサの[node-html-parser]と、Javascriptパーサの[espree]のみ実装しています。
JSXやTypeScript、PHPなどを読み込ませようと`html: ['.php']`のように設定したとしても動作しません。

[node-html-parser]: https://github.com/taoqf/node-html-parser
[espree]: https://github.com/eslint/espree


### options.outputExcludes

変換対象にしないファイル拡張子を定義します。

初期値: [] (string[])

内部的には全ファイルを走査しているため、その対象から外す処理が行われます。
`['.js', '.html']`のように、ピリオド付きのファイル拡張子を指定してください。


### options.keepData

一連の処理が終了したらJSONファイルを削除するか否か。

初期値: true (boolean)


### options.applyClassNameWithoutDot

Javascriptでの文字置換処理において、`.c-className`のような先頭にピリオドが付いたものだけでなく、`c-className`のようなピリオドを伴わない文字列もハッシュ化クラス名に置き換えるか否か。

初期値: false (boolean)


デフォルトではfalseになっているため、ピリオド付きのクラス名にしか適用されません。
`document.querySelector()`で使いやすい上に、ピリオドを必ず伴うところからクラス名を置換しようとしていることが明確です。

設定をtrueに変更することで、`document.getElementsByClassName()`や`document.body.classList.add()`などのピリオドを付けずにクラス名を扱う場面でも使えるようになります。
置換規則を「クラス名の前後にクォート記号・空白記号・文頭・文末のいずれかが存在すること」としていますので「何が文字置換されるか」の推測はある程度予見可能ですが意図せず条件に当てはまって過剰置換を行う危険性もあります。
特に「dark」「red」などの単純な命名を行った場合は非常に危険ですのでご注意ください。


### options.preRun

obfuscator関数 (PostCSS内部で実行される) が実行される直前に挿入される処理です。

初期値: () => Promise.resolve() (Promise.<Object>)


例えば500ミリ秒のウェイトを挟みたい場合は次のように記述すれば可能です。

```javascript
preRun: () => new Promise(resolve => setTimeout(resolve, 500)),
```


### options.callBack

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

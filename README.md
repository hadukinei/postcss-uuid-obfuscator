# PostCSS UUID Obfuscator

## 更新点: v2.0.0

- 依存パッケージのバージョンアップ
- 無視したいファイルを設定するfileIgnoreプロパティの追加
- Node.js@24.0.0以降でエラーになっていたため、ハッシュ化に用いるパッケージを[hasha]から[@noble/hashes]に変更

---

この[PostCSS]プラグインはクラス名を[UUID]などでハッシュ化します。
そしてハッシュ化したクラス名を、HTMLファイルのclass属性・JavascriptやPHPの文字列などに対して置換処理を適用します。
ハッシュ化する範囲を限定しているため変数名を置換することはありません。

基本的には[gulp-postcss]によって読み込まれ、[gulp] (gulpfile.mjs) パイプラインでの動作を想定していますがJS-APIでのPostCSSでも動作します。
このプラグイン作成には[postcss-obfuscator]から多くの影響を受けています。

PHPでの処理については[注釈2](#php処理について)を参照してください。

[PostCSS]: https://github.com/postcss/postcss
[UUID]: https://github.com/uuidjs/uuid
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[gulp]: https://gulpjs.com/
[postcss-obfuscator]: https://github.com/n4j1Br4ch1D/postcss-obfuscator
[@noble/hashes]: https://github.com/paulmillr/noble-hashes


---

## 目次

- [PostCSS UUID Obfuscator](#postcss-uuid-obfuscator)
  - [更新点: v2.0.0](#更新点-v200)
  - [目次](#目次)
  - [特徴](#特徴)
    - [生成アルゴリズム](#生成アルゴリズム)
    - [文字置換の過剰と過小](#文字置換の過剰と過小)
  - [インストール](#インストール)
  - [gulpでの使い方](#gulpでの使い方)
    - [package.json](#packagejson)
    - [npmパッケージのインストール](#npmパッケージのインストール)
    - [パッケージの読み込み](#パッケージの読み込み)
    - [変数](#変数)
    - [メインタスク](#メインタスク)
      - [targetPathプロパティ](#targetpathプロパティ)
    - [npm.scriptsへのエクスポート](#npmscriptsへのエクスポート)
    - [HTML,Javascriptファイルへの適用タスク](#htmljavascriptファイルへの適用タスク)
    - [中間ファイルの削除タスク](#中間ファイルの削除タスク)
  - [JS-APIでの使い方](#js-apiでの使い方)
    - [package.json](#packagejson-1)
    - [npm パッケージのインストール](#npm-パッケージのインストール)
    - [パッケージ の読み込み](#パッケージ-の読み込み)
    - [変 数](#変-数)
    - [メイン タスク](#メイン-タスク)
      - [targetPath プロパティ](#targetpath-プロパティ)
      - [エントリーポイントとなるファイルは必ず1個](#エントリーポイントとなるファイルは必ず1個)
  - [API](#api)
    - [options.enable](#optionsenable)
    - [options.length](#optionslength)
    - [options.retryCount](#optionsretrycount)
    - [options.classPrefix](#optionsclassprefix)
    - [options.classSuffix](#optionsclasssuffix)
    - [options.classIgnore](#optionsclassignore)
    - [options.fileIgnore](#optionsfileignore)
    - [options.jsonsPath](#optionsjsonspath)
    - [options.targetPath](#optionstargetpath)
    - [options.extensions](#optionsextensions)
    - [options.outputExcludes](#optionsoutputexcludes)
    - [options.scriptType](#optionsscripttype)
    - [options.keepData](#optionskeepdata)
    - [options.applyClassNameWithoutDot](#optionsapplyclassnamewithoutdot)
    - [options.preRun](#optionsprerun)
    - [options.callBack](#optionscallback)
      - [ハッシュ化したクラス名](#ハッシュ化したクラス名)
      - [PHP処理について](#php処理について)


---

## 特徴

元となったpostcss-obfuscatorはとても素晴らしいパッケージですが、いくつかの重大な問題に直面したためにPostCSS UUID Obfuscatorを作成しました。


### 生成アルゴリズム

postcss-obfuscatorでは新しいクラス名を得るために`Math.random()`を使っています。

乱数衝突の観点からこれは好ましいものではありませんし、実際に衝突が発生した場合の特別な処理が行われているとは思えませんでした。


### 文字置換の過剰と過小

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


---

## インストール

```
npm install postcss-uuid-obfuscator
```


---

## gulpでの使い方

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

上記のscriptsがpackage.jsonに用意されているものとします。


### npmパッケージのインストール

```
npm install autoprefixer dotenv fs-extra gulp gulp-connect-php gulp-if gulp-postcss gulp-rename gulp-sass postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。

[TailwindCSS]: https://tailwindcss.com/
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso


### パッケージの読み込み

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


### 変数

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


### メインタスク

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


#### targetPathプロパティ

`targetPath`にgulpの出力先フォルダを指定してください。

上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


### npm.scriptsへのエクスポート

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

`applyObfuscated()`関数について述べる前に、タスクの呼び出し順を指定します。
CSSの処理は必ずHTMLやJavascriptの処理よりも後に並び替えてください。

クラス名のハッシュ化処理ではCSSで処理して得た結果を利用して、HTMLやJavascriptの文字置換を行います。
この順序が前後すると正常な動作は期待できません。


### HTML,Javascriptファイルへの適用タスク

```javascript
const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}
```

CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


### 中間ファイルの削除タスク

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

## JS-APIでの使い方

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


### npm パッケージのインストール

```
npm install autoprefixer dotenv fs-extra glob npm-run-all2 path postcss postcss-csso postcss-uuid-obfuscator sass tailwindcss
```

上記のnpmパッケージがインストールされているものとします。

SCSS構文で、TailwindCSS・autoprefixer・postcss-cssoを併用するサンプルです。

`npx tailwindcss init`の初期化処理は完了しているものとします。


### パッケージ の読み込み

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


### 変 数

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


### メイン タスク

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

`obfuscator({})`のオプション引数について詳細は後述しますが、ここで重要なのは2点。


#### targetPath プロパティ

`targetPath`にbuild-css.mjsの出力先フォルダを指定してください。

上例ではsrcフォルダの中身を変換してdistフォルダに出力し、その後でdistフォルダにあるファイルに対して文字置換を行います。


#### エントリーポイントとなるファイルは必ず1個

開発モード (`npm run dev`) でPostCSS UUID Obfuscatorを無効化している間は問題ありません。
しかしビルドモード (`npm run build`) でこのパッケージを有効にした場合、最後に処理したSCSSファイルが以前のハッシュ化処理を上書きしてしまいます。

必ず'index.scss'など、エントリポイントとなるファイルは1つだけにしてください。


3. CSS処理が完了した後で、`applyObfuscated()`のタスクを呼び出します。
ここでHTML・Javascriptの文字置換処理を行います。


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
  fileIgnore,
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

クラス名のハッシュ化処理を行うか否か。

初期値: true (boolean)


### options.length

ハッシュ化クラス名の文字数。[注釈1](#ハッシュ化したクラス名)

初期値: 5 (number)


### options.retryCount

乱数衝突が発生した場合の再生成を行う回数上限。[注釈1](#ハッシュ化したクラス名)

初期値: 25 (number)


### options.classPrefix

クラス名の接頭語。[注釈1](#ハッシュ化したクラス名)

初期値: 'x--' (string)


### options.classSuffix

クラス名の接尾語。[注釈1](#ハッシュ化したクラス名)

初期値: '' (string)


### options.classIgnore

ハッシュ化処理に含めないクラス名。

初期値: [] (string[])

別のプラグインが指定しているなど、特定のクラス名でなければ動作できない場合に使います。
指定するには`['scrollbar-track', 'scrollbar-thumb']`のように記述して、先頭のピリオドを含めないようにしてください。


### options.fileIgnore

ハッシュ化処理に含めないファイル名。

初期値: [] (string[])

保存したプラグインファイルなど、ハッシュ化処理に巻き込みたくない場合に使います。
指定するには`['plugins.min.js']`のようにファイル名のみで記述して、フォルダ名を含めないようにしてください。


### options.jsonsPath

クラス名とハッシュ化クラス名の対照表を記録したJSONファイルのフォルダ名。

初期値: 'css-obfuscator' (string)


### options.targetPath

タスクランナーなどによってHTML・CSS・Javascriptなど各ファイルを出力するフォルダの名前を指定します。
ファイルの出力が終わった後で、このフォルダに格納されるファイルの文字置換を行います。

変換元となるフォルダを指定してしまった場合、最悪の可能性としては元ファイルを破壊してしまうため注意してください。

初期値: 'out' (string)


### options.extensions

変換対象のファイル拡張子を定義しています。

初期値: {html: ['.html', '.htm'], javascript: ['.js'], php: ['.php']} [注釈2](#php処理について)


> 特別な理由がない場合は設定変更しないことを強く推奨します。

現段階ではHTMLパーサの[node-html-parser]と、Javascriptパーサの[espree]、そしてPHPパーサの[gyros]のみ実装しています。
JSXやTypeScriptなど対象外の言語を読み込ませるために`javascript: ['.ts']`のような設定へ変更したとしても動作しません。

[node-html-parser]: https://github.com/taoqf/node-html-parser
[espree]: https://github.com/eslint/espree
[gyros]: https://github.com/loilo/gyros


### options.outputExcludes

変換対象にしないファイル拡張子を定義します。

初期値: ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.map', '.webmanifest', '.mp4', '.webm', '.ogg'] (string[])

内部的には全ファイルを走査しているため、その対象から外す処理が行われます。
`['.js', '.html']`のように、ピリオド付きのファイル拡張子を指定してください。


### options.scriptType

Javascriptのモジュールタイプを指定する。

初期値: "script" (string)

ESM形式の場合は変更する必要はありません。

しかしモジュール形式（.mjsファイル）の場合は "module" と、CommonJS形式（.cjsファイル）の場合は "commonjs" と指定してください。


### options.keepData

一連の処理が終了したらJSONファイルを削除するか否か。

初期値: true (boolean)


### options.applyClassNameWithoutDot

Javascript・PHPでの文字置換処理において、`.c-className`のような先頭にピリオドが付いたものだけでなく、`c-className`のようなピリオドを伴わない文字列もハッシュ化クラス名に置き換えるか否か。

初期値: false (boolean)


デフォルトではfalseになっているため、ピリオド付きのクラス名にしか適用されません。
`document.querySelector()`・`document.querySelectorAll()`・`document.closest()`関数で使いやすい上に、ピリオドを必ず伴うところからクラス名を置換しようとしていることが明確です。

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

#### ハッシュ化したクラス名

新しいクラス名の生成方法は、単純な文字列のハッシュ化処理だけではありません。

+ [UUID] v4 (ランダムな値) をシード値として生成し、既に生成されている場合は生成し直す。
+ 変換したいクラス名とシード値を結合し、[@noble/hashes]のSHA512形式でハッシュ化し、2進数に変換し、先頭に'111'を追加して、base32形式で出力する。
+ options.lengthの文字数に従って文字列を切り詰める。
+ 変換済みのクラス名と乱数衝突を起こしていた場合は1番目に戻る
   > ただしoptions.retryCountで指定した再探索回数の上限に到達してしまった場合、警告文を表示して次に進みます。
+ options.prefixとoptions.suffixを変換後の文字列の前後に付け足す。

特に5番目の手順を行っているため、ハッシュ化されたクラス名の文字長はoptions.lenthと必ず一致するとは限りません。

[hasha]: https://github.com/sindresorhus/hasha

---

#### PHP処理について

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

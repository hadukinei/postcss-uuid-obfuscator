# PostCSS UUID Obfuscator

This is a [PostCSS] plugin which works to hashing (randomizing) class-name with [UUID].
And also applying to HTML class-attribute, Javascript string replacing.
I think primary usage is [gulp-postcss] with [gulp] (gulpfile.mjs). But this is also working in JS-API of the PostCSS.
This plugin is very inspired a [postcss-obfuscator], and thank you so much.

このPostCSSプラグインはクラス名をUUIDでハッシュ化します。
そしてハッシュ化したクラス名を、HTMLファイルのclass属性やJavascriptの文字列に対して置換処理を適用します。
基本的にはgulp-postcssによって読み込まれ、gulpfile.mjsでの動作を想定しています。
しかしJS-APIでのPostCSSでも動作します。
このプラグイン作成にはpostcss-obfuscatorから多くの影響を受けています。


---

## Install

```
npm install postcss-uuid-obfuscator
```


---

## How to use with gulp

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


### Variables

```javascript
// npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'
```

オートリロードを想定している開発モードではハッシュ化処理に時間がかかって邪魔になります。
処理の可否を決定するための変数を定義しておきます。
上例では `process.title` を使っていますが、環境変数を使うなど方法に制限はありません。

ハッシュ化処理の結果をJSON形式で保存します。
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


### Task: apply

```javascript
const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}
```


### Task: clean

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


### Export functions to npm scripts

```javascript
// npm run build
export default series(
  task_css,
  task_applyObfuscate,
)

// npm run dev
export const dev = series(
  task_css,
)

// npm run clean
export const clean = series(
  task_clean,
)
```



[PostCSS]: https://github.com/postcss/postcss
[UUID]: https://github.com/uuidjs/uuid
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[gulp]: https://gulpjs.com/
[postcss-obfuscator]: https://github.com/n4j1Br4ch1D/postcss-obfuscator
[TailwindCSS]: https://tailwindcss.com/
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso

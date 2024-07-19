/**
 * load package
 */

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

import { obfuscator, applyObfuscated } from '../../index.mjs'


/**
 * variable
 */

// npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev:css/.test(process.title)

// PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'

// counts task processed files
let taskedFileCount = 0
let taskFiles = 0


/**
 * task
 */

// apply obfuscated data to HTML, JS
const apply = () => {
  taskedFileCount ++

  if(taskedFileCount === taskFiles){
    applyObfuscated()
  }
}


// PostCSS
const task = async () => {
  if(fs.existsSync(jsonsPath)){
    fs.rmSync(jsonsPath, {recursive: true})
  }

  const files = await glob('src/css/**/!(_)*.scss', {
    ignore: 'node_modules/**',
  })

  taskFiles = files.length

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
        /**
         * gulpではsrcで捕まえたファイル群をストリームで処理していたので、その初期化処理としてfleshはキャッシュ削除として有効だった
         * postcss単独で行う場合はファイルごとに処理するため、freshをtrueにすると都度初期化してしまうので前回以前の内容を削除してしまうためNG
         */
        fresh: false,
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

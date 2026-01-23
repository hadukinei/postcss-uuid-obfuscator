/**
 * load package
 */

// Files
import fs from 'node:fs'
import path from 'node:path'
import globlike from './globlike.mjs'

// SCSS
import * as dartSass from 'sass'

// PostCSS
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import csso from 'postcss-csso'
import { enumSpreader } from 'postcss-enumerates-in-line'

//import { cleanObfuscator, obfuscator, applyObfuscated } from 'postcss-uuid-obfuscator'
import { cleanObfuscator, obfuscator, applyObfuscated } from '../../index.mjs'


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
  cleanObfuscator(jsonsPath)

  const files = globlike('src/css')

  taskFiles = files.length

  files.forEach(file => {
    if(path.extname(file) !== '.scss') return

    const distPath = path.dirname(file).replace(/^src/, 'dist') + path.sep + path.basename(file).replace(/\.scss$/, '.css')

    let body = fs.readFileSync(file, {
      encoding: 'utf-8',
    })

    body = dartSass.compile(file).css.replace(/[\t\r\n\s]+/g, ' ')

    postcss([
      enumSpreader({
        darkClassName: 'is-dark',
        appendShorthand: [
          ['d', ['display']],

          ['flw', ['flex-wrap']],
          ['fld', ['flex-direction']],
          ['jstc', ['justify-content']],
          ['alni', ['align-items']],

          ['pos', ['position']],
          ['z', ['z-index']],

          ['xion', ['transition']],

          ['ojf', ['object-fit']],
          //['ojp', ['object-position']],

          ['bdf', ['backdrop-filter']],

          ['fi', ['text-indent']],
          ['fa', ['text-align']],
          ['fsp', ['letter-spacing']],
        ],
      }),
      autoprefixer(),
      csso(),
      obfuscator({
        enable: !isDev,
        length: 3,
        targetPath: 'dist',
        jsonsPath: jsonsPath,
        applyClassNameWithoutDot: true,
        pathIgnore: ['dist\\js\\smooth-scrollbar'],
        classIgnore: ['is-light', 'is-dark', 'scrollbar-track', 'scrollbar-thumb'],
      })
    ])
    .process(body, {from: file, to: distPath})
    .then(res => {
      fs.mkdirSync(path.dirname(res.opts.to), {recursive: true})
      fs.writeFileSync(res.opts.to, res.css)

      apply()
    })
  })
}

task()

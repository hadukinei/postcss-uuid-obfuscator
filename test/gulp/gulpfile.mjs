/**
 * load packages
 */

// Stream
import { watch, series, src, dest } from 'gulp'
import plumber from 'gulp-plumber'
import filter from 'gulp-filter'
import gulpIf from 'gulp-if'
import rename from 'gulp-rename'

import fs from 'node:fs'
import through2 from 'through2'

// Config
import { configDotenv } from 'dotenv'

// Image
import sharpOptimizeImages from 'gulp-sharp-optimize-images'

// Pug
import pug from 'gulp-pug'

// SCSS
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)

// PostCSS
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import csso from 'postcss-csso'
import { enumSpreader } from 'postcss-enumerates-in-line'

//import { cleanObfuscator, obfuscator, applyObfuscated } from 'postcss-uuid-obfuscator'
import { cleanObfuscator, obfuscator, applyObfuscated } from '../../index.mjs'

// TypeScript
import ts from 'typescript'

// Live server
import browserSync from 'browser-sync'
import { server } from 'gulp-devserver-php';


/**
 * Variables
 */

// dotenv
const dotenvData = configDotenv({path: '.env'}).parsed ?? {};
const isPHP = /true/.test(dotenvData.IS_PHP ?? 'false')
const PHP_BIN = dotenvData.PHP_BIN ?? ''
const PHP_INI = dotenvData.PHP_INI ?? ''

// npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'


/**
 * Tasks
 */

// Copy
const task_copy = done => {
  src('src/public/**/*', {
    allowEmpty: true,
    dot: true,
    encoding: false,
  })
  .pipe(plumber())
  .pipe(dest('dist'))

  done()
}


// Image
const task_img = done => {
  const png = filter('**/*.png', {restore: true})
  const jpg = filter('**/*.jpg', {restore: true})

  src('src/img/**/*.*', {
    allowEmpty: true,
    encoding: false,
  })
  .pipe(plumber())

  .pipe(png)
  .pipe(sharpOptimizeImages({
    png_to_webp: {
      quality: 80,
      lossless: false,
    },
    png: {},
  }))
  .pipe(png.restore)

  .pipe(jpg)
  .pipe(sharpOptimizeImages({
    jpg_to_webp: {
      quality: 80,
      lossless: false,
    },
    jpg: {
      quality: 80,
      mozjpeg: true,
    },
  }))
  .pipe(jpg.restore)

  .pipe(dest('dist/img'))

  done()
}


// HTML <= Pug
const task_html = done => {
  src('src/**/!(_)*.pug', {
    allowEmpty: true,
  })
  .pipe(plumber())
  .pipe(pug({
    locals: {
      isPHP: isPHP
    },
    filters: {
      "php": text => "<?php\r\n" + text + "\r\n?>"
    },
  }))
  .pipe(gulpIf(isPHP, rename({
    extname: '.php',
  })))
  .pipe(dest('dist'))

  done()
}


// Javascript <= TypeScript
const task_js = done => {
	const tsOption = {
		target: 'es6',
		module: 'commonjs',
		explainFiles: true,
		noImplicitAny: false,
		exclude: ['node_modules'],
	}

	src('src/js/**/*.ts', {
		allowEmpty: true,
	})
	.pipe(plumber())
	.pipe(through2.obj((file, _, cb) => {
		let text = file.contents.toString()
		text = text.replace(/^import\s.*?$/gm, '')
		text = ts.transpile(text, tsOption)
		file.contents = Buffer.from(text)
		cb(null, file)
	}))
	.pipe(rename({
		extname: '.js',
	}))
	.pipe(dest('dist/js'))

	done()
}


// CSS <= SCSS
const task_css = done => {
  cleanObfuscator(jsonsPath)

  src('src/**/!(_)*.scss', {
    allowEmpty: true,
  })
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([
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
  ]))
  .pipe(dest('dist'))

  done()
}

const task_applyObfuscate = done => {
  applyObfuscated()

  done()
}

const task_clean = done => {
  if(fs.existsSync('dist')){
    fs.rmSync('dist', {recursive: true})
  }

  if(fs.existsSync(jsonsPath)){
    fs.rmSync(jsonsPath, {recursive: true})
  }

  done()
}


// Watch
const task_watch = done => {
  watch('./src/public/**/*', series(task_copy, task_reload))
  watch('./src/img/**/*', series(task_img, task_reload))
  watch('./src/**/*.pug', series(task_html, task_reload))
  watch('./src/**/*.scss', series(task_css, task_reload))
  watch('./src/**/*.{js,ts}', series(task_js, task_reload))
  done()
}

const task_server = done => {
  if(isPHP){
    server(
      {
        base: 'dist',
        port: 8880,
        bin: PHP_BIN ? PHP_BIN : 'php',
        ini: PHP_INI ? PHP_INI : false,
      },
      () => {
        browserSync.init({
          proxy: 'localhost:8880'
        })
      },
    )
  }else{
    browserSync.init({
      server: {
        baseDir: './dist',
      },
    })
  }

  done()
}

const task_reload = done => {
  browserSync.reload()
  done()
}


/**
 * Exports
 */

// npm run build
export default series(
  task_copy,
  task_img,
  task_html,
  task_js,
  task_css,
  task_applyObfuscate,
)

// npm run dev
export const dev = series(
  task_copy,
  task_img,
  task_html,
  task_js,
  task_css,
  task_server,
  task_watch,
)

// npm run clean
export const clean = series(
  task_clean,
)

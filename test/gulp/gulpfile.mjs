/**
 * load package
 */

// Stream
import { watch, series, src, dest } from 'gulp'
import plumber from 'gulp-plumber'
import filter from 'gulp-filter'

import { glob } from 'glob'

import fs from 'fs-extra'


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
import tailwindcss from 'tailwindcss'
import csso from 'postcss-csso'

import { cleanObfuscator, obfuscator, applyObfuscated } from 'postcss-uuid-obfuscator'

// TypeScript
import * as esbuild from 'esbuild'

// Live server
import browserSync from 'browser-sync'


/**
 * const variable
 */

// npm run build, or npm run dev
const isDev = /(^|[\s'"`])dev([\s'"`]|$)/.test(process.title)

// PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'


/**
 * Task
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
  .pipe(pug())
  .pipe(dest('dist'))

  done()
}


// Javascript <= TypeScript
const task_js = async done => {
  const files = await glob('src/js/**/!(_)*.{js,ts}', {
    ignore: 'node_modules/**',
  })

  await esbuild.build({
    entryPoints: files,
    outdir: 'dist/js',
    target: ['es6'],
    bundle: true,
    minify: true,
    sourcemap: true,
    logLevel: 'info',
  })

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
    tailwindcss(),
    autoprefixer(),
    csso(),
    /**
     * postcss単独とは異なり、複数のエントリポイントを作成してもよい
     */
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
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  })

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

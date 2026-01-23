/**
 * load package
 */

// Files
import fs from 'node:fs'
import path from 'node:path'
import globlike from './globlike.mjs'

// TypeScript
import ts from 'typescript'


/**
 * task
 */

// Javascript <= TypeScript
const task = async () => {
  const tsOption = {
    target: 'es6',
    module: 'commonjs',
    explainFiles: true,
    noImplicitAny: false,
    exclude: ['node_modules'],
  }

  const files = globlike('src/js')

  files.forEach(file => {
    if(path.extname(file) !== '.ts') return

    fs.promises.readFile(file)
    .then(res => Buffer.from(res).toString("utf8").replace(/^import\s.*?$/gm, ''))
    .then(body => {
      const oUrl = file.replace(/^src\\js\\/, '.\\dist\\js\\').replace(/\.ts$/, '.js').replace(/\\/g, '/')
      const jsText = ts.transpile(body, tsOption)
      return {
        oUrl: oUrl,
        jsText: jsText,
      }
    })
    .then(data => {
      const distPath = path.dirname(file).replace(/^src/, 'dist') + path.sep + path.basename(file).replace(/[.]ts$/, '.js')
      fs.mkdirSync(path.dirname(distPath), {recursive: true})
      fs.writeFileSync(data.oUrl, data.jsText)
    })
    .catch(e => {
      console.log(e)
    })
  })
}

task()

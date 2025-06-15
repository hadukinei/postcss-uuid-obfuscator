/**
 * load package
 */

// Files
import { glob } from 'glob'
import fs from 'fs-extra'

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

  const files = await glob('src/js/**/!(_)*.{js,ts}', {
    ignore: 'node_modules/**',
  })

  files.forEach(file => {
    fs.readFile(file)
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
      fs.ensureFile(data.oUrl, () => {
        fs.writeFile(data.oUrl, data.jsText)
        .catch(e => {
          console.log(e)
        })
      })
      return 0
    })
    .catch(e => {
      console.log(e)
    })
  })
}

task()

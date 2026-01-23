/**
 * load package
 */

// Files
import fs from 'node:fs'
import path from 'node:path'
import globlike from './globlike.mjs'


/**
 * task
 */

// copy from src/public/ to dist/
const task = () => {
  const files = globlike('src/public')

  files.forEach(file => {
    const distPath = 'dist' + path.dirname(file).replace(/^src[\/\\]+public/, '') + path.sep + path.basename(file)
    fs.mkdirSync(path.dirname(distPath), {recursive: true})
    fs.copyFileSync(file, distPath)
  })
}

task()


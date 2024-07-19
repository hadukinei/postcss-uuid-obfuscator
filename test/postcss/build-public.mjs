/**
 * load package
 */

// Files
import { glob } from 'glob'
import fs from 'fs-extra'
import path from 'path'


/**
 * task
 */

// copy from src/public/ to dist/
const task = async () => {
  const files = await glob('src/public/**/*', {
    ignore: 'node_modules/**',
    dot: true,
  })

  files.forEach(file => {
    const distPath = 'dist' + path.dirname(file).replace(/^src[\/\\]+public/, '') + path.sep + path.basename(file).replace(/\.pug$/, '.html')
    fs.copySync(file, distPath)
  })
}

task()

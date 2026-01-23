/**
 * load package
 */

// Files
import fs from 'node:fs'
import path from 'node:path'
import globlike from './globlike.mjs'

// Image
import sharp from 'sharp'


/**
 * task
 */

// copy from src/public/ to dist/
const task = async () => {
  const files = globlike('src/img')

  files.forEach(file => {
    const distPath = path.dirname(file).replace(/^src/, 'dist') + path.sep + path.basename(file)
    fs.mkdirSync(path.dirname(distPath), {recursive: true})

    const ext = path.extname(file)
    let renamedPath = ''

    switch(ext){
      case '.png':
        renamedPath = distPath.replace(/[.].+?$/, '.webp')

        sharp(file)
        .png({
          quality: 80,
        })
        .toFile(distPath)
        .catch(err => {
          console.log(err.message)
        })

        sharp(file)
        .toFormat('webp', {
          quality: 80,
          lossless: false,
        })
        .toFile(renamedPath)
        .catch(err => {
          console.log(err.message)
        })
      break;

      case '.jpeg':
      case '.jpg':
        renamedPath = distPath.replace(/[.].+?$/, '.webp')

        sharp(file)
        .jpeg({
          quality: 80,
        })
        .toFile(distPath)
        .catch(err => {
          console.log(err.message)
        })

        sharp(file)
        .toFormat('webp', {
          quality: 80,
          mozjpeg: true,
        })
        .toFile(renamedPath)
        .catch(err => {
          console.log(err.message)
        })
      break;

      default:
        fs.copyFileSync(file, distPath, {recursive: true})
      break;
    }
  })
}

task()

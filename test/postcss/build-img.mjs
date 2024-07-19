/**
 * load package
 */

// Files
import { glob } from 'glob'
import fs from 'fs-extra'
import path from 'path'

// Image
import sharp from 'sharp'


/**
 * task
 */

// copy from src/public/ to dist/
const task = async () => {
  const files = await glob('src/img/**/*.*', {
    ignore: 'node_modules/**',
  })

  files.forEach(file => {
    const distPath = path.dirname(file).replace(/^src/, 'dist') + path.sep + path.basename(file)
    const ext = path.extname(file)
    let renamedPath = ''

    switch(ext){
      case '.png':
        renamedPath = distPath.replace(/\..+?$/, '.webp')
        fs.ensureFileSync(distPath)
        fs.ensureFileSync(renamedPath)

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
        renamedPath = distPath.replace(/\..+?$/, '.webp')
        fs.ensureFileSync(distPath)
        fs.ensureFileSync(renamedPath)

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
      fs.copySync(file, distPath)
      break;
    }
    //console.log(file, ext)
    //fs.copySync(file, distPath)
  })
}

task()

/**
 * load package
 */

// Stream
import fs from 'node:fs'


/**
 * variable
 */

// PostCSS UUID Obfuscator: JSON.map file path
const jsonsPath = 'css-obfuscator'


/**
 * task
 */
if(fs.existsSync('dist')){
  fs.rmSync('dist', {recursive: true})
}

if(fs.existsSync(jsonsPath)){
  fs.rmSync(jsonsPath, {recursive: true})
}

fs.mkdirSync('dist', {recursive: true})

/**
 * load package
 */

// Files
import { glob } from 'glob'
import fs from 'fs-extra'
import path from 'path'

// Pug
import pug from 'pug'

// Config
import { configDotenv } from 'dotenv'


/**
 * variables
 */

// dotenv
const dotenvData = configDotenv({path: '.env'}).parsed ?? {};
const isPHP = /true/.test(dotenvData.IS_PHP ?? 'false')

// Pug option
const pugOption = {
  // #{locals.base} in pug file
  isPHP: isPHP,

  // filter for PHP syntax
  filters: {
    "php": text => "<?php\r\n" + text + "\r\n?>"
  },
}


/**
 * task
 */

// HTML <= Pug
const task = async () => {
  const files = await glob('src/**/!(_)*.pug', {
    ignore: 'node_modules/**',
  })

  files.forEach(file => {
    let body = fs.readFileSync(file, {
      encoding: 'utf-8',
    })

    body = pug.render(body, pugOption)

    const distPath = path.dirname(file).replace(/^src/, 'dist')
    + path.sep
    + path.basename(file).replace(/\.pug$/, (isPHP ? '.php' : '.html'))

    fs.writeFileSync(distPath, body)
  })
}

task()

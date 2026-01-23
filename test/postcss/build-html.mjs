/**
 * load package
 */

// Files
import fs from 'node:fs'
import path from 'node:path'
import globlike from './globlike.mjs'

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
  // #{locals.isPHP} in pug file
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
  const files = globlike('src')

  files.forEach(file => {
    if(path.extname(file) !== '.pug') return

    let body = fs.readFileSync(file, {
      encoding: 'utf-8',
    })

    body = pug.render(body, pugOption)

    const distPath = path.dirname(file).replace(/^src/, 'dist')
    + path.sep
    + path.basename(file).replace(/\.pug$/, (isPHP ? '.php' : '.html'))

    fs.mkdirSync(path.dirname(distPath), {recursive: true})
    fs.writeFileSync(distPath, body)
  })
}

task()

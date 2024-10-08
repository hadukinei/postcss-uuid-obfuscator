/**
 * load package
 */

// Files
import path from 'path'
import fs from 'fs-extra'

// Syntax - CSS
import { createParser } from 'css-selector-parser'

// Syntax - HTML
import { parse as htmlParser } from 'node-html-parser'

// Syntax - Javascript
import * as espree from 'espree'
import estraverse from 'estraverse'
import escodegen from 'escodegen'

// Syntax - PHP
import { gyros } from 'gyros'

// Syntax - Transfer from AST to minified string
import { minify } from 'terser'

// Hash for Crypt
import { v4 as uuid4 } from 'uuid'
import { hashSync } from 'hasha'

// CLI
import chalk from 'chalk'
import * as readline from 'node:readline'


/**
 * global variable
 */

// Random seed
let seed = uuid4()

// Hashed class list
let tmpClassList = []

// defalut option: gulpObfuscator
/** @see README.md */
const defaultOptions = {
  enable: true,
  length: 5,
  retryCount: 100,
  classPrefix: '',
  classSuffix: '',
  classIgnore: [],
  jsonsPath: 'css-obfuscator',
  targetPath: 'out',
  extensions: {
    html: ['.html', '.htm'],
    javascript: ['.js'],
    php: ['.php'],
  },
  outputExcludes: [
    '.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico',
    '.map', '.webmanifest',
    '.mp4', '.webm', '.ogg'
  ],
  scriptType: 'script',
  keepData: true,
  applyClassNameWithoutDot: false,
  preRun: () => Promise.resolve(),
  callBack: () => {},
}

// merged options, gulpApplyObfuscated inherited from gulpObfuscator
let optionsOverride = {}

// define plugin name for displaying in console.log
const pluginName = 'PostCSS UUID Obfuscator'

const lockFilePath = '.obfuscator.lock'


/**
 * PostCSS UUID Obfuscator
 * This product works on gulp-postcss with gulpfile.mjs
 */
export const cleanObfuscator = jsonsPath => {
  if(fs.existsSync(jsonsPath)){
    fs.rmSync(jsonsPath, {recursive: true})
    process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(jsonsPath)}\r\n`)
  }

  if(fs.existsSync(lockFilePath)){
    fs.rmSync(lockFilePath, {recursive: true})
    process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(lockFilePath)}\r\n`)
  }
}

export const obfuscator = (options = {}) => {
  const {
    enable,
    length,
    retryCount,
    classPrefix,
    classSuffix,
    classIgnore,
    jsonsPath,
    targetPath,
    extensions,
    outputExcludes,
    scriptType,
    keepData,
    applyClassNameWithoutDot,
    preRun,
    callBack,
  } = {...defaultOptions, ...options}
  optionsOverride = {...defaultOptions, ...options}

  let data = {}
  let jsonData = {}
  let singleFileData = {}
  let processedFiles = new Set()
  optionsOverride.cssFilesNo = 0
  optionsOverride.cssNo = 0
  optionsOverride.classesNo = 0
  optionsOverride.isComplete = false

  const fresh = true
  const multi = false
  const differMulti = false
  const formatJson = false

  return {
    postcssPlugin: pluginName,
    Once: async (root, { result }) => {
      if(fs.existsSync(lockFilePath)){
        fs.rmSync(lockFilePath, {recursive: true})
        process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(lockFilePath)}\r\n`)
      }

      if(!enable){
        process.stdout.write(`${chalk.bold.blue("Obfuscator skip:")} ${chalk.cyan("Skip obfuscation (option.enable is false)")}\r\n`)
        return
      }else if(classPrefix !== '' && /^\d/.test(classPrefix.charAt(0))){
        process.stdout.write(`${chalk.bold.blue("Obfuscator error:")} ${chalk.red("There is a numeric character in the first-letter of classPrefix. className must not start with numeric character.")}\r\n`)
        return
      }else{
        if(processedFiles.size == 0){
          await preRun()
          process.stdout.write(`${chalk.bold.blue("Obfuscator prerun:")} ${chalk.cyan("Finished.")}\r\n`)
        }

        let cssFile = getRelativePath(result.opts.from)
        optionsOverride.cssNo ++
        process.stdout.write(`${chalk.bold.blue("Obfuscator processing:")} ${chalk.cyan(cssFile)}\r\n`)

        singleFileData = {}
        if(multi){
          data = singleFileData
          if(!differMulti){
            data = jsonData
          }
        }else{
          data = jsonData
        }

        root.walkRules(rule => {
          rule.selectors = rule.selectors.map(selector => {
            const classList = getClassNames(selector)
            optionsOverride.classesNo += classList.size
            classList.forEach(className => {
              let oldClassName = '.' + className
              let newClassName
              if(classIgnore.includes(className)){
                newClassName = className
              }else{
                newClassName = getRandomName(className, Math.min(86, length), retryCount)
              }

              if(newClassName === null){
                throw new Error('Panic for className generating.')
              }

              newClassName = `.${classPrefix}${newClassName}${classSuffix}`
              let validCssClassName = '.' + escapeClassName
              let octalValidCssClassName = '.' + octalizeClassName(oldClassName.slice(1))

              if(jsonData.hasOwnProperty(oldClassName)){
                selector = selector.replace(validCssClassName, jsonData[oldClassName])
                selector = selector.replace(octalValidCssClassName, jsonData[oldClassName])
              }else{
                selector = selector.replace(validCssClassName, newClassName)
                selector = selector.replace(octalValidCssClassName, newClassName)
                jsonData[oldClassName] = newClassName
              }
            })
            return selector
          })
        })

        jsonData = {...jsonData, ...singleFileData}
        const fileName = path.basename(root.source.input.file, '.css')
        const newJsonsPath = `${jsonsPath}/${multi? fileName: 'main'}.json`
        writeJsonToFile(data, newJsonsPath, formatJson, fresh, !multi & fresh)

        const waitforCreation = () => {
          optionsOverride.cssFilesNo = getFileCount(targetPath, {css: ['.css']}, [])

          if(optionsOverride.cssNo === optionsOverride.cssFilesNo){
            fs.writeFileSync(lockFilePath, '')
            process.stdout.write(`${chalk.bold.blue("Obfuscator create:")} ${chalk.cyan(lockFilePath)}\r\n`)
          }else{
            setTimeout(() => {
              if(!optionsOverride.isComplete){
                process.stdout.write(`${chalk.bold.blue("Obfuscator wait:")} ${chalk.cyan("CSS processing...")}\r\n`)
                waitforCreation()
              }else{
                if(fs.existsSync(lockFilePath)){
                  fs.rmSync(lockFilePath, {recursive: true})
                  process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(lockFilePath)}\r\n`)
                }
              }
            }, 1000)
          }
        }
        waitforCreation()

        processedFiles.add(jsonsPath)
      }
    }
  }
}


/**
 * Applying obfuscated classname to HTML, JS, ...etc
 */
let waitCount = 0, waitMax = 10
export const applyObfuscated = () => {
  if(!optionsOverride.enable){
    process.stdout.write(`${chalk.bold.blue("Obfuscator quit:")} ${chalk.cyan("Cancel to apply obfuscated data.")}\r\n`)
    return
  }

  const lockFilePath = '.obfuscator.lock'

  const applyMain = () => {
    process.stdout.write(`${chalk.bold.blue("Obfuscator begin:")} ${chalk.cyan("Applying obfuscated data to files.")}\r\n`)

    replaceJsonKeysInFiles(optionsOverride.targetPath, optionsOverride.extensions, optionsOverride.outputExcludes, optionsOverride.jsonsPath, optionsOverride.keepData, optionsOverride.applyClassNameWithoutDot)
    process.stdout.write(`${chalk.bold.blue("Obfuscator done:")} ${chalk.cyan("All files have been updated.")}\r\n`)

    process.stdout.write(`${chalk.bold.blue("Obfuscator result:")} ${chalk.yellow(
      optionsOverride.cssFilesNo + "/" + getFileCount(
        optionsOverride.targetPath,
        {css: ['.css']},
        []
      ) + " CSS| " + getFileCount(
        optionsOverride.targetPath,
        optionsOverride.extensions,
        optionsOverride.outputExcludes
      ) + "/" + getFileCount(
        optionsOverride.targetPath,
        optionsOverride.extensions,
        []
      ) + " Files| "
      + (optionsOverride.classesNo - optionsOverride.classIgnore.length).toString()
      + "/" + optionsOverride.classesNo.toString() + " Classes"
    )}\r\n`)

    optionsOverride.callBack()

    if(fs.existsSync(lockFilePath)){
      fs.rmSync(lockFilePath, {recursive: true})
      process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(lockFilePath)}\r\n`)
    }
    optionsOverride.isComplete = true
  }

  const waitForObfuscation = () => {
    if(waitCount > waitMax){
      process.stdout.write(`${chalk.bold.blue("Obfuscator error:")} ${chalk.red("Timeout; to wait a file creation.")}\r\n`)
    }else if(!fs.existsSync(lockFilePath)){
      setTimeout(() => {
        process.stdout.write(`${chalk.bold.blue("Obfuscator wait:")} ${chalk.cyan("Wait for file creation.")}\r\n`)
        waitForObfuscation()
      }, 1000)
    }else{
      process.stdout.write(`${chalk.bold.blue("Obfuscator succeed:")} ${chalk.cyan("File created.")}\r\n`)
      applyMain()
    }

    waitCount ++;
  }

  waitForObfuscation()
}


/**
 * ==========
 * Utils
 */

const getRandomName = (className, length, retryCount) => {
  const chars = '0123456789abcdefghijklmnopqrstuv'.split('')

  const getRandom = () => {
    const hashed = hashSync(className + "\t" + seed, {
      encoding: 'hex',
      algorithm: 'sha512',
    })
    const randomString = (
      '1' + hashed.split('').map(
        c => ('0000' + parseInt('0x' + c).toString(2)).slice(-4)
      ).join('') + '11'
    )
    .match(/.{5}/g)
    .map(b => chars[parseInt(b, 2)]).join('')
    .substring(0, length)

    return randomString
  }

  let hash = '', count = 0
  do{
    count ++
    hash = getRandom()
    if(tmpClassList.filter(className => className === hash).length > 0){
      hash = ''
      seed = uuid4()
    }else{
      break
    }
  }while(!hash && count < retryCount)

  if(hash === ''){
    process.stdout.write(`${chalk.bold.blue("Obfuscator error:")} ${chalk.red("Cannot found a unique hashed className.")}\r\n`)
    return null
  }

  tmpClassList.push(hash)
  return hash
}


const writeJsonToFile = (data, filePath, format = true, fresh = false, startOver = false) => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'))
  if(startOver){
    if(fs.existsSync(dirPath)){
      fs.rmSync(dirPath, {recursive: true})
      process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(dirPath)}\r\n`)
    }
  }

  if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, {recursive: true})
    process.stdout.write(`${chalk.bold.blue("Obfuscator create:")} ${chalk.cyan(dirPath)}\r\n`)
  }

  if(!fs.existsSync(filePath)){
    fs.writeFileSync(filePath, '{}')
    process.stdout.write(`${chalk.bold.blue("Obfuscator create:")} ${chalk.cyan(filePath)}\r\n`)
  }

  let jsonData = fs.readFileSync(filePath)
  let parsedData = JSON.parse(jsonData)
  const mergedData = fresh? data: {...data, ...parsedData}
  const outputData = format? JSON.stringify(mergedData, null, 2): JSON.stringify(mergedData)

  fs.writeFileSync(filePath, outputData)
  process.stdout.write(`${chalk.bold.blue("Obfuscator write:")} ${chalk.cyan(filePath)}\r\n`)
}


const replaceJsonKeysInFiles = (filesDir, extensions, outputExcludes, jsonDataPath, keepData, applyClassNameWithoutDot) => {
  const jsonData = {}
  fs.readdirSync(jsonDataPath).forEach(file => {
    const filePath = path.join(jsonDataPath, file)
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    Object.assign(jsonData, fileData)
  })

  const replaceJsonKeysInFile = async filePath => {
    const fileExt = path.extname(filePath).toLowerCase()

    if(fs.statSync(filePath).isDirectory()){
      fs.readdirSync(filePath).forEach(subFilePath => {
        replaceJsonKeysInFile(path.join(filePath, subFilePath))
      })
    }else if(outputExcludes.includes(fileExt)){
      process.stdout.write(`${chalk.bold.blue("Obfuscator ignore:")} ${chalk.cyan(filePath)}\r\n`)
    }else if(!outputExcludes.includes(path.basename(filePath)) && extensions.html.includes(fileExt)){
      //replace html
      process.stdout.write(`${chalk.green("\u{2b25}")} ${chalk.bold.blue("Target:")} ${chalk.yellow(filePath)}\r\n`)

      let fileContent = fs.readFileSync(filePath, 'utf-8')
      let parsed = htmlParser(fileContent)
      const nodes = parsed.querySelectorAll('[class]')

      Object.keys(jsonData).forEach(key => {
        readline.moveCursor(process.stdout, -process.stdout.columns, 0)
        readline.clearLine(process.stdout, 0)
        let stdoutStr = `  ${chalk.bold.blue("[" + filePath + "]")} ${chalk.cyan(key)}`
        stdoutStr = stdoutStr.slice(0, process.stdout.columns)
        process.stdout.write(stdoutStr)

        nodes.forEach(node => {
          if(node.classList.contains(key.slice(1))){
            node.classList.remove(key.slice(1))
            node.classList.add(jsonData[key].slice(1))
          }
        })
      })

      process.stdout.write(`\r\n${chalk.green("\u{2714}")} ${chalk.bold.blue("Processed:")} ${chalk.yellow(filePath)}\r\n`)

      const transformed = parsed.toString()
      fs.writeFileSync(filePath, transformed)
    }else if(!outputExcludes.includes(path.basename(filePath)) && extensions.javascript.includes(fileExt)){
      //replace javascript
      process.stdout.write(`${chalk.green("\u{2b25}")} ${chalk.bold.blue("Target:")} ${chalk.yellow(filePath)}\r\n`)

      let fileContent = fs.readFileSync(filePath, 'utf-8')
      const ast = espree.parse(fileContent, {
        ecmaVersion: 'latest',
        sourceType: optionsOverride.scriptType,
      })

      estraverse.replace(ast, {
        enter: twig => {
          if((twig.type === 'Literal') && (typeof twig.value === 'string')){
            let value = twig.value
            let raw = twig.raw
            let isHit = false

            Object.keys(jsonData).forEach(key => {
              readline.moveCursor(process.stdout, -process.stdout.columns, 0)
              readline.clearLine(process.stdout, 0)
              let stdoutStr = `  ${chalk.bold.blue("[" + filePath + "]")} ${chalk.cyan(key)}`
              stdoutStr = stdoutStr.slice(0, process.stdout.columns)
              process.stdout.write(stdoutStr)

              let findRegex = new RegExp(`([\\s"'\\\`]|^)(${escapeRegExp(key)})(?=$|[\\s"'\\\`])`, 'g')
              if(findRegex.test(twig.value)){
                isHit = true
                let escapeRegex = new RegExp(`${escapeRegExp(key)}`, 'g')
                value = value.replace(escapeRegex, jsonData[key])
                raw = raw.replace(escapeRegex, jsonData[key])
              }

              if(applyClassNameWithoutDot){
                findRegex = new RegExp(`([\\s"'\\\`]|^)(${escapeRegExp(key.slice(1))})(?=$|[\\s"'\\\`])`, 'g')
                if(findRegex.test(twig.value)){
                  isHit = true
                  let escapeRegex = new RegExp(`${escapeRegExp(key.slice(1))}`, 'g')
                  value = value.replace(escapeRegex, jsonData[key].slice(1))
                  raw = raw.replace(escapeRegex, jsonData[key].slice(1))
                }
              }
            })

            if(isHit){
              return{
                ...twig,
                value: value,
                raw: raw
              }
            }
          }
        }
      })

      process.stdout.write(`\r\n${chalk.green("\u{2714}")} ${chalk.bold.blue("Processed:")} ${chalk.yellow(filePath)}\r\n`)

      let regenerate = escodegen.generate(ast)
      var minified = await minify(regenerate)
      fs.writeFileSync(filePath, minified.code)
    }else if(!outputExcludes.includes(path.basename(filePath)) && extensions.php.includes(fileExt)){
      //replace php
      process.stdout.write(`${chalk.green("\u{2b25}")} ${chalk.bold.blue("Target:")} ${chalk.yellow(filePath)}\r\n`)

      let fileContent = fs.readFileSync(filePath, 'utf-8')

      let regenerate = gyros(fileContent, {parseMode: 'code'}, () => {});

      Object.keys(jsonData).forEach(key => {
        readline.moveCursor(process.stdout, -process.stdout.columns, 0)
        readline.clearLine(process.stdout, 0)
        let stdoutStr = `  ${chalk.bold.blue("[" + filePath + "]")} ${chalk.cyan(key)}`
        stdoutStr = stdoutStr.slice(0, process.stdout.columns)
        process.stdout.write(stdoutStr)

        regenerate = gyros(regenerate.toString(), {parseMode: 'code'}, (node, {update}) => {
          if(/(string|inline)/.test(node.kind)){
            let escapeRegex = new RegExp(`(^|[\\s"'\\\`])${escapeRegExp(key)}([\\s"'\\\`]|$)`, 'g')
            if(escapeRegex.test(node.raw)){
              update(node.raw.replace(escapeRegex, "$1" + jsonData[key] + "$2"))
            }

            if(applyClassNameWithoutDot){
              escapeRegex = new RegExp(`(^|[\\s"'\\\`])${escapeRegExp(key.slice(1))}([\\s"'\\\`]|$)`, 'g')
              if(escapeRegex.test(node.raw)){
                update(node.raw.replace(escapeRegex, "$1" + jsonData[key].slice(1) + "$2"))
              }
            }
          }
        })
      })

      process.stdout.write(`\r\n${chalk.green("\u{2714}")} ${chalk.bold.blue("Processed:")} ${chalk.yellow(filePath)}\r\n`)

      fs.writeFileSync(filePath, regenerate.toString())
    }

    if(!keepData){
      if(fs.existsSync(jsonDataPath)){
        fs.rmSync(jsonDataPath, {recursive: true})
        process.stdout.write(`${chalk.bold.blue("Obfuscator unlink:")} ${chalk.cyan(jsonDataPath)}\r\n`)
      }
    }
  }

  replaceJsonKeysInFile(filesDir)
}


const copyDirectory = (source, destination, copyHiddenFiles = false) => {
  return new Promise(resolve => {
    if(!fs.existsSync(destination)){
      fs.mkdirSync(destination)
    }

    const files = fs.readdirSync(source)

    for(const file of files){
      if(!copyHiddenFiles && file.startsWith('.')){
        continue
      }
      const sourcePath = path.join(source, file)
      const destPath = path.join(destination, file)

      if(fs.statSync(sourcePath).isDirectory()){
        copyDirectory(sourcePath, destPath)
      }else{
        fs.copyFileSync(sourcePath, destPath)
      }
    }

    resolve()
  })
}


const getFileCount = (directoryPath, extensions, expludePathsOrFiles = []) => {
  let count = 0
  const files = fs.readdirSync(directoryPath)
  files.forEach(file => {
    const filePath = path.join(directoryPath, file)
    const isExcluded = expludePathsOrFiles.some(excludePathOrFile => {
      return (
        excludePathOrFile === file ||
        excludePathOrFile === filePath ||
        excludePathOrFile === path.basename(filePath)
      )
    })

    if(fs.statSync(filePath).isDirectory()){
      count += getFileCount(filePath, extensions, expludePathsOrFiles)
    }else if(extensions.hasOwnProperty('css') && (extensions.css).some(extension => file.endsWith(extension)) && !isExcluded){
      count ++
    }else if(extensions.hasOwnProperty('html') && (extensions.html).some(extension => file.endsWith(extension)) && !isExcluded){
      count ++
    }else if(extensions.hasOwnProperty('javascript') && (extensions.javascript).some(extension => file.endsWith(extension)) && !isExcluded){
      count ++
    }else if(extensions.hasOwnProperty('php') && (extensions.php).some(extension => file.endsWith(extension)) && !isExcluded){
      count ++
    }
  })
  return count
}


const extractClassNames = obj => {
  const classNames = new Set()
  const traverse = node => {
    if(node.type === 'ClassName'){
      classNames.add(node.name)
    }

    for(const key of Object.keys(node)){
      const value = node[key]
      if(typeof value === 'object' && value !== null){
        if(Array.isArray(value)){
          value.forEach(traverse)
        }else{
          traverse(value)
        }
      }
    }
  }

  traverse(obj)
  return classNames
}


const escapeClassName = className => {
  const escapes = {
    '!': '\\!',
    '"': '\\"',
    '#': '\\#',
    '$': '\\$',
    '%': '\\%',
    '&': '\\&',
    '\'': '\\\'',
    '(': '\\(',
    ')': '\\)',
    '*': '\\*',
    '+': '\\+',
    ',': '\\,',
    '.': '\\.',
    '/': '\\/',
    ':': '\\:',
    ';': '\\;',
    '<': '\\<',
    '=': '\\=',
    '>': '\\>',
    '?': '\\?',
    '@': '\\@',
    '[': '\\[',
    '\\': '\\\\',
    ']': '\\]',
    '^': '\\^',
    '`': '\\`',
    '{': '\\{',
    '|': '\\|',
    '}': '\\}',
    '~': '\\~',
    ' ': '\\ ',
  }

  return className.split('').map(char => escapes[char] || char).join('')
}


const octalizeClassName = className => {
  const escaped = className.split('').map(char => {
    if(/[!\"#$%&\'()*+,.\/:;<=>?@\[\\\]^\`{|}~]/.test(char)){
      return `\\${char}`
    }else{
      return char
    }
  }).join('')

  return escaped
}


const getClassNames = selectorStr => {
  const keyframeOrAtRuleRegex = /^(?:@|\d+|from|to)\b/
  if(keyframeOrAtRuleRegex.test(selectorStr)){
    return new Set()
  }

  selectorStr = selectorStr.replace(/(^|\s+)&/g, '')

  const parse = createParser({syntax: 'progressive'})
  const ast = parse(selectorStr)
  return extractClassNames(ast)
}


const getRelativePath = absolutePath => {
  const currentDirectory = process.cwd()
  const relativePath = path.relative(currentDirectory, absolutePath)
  return relativePath
}


const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

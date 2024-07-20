/**
 * load package
 */

// Files
import path from 'path'
import fs from 'fs-extra'

// Syntax
import { createParser } from 'css-selector-parser'
import { parse as htmlParser } from 'node-html-parser'
import * as espree from 'espree'
import estraverse from 'estraverse'
import escodegen from 'escodegen'

import { minify } from 'terser'

// Hash for Crypt
import { v4 as uuid4 } from 'uuid'
import { hashSync } from 'hasha'


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
  },
  outputExcludes: [],
  keepData: true,
  applyClassNameWithoutDot: false,
  preRun: () => Promise.resolve(),
  callBack: () => {},
}

// merged options, gulpApplyObfuscated inherited from gulpObfuscator
let optionsOverride = {}

// define plugin name for displaying in console.log
const pluginName = 'PostCSS UUID Obfuscator'


/**
 * PostCSS UUID Obfuscator
 * This product works on gulp-postcss with gulpfile.mjs
 */
export const cleanObfuscator = jsonsPath => {
  if(fs.existsSync(jsonsPath)){
    fs.rmSync(jsonsPath, {recursive: true})
    logger('info', pluginName, 'Data removed:', jsonsPath)
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

  const lockFilePath = '.obfuscator.lock'
  const fresh = true
  const multi = false
  const differMulti = false
  const formatJson = false

  return {
    postcssPlugin: pluginName,
    Once: async (root, { result }) => {
      if(fs.existsSync(lockFilePath)){
        fs.rmSync(lockFilePath, {recursive: true})
        logger('info', pluginName, 'LockFile removed:', lockFilePath)
      }

      if(!enable){
        logger('info', pluginName, 'Skip:', 'Skipped by setting (enable is false).')
        return
      }else if(classPrefix !== '' && /^\d/.test(classPrefix.charAt(0))){
        logger('warn', pluginName, 'Error:', 'There is a numeric character in the first-letter of classPrefix. className must not start with numeric character.')
        return
      }else{
        if(processedFiles.size == 0){
          await preRun()
          logger('info', pluginName, 'PreRun:', 'PreRun event hook finished.')
        }

        let cssFile = getRelativePath(result.opts.from)
        optionsOverride.cssNo ++
        logger('info', pluginName, 'Processing:', cssFile)

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
            logger('info', pluginName, 'LockFile created:', lockFilePath)
          }else{
            setTimeout(() => {
              if(!optionsOverride.isComplete){
                logger('info', pluginName, 'Wait:', 'CSS processing...')
                waitforCreation()
              }else{
                if(fs.existsSync(lockFilePath)){
                  fs.rmSync(lockFilePath, {recursive: true})
                  logger('info', pluginName, 'LockFile removed:', lockFilePath)
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
export const applyObfuscated = () => {
  if(!optionsOverride.enable){
    logger('info', pluginName, 'Quit:', 'Cancel to apply obfuscated data')
    return
  }

  const lockFilePath = '.obfuscator.lock'

  const applyMain = () => {
    logger('info', pluginName, 'Applying:', 'Files (HTML, JS) are transformed by obfuscated data.')

    replaceJsonKeysInFiles(optionsOverride.targetPath, optionsOverride.extensions, optionsOverride.outputExcludes, optionsOverride.jsonsPath, optionsOverride.keepData, optionsOverride.applyClassNameWithoutDot)
    logger('info', pluginName, 'Replaced:', 'All files have been updated.')

    logger('success', pluginName, 'Processed:', `${optionsOverride.cssFilesNo}/${getFileCount(
      optionsOverride.targetPath,
      {css: ['.css']},
      []
    )} CSS| ${getFileCount(
      optionsOverride.targetPath,
      optionsOverride.extensions,
      optionsOverride.outputExcludes
    )}/${getFileCount(
      optionsOverride.targetPath,
      optionsOverride.extensions,
      []
    )} Files| ${
      optionsOverride.classesNo - optionsOverride.classIgnore.length
    }/${optionsOverride.classesNo} Class`)

    optionsOverride.callBack()

    if(fs.existsSync(lockFilePath)){
      fs.rmSync(lockFilePath, {recursive: true})
      logger('info', pluginName, 'LockFile removed:', lockFilePath)
    }
    optionsOverride.isComplete = true
  }

  const waitForObfuscation = () => {
    if(!fs.existsSync(lockFilePath)){
      setTimeout(() => {
        logger('info', pluginName, 'LockFile:', 'checking...')
        waitForObfuscation()
      }, 1000)
    }else{
      logger('info', pluginName, 'LockFile found:', lockFilePath)
      applyMain()
    }
  }

  waitForObfuscation()
}


/**
 * ==========
 * Utils
 */

const getRandomName = (className, length, retryCount) => {
  const getRandom = () => {
    let randomString = hashSync(className + "\t" + seed, {
      encoding: 'base64',
      algorithm: 'sha512',
    }).substring(0, length).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    randomString = '_' + randomString.toLowerCase()

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
    logger('warn', pluginName, 'Error:', 'Cannot found a unique hashed className.')
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
      logger('info', pluginName, 'Directory removed:', dirPath)
    }
  }

  if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, {recursive: true})
    logger('info', pluginName, 'Directory created:', dirPath)
  }

  if(!fs.existsSync(filePath)){
    fs.writeFileSync(filePath, '{}')
    logger('info', pluginName, 'File created:', filePath)
  }

  let jsonData = fs.readFileSync(filePath)
  let parsedData = JSON.parse(jsonData)
  const mergedData = fresh? data: {...data, ...parsedData}
  const outputData = format? JSON.stringify(mergedData, null, 2): JSON.stringify(mergedData)

  fs.writeFileSync(filePath, outputData)
  logger('info', pluginName, 'Data written to file:', filePath)
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
    }else if(!outputExcludes.includes(path.basename(filePath)) && extensions.html.includes(fileExt)){
      //replace html
      let fileContent = fs.readFileSync(filePath, 'utf-8')
      let parsed = htmlParser(fileContent)
      const nodes = parsed.querySelectorAll('[class]')

      Object.keys(jsonData).forEach(key => {
        nodes.forEach(node => {
          if(node.classList.contains(key.slice(1))){
            node.classList.remove(key.slice(1))
            node.classList.add(jsonData[key].slice(1))
          }
        })
      })

      const transformed = parsed.toString()
      fs.writeFileSync(filePath, transformed)
    }else if(!outputExcludes.includes(path.basename(filePath)) && extensions.javascript.includes(fileExt)){
      //replace javascript
      let fileContent = fs.readFileSync(filePath, 'utf-8')
      const ast = espree.parse(fileContent, {ecmaVersion: 6})

      estraverse.replace(ast, {
        enter: twig => {
          if((twig.type === 'Literal') && (typeof twig.value === 'string')){
            let value = twig.value
            let raw = twig.raw
            let isHit = false

            Object.keys(jsonData).forEach(key => {
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

      let regenerate = escodegen.generate(ast)
      var minified = await minify(regenerate)
      fs.writeFileSync(filePath, minified.code)
    }

    if(!keepData){
      if(fs.existsSync(jsonDataPath)){
        fs.rmSync(jsonDataPath, {recursive: true})
        logger('info', pluginName, 'Data removed:', jsonDataPath)
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


const logger = (type, issuer, task, data) => {
  const mainColor = '\x1b[38;2;99;102;241m%s\x1b[0m'
  switch(type){
    case 'info':
    console.info(mainColor, issuer, '\x1b[36m', task, data, '\x1b[0m')
    break;

    case 'warn':
    console.info(mainColor, issuer, '\x1b[33m', task, data, '\x1b[0m')
    break;

    case 'success':
    console.info(mainColor, issuer, '\x1b[31m', task, data, '\x1b[0m')
    break;

    default:
    console.info("'\x1b[0m'", issuer, '\x1b[32m', task, data, '\x1b[0m')
    break;
  }
}


const getRelativePath = absolutePath => {
  const currentDirectory = process.cwd()
  const relativePath = path.relative(currentDirectory, absolutePath)
  return relativePath
}


const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')


/*
const isFileOrInDirectory = (paths, filePath) => {
  const resolvedFilePath = filePath.replace(/\\/g, '/')

  for(const currentPath of paths){
    const resolvedCurrentPath = currentPath.replace(/\\/g, '/')

    if(resolvedCurrentPath === resolvedFilePath){
      return true
    }

    if(resolvedCurrentPath.endsWith('/') && resolvedFilePath.startsWith(resolvedCurrentPath)){
      const relativeFilePath = resolvedFilePath.substring(resolvedCurrentPath.length)
      if(!relativeFilePath.startsWith('/') && relativeFilePath !== ''){
        return true
      }
    }
  }

  return false
}
*/

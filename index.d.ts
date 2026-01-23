// declare module "postcss-uuid-obfuscator"

/**
 * Cleans folder which made by previous work.
 * @param {string} jsonsPath - Path to JSON file.
 */
export declare function cleanObfuscator(jsonsPath: string): null

interface TargetExtensionsObject extends Object {
  html: string[],
  javascript: string[],
  php: string[],
}

/**
 * Define a variable option used by function `obfuscator`.
 */
interface PostCssUuidObfuscatorOption extends Object {
  /**
   * PostCSS UUID Obfuscator options: enable
   * @param {boolean} enable - Enable to work this plugin.
   * @default true
   */
  enable?: true,

  /**
   * PostCSS UUID Obfuscator options: length
   * @param {number} length - String length about class-name which is obfuscated.
   * @default 5
   */
  length?: 5,

  /**
   * PostCSS UUID Obfuscator options: retryCount
   * @param {number} retryCount - How many time retrying when occurred class-name collisions.
   * @default 60
   */
  retryCount?: 60,

  /**
   * PostCSS UUID Obfuscator options: classPrefix
   * @param {string} classPrefix - Prefix after obfuscation.
   * @default 'x--'
   */
  classPrefix?: 'x--',

  /**
   * PostCSS UUID Obfuscator options: classSuffix
   * @param {string} classSuffix - Suffix after obfuscation.
   * @default ''
   */
  classSuffix?: '',

  /**
   * PostCSS UUID Obfuscator options: classIgnore
   * @param {string[]} classIgnore - Designate ignoring class-name that would not be obfuscated.
   * @default []
   */
  classIgnore?: [],

  /**
   * PostCSS UUID Obfuscator options: fileIgnore
   * @param {string[]} fileIgnore - Designate ignoring files that would not be obfuscated.
   * @default []
   */
  fileIgnore?: [],

  /**
   * PostCSS UUID Obfuscator options: pathIgnore
   * @param {string[]} pathIgnore - Designate ignoring file-pathes that would not be obfuscated.
   * @default []
   */
  pathIgnore?: [],

  /**
   * PostCSS UUID Obfuscator options: jsonsPath
   * @param {string} jsonsPath - Intermediate folder's name which saves JSON files about obfuscation list table.
   * @default 'css-obfuscator'
   */
  jsonsPath?: 'css-obfuscator',

  /**
   * PostCSS UUID Obfuscator options: targetPath
   * @param {string} targetPath - Intermediate folder's name which saves JSON files about obfuscation list table.
   * @default 'out'
   */
  targetPath?: 'out',

  /**
   * PostCSS UUID Obfuscator options: extensions
   * @param {TargetExtensionsObject} extensions - Extensions of target files.
   * @default {html: ['.html', '.htm'], javascript: ['.js'], php: ['.php']}
   */
  extensions?: {
    html: ['.html', '.htm'],
    javascript: ['.js'],
    php: ['.php'],
  },

  /**
   * PostCSS UUID Obfuscator options: outputExcludes
   * @param {string[]} outputExcludes - Ignoring extensions.
   * @default ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.map', '.webmanifest', '.mp4', '.webm', '.ogg']
   */
  outputExcludes?: [
    '.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico',
    '.map', '.webmanifest',
    '.mp4', '.webm', '.ogg'
  ],

  /**
   * PostCSS UUID Obfuscator options: scriptType
   * @param {string} scriptType - Designate about module type of Javascript.
   * @type {string} 'script' is ESModule
   * @type {string} 'commonjs' is CommonJS
   * @default 'script'
   */
  scriptType?: 'script',

  /**
   * PostCSS UUID Obfuscator options: keepData
   * @param {boolean} keepData - After processed this package, you want to remove intermediate JSON files or not.
   * @default true
   */
  keepData?: true,

  /**
   * PostCSS UUID Obfuscator options: applyClassNameWithoutDot
   * @param {boolean} applyClassNameWithoutDot - If you turn on true this value, so execute replacing also class names without `.` (dot) character. (for example `c-className`)
   * @default false
   */
  applyClassNameWithoutDot?: false,

  /**
   * Pre-run function that fired when run before `obfuscator` function.
   * @returns Promise
   */
  preRun?: () => Promise<null>

  /**
   * Callback function that will emit in the ending of `applyObfuscated` function.
   * @param {function (): null}
   */
  callBack?: () => null
}

/**
 * Create a JSON file that contains comparison table between original CSS className and hash-nized one.
 * @param {PostCssUuidObfuscatorOption} options - [Optional] Obfuscation options.
 */
export declare function obfuscator(options?: PostCssUuidObfuscatorOption): import('postcss').Plugin

/**
 * Apply comparison data to HTML, Javascript and other files that designated by option in the `obfuscator` function.
 */
export declare function applyObfuscated(): null

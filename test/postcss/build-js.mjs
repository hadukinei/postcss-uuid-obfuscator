/**
 * load package
 */

// Files
import { glob } from 'glob'

// TypeScript
import * as esbuild from 'esbuild'


/**
 * task
 */

// Javascript <= TypeScript
const task = async () => {
  const files = await glob('src/js/**/!(_)*.{js,ts}', {
    ignore: 'node_modules/**',
  })

  await esbuild.build({
    entryPoints: files,
    outdir: 'dist/js',
    target: ['es6'],
    bundle: true,
    minify: true,
    sourcemap: true,
    logLevel: 'info',
  })
}

task()

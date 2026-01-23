import fs from 'node:fs'
import path from 'node:path'

const globlike = dir => {
  let files = []
  const items = fs.readdirSync(dir)

  for(const item of items) {
    const itemPath= path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if(stat.isDirectory()) {
      files = files.concat(globlike(itemPath))
    } else {
      files.push(itemPath)
    }
  }

  return files
}

export default globlike

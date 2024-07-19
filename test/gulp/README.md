# installing

## npm
npm init -y
npm i -D autoprefixer browser-sync esbuild fs-extra glob gulp gulp-filter gulp-plumber gulp-postcss gulp-pug gulp-sass gulp-sharp-optimize-images postcss-csso sass tailwindcss
npm i -D --include-optional sharp
npm i smooth-scrollbar
npx tailwindcss init

## package.json
- change: scripts

## tailwind.config.js
- change: content

---

# scripts

- dev (port: 3000)
  - `npm run dev`
- localhost
  - `npm run build`
- clean up folder, dist and css-obfuscator
  - `npm run clean`

---

# directories
- src/
  - source files
- dist/
  - destination (localhost basedir)

# installing

## npm
npm init -y
npm i -D autoprefixer esbuild fs-extra glob npm-run-all2 path postcss postcss-csso pug sass sharp tailwindcss
npx tailwindcss init

## package.json
- change: scripts

## tailwind.config.js
- change: content

---

# scripts

- dev (does not launch live-server, obfuscater may not run)
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

const esbuild = require("esbuild");
const autoprefixer = require("autoprefixer");
const tailwindcss = require('tailwindcss')
const stylePlugin = require('esbuild-style-plugin')

esbuild
  .build({
    entryPoints: [
      "src/index.css",
      "src/app.js",
    ],
    bundle: true,
    plugins: [
      stylePlugin({
        postcss: {
          plugins: [tailwindcss({
            mode: 'jit',
            content: [
              './**/*.{jsx,tsx,html,mdx}',
            ],
            // darkMode: "class",
            plugins: [
              require('@tailwindcss/typography')({
                // :where 在手机上兼容性不佳，不启用
                // https://github.com/tailwindlabs/tailwindcss-typography/pull/203
                target: 'legacy'
              }),
            ],
          }), autoprefixer]
        },
      })
    ],
    external: ['@bysir/hollow'],
    metafile: true,
    outdir: "statics",
    minify: true,
    sourcemap: true,
    treeShaking: true,
    target: ["chrome78"],
    watch: process.env.MODE !== 'prod' ? {
      onRebuild: function (e, result) {
        if (e) {
          console.error(e.message)
        } else {
          console.log("rebuild success")
        }
      }
    } : null,
    write: true,
  })
  .then((e) => {
    console.log("build success")
  })
  .catch((e) => console.error(e.message));

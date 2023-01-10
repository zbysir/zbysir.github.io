const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  content: [
    './**/*.{jsx,tsx,html,mdx}',
  ],
  // darkMode: "class",
  theme: {
    colors: {
      ...colors,
      gray: colors.neutral,
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography')({
      // :where 在手机上兼容性不佳，不启用
      // https://github.com/tailwindlabs/tailwindcss-typography/pull/203
      target: 'legacy'
    }),
  ],
}
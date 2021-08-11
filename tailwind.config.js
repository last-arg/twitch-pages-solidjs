const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors : colors,
    extend: {
      fontWeight: ['hover', 'focus'],
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      width: {
        // TODO?: replace 1rem with w-4?
        "full-1rem": "calc(100% - 1rem)",
      },
      colors: {
        "transparent": "transparent",
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/line-clamp'),
  ]
};

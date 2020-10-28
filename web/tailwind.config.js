const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend: {
      colors: {
        nav: '#e56e02',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    animation: ['responsive', 'motion-safe', 'motion-reduce', 'hover'],
    borderWidth: ['responsive', 'first', 'hover', 'focus'],
  },
  plugins: [require('@tailwindcss/ui')],
};

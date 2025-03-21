const {addIconSelectors} = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-primeui'),
    addIconSelectors(['hugeicons', 'mdi'])
  ]
}

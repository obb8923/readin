/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'p': ['Pretendard-Regular'],
      },
      colors: {
        'background': '#fafafa',
        'matcha': '#5F9B41',
        'skyblue': '#378FE9',
        'brick': '#E06847',
        'white': '#fefefe',
        'black': '#191919',
        'svggray': '#6b7280',
        'bluegray': '#F1F2F4',
      },
    },
  },
  plugins: [],
}; 

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
        'p-semibold': ['Pretendard-SemiBold'],
        'p-extrabold': ['Pretendard-ExtraBold'],
        'p-black': ['Pretendard-Black'],
      },
      colors: {
        'background': '#fafafa',
        'backgroundf8': '#fafafaf8',
        'backgroundaa': '#fafafaaa',
        'matcha': '#5F9B41',
        'skyblue': '#378FE9',
        'brick': '#E06847',
        'white': '#fefefe',
        'black': '#191919',
        'svggray': '#6b7280',
        'svggray2': '#9ca3af',
        'bluegray': '#F1F2F4',
      },
    },
  },
  plugins: [],
}; 

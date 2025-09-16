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
        'p-regular': ['Pretendard-Regular'],
        'p-semibold': ['Pretendard-SemiBold'],
        'p-extrabold': ['Pretendard-ExtraBold'],
        'p-bold': ['Pretendard-Bold'],
        'p-medium': ['Pretendard-Medium'],
        'p-black': ['Pretendard-Black'],
      },
      colors: {
        'primary': '#fb5531',
        'background': '#212121',
        'white': '#fafafa',
        'black': '#212121',
        'realblack': '#000000',
        'gray100': '#E6E6E6',
        'gray200': '#CCCCCC',
        'gray300': '#B3B3B3',
        'gray400': '#999999',
        'gray500': '#808080',
        'gray600': '#666666',
        'gray700': '#4D4D4D',
        'gray800': '#333333',
        'gray900': '#1A1A1A',
        'orange100': '#FED2C8',
        'orange200': '#FDA896',
        'orange300': '#FC7F64',
        'orange400': '#FB5531',
        'orange500': '#F53005',
        'orange600': '#C32604',
        'orange700': '#911C03',
        'orange800': '#5F1202',
        'orange900': '#2D0901',
        'kdc1': '#fda896',
        'kdc2': '#fb5531',
        'kdc3': '#911c03',
        'kdc4': '#FDDC96',
        'kdc5': '#fbbb31',
        'kdc6': '#916403',
        'kdc7': '#cccccc',
        'kdc8': '#808080',
        'kdc9': '#fafafa',
        'kdc10': '#212121',


      },

    },
  },
  plugins: [],
}; 

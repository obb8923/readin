module.exports = {
  presets: ['module:@react-native/babel-preset','nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'], // 별칭 기준 경로
        alias: {
          '@': './src', // @ 를 src 폴더로 매핑
          '@assets': './assets',
          '@domain': './src/domain',
          '@component': './src/shared/component',
          '@constant': './src/shared/constant',
          '@libs': './src/shared/libs',
          '@store': './src/shared/store',
          '@nav': './src/shared/nav',
          '@home': './src/domain/home',
          '@books': './src/domain/books',
          '@profile': './src/domain/profile',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        blacklist: null, // DEPRECATED
        whitelist: null, // DEPRECATED
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
    'react-native-worklets/plugin',
  ],
};

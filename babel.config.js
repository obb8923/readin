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
          '@components': './src/shared/components',
          '@constants': './src/shared/constants',
          '@libs': './src/shared/libs',
          '@store': './src/shared/store',
          '@services': './src/shared/services',
          '@types': './src/shared/types',
          '@diary': './src/domain/diary',
          '@calendar': './src/domain/calendar',
          '@etc': './src/domain/etc',
          '@nav': './src/shared/nav',
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
    'react-native-reanimated/plugin',
  ],
};

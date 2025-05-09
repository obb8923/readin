const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require("nativewind/metro");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    extraNodeModules: {
      'url': require.resolve('react-native-url-polyfill'),
      'events': require.resolve('events'),
      'http': require.resolve('stream-http'),
      'https': require.resolve('stream-http'),
      'net': require.resolve('react-native-tcp-socket'),
      'tls': require.resolve('react-native-tcp-socket'),
      'stream': require.resolve('readable-stream'),
      'crypto': require.resolve('react-native-crypto'),
      'zlib': require.resolve('browserify-zlib'),
      'util': require.resolve('util'),
      'assert': require.resolve('assert'),
    },
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });
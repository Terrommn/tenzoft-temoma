const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// NativeWind v2 CSS support
config.transformer.babelTransformerPath = require.resolve('react-native-css-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'css');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'css'];

module.exports = config; 
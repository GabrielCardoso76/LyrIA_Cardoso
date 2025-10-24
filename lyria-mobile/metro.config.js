const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  url: require.resolve('react-native-url-polyfill'),
  'node:url': require.resolve('react-native-url-polyfill'),
  http: require.resolve('stream-http'),
  'node:http': require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  'node:https': require.resolve('https-browserify'),
  net: require.resolve('react-native-tcp-socket'),
  'node:net': require.resolve('react-native-tcp-socket'),
  events: require.resolve('events'),
};

module.exports = config;

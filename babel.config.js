module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo wires up expo-router and, when react-native-reanimated
    // is installed, appends the react-native-worklets babel plugin for us.
    presets: ['babel-preset-expo'],
  };
};

module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // react-native-reanimated 利用時に必須。plugins 配列の最後に置くこと（公式制約）。
    plugins: ["react-native-reanimated/plugin"],
  };
};

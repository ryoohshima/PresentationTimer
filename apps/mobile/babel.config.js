module.exports = (api) => {
  api.cache(true);
  return {
    // reanimated 4 の worklets plugin は babel-preset-expo(SDK 54) が
    // react-native-worklets の存在を検出して自動適用するため、手動指定しない（二重適用防止）
    presets: ["babel-preset-expo"],
  };
};

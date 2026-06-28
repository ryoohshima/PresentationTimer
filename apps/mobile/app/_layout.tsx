import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 全ルート共通の親レイアウト。
// index / timer は通常のスタック画面、settings はモーダル表示にする
// （docs/06-screens.md: 設定は ① / ② いずれからも開けるモーダル）。
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "アジェンダ編集" }} />
        <Stack.Screen name="timer" options={{ title: "タイマー実行" }} />
        <Stack.Screen name="settings" options={{ title: "設定", presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

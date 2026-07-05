import { TimerProvider } from "@agenda-timer/store";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAgendaPersistence } from "../hooks/useAgendaPersistence";

// TimerProvider 配下で永続化フックを走らせるための無描画コンポーネント（Issue #19）。
function AgendaPersistence() {
  useAgendaPersistence();
  return null;
}

// 全ルート共通の親レイアウト。
// index / timer は通常のスタック画面、settings はモーダル表示にする
// （docs/06-screens.md: 設定は ① / ② いずれからも開けるモーダル）。
// GestureHandlerRootView はドラッグ並べ替え（react-native-draggable-flatlist）に必須。
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <TimerProvider>
          <AgendaPersistence />
          <Stack>
            <Stack.Screen name="index" options={{ title: "アジェンダ編集" }} />
            <Stack.Screen name="timer" options={{ title: "タイマー実行" }} />
            <Stack.Screen name="settings" options={{ title: "設定", presentation: "modal" }} />
          </Stack>
        </TimerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

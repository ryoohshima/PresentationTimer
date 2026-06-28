import { getRemainingSec } from "@agenda-timer/core-logic";
import type { TimerState } from "@agenda-timer/types";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// 骨組み段階のサンプル状態。共有エンジン（core-logic）の配線確認用に
// 残り時間をセレクタ経由で算出して表示する（本実装は後続 Issue）。
const sampleState: TimerState = {
  agenda: [
    {
      id: "1",
      title: "オープニング",
      plannedSec: 300,
      allocatedSec: 300,
      isLocked: false,
    },
  ],
  currentIndex: 0,
  status: "running",
  elapsedInItemSec: 60,
  totalPlannedSec: 300,
  reallocationMode: "proportional",
};

// ② タイマー実行画面。
// 「一時停止 → 編集に戻る」で ① へ戻り、「設定」で ③ 設定モーダルへ遷移する。
export default function TimerScreen() {
  const router = useRouter();
  const remaining = getRemainingSec(sampleState);

  // 戻れる履歴があれば back、無ければ起点 (/) へ置換して必ず編集に戻す。
  const handleBackToEdit = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>② タイマー実行</Text>
      <Text style={styles.remaining}>残り {remaining ?? "—"} 秒</Text>

      <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={handleBackToEdit}>
        <Text style={styles.primaryLabel}>一時停止 → 編集に戻る</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.secondaryLabel}>設定</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  remaining: {
    fontSize: 48,
    fontWeight: "800",
    color: "#16a34a",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 240,
    alignItems: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 240,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  secondaryLabel: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
});

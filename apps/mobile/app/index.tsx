import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ① アジェンダ編集画面（遷移の起点）。
// 「開始」で ② タイマー実行へ、「設定」で ③ 設定モーダルへ遷移する。
export default function AgendaEditScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>① アジェンダ編集</Text>
      <Text style={styles.desc}>アジェンダと時間配分を登録する画面（骨組み）。</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={() => router.push("/timer")}
      >
        <Text style={styles.primaryLabel}>開始</Text>
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
  desc: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
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
    minWidth: 200,
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

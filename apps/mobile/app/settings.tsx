import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ③ 設定画面（モーダル表示）。① / ② いずれからも開ける。
// 「閉じる」でモーダルを閉じて呼び出し元へ戻る。
export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>③ 設定</Text>
      <Text style={styles.desc}>再配分モードや通知などを設定する画面（骨組み）。</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeLabel}>閉じる</Text>
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
  closeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  closeLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

import { Button, StyleSheet, Text, View } from "react-native";

type Props = {
  onBackToEdit: () => void;
  onSettings: () => void;
};

export function TimerScreen({ onBackToEdit, onSettings }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>タイマー実行</Text>
      <Text style={styles.timer}>00:00</Text>
      <Text style={styles.item}>（アジェンダ項目）</Text>
      <View style={styles.actions}>
        <Button title="一時停止 → 編集に戻る" onPress={onBackToEdit} />
        <Button title="設定" onPress={onSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  timer: {
    fontSize: 96,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  item: {
    fontSize: 24,
    color: "#ccc",
    marginBottom: 48,
    marginTop: 16,
  },
  actions: {
    gap: 12,
    width: "100%",
  },
});

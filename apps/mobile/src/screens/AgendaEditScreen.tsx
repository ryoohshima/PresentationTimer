import { Button, StyleSheet, Text, View } from "react-native";

type Props = {
  onStart: () => void;
  onSettings: () => void;
};

export function AgendaEditScreen({ onStart, onSettings }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>アジェンダ編集</Text>
      <Text style={styles.placeholder}>アジェンダ項目がここに表示されます</Text>
      <View style={styles.actions}>
        <Button title="開始" onPress={onStart} />
        <Button title="設定" onPress={onSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
});

import { Button, Modal, StyleSheet, Text, View } from "react-native";

type Props = {
  onClose: () => void;
};

export function SettingsScreen({ onClose }: Props) {
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
          <Button title="閉じる" onPress={onClose} />
        </View>
        <Text style={styles.placeholder}>設定項目がここに表示されます</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  placeholder: {
    color: "#999",
    textAlign: "center",
    marginTop: 48,
  },
});

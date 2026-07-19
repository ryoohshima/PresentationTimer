import { getRemainingSec } from "@presentation-timer/core-logic";
import { TimerProvider, useTimerStore } from "@presentation-timer/store";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

function AppContent() {
  const { state } = useTimerStore();
  const remaining = getRemainingSec(state);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>プレゼンタイマー</Text>
      <Text style={styles.status}>
        Status: {state.status} / Remaining: {remaining ?? "—"}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    color: "#666",
  },
});

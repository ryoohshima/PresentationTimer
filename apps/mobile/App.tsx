import { getRemainingSec } from "@agenda-timer/core-logic";
import type { TimerState } from "@agenda-timer/types";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const initialState: TimerState = {
  agenda: [],
  currentIndex: 0,
  status: "idle",
  elapsedInItemSec: 0,
  totalPlannedSec: 0,
  reallocationMode: "proportional",
};

export default function App() {
  const remaining = getRemainingSec(initialState);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgendaTimer</Text>
      <Text style={styles.status}>
        Status: {initialState.status} / Remaining: {remaining ?? "—"}
      </Text>
      <StatusBar style="auto" />
    </View>
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

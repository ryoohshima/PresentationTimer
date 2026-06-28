import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AgendaEditScreen } from "./src/screens/AgendaEditScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { TimerScreen } from "./src/screens/TimerScreen";

type Screen = "agenda-edit" | "timer";

export default function App() {
  const [screen, setScreen] = useState<Screen>("agenda-edit");
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {screen === "agenda-edit" ? (
        <AgendaEditScreen
          onStart={() => setScreen("timer")}
          onSettings={() => setSettingsVisible(true)}
        />
      ) : (
        <TimerScreen
          onBackToEdit={() => setScreen("agenda-edit")}
          onSettings={() => setSettingsVisible(true)}
        />
      )}
      {settingsVisible && <SettingsScreen onClose={() => setSettingsVisible(false)} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

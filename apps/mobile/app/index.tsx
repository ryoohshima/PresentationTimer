import { formatMinSec } from "@agenda-timer/core-logic";
import { useTimerStore } from "@agenda-timer/store";
import type { AgendaItem } from "@agenda-timer/types";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { type RenderItemParams } from "react-native-draggable-flatlist";
import { AgendaItemRow } from "../components/AgendaItemRow";

// ① アジェンダ編集画面（docs/06-screens.md 画面①）。
// 項目の追加・削除・ドラッグ並べ替え・plannedSec 入力を行い、「開始」で ② タイマー実行へ。
export default function AgendaEditScreen() {
  const router = useRouter();
  const { state, addItem, removeItem, moveItem, updateItem, toggleLock, start } = useTimerStore();
  const { agenda } = state;

  const handleStart = () => {
    start();
    router.push("/timer");
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<AgendaItem>) => (
    <AgendaItemRow
      item={item}
      drag={drag}
      isActive={isActive}
      onUpdate={(patch) => updateItem(item.id, patch)}
      onToggleLock={() => toggleLock(item.id)}
      onRemove={() => removeItem(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>合計 {formatMinSec(state.totalPlannedSec)}</Text>
        <Pressable accessibilityRole="button" style={styles.addButton} onPress={() => addItem()}>
          <Text style={styles.addLabel}>＋ 項目を追加</Text>
        </Pressable>
      </View>

      {agenda.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>アジェンダがありません</Text>
          <Text style={styles.emptyDesc}>
            「＋ 項目を追加」から発表の流れを組み立ててください。
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={agenda}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ from, to }) => {
            const moved = agenda[from];
            if (moved) {
              moveItem(moved.id, to);
            }
          }}
          containerStyle={styles.list}
        />
      )}

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: agenda.length === 0 }}
          disabled={agenda.length === 0}
          style={[styles.primaryButton, agenda.length === 0 && styles.primaryButtonDisabled]}
          onPress={handleStart}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  addLabel: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  footer: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  primaryLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
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

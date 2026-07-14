import { formatMinSec } from "@agenda-timer/core-logic";
import { useTimerStore } from "@agenda-timer/store";
import type { AgendaItem } from "@agenda-timer/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { type RenderItemParams } from "react-native-draggable-flatlist";
import { AgendaItemRow } from "../components/AgendaItemRow";
import { GlassCard } from "../components/GlassCard";
import { GradientBackground } from "../components/GradientBackground";
import { PillButton } from "../components/PillButton";
import { colors } from "../constants/theme";

// ① アジェンダ編集画面（docs/06-screens.md 画面①）。
// 項目の追加・削除・ドラッグ並べ替え・plannedSec 入力を行い、「開始」で ② タイマー実行へ。
// 見た目は design.pen の「App — ① アジェンダ編集」に準拠する。
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
    <GradientBackground style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>アジェンダ</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="設定"
          onPress={() => router.push("/settings")}
        >
          <Feather name="settings" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <Text style={styles.summaryLabel}>合計 {formatMinSec(state.totalPlannedSec)}</Text>

      {agenda.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clipboard" size={40} color="#14171A33" />
          <Text style={styles.emptyTitle}>アジェンダがありません</Text>
          <Text style={styles.emptyDesc}>
            「＋ 項目を追加」から発表の流れを組み立ててください。
          </Text>
          <GlassCard style={styles.emptyAddButton}>
            <Pressable
              accessibilityRole="button"
              style={styles.addButtonInner}
              onPress={() => addItem()}
            >
              <Text style={styles.addLabel}>＋ 項目を追加</Text>
            </Pressable>
          </GlassCard>
        </View>
      ) : (
        <>
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

          <GlassCard>
            <Pressable
              accessibilityRole="button"
              style={styles.addButtonInner}
              onPress={() => addItem()}
            >
              <Text style={styles.addLabel}>＋ 項目を追加</Text>
            </Pressable>
          </GlassCard>
        </>
      )}

      <View style={styles.footer}>
        <PillButton label="開始" onPress={handleStart} disabled={agenda.length === 0} fullWidth />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.ink,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14171A8C",
  },
  list: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#14171A99",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#14171A66",
    textAlign: "center",
    lineHeight: 13 * 1.7,
    maxWidth: 270,
  },
  emptyAddButton: {
    marginTop: 4,
    alignSelf: "stretch",
  },
  addButtonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  addLabel: {
    color: "#14171A66",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    gap: 8,
  },
});

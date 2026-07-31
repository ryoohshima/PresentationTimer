import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatMinSec } from "@presentation-timer/core-logic";
import { useTimerStore } from "@presentation-timer/store";
import type { AgendaItem } from "@presentation-timer/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AgendaItemEditModal } from "../components/AgendaItemEditModal";
import { AgendaItemRow } from "../components/AgendaItemRow";
import { DraggableRow } from "../components/DraggableRow";
import { GlassCard } from "../components/GlassCard";
import { GradientBackground } from "../components/GradientBackground";
import { PillButton } from "../components/PillButton";
import { colors } from "../constants/theme";
import { useDragReorder } from "../hooks/useDragReorder";

// ① アジェンダ編集画面（docs/06-screens.md 画面①）。
// 行は表示専用で、鉛筆アイコン（または「＋ 項目を追加」）で編集モーダルを開いて入力する。
// 削除・ドラッグ並べ替え・ロックは行上のアイコンで直接行い、「開始」で ② タイマー実行へ。
// 見た目は design.pen の「App — ① アジェンダ編集」に準拠する。

/** モーダルの編集対象。undefined=閉、{mode:"add"}=新規、{mode:"edit"}=既存項目。 */
type EditorTarget = { mode: "add" } | { mode: "edit"; item: AgendaItem };

export default function AgendaEditScreen() {
  const router = useRouter();
  const { state, addItem, removeItem, moveItem, updateItem, toggleLock, start } = useTimerStore();
  const { agenda } = state;
  const [editorTarget, setEditorTarget] = useState<EditorTarget | undefined>(undefined);

  const drag = useDragReorder({
    agendaIds: agenda.map((item) => item.id),
    onReorder: (from, to) => {
      const moved: AgendaItem | undefined = agenda[from];
      if (moved) {
        moveItem(moved.id, to);
      }
    },
  });

  const handleStart = () => {
    start();
    router.push("/timer");
  };

  // 誤タップによる即時削除を防ぐため確認を挟む。web は Alert.alert が no-op のため confirm を使う。
  const confirmRemove = (item: AgendaItem) => {
    const message = `「${item.title || "（無題）"}」を削除しますか？`;
    if (Platform.OS === "web") {
      if (globalThis.confirm(message)) {
        removeItem(item.id);
      }
      return;
    }
    Alert.alert("項目を削除", message, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => removeItem(item.id) },
    ]);
  };

  const handleSave = (title: string, plannedSec: number) => {
    if (editorTarget?.mode === "edit") {
      updateItem(editorTarget.item.id, { title, plannedSec });
    } else {
      addItem(title, plannedSec);
    }
    setEditorTarget(undefined);
  };

  const addButton = (
    <GlassCard style={styles.addCard}>
      <Pressable
        accessibilityRole="button"
        style={styles.addButtonInner}
        onPress={() => setEditorTarget({ mode: "add" })}
      >
        <Text style={styles.addLabel}>＋ 項目を追加</Text>
      </Pressable>
    </GlassCard>
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
          <MaterialCommunityIcons name="clipboard-list-outline" size={40} color="#14171A33" />
          <Text style={styles.emptyTitle}>アジェンダがありません</Text>
          <Text style={styles.emptyDesc}>
            「＋ 項目を追加」から発表の流れを組み立ててください。
          </Text>
          <View style={styles.emptyAddButton}>{addButton}</View>
        </View>
      ) : (
        <>
          {/* ドラッグ中はリスト自体のスクロールを止め、Pan とタッチが競合しないようにする。 */}
          <ScrollView
            ref={drag.scrollRef}
            style={styles.list}
            scrollEnabled={drag.activeId === null}
          >
            {/* 行は absolute 配置（測定後）のため、リスト高さはここで明示する。 */}
            <View style={drag.listHeight === undefined ? undefined : { height: drag.listHeight }}>
              {agenda.map((item, index) => (
                <DraggableRow key={item.id} agendaIndex={index} itemId={item.id} controller={drag}>
                  {(gesture) => (
                    <AgendaItemRow
                      item={item}
                      dragGesture={gesture}
                      isActive={drag.activeId === item.id}
                      onEdit={() => setEditorTarget({ mode: "edit", item })}
                      onToggleLock={() => toggleLock(item.id)}
                      onRemove={() => confirmRemove(item)}
                    />
                  )}
                </DraggableRow>
              ))}
            </View>
          </ScrollView>
          {addButton}
        </>
      )}

      <View style={styles.footer}>
        <PillButton label="開始" onPress={handleStart} disabled={agenda.length === 0} fullWidth />
      </View>

      <AgendaItemEditModal
        visible={editorTarget !== undefined}
        item={editorTarget?.mode === "edit" ? editorTarget.item : undefined}
        onSave={handleSave}
        onClose={() => setEditorTarget(undefined)}
      />
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
  // design.pen の AddItemRow は他カード（strokeWidth 1）より太い 1.5。
  addCard: {
    borderWidth: 1.5,
  },
  addButtonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  addLabel: {
    // アクションであることが伝わるようアクセント色 + 太字にする（disabled 誤認の防止）。
    color: colors.accentGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    gap: 8,
  },
});

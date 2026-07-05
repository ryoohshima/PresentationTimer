import type { AgendaItem } from "@agenda-timer/types";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

// 画面① アジェンダ編集の 1 行。タイトル・分:秒入力・ロックトグル・削除・ドラッグハンドル。
// 分:秒はテキスト入力中の中間状態（空文字等）を許すため行ローカル state に持ち、
// 確定値のみ onUpdate で store へ流す（docs/06-screens.md 画面①）。

interface AgendaItemRowProps {
  item: AgendaItem;
  /** 長押しでドラッグ並べ替えを開始する（react-native-draggable-flatlist の drag）。 */
  drag: () => void;
  /** ドラッグ中の行なら true（ハイライト表示用）。 */
  isActive: boolean;
  onUpdate: (patch: { title?: string; plannedSec?: number }) => void;
  onToggleLock: () => void;
  onRemove: () => void;
}

/** 数値入力文字列を 0 以上の整数へ変換する（数値以外・空文字は 0 扱い）。 */
function toSec(text: string): number {
  const value = Number.parseInt(text, 10);
  return Number.isNaN(value) ? 0 : Math.max(0, value);
}

export function AgendaItemRow({
  item,
  drag,
  isActive,
  onUpdate,
  onToggleLock,
  onRemove,
}: AgendaItemRowProps) {
  const [minText, setMinText] = useState(String(Math.floor(item.plannedSec / 60)));
  const [secText, setSecText] = useState(String(item.plannedSec % 60));

  const commitTime = (nextMinText: string, nextSecText: string) => {
    const sec = Math.min(59, toSec(nextSecText));
    onUpdate({ plannedSec: toSec(nextMinText) * 60 + sec });
  };

  return (
    <View style={[styles.row, isActive && styles.rowActive]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="ドラッグして並べ替え"
        onLongPress={drag}
        style={styles.dragHandle}
      >
        <Text style={styles.dragHandleLabel}>≡</Text>
      </Pressable>

      <View style={styles.body}>
        <TextInput
          value={item.title}
          onChangeText={(text) => onUpdate({ title: text })}
          placeholder="項目名"
          style={styles.titleInput}
          accessibilityLabel="項目名"
        />

        <View style={styles.timeRow}>
          <TextInput
            value={minText}
            onChangeText={(text) => {
              setMinText(text);
              commitTime(text, secText);
            }}
            keyboardType="number-pad"
            style={styles.timeInput}
            accessibilityLabel="予定時間（分）"
          />
          <Text style={styles.timeSeparator}>分</Text>
          <TextInput
            value={secText}
            onChangeText={(text) => {
              setSecText(text);
              commitTime(minText, text);
            }}
            keyboardType="number-pad"
            style={styles.timeInput}
            accessibilityLabel="予定時間（秒）"
          />
          <Text style={styles.timeSeparator}>秒</Text>

          <View style={styles.lockRow}>
            <Text style={styles.lockLabel}>固定</Text>
            <Switch
              value={item.isLocked}
              onValueChange={onToggleLock}
              accessibilityLabel="再配分の対象外にする"
            />
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="項目を削除"
        onPress={onRemove}
        style={styles.removeButton}
      >
        <Text style={styles.removeLabel}>削除</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  rowActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  dragHandle: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dragHandleLabel: {
    fontSize: 20,
    color: "#9ca3af",
  },
  body: {
    flex: 1,
    gap: 6,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeInput: {
    minWidth: 48,
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },
  timeSeparator: {
    fontSize: 14,
    color: "#6b7280",
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 4,
  },
  lockLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  removeLabel: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
});

import type { AgendaItem } from "@agenda-timer/types";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../constants/theme";
import { GlassCard } from "./GlassCard";

// 画面① アジェンダ編集の 1 行。タイトル・分:秒入力・ロックトグル・削除・ドラッグハンドル。
// 分:秒はテキスト入力中の中間状態（空文字等）を許すため行ローカル state に持ち、
// 確定値のみ onUpdate で store へ流す（docs/06-screens.md 画面①）。
// 見た目は design.pen の AppAgendaRow（ガラスカード + アイコン式ロック/削除）に準拠する。

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
    <GlassCard
      strong
      style={[styles.row, isActive && styles.rowActive, item.isLocked && styles.rowLocked]}
    >
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
          placeholderTextColor="#14171A66"
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
          {item.isLocked && <Text style={styles.lockedSuffix}>・固定</Text>}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.isLocked ? "再配分の対象にする" : "再配分の対象外にする"}
        onPress={onToggleLock}
        style={styles.iconButton}
      >
        <Feather
          name={item.isLocked ? "lock" : "unlock"}
          size={20}
          color={item.isLocked ? colors.accentGreen : "#9CA3AF"}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="項目を削除"
        onPress={onRemove}
        style={styles.iconButton}
      >
        <Feather name="trash-2" size={20} color="#9CA3AF" />
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    padding: 16,
  },
  rowActive: {
    borderColor: colors.accentGreen,
    borderWidth: 1.5,
  },
  rowLocked: {
    borderColor: colors.accentGreen,
    borderWidth: 1.5,
  },
  dragHandle: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dragHandleLabel: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    padding: 0,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    minWidth: 20,
    fontSize: 13,
    color: "#6B7280",
    padding: 0,
  },
  timeSeparator: {
    fontSize: 13,
    color: "#6B7280",
  },
  lockedSuffix: {
    fontSize: 13,
    color: colors.accentGreen,
    fontWeight: "600",
  },
  iconButton: {
    padding: 4,
  },
});

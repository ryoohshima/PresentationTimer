import type { AgendaItem } from "@agenda-timer/types";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";
import { GlassCard } from "./GlassCard";

// 画面① アジェンダ編集の 1 行。表示専用とし、行タップで編集モーダルを開く
// （行内インライン入力は入力可否が分かりづらいため AgendaItemEditModal に集約）。
// 見た目は design.pen の AppAgendaRow（タイトル + 「5分 00秒」詳細 + ロック/削除）に準拠する。

interface AgendaItemRowProps {
  item: AgendaItem;
  /** 長押しでドラッグ並べ替えを開始する（react-native-draggable-flatlist の drag）。 */
  drag: () => void;
  /** ドラッグ中の行なら true（ハイライト表示用）。 */
  isActive: boolean;
  onEdit: () => void;
  onToggleLock: () => void;
  onRemove: () => void;
}

/** 秒数を「5分 00秒」表記へ整形する。 */
function formatPlanned(sec: number): string {
  return `${Math.floor(sec / 60)}分 ${String(sec % 60).padStart(2, "0")}秒`;
}

export function AgendaItemRow({
  item,
  drag,
  isActive,
  onEdit,
  onToggleLock,
  onRemove,
}: AgendaItemRowProps) {
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title || "無題の項目"}を編集`}
        onPress={onEdit}
        onLongPress={drag}
        style={styles.body}
      >
        <Text style={[styles.title, item.title === "" && styles.titlePlaceholder]}>
          {item.title || "（無題）"}
        </Text>
        <Text style={styles.detail}>
          {formatPlanned(item.plannedSec)}
          {item.isLocked && <Text style={styles.lockedSuffix}> ・固定</Text>}
        </Text>
      </Pressable>

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
    marginBottom: 12,
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
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  titlePlaceholder: {
    color: "#14171A66",
  },
  detail: {
    fontSize: 13,
    color: "#6B7280",
  },
  lockedSuffix: {
    color: colors.accentGreen,
    fontWeight: "600",
  },
  iconButton: {
    padding: 4,
  },
});

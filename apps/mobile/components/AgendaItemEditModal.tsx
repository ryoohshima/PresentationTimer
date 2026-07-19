import type { AgendaItem } from "@agenda-timer/types";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../constants/theme";
import { PillButton } from "./PillButton";

// 画面① の項目入力モーダル。行内インライン編集は入力可否が分かりづらいため、
// タイトル・時間の編集は本モーダルに集約する（新規追加と既存編集の両対応）。

interface AgendaItemEditModalProps {
  visible: boolean;
  /** 編集対象。undefined なら新規追加モード。 */
  item?: AgendaItem;
  onSave: (title: string, plannedSec: number) => void;
  onClose: () => void;
}

/** 数値入力文字列を 0 以上の整数へ変換する（数値以外・空文字は 0 扱い）。 */
function toSec(text: string): number {
  const value = Number.parseInt(text, 10);
  return Number.isNaN(value) ? 0 : Math.max(0, value);
}

export function AgendaItemEditModal({ visible, item, onSave, onClose }: AgendaItemEditModalProps) {
  const [title, setTitle] = useState("");
  const [minText, setMinText] = useState("5");
  const [secText, setSecText] = useState("00");

  // モーダルを開くたびに編集対象の現在値（新規時はデフォルト 5 分）で初期化する。
  useEffect(() => {
    if (visible) {
      setTitle(item?.title ?? "");
      const plannedSec = item?.plannedSec ?? 300;
      setMinText(String(Math.floor(plannedSec / 60)));
      setSecText(String(plannedSec % 60).padStart(2, "0"));
    }
  }, [visible, item]);

  const handleSave = () => {
    const plannedSec = toSec(minText) * 60 + Math.min(59, toSec(secText));
    onSave(title.trim(), plannedSec);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="閉じる" />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{item === undefined ? "項目を追加" : "項目の編集"}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="閉じる" onPress={onClose}>
              <Feather name="x" size={24} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>タイトル</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="例: オープニング"
              placeholderTextColor="#14171A66"
              style={styles.titleInput}
              accessibilityLabel="項目名"
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>時間</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={minText}
                onChangeText={setMinText}
                keyboardType="number-pad"
                style={styles.timeInput}
                accessibilityLabel="予定時間（分）"
                selectTextOnFocus
              />
              <Text style={styles.timeUnit}>分</Text>
              <TextInput
                value={secText}
                onChangeText={setSecText}
                keyboardType="number-pad"
                style={styles.timeInput}
                accessibilityLabel="予定時間（秒）"
                selectTextOnFocus
              />
              <Text style={styles.timeUnit}>秒</Text>
            </View>
          </View>

          {/* タイトルは必須（空のまま保存して「（無題）」項目が生まれるのを防ぐ）。 */}
          <PillButton
            label={item === undefined ? "追加" : "保存"}
            onPress={handleSave}
            disabled={title.trim() === ""}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#14171A66",
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "#FFFFFFF2",
    padding: 20,
    gap: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#14171A8C",
  },
  titleInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#14171A1F",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeInput: {
    width: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#14171A1F",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  timeUnit: {
    fontSize: 15,
    fontWeight: "600",
    color: "#14171A8C",
    marginRight: 10,
  },
});

import { formatMinSec } from "@agenda-timer/core-logic";
import type { AgendaItem } from "@agenda-timer/types";
import { StyleSheet, Text, View } from "react-native";

// 次項目のタイトルと割当時間を控えめに表示する（Issue #24, docs/06 画面②）。
// 次が無い（現項目が最後）場合は終端表示を出す。

interface NextItemPreviewProps {
  item: AgendaItem | undefined;
}

export function NextItemPreview({ item }: NextItemPreviewProps) {
  return (
    <View style={styles.container}>
      {item === undefined ? (
        <Text style={styles.text}>最後の項目です</Text>
      ) : (
        <Text style={styles.text} numberOfLines={1}>
          次: {item.title || "（無題）"}（{formatMinSec(item.allocatedSec)}）
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  text: {
    fontSize: 16,
    color: "#6b7280",
  },
});

import { formatMinSec } from "@presentation-timer/core-logic";
import type { AgendaItem } from "@presentation-timer/types";
import { StyleSheet, Text } from "react-native";
import { GlassCard } from "./GlassCard";

// 次項目のタイトルと割当時間を控えめに表示する（Issue #24, docs/06 画面②）。
// 次が無い（現項目が最後）場合は終端表示を出す。
// 見た目は design.pen の NextBox（ガラスカード + NEXT ラベル）に準拠する。

interface NextItemPreviewProps {
  item: AgendaItem | undefined;
}

export function NextItemPreview({ item }: NextItemPreviewProps) {
  return (
    <GlassCard style={styles.container}>
      <Text style={styles.label}>NEXT</Text>
      {item === undefined ? (
        <Text style={styles.text}>最後の項目です</Text>
      ) : (
        <Text style={styles.text} numberOfLines={1}>
          次: {item.title || "（無題）"}（{formatMinSec(item.allocatedSec)}）
        </Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#14171A66",
  },
  text: {
    fontSize: 15,
    color: "#14171ABF",
  },
});

import type { PaceLevel } from "@agenda-timer/core-logic";
import { StyleSheet, View } from "react-native";
import { paceColor } from "../constants/paceColors";

// 現項目の 経過/割当 を可視化する進捗バー（Issue #22）。
// 超過（rate > 1）はバーを満杯のまま赤で示す。

interface ProgressBarProps {
  /** 進捗率（0〜1+）。undefined は 0 扱い。 */
  rate: number | undefined;
  level: PaceLevel | undefined;
}

export function ProgressBar({ rate, level }: ProgressBarProps) {
  const widthPercent = Math.min(1, Math.max(0, rate ?? 0)) * 100;

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View
        style={[styles.fill, { width: `${widthPercent}%`, backgroundColor: paceColor(level) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: "stretch",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
  },
});

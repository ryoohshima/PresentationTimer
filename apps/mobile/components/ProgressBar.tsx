import type { PaceLevel } from "@agenda-timer/core-logic";
import { StyleSheet, View } from "react-native";
import { paceBarColor } from "../constants/paceColors";
import { colors } from "../constants/theme";

// 現項目の 経過/割当 を可視化する進捗バー（Issue #22）。
// 超過（rate > 1）はバーを満杯のまま赤で示す。
// 見た目は design.pen の ProgressTrack/ProgressFill（半透明トラック + 角丸4）に準拠する。

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
        style={[styles.fill, { width: `${widthPercent}%`, backgroundColor: paceBarColor(level) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: "stretch",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});

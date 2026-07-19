import { Feather } from "@expo/vector-icons";
import {
  formatMinSec,
  getCurrentItem,
  getNextItem,
  getPaceLevel,
  getProgressRate,
  getRemainingSec,
  getScheduleOverUnderSec,
  getTotalRemainingSec,
} from "@presentation-timer/core-logic";
import { useTimerStore } from "@presentation-timer/store";
import { useKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { NextItemPreview } from "../components/NextItemPreview";
import { PillButton } from "../components/PillButton";
import { ProgressBar } from "../components/ProgressBar";
import { paceTimeColor } from "../constants/paceColors";
import { colors } from "../constants/theme";
import { useTimerTick } from "../hooks/useTimerTick";

// ② タイマー実行画面（docs/06-screens.md 画面②）。
// 現項目タイトルと残り時間を特大表示し、進捗バー・押し/巻き・次項目プレビュー・操作系を備える。
// 派生値はすべて core-logic のセレクタから取得する（docs/04: 状態に保持しない）。
// 見た目は design.pen の「App — ② タイマー実行」に準拠する。

// running 中のみマウントして画面スリープを抑止する（Issue #25）。
// アンマウント（pause / finished / 画面離脱）で expo-keep-awake が自動的に解除する。
function KeepAwakeWhileRunning() {
  useKeepAwake();
  return null;
}

/** 押し/巻き秒のラベル（docs/04: 正=押し・負=巻き）。 */
function overUnderLabel(overUnderSec: number): string {
  if (overUnderSec > 0) {
    return `押し ${formatMinSec(overUnderSec)}`;
  }
  if (overUnderSec < 0) {
    return `巻き ${formatMinSec(-overUnderSec)}`;
  }
  return "定刻";
}

// 全体基準の押し/巻きの色。項目内ペース（paceLevel）とは独立に、偏差の符号のみで決める。
const NEUTRAL_LABEL_COLOR = "#14171A8C";

function scheduleColor(overUnderSec: number): string {
  if (overUnderSec > 0) {
    return colors.accentRedDeep;
  }
  if (overUnderSec < 0) {
    return colors.accentGreen;
  }
  return NEUTRAL_LABEL_COLOR;
}

export default function TimerScreen() {
  const router = useRouter();
  const { state, pause, resume, advanceItem } = useTimerStore();
  useTimerTick();

  const currentItem = getCurrentItem(state);
  const nextItem = getNextItem(state);
  const remainingSec = getRemainingSec(state);
  const scheduleOverUnderSec = getScheduleOverUnderSec(state);
  const totalRemainingSec = getTotalRemainingSec(state);
  const progressRate = getProgressRate(state);
  const paceLevel = getPaceLevel(state);
  const isRunning = state.status === "running";
  const isPaused = state.status === "paused";

  // 戻れる履歴があれば back、無ければ起点 (/) へ置換して必ず編集に戻す。
  const handleBackToEdit = () => {
    if (isRunning) {
      pause();
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // 全項目終了（finished）。currentItem 無しの異常系もここに倒す。
  if (state.status === "finished" || currentItem === undefined) {
    return (
      <GradientBackground style={styles.finishedContainer}>
        <Feather name="flag" size={44} color={colors.accentGreen} />
        <Text style={styles.finishedTitle}>終了</Text>
        <Text style={styles.finishedDesc}>すべての項目が完了しました。</Text>
        <PillButton
          label="編集に戻る"
          onPress={handleBackToEdit}
          fullWidth
          style={styles.finishedButton}
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={styles.container}>
      {isRunning && <KeepAwakeWhileRunning />}

      <View style={styles.top}>
        <Text style={styles.itemTitle} numberOfLines={2} adjustsFontSizeToFit>
          {currentItem.title || "（無題）"}
        </Text>

        <Text
          style={[styles.remaining, { color: paceTimeColor(paceLevel) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {remainingSec === undefined ? "--:--" : formatMinSec(remainingSec)}
        </Text>

        <ProgressBar rate={progressRate} level={paceLevel} />

        {/* 押し/巻きは項目内ではなく全体スケジュール基準（当初計画との累積偏差）で表示する。 */}
        <Text style={[styles.overUnder, { color: scheduleColor(scheduleOverUnderSec) }]}>
          {overUnderLabel(scheduleOverUnderSec)}
          {isPaused ? "（一時停止中）" : ""}
        </Text>

        <Text style={styles.totalRemaining}>
          全体 残り {formatMinSec(totalRemainingSec)} / {formatMinSec(state.totalPlannedSec)}
        </Text>
      </View>

      <View style={styles.bottom}>
        <NextItemPreview item={nextItem} />

        <View style={styles.controls}>
          <PillButton
            label={isRunning ? "一時停止" : "再開"}
            onPress={isRunning ? pause : resume}
            variant="secondary"
            style={styles.controlButton}
          />
          <PillButton label="次へ" onPress={advanceItem} style={styles.controlButton} />
        </View>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={handleBackToEdit}>
            <Text style={styles.linkLabel}>編集に戻る</Text>
          </Pressable>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  top: {
    gap: 16,
  },
  itemTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  remaining: {
    // 数 m 離れても読める特大表示（docs/06）。画面幅に収まらない場合は自動縮小する。
    fontSize: 96,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    textAlign: "center",
  },
  overUnder: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  totalRemaining: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: NEUTRAL_LABEL_COLOR,
    textAlign: "center",
  },
  bottom: {
    gap: 16,
  },
  finishedContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  finishedTitle: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.ink,
  },
  finishedDesc: {
    fontSize: 16,
    color: "#14171A8C",
  },
  finishedButton: {
    marginTop: 8,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
  },
  linkLabel: {
    color: "#14171A8C",
    fontSize: 13,
  },
});

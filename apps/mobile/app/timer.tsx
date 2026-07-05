import {
  formatMinSec,
  getCurrentItem,
  getNextItem,
  getOverUnderSec,
  getPaceLevel,
  getProgressRate,
  getRemainingSec,
} from "@agenda-timer/core-logic";
import { useTimerStore } from "@agenda-timer/store";
import { useKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NextItemPreview } from "../components/NextItemPreview";
import { ProgressBar } from "../components/ProgressBar";
import { paceColor } from "../constants/paceColors";
import { useTimerTick } from "../hooks/useTimerTick";

// ② タイマー実行画面（docs/06-screens.md 画面②）。
// 現項目タイトルと残り時間を特大表示し、進捗バー・押し/巻き・次項目プレビュー・操作系を備える。
// 派生値はすべて core-logic のセレクタから取得する（docs/04: 状態に保持しない）。

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

export default function TimerScreen() {
  const router = useRouter();
  const { state, pause, resume, advanceItem } = useTimerStore();
  useTimerTick();

  const currentItem = getCurrentItem(state);
  const nextItem = getNextItem(state);
  const remainingSec = getRemainingSec(state);
  const overUnderSec = getOverUnderSec(state);
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
      <View style={styles.container}>
        <Text style={styles.finishedTitle}>終了</Text>
        <Text style={styles.finishedDesc}>すべての項目が完了しました。</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={handleBackToEdit}
        >
          <Text style={styles.primaryLabel}>編集に戻る</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRunning && <KeepAwakeWhileRunning />}

      <Text style={styles.itemTitle} numberOfLines={2} adjustsFontSizeToFit>
        {currentItem.title || "（無題）"}
      </Text>

      <Text
        style={[styles.remaining, { color: paceColor(paceLevel) }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {remainingSec === undefined ? "--:--" : formatMinSec(remainingSec)}
      </Text>

      <ProgressBar rate={progressRate} level={paceLevel} />

      <Text style={[styles.overUnder, { color: paceColor(paceLevel) }]}>
        {overUnderSec === undefined ? "" : overUnderLabel(overUnderSec)}
        {isPaused ? "（一時停止中）" : ""}
      </Text>

      <NextItemPreview item={nextItem} />

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={isRunning ? pause : resume}
        >
          <Text style={styles.secondaryLabel}>{isRunning ? "一時停止" : "再開"}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={advanceItem}>
          <Text style={styles.primaryLabel}>次へ</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" style={styles.linkButton} onPress={handleBackToEdit}>
          <Text style={styles.linkLabel}>一時停止して編集に戻る</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.linkButton}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.linkLabel}>設定</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#fff",
  },
  itemTitle: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
  },
  remaining: {
    // 数 m 離れても読める特大表示（docs/06）。画面幅に収まらない場合は自動縮小する。
    fontSize: 120,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  overUnder: {
    fontSize: 20,
    fontWeight: "600",
  },
  finishedTitle: {
    fontSize: 64,
    fontWeight: "800",
  },
  finishedDesc: {
    fontSize: 18,
    color: "#6b7280",
  },
  controls: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  secondaryLabel: {
    color: "#2563eb",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 24,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkLabel: {
    color: "#6b7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

import { useTimerStore } from "@agenda-timer/store";
import type { ReallocationMode } from "@agenda-timer/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Fragment, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "../components/GlassCard";
import { GradientBackground } from "../components/GradientBackground";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { colors } from "../constants/theme";

// ③ 設定画面（モーダル表示）。① / ② いずれからも開ける。
// 右上の × でモーダルを閉じて呼び出し元へ戻る（設定は選択した瞬間に反映される）。
// 見た目は design.pen の「App — ③ 設定」に準拠する。

// fixed-end は再配分ロジック・終了時刻の設定 UI とも未実装のため選択不可にする（Issue #90）。
const MODE_OPTIONS: { mode: ReallocationMode; title: string; desc: string; disabled?: boolean }[] =
  [
    { mode: "proportional", title: "比例配分", desc: "押した分を残りの項目へ比例配分します" },
    {
      mode: "fixed-end",
      title: "終了時刻固定（準備中）",
      desc: "決めた終了時刻から逆算して配分します",
      disabled: true,
    },
    { mode: "off", title: "再配分しない", desc: "各項目の持ち時間を変更しません" },
  ];

/** エポック秒を "HH:MM" 表記へ整形する。未設定なら "未設定"。 */
function formatEndTime(endAtEpochSec: number | undefined): string {
  if (endAtEpochSec === undefined) {
    return "未設定";
  }
  const date = new Date(endAtEpochSec * 1000);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function RadioDot({ selected }: { selected: boolean }) {
  return <View style={[styles.radio, selected && styles.radioSelected]} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { state, setReallocationMode } = useTimerStore();

  // 通知設定は現状 store 未対応（配信の仕組み自体が未実装）のため、UI 上の見た目のみ画面ローカルで保持する。
  const [remainingNotify, setRemainingNotify] = useState(true);
  const [overNotify, setOverNotify] = useState(true);
  const [vibration, setVibration] = useState(false);

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            onPress={() => router.back()}
          >
            <Feather name="x" size={24} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>再配分モード</Text>
          <GlassCard strong>
            {MODE_OPTIONS.map((option, index) => (
              <Fragment key={option.mode}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: state.reallocationMode === option.mode,
                    disabled: option.disabled ?? false,
                  }}
                  disabled={option.disabled}
                  onPress={() => setReallocationMode(option.mode)}
                  style={[styles.modeRow, option.disabled && styles.modeRowDisabled]}
                >
                  <RadioDot selected={state.reallocationMode === option.mode} />
                  <View style={styles.modeTextCol}>
                    <Text style={styles.modeTitle}>{option.title}</Text>
                    <Text style={styles.modeDesc}>{option.desc}</Text>
                  </View>
                </Pressable>
              </Fragment>
            ))}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>終了時刻</Text>
          <GlassCard strong style={styles.endTimeCard}>
            <Text style={styles.endTimeTitle}>発表の終了時刻</Text>
            <Text style={styles.endTimeValue}>{formatEndTime(state.endAtEpochSec)}</Text>
            <Feather name="chevron-right" size={20} color="#14171A66" />
          </GlassCard>
          <Text style={styles.caption}>終了時刻固定モードでのみ使用されます</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>通知 / アラート</Text>
          <GlassCard strong>
            <View style={styles.notifRow}>
              <Text style={styles.notifTitle}>残りわずかで通知</Text>
              <ToggleSwitch
                value={remainingNotify}
                onValueChange={setRemainingNotify}
                accessibilityLabel="残りわずかで通知"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.notifRow}>
              <Text style={styles.notifTitle}>超過で通知</Text>
              <ToggleSwitch
                value={overNotify}
                onValueChange={setOverNotify}
                accessibilityLabel="超過で通知"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.notifRow}>
              <Text style={styles.notifTitle}>項目の切り替えでバイブレーション</Text>
              <ToggleSwitch
                value={vibration}
                onValueChange={setVibration}
                accessibilityLabel="項目の切り替えでバイブレーション"
              />
            </View>
          </GlassCard>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  main: {
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
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
  divider: {
    height: 1,
    backgroundColor: "#14171A0F",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  modeRowDisabled: {
    opacity: 0.4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#14171A29",
  },
  radioSelected: {
    borderWidth: 6,
    borderColor: colors.accentGreen,
  },
  modeTextCol: {
    flex: 1,
    gap: 2,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  modeDesc: {
    fontSize: 12,
    color: "#14171A8C",
  },
  endTimeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  endTimeTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  endTimeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#14171A8C",
  },
  caption: {
    fontSize: 12,
    color: "#14171A66",
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  notifTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
});

import type { PaceLevel } from "@presentation-timer/core-logic";
import { colors } from "./theme";

// 押し/巻きレベルの配色（docs/06: 緑=余裕 / 黄=残りわずか / 赤=超過）。
// レベル判定は core-logic の getPaceLevel が担い、UI は色への写像のみ持つ。
// design.pen は用途で 2 系統を使い分ける:
//   小さい文字（押し/巻きラベル等）= 深色系（accent-green / accent-yellow-deep / accent-red-deep）
//   面積の大きい進捗バー = 明色系（accent-green-bright / accent-yellow / accent-red）
//   残り時間の特大数字 = 平常時は ink、warning/over のみ深色系

/** 進捗バーの塗り色（design.pen ProgressFill）。 */
export const PACE_BAR_COLORS: Record<PaceLevel, string> = {
  safe: colors.accentGreenBright,
  warning: colors.accentYellow,
  over: colors.accentRed,
};

/** 残り時間の特大数字の色（design.pen TimerTime: safe は ink のまま）。 */
export const PACE_TIME_COLORS: Record<PaceLevel, string> = {
  safe: colors.ink,
  warning: colors.accentYellowDeep,
  over: colors.accentRedDeep,
};

/** レベル未定（現項目無し等）のときのフォールバック色。 */
export const PACE_COLOR_FALLBACK = "#6b7280";

export function paceBarColor(level: PaceLevel | undefined): string {
  return level === undefined ? PACE_COLOR_FALLBACK : PACE_BAR_COLORS[level];
}

export function paceTimeColor(level: PaceLevel | undefined): string {
  return level === undefined ? PACE_COLOR_FALLBACK : PACE_TIME_COLORS[level];
}

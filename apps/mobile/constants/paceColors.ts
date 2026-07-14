import type { PaceLevel } from "@agenda-timer/core-logic";
import { colors } from "./theme";

// 押し/巻きレベルの配色（docs/06: 緑=余裕 / 黄=残りわずか / 赤=超過）。
// レベル判定は core-logic の getPaceLevel が担い、UI は色への写像のみ持つ。
// 色は design.pen のデザイントークン（accent-green / accent-yellow-deep / accent-red-deep）と一致させる。

export const PACE_COLORS: Record<PaceLevel, string> = {
  safe: colors.accentGreen,
  warning: colors.accentYellowDeep,
  over: colors.accentRedDeep,
};

/** レベル未定（現項目無し等）のときのフォールバック色。 */
export const PACE_COLOR_FALLBACK = "#6b7280";

export function paceColor(level: PaceLevel | undefined): string {
  return level === undefined ? PACE_COLOR_FALLBACK : PACE_COLORS[level];
}

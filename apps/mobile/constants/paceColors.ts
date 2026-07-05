import type { PaceLevel } from "@agenda-timer/core-logic";

// 押し/巻きレベルの配色（docs/06: 緑=余裕 / 黄=残りわずか / 赤=超過）。
// レベル判定は core-logic の getPaceLevel が担い、UI は色への写像のみ持つ。

export const PACE_COLORS: Record<PaceLevel, string> = {
  safe: "#16a34a",
  warning: "#ca8a04",
  over: "#dc2626",
};

/** レベル未定（現項目無し等）のときのフォールバック色。 */
export const PACE_COLOR_FALLBACK = "#6b7280";

export function paceColor(level: PaceLevel | undefined): string {
  return level === undefined ? PACE_COLOR_FALLBACK : PACE_COLORS[level];
}

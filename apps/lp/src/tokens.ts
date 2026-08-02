import type { CSSProperties } from "react";

// design.pen の変数定義（8b06d39 時点）と 1:1 対応
export const INK = "#14171A";
export const ACCENT_GREEN = "#16803D";
export const ACCENT_GREEN_BRIGHT = "#22C55E";
export const ACCENT_YELLOW = "#EAB308";
export const ACCENT_YELLOW_DEEP = "#CA8A04";
export const ACCENT_RED = "#EF4444";
export const ACCENT_RED_DEEP = "#DC2626";

export const GLASS_FILL = "rgba(255,255,255,0.4)";
export const GLASS_FILL_STRONG = "rgba(255,255,255,0.6)";
export const GLASS_STROKE = "rgba(255,255,255,0.7)";
export const GLASS_SHADOW = "rgba(20,23,26,0.12)";
export const GLASS_DARK_FILL = "rgba(20,23,26,0.6)";
export const GLASS_DARK_STROKE = "rgba(255,255,255,0.2)";

export const FONT_DISPLAY = "'Space Grotesk', sans-serif";
export const FONT_EYEBROW = "'Inter', sans-serif";

export function glassBlur(): CSSProperties {
  return {
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  };
}

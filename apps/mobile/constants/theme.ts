// design.pen のデザイントークンをそのまま定数化したもの（Pencil MCP で取得した variables に対応）。
// フォントはシステムフォントで近似する方針のため font-body / font-display は取り込まない。

export const colors = {
  ink: "#14171A",
  bg: "#EEF3EF",
  bgGradA: "#DFF0E4",
  bgGradB: "#F4F1E4",
  bgGradC: "#E3EEF6",
  accentGreen: "#16803D",
  accentGreenBright: "#22C55E",
  accentRed: "#EF4444",
  accentRedDeep: "#DC2626",
  accentYellow: "#EAB308",
  accentYellowDeep: "#CA8A04",
  glassFill: "#FFFFFF66",
  glassFillStrong: "#FFFFFF99",
  glassStroke: "#FFFFFFB3",
  glassShadow: "#14171A1F",
  glassDarkFill: "#14171A99",
  glassDarkStroke: "#FFFFFF33",
} as const;

/** PhoneMock の背景に使う斜めグラデーション（放射グラデーション3枚の近似）。 */
export const backgroundGradientColors = [colors.bgGradA, colors.bg, colors.bgGradC] as const;

export const radius = {
  pill: 100,
  card: 16,
} as const;

import { Platform } from "react-native";

// design.pen のデザイントークンをそのまま定数化したもの（Pencil MCP で取得した variables に対応）。
// フォントはシステムフォントで近似する方針のため font-body / font-display は取り込まない。

// Android は backdrop blur 非対応（BlurView は PR #91 で非描画）に加え、elevation の影が
// 半透明背景を透けて中身を濁らせるため、ガラス系トークンは backgroundBase(#ECF2E9) と
// 事前合成した単色で代替する。iOS / web は design.pen の半透明値をそのまま使う。
const isAndroid = Platform.OS === "android";

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
  glassFill: isAndroid ? "#F4F7F2" : "#FFFFFF66",
  glassFillStrong: isAndroid ? "#F7FAF6" : "#FFFFFF99",
  glassStroke: isAndroid ? "#F9FBF8" : "#FFFFFFB3",
  glassShadow: "#14171A1F",
  glassDarkFill: "#14171A99",
  glassDarkStroke: "#FFFFFF33",
} as const;

/** design.pen PhoneMock 背景のベース色。 */
export const backgroundBase = "#ECF2E9";

/**
 * design.pen PhoneMock 背景の放射グラデーション3枚（緑・青・黄）。
 * cx/cy はデザインの center、rx/ry はデザインの size（楕円直径比）の半分。
 */
export const backgroundBlobs = [
  { color: "#9EDDBB", cx: "15%", cy: "12%", rx: "65%", ry: "45%" },
  { color: "#9CC9E8", cx: "90%", cy: "42%", rx: "60%", ry: "42.5%" },
  { color: "#EFDFA8", cx: "40%", cy: "95%", rx: "75%", ry: "45%" },
] as const;

export const radius = {
  pill: 100,
  card: 16,
} as const;

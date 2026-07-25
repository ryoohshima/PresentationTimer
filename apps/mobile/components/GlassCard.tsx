import { BlurView } from "expo-blur";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, StyleSheet, View } from "react-native";
import { colors, radius } from "../constants/theme";

// design.pen のガラスモーフィズムカード（背景ブラー + 半透明の白 + 縁取り + 影）。
// background_blur（glass-blur 24）は expo-blur で表現する。web は backdrop-filter
// 上限（intensity 100 = 20px）に丸める。Android はネイティブ非対応で BlurView が
// 半透明白の単色レイヤーに退化し、fill と二重合成されて枠色と食い違うため描画しない。

interface GlassCardProps {
  children: React.ReactNode;
  /** true で glass-fill-strong（より不透明な白）を使う。 */
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, strong = false, style }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: strong ? colors.glassFillStrong : colors.glassFill },
        style,
      ]}
    >
      {Platform.OS !== "android" && (
        <BlurView intensity={100} tint="light" style={styles.blur} pointerEvents="none" />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    boxShadow: "0px 8px 12px rgba(20, 23, 26, 0.12)",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card,
    overflow: "hidden",
  },
});

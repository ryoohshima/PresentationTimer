import { BlurView } from "expo-blur";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "../constants/theme";

// design.pen のガラスモーフィズムカード（背景ブラー + 半透明の白 + 縁取り + 影）。
// background_blur（glass-blur 24）は expo-blur で表現する。web は backdrop-filter
// 上限（intensity 100 = 20px）に丸め、Android はネイティブ非対応のため半透明フィルへ退化する。

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
      <BlurView intensity={100} tint="light" style={styles.blur} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card,
    overflow: "hidden",
  },
});

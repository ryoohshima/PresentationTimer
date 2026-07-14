import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "../constants/theme";

// design.pen のガラスモーフィズムカード（半透明の白 + 縁取り + 影）の近似。
// 実機ブラー（background_blur）は使わず、半透明フィルのみで質感を表現する。

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
});

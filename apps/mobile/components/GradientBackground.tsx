import { LinearGradient } from "expo-linear-gradient";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { backgroundGradientColors } from "../constants/theme";

// design.pen の PhoneMock 背景（放射グラデーション3枚）を、斜めの線形グラデーションで近似する。
// 全画面（①②③）で共通の背景として使う。
// 端末のセーフエリア（ノッチ・ステータスバー・ホームインジケータ）はここで一括して吸収する。

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={backgroundGradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.fill,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

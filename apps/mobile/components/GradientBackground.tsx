import { useId } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { backgroundBase, backgroundBlobs } from "../constants/theme";

// design.pen の PhoneMock 背景（ベース色 + 放射グラデーション3枚）を react-native-svg で再現する。
// 全画面（①②③）で共通の背景として使う。
// 端末のセーフエリア（ノッチ・ステータスバー・ホームインジケータ）はここで一括して吸収する。

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  const insets = useSafeAreaInsets();
  // web では SVG の id がドキュメント全体で共有されるため、スタック内に複数画面が
  // 同時マウントされると同名 id が衝突してグラデーションが描画されない。画面ごとに一意化する。
  const idPrefix = `bg-blob-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;

  return (
    <View style={styles.fill}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {backgroundBlobs.map((blob, index) => (
            <RadialGradient key={blob.color} id={`${idPrefix}-${index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={blob.color} stopOpacity={1} />
              <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {backgroundBlobs.map((blob, index) => (
          <Ellipse
            key={blob.color}
            cx={blob.cx}
            cy={blob.cy}
            rx={blob.rx}
            ry={blob.ry}
            fill={`url(#${idPrefix}-${index})`}
          />
        ))}
      </Svg>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: backgroundBase,
  },
  content: {
    flex: 1,
  },
});

import { BlurView } from "expo-blur";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../constants/theme";

// design.pen の PillButton コンポーネント（primary=緑塗り / secondary=半透明白）。
// secondary はガラス面のため background_blur を expo-blur で表現する
// （primary は 80% 不透明の緑塗りでブラーがほぼ見えないため適用しない）。
// Android は GlassCard と同じくブラー退化による二重合成を避けるため描画しない。

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: PillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant === "secondary" && Platform.OS !== "android" && (
        <BlurView intensity={100} tint="light" style={styles.blur} pointerEvents="none" />
      )}
      <Text style={variant === "primary" ? styles.primaryLabel : styles.secondaryLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  primary: {
    // Android は半透明緑(80%)だと elevation の影が透けて濁るため、
    // backgroundBase と事前合成した単色で代替する（theme.ts のガラス系トークンと同方針）。
    backgroundColor: Platform.OS === "android" ? "#41975F" : `${colors.accentGreen}CC`,
    borderWidth: 1,
    borderColor: "#FFFFFF59",
    boxShadow: "0px 8px 24px rgba(22, 128, 61, 0.25)",
  },
  secondary: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  disabled: {
    opacity: 0.4,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
});

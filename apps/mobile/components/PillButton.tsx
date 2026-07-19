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
    backgroundColor: `${colors.accentGreen}CC`,
    borderWidth: 1,
    borderColor: "#FFFFFF59",
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
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

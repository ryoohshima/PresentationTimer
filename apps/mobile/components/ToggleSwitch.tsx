import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// design.pen の Toggle コンポーネント（緑=ON / 半透明黒=OFF、ノブが左右に動く）の近似。

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const TRACK_PADDING = 4;
const KNOB_SIZE = 24;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - TRACK_PADDING * 2;

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel?: string;
}

export function ToggleSwitch({ value, onValueChange, accessibilityLabel }: ToggleSwitchProps) {
  const knobPosition = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    knobPosition.value = withTiming(value ? 1 : 0, { duration: 150 });
  }, [value, knobPosition]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knobPosition.value * KNOB_TRAVEL }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      style={[styles.track, { backgroundColor: value ? "#22C55ED9" : "#14171A29" }]}
    >
      <Animated.View style={[styles.knob, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT,
    padding: TRACK_PADDING,
    borderWidth: 1,
    borderColor: "#FFFFFF80",
    justifyContent: "center",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 2px 6px rgba(20, 23, 26, 0.2)",
  },
});

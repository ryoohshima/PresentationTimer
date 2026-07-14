import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { colors } from "../constants/theme";

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
  const knobPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(knobPosition, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [value, knobPosition]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      style={[styles.track, { backgroundColor: value ? "#22C55ED9" : "#14171A29" }]}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: knobPosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, KNOB_TRAVEL],
                }),
              },
            ],
          },
        ]}
      />
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
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
});

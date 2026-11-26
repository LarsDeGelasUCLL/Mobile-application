import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Platform } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  testID?: string;
}

/** A pulsing placeholder block; holds still when the OS asks for reduced motion. */
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 4,
  testID,
}: SkeletonProps) {
  const styles = useStyles();
  const [opacity] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(false);

  // Follow the reduce-motion setting, also when it changes while mounted.
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion, () => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          // The native driver does not exist on web.
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius, opacity }]}
      testID={testID}
    />
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    backgroundColor: t.colors.surfaceTint,
  },
}));

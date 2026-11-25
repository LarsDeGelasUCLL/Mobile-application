import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../theme/ThemeProvider";
import { toneColor, type Tone } from "../../theme/tone";

export type IconName = ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  tone?: Tone;
  testID?: string;
}

export function Icon({
  name,
  size = 24,
  tone = "default",
  testID,
}: IconProps) {
  const { colors } = useTheme();
  // Decorative: every icon sits beside visible text or inside a labelled control.
  return (
    <Ionicons
      name={name}
      size={size}
      color={toneColor(colors, tone)}
      aria-hidden
      testID={testID}
    />
  );
}

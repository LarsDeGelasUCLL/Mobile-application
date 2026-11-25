import { ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { toneColor, type Tone } from "../../theme/tone";

interface SpinnerProps {
  size?: "small" | "large";
  tone?: Tone;
  testID?: string;
}

export function Spinner({
  size = "small",
  tone = "primary",
  testID,
}: SpinnerProps) {
  const { colors } = useTheme();
  return (
    <ActivityIndicator
      size={size}
      color={toneColor(colors, tone)}
      style={{ padding: 4 }}
      testID={testID}
    />
  );
}

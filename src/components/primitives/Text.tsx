import { Text as RNText } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { fontFamily, typeScale } from "../../theme/tokens";

interface TextProps {
  children: React.ReactNode;
  size?: keyof typeof typeScale;
  weight?: "normal" | "medium" | "bold";
  align?: "left" | "center" | "right";
  color?: string;
  numberOfLines?: number;
}

// Design allows only 400/600/700; "medium" renders as 600.
// as const: a readonly map of literal weights; it narrows, it asserts no type.
const familyByWeight = {
  normal: fontFamily.regular,
  medium: fontFamily.semibold,
  bold: fontFamily.bold,
} as const;

export function Text({
  children,
  size = "md",
  weight = "normal",
  align = "left",
  color,
  numberOfLines,
}: TextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        typeScale[size],
        {
          fontFamily: familyByWeight[weight],
          textAlign: align,
          color: color ?? colors.text,
        },
      ]}
    >
      {children}
    </RNText>
  );
}

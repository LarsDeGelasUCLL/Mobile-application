import { Text as RNText, StyleSheet } from "react-native";

interface TextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "bold";
  align?: "left" | "center" | "right";
  color?: string;
}

export function Text({
  children,
  size = "md",
  weight = "normal",
  align = "left",
  color = "#111827",
}: TextProps) {
  return (
    <RNText style={[styles[size], styles[weight], { textAlign: align, color }]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 16, lineHeight: 22 },
  lg: { fontSize: 20, lineHeight: 28 },
  xl: { fontSize: 26, lineHeight: 34 },
  normal: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  bold: { fontWeight: "700" },
});

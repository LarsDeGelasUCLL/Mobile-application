import { View, StyleSheet } from "react-native";
import { Text } from "./Text";

interface ToastProps {
  message: string;
  variant?: "default" | "success" | "error";
  visible: boolean;
}

export function Toast({ message, variant = "default", visible }: ToastProps) {
  if (!visible) return null;

  return (
    <View style={[styles.base, styles[variant]]}>
      <Text size="sm" weight="medium" color="#FFFFFF">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 50,
  },
  default: { backgroundColor: "#1F2937" },
  success: { backgroundColor: "#059669" },
  error: { backgroundColor: "#DC2626" },
});

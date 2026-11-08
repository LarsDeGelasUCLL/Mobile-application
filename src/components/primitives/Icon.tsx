import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, type ColorValue } from "react-native";

export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IoniconsName;
  size?: number;
  color?: ColorValue;
}

export function Icon({ name, size = 24, color = "#374151" }: IconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color as any}
      style={styles.base}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});

import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "./primitives";
import { colors } from "../types/theme";

interface BrandHeaderProps {
  title: string;
  iconName?: ComponentProps<typeof Icon>["name"];
  testID?: string;
}

export function BrandHeader({
  title,
  iconName = "people",
  testID = "brand-header",
}: BrandHeaderProps) {
  return (
    <View style={styles.brand} testID={testID}>
      <View style={styles.brandMark}>
        <Icon name={iconName} size={28} color="#FFFFFF" />
      </View>
      <Text size="sm" weight="bold" color={colors.primary}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  brandMark: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
});

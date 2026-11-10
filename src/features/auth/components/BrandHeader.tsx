import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "../../../components/primitives";
import { colors } from "../../../theme/colors";

interface BrandHeaderProps {
  title: string;
  iconName?: ComponentProps<typeof Icon>["name"];
  testID?: string;
}

// TODO: find a logo and implement it in the header of my app.
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
      <Text size="md" weight="bold" color={colors.primary}>
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
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
});

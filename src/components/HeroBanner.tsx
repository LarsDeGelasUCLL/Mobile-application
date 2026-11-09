import { StyleSheet, View } from "react-native";
import { Icon, Text } from "./primitives";
import { colors } from "../types/theme";

interface HeroBannerProps {
  badgeText: string;
  title: string;
  description: string;
  footerText: string;
  testID?: string;
}

export function HeroBanner({
  badgeText,
  title,
  description,
  footerText,
  testID = "hero-banner",
}: HeroBannerProps) {
  return (
    <View style={styles.hero} testID={testID}>
      <View style={styles.heroLabel}>
        <Icon name="sparkles-outline" size={17} color="#FFFFFF" />
        <Text size="sm" weight="medium" color="#FFFFFF">
          {badgeText}
        </Text>
      </View>
      <Text size="xl" weight="bold" color="#FFFFFF">
        {title}
      </Text>
      <Text color="#EEE8FB">{description}</Text>
      <View style={styles.heroFooter}>
        <Icon name="people-outline" size={18} color="#E3D8FA" />
        <Text size="sm" color="#EEE8FB">
          {footerText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 14,
    padding: 22,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
  },
  heroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#765DB4",
  },
});

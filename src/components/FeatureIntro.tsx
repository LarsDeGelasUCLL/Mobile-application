import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "./primitives";
import { colors } from "../types/theme";

interface FeatureIntroProps {
  iconName: ComponentProps<typeof Icon>["name"];
  title: string;
  description: string;
  testID?: string;
}

export function FeatureIntro({
  iconName,
  title,
  description,
  testID = "feature-intro",
}: FeatureIntroProps) {
  return (
    <View style={styles.intro} testID={testID}>
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={24} color={colors.primary} />
      </View>
      <Text size="lg" weight="bold">
        {title}
      </Text>
      <Text align="center" color={colors.muted}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
});

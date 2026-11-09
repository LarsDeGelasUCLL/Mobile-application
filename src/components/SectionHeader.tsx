import { StyleSheet, View } from "react-native";
import { Badge, Stack, Text } from "./primitives";
import { colors } from "../types/theme";

interface SectionHeaderProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  testID?: string;
}

export function SectionHeader({
  title,
  description,
  badgeLabel,
  testID = "section-header",
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeading} testID={testID}>
      <View style={styles.copy}>
        <Stack gap="sm">
          <Text size="md" weight="bold">
            {title}
          </Text>
          {description !== undefined && (
            <Text size="sm" color={colors.muted}>
              {description}
            </Text>
          )}
        </Stack>
      </View>
      {badgeLabel !== undefined && <Badge label={badgeLabel} />}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: {
    flex: 1,
  },
});

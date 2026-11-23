import { View } from "react-native";
import { Badge, Stack, Text } from "../primitives";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

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
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeading} testID={testID}>
      <View style={styles.copy}>
        <Stack gap="sm">
          <Text size="md" weight="bold">
            {title}
          </Text>
          {description !== undefined && (
            <Text size="sm" color={colors.textMuted}>
              {description}
            </Text>
          )}
        </Stack>
      </View>
      {badgeLabel !== undefined && <Badge label={badgeLabel} />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.md,
  },
  copy: {
    flex: 1,
  },
}));

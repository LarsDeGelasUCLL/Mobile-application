import type { ComponentProps } from "react";
import { View } from "react-native";
import { Icon, Text } from "../../../components/primitives";
import { makeStyles, useTheme } from "../../../theme/ThemeProvider";

interface BrandHeaderProps {
  iconName?: ComponentProps<typeof Icon>["name"];
  testID?: string;
}

/** Brand mark + "Laruna" wordmark. The view's own title goes below it. */
export function BrandHeader({
  iconName = "people",
  testID = "brand-header",
}: BrandHeaderProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.brand} testID={testID}>
      <View style={styles.brandMark}>
        <Icon name={iconName} size={28} color={colors.onPrimary} />
      </View>
      <Text size="md" weight="bold" color={colors.primaryText}>
        Laruna
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  brand: {
    alignItems: "center",
    gap: t.spacing.md,
    marginBottom: t.spacing.xl,
  },
  brandMark: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primary,
  },
}));

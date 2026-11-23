import type { ComponentProps } from "react";
import { View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: ComponentProps<typeof Icon>["name"];
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.base}>
      {icon !== undefined && (
        <Icon name={icon} size={32} color={colors.primaryText} />
      )}
      <Text size="lg" weight="bold" align="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text align="center" color={colors.textMuted}>
          {description}
        </Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    alignItems: "center",
    justifyContent: "center",
    padding: t.spacing.xxl,
    gap: t.spacing.sm,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.primaryBorder,
    borderStyle: "dashed",
  },
  action: {
    marginTop: t.spacing.md,
    width: "100%",
  },
}));

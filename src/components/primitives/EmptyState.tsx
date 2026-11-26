import type { ComponentProps } from "react";
import { View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** E.g. a button that creates the first item. */
  action?: React.ReactNode;
  icon?: ComponentProps<typeof Icon>["name"];
  testID?: string;
}

/** Placeholder card (dashed border) for a list with nothing in it yet. */
export function EmptyState({
  title,
  description,
  action,
  icon,
  testID,
}: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.base} testID={testID}>
      {icon !== undefined && <Icon name={icon} size={32} tone="primary" />}
      <Text size="lg" weight="bold" align="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text align="center" tone="muted">
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

import { Pressable, View } from "react-native";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface ListRowProps {
  label: string;
  icon?: IconName;
  /** Replaces icon (e.g. an avatar). */
  leading?: React.ReactNode;
  description?: string;
  value?: string;
  /** Replaces value + chevron (e.g. a switch, avatar, badge). */
  trailing?: React.ReactNode;
  /** Makes the row pressable and shows a chevron. */
  onPress?: () => void;
  /** Red label, for "Log out", "Leave group", ... */
  destructive?: boolean;
  testID?: string;
}

/** A settings-style row: icon, label, optional description and a value or custom trailing element. */
export function ListRow({
  label,
  icon,
  leading,
  description,
  value,
  trailing,
  onPress,
  destructive = false,
  testID,
}: ListRowProps) {
  const styles = useStyles();
  const { iconSize } = useTheme();

  const content = (
    <>
      {leading ??
        (icon !== undefined && (
          <Icon
            name={icon}
            size={iconSize.md}
            tone={destructive ? "error" : "primary"}
          />
        ))}
      <View style={styles.copy}>
        <Text
          weight="medium"
          tone={destructive ? "error" : "default"}
          numberOfLines={1}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" tone="muted">
            {description}
          </Text>
        )}
      </View>
      {trailing ?? (
        <>
          {value !== undefined && (
            <Text
              size="sm"
              tone="muted"
              numberOfLines={1}
              align="right"
            >
              {value}
            </Text>
          )}
          {onPress !== undefined && !destructive && (
            <Icon
              name="chevron-forward"
              size={iconSize.md}
              tone="muted"
            />
          )}
        </>
      )}
    </>
  );

  if (onPress === undefined) {
    return (
      <View style={styles.base} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value !== undefined ? `${label}, ${value}` : label}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    minHeight: t.controlSize.row,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    backgroundColor: t.colors.surface,
  },
  copy: { flex: 1, gap: 2 },
  pressed: { backgroundColor: t.colors.surfaceTint },
}));

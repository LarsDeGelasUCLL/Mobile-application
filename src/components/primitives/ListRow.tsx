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
  const { colors, iconSize } = useTheme();
  const labelColor = destructive ? colors.error : colors.text;

  const content = (
    <>
      {leading ??
        (icon !== undefined && (
          <Icon
            name={icon}
            size={iconSize.md}
            color={destructive ? colors.error : colors.primaryText}
          />
        ))}
      <View style={styles.copy}>
        <Text weight="medium" color={labelColor} numberOfLines={1}>
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" color={colors.textMuted}>
            {description}
          </Text>
        )}
      </View>
      {trailing ?? (
        <>
          {value !== undefined && (
            <Text
              size="sm"
              color={colors.textMuted}
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
              color={colors.textMuted}
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
    minHeight: 52,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    backgroundColor: t.colors.surface,
  },
  copy: { flex: 1, gap: 2 },
  pressed: { backgroundColor: t.colors.surfaceTint },
}));

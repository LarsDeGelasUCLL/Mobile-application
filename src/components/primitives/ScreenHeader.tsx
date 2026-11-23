import { View } from "react-native";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back arrow left of the title. */
  onBack?: () => void;
  /** Max 2 `IconButton`s (design §4). */
  actions?: React.ReactNode;
  testID?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  actions,
  testID,
}: ScreenHeaderProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.base} testID={testID}>
      {onBack !== undefined && (
        <IconButton
          icon="arrow-back"
          accessibilityLabel="Go back"
          onPress={onBack}
          color={colors.text}
          testID={testID !== undefined ? `${testID}-back` : undefined}
        />
      )}
      <View style={styles.copy}>
        <Text
          size={onBack !== undefined ? "xl" : "xxl"}
          weight="bold"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text size="sm" color={colors.textMuted}>
            {subtitle}
          </Text>
        )}
      </View>
      {actions !== undefined && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.xs,
    minHeight: 56,
  },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: "row", alignItems: "center" },
}));

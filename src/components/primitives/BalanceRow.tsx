import { View } from "react-native";
import { Avatar } from "./Avatar";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";
import { describeBalance } from "../../utils/money";

interface BalanceRowProps {
  name: string;
  /** Net balance in EUR: > 0 gets back, < 0 owes. */
  amount: number;
  avatarUri?: string;
  testID?: string;
}

/** Sign + words + colour, never colour alone (design §3.1). */
export function BalanceRow({
  name,
  amount,
  avatarUri,
  testID,
}: BalanceRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const balance = describeBalance(amount);
  const toneColor =
    balance.tone === "muted" ? colors.textMuted : colors[balance.tone];

  return (
    <View
      style={styles.base}
      testID={testID}
      accessible
      accessibilityLabel={`${name} ${balance.label} ${balance.amount}`}
    >
      <Avatar name={name} uri={avatarUri} size="sm" />
      <View style={styles.name}>
        <Text weight="medium" numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.amount}>
        <Text weight="bold" color={toneColor} align="right">
          {balance.amount}
        </Text>
        <Text size="xs" color={toneColor} align="right">
          {balance.label}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    minHeight: 52,
    paddingVertical: t.spacing.sm,
  },
  name: { flex: 1 },
  amount: { alignItems: "flex-end" },
}));

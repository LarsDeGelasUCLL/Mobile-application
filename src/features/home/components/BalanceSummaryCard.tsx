import { View } from "react-native";
import { Card, Row, Skeleton, Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { makeStyles } from "../../../theme/ThemeProvider";
import { describeBalance } from "../../../utils/money";

interface BalanceSummaryCardProps {
  /** Open amount others owe the user. */
  youAreOwed: number;
  /** Open amount the user owes others, as a positive number. */
  youOwe: number;
  /** Shows a skeleton instead of the amounts. */
  isLoading: boolean;
  testID?: string;
}

/** "Personal expenses": what the user gets back and what they owe. */
export function BalanceSummaryCard({
  youAreOwed,
  youOwe,
  isLoading,
  testID,
}: BalanceSummaryCardProps) {
  const styles = useStyles();
  const { t, locale } = useI18n();
  const balances = [
    { label: t("home.balance.youGetBack"), balance: describeBalance(youAreOwed, locale) },
    { label: t("home.balance.youOwe"), balance: describeBalance(-youOwe, locale) },
  ];
  return (
    <Card>
      <View style={styles.summary} testID={testID}>
        <Text size="sm" tone="muted">
          {t("home.balance.title")}
        </Text>
        {isLoading ? (
          <Skeleton height={28} width="70%" />
        ) : (
          <Row gap="md">
            {balances.map(({ label, balance }) => (
              <View
                key={label}
                style={styles.balance}
                accessible
                accessibilityLabel={`${label} ${balance.amount}`}
              >
                <Text size="sm" tone="muted">
                  {label}
                </Text>
                <Text size="xl" weight="bold" tone={balance.tone}>
                  {balance.amount}
                </Text>
              </View>
            ))}
          </Row>
        )}
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  summary: { gap: t.spacing.sm },
  balance: { flex: 1, gap: t.spacing.xs },
}));

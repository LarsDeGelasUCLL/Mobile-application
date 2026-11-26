import {
  Card,
  Row,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseSplitDto } from "../../../types";

interface SplitRowProps {
  split: ExpenseSplitDto;
  isPayer: boolean;
  /** Shows the settle/unsettle button (see `canSettleSplit`). */
  canSettle: boolean;
  isLoading: boolean;
  onToggleSettled: () => void;
  testID?: string;
}

/** One share of an expense: who, settled or not, amount, settle button. */
export function SplitRow({
  split,
  isPayer,
  canSettle,
  isLoading,
  onToggleSettled,
  testID,
}: SplitRowProps) {
  const { t, locale } = useI18n();
  const participantName =
    split.userProfile?.displayName ?? t("expenses.split.participant");
  return (
    <Card testID={testID}>
      <Row justify="space-between" align="center">
        <Stack gap="none" flex={1}>
          <Text weight="medium">
            {isPayer
              ? t("expenses.split.payer", { name: participantName })
              : participantName}
          </Text>
          <Text size="sm" tone="muted">
            {t(
              split.isSettled
                ? "expenses.split.settled"
                : "expenses.split.notSettled",
            )}
          </Text>
        </Stack>
        <Stack gap="sm" align="flex-end">
          <Text weight="bold">{formatCurrency(split.amountOwed, locale)}</Text>
          {canSettle ? (
            <StyledButton
              label={t(
                split.isSettled
                  ? "expenses.split.unsettle"
                  : "expenses.split.settle",
              )}
              onPress={onToggleSettled}
              variant="secondary"
              isLoading={isLoading}
              testID={`settle-split-${split.id}`}
            />
          ) : null}
        </Stack>
      </Row>
    </Card>
  );
}

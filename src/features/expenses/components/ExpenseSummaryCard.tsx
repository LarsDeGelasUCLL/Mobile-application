import { Badge, Card, Row, Stack, Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { formatDateTime } from "../../../utils/dates";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseDto } from "../../../types";

/** Expense detail summary: title, type, amount, payer, creator, date, receipt. */
export function ExpenseSummaryCard({
  expense,
  testID,
}: {
  expense: ExpenseDto;
  testID?: string;
}) {
  const { t, locale } = useI18n();
  return (
    <Card testID={testID}>
      <Stack gap="sm">
        <Row justify="space-between" align="center">
          <Text size="lg" weight="bold">
            {expense.title}
          </Text>
          <Badge
            label={t(
              expense.groupId
                ? "expenses.badge.group"
                : "expenses.badge.personal",
            )}
          />
        </Row>
        <Text size="xxl" weight="bold">
          {formatCurrency(expense.amount, locale)}
        </Text>
        <Text size="sm" tone="muted">
          {t("expenses.paidBy", {
            name:
              expense.paidByProfile?.displayName ??
              t("expenses.participantFallback"),
          })}
        </Text>
        <Text size="sm" tone="muted">
          {t("expenses.createdBy", {
            name:
              expense.createdByProfile?.displayName ??
              expense.paidByProfile?.displayName ??
              t("expenses.participantFallback"),
          })}
        </Text>
        <Text size="sm" tone="muted">
          {formatDateTime(expense.recordCreated, locale)}
        </Text>
        {expense.receiptUrl ? (
          <Text size="sm" tone="muted">
            {t("expenses.receipt", { url: expense.receiptUrl })}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

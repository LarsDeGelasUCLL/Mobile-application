import { Badge, Card, Row, Stack, Text } from "../../../components/primitives";
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
  return (
    <Card testID={testID}>
      <Stack gap="sm">
        <Row justify="space-between" align="center">
          <Text size="lg" weight="bold">
            {expense.title}
          </Text>
          <Badge label={expense.groupId ? "Group expense" : "Personal"} />
        </Row>
        <Text size="xxl" weight="bold">
          {formatCurrency(expense.amount)}
        </Text>
        <Text size="sm" tone="muted">
          Paid by {expense.paidByProfile?.displayName ?? "A participant"}
        </Text>
        <Text size="sm" tone="muted">
          Created by{" "}
          {expense.createdByProfile?.displayName ??
            expense.paidByProfile?.displayName ??
            "A participant"}
        </Text>
        <Text size="sm" tone="muted">
          {new Date(expense.recordCreated).toLocaleString()}
        </Text>
        {expense.receiptUrl ? (
          <Text size="sm" tone="muted">
            Receipt: {expense.receiptUrl}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

import {
  Card,
  Row,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
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
  return (
    <Card testID={testID}>
      <Row justify="space-between" align="center">
        <Stack gap="none" flex={1}>
          <Text weight="medium">
            {split.userProfile?.displayName ?? "Participant"}
            {isPayer ? " (payer)" : ""}
          </Text>
          <Text size="sm" tone="muted">
            {split.isSettled ? "Settled" : "Not settled"}
          </Text>
        </Stack>
        <Stack gap="sm" align="flex-end">
          <Text weight="bold">{formatCurrency(split.amountOwed)}</Text>
          {canSettle ? (
            <StyledButton
              label={split.isSettled ? "Unsettle" : "Settle"}
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

import { EmptyState, StyledButton } from "../../../components/primitives";

interface ExpenseMissingStateProps {
  /** The page deleted it, but the group balances did not refresh. */
  deleted?: boolean;
  /** Shows a "Go back" button. */
  onBack?: () => void;
  testID?: string;
}

/** Empty state when the expense is not (or no longer) there. */
export function ExpenseMissingState({
  deleted = false,
  onBack,
  testID,
}: ExpenseMissingStateProps) {
  return (
    <EmptyState
      title={deleted ? "Expense deleted" : "Expense unavailable"}
      description={
        deleted
          ? "The expense was deleted, but group balances still need to be refreshed."
          : "This expense could not be found or you do not have access to it."
      }
      action={
        onBack ? (
          <StyledButton label="Go back" onPress={onBack} variant="secondary" />
        ) : undefined
      }
      testID={testID}
    />
  );
}

import { EmptyState, StyledButton } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

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
  const { t } = useI18n();
  return (
    <EmptyState
      title={t(
        deleted
          ? "expenses.missing.deletedTitle"
          : "expenses.missing.unavailableTitle",
      )}
      description={t(
        deleted
          ? "expenses.missing.deletedText"
          : "expenses.missing.unavailableText",
      )}
      action={
        onBack ? (
          <StyledButton label={t("common.goBack")} onPress={onBack} variant="secondary" />
        ) : undefined
      }
      testID={testID}
    />
  );
}

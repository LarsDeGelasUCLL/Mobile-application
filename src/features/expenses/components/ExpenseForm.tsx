import { useImperativeHandle, useReducer, type Ref } from "react";
import {
  Card,
  FeedbackBanner,
  InputField,
  Stack,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import {
  validateExpenseForm,
  type ValidExpenseForm,
} from "../../../services/expenses/expenseValidation";
import type { ExpenseDto, PublicUserProfileDto } from "../../../types";
import {
  expenseFormReducer,
  initialExpenseFormState,
} from "../expenseFormState";
import { PaidByPicker } from "./PaidByPicker";
import { SplitAmountRow } from "./SplitAmountRow";
import { SplitBetween } from "./SplitBetween";

interface ExpenseFormProps {
  /** `null` for a personal expense. */
  groupId: string | null;
  currentUserId: string;
  /** Who may pay or take a share. */
  participants: PublicUserProfileDto[];
  /** Read once on mount; give the form `key={expense.id}` to reset it. */
  initialExpense?: ExpenseDto;
  isLoading: boolean;
  /** The store's save error, shown with a retry. */
  error: string | null;
  /** Called with the validated values only. */
  onSubmit: (payload: ValidExpenseForm) => Promise<void>;
  /** The page's sticky footer button calls `submit()`. */
  ref?: Ref<ExpenseFormHandle>;
}

/** What the parent can call through `ref`. */
export interface ExpenseFormHandle {
  submit: () => void;
}

/** The create / edit expense form: details, payer and how the amount is split. */
export function ExpenseForm({
  groupId,
  currentUserId,
  participants,
  initialExpense,
  isLoading,
  error,
  onSubmit,
  ref,
}: ExpenseFormProps) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(
    expenseFormReducer,
    { currentUserId, initialExpense },
    initialExpenseFormState,
  );
  const {
    title,
    amount,
    receiptUrl,
    paidByUserId,
    splitMode,
    splits,
    validationError,
  } = state;

  // Validate; show the first error, or hand the clean values to `onSubmit`.
  const handleSubmit = () => {
    const result = validateExpenseForm(
      { title, amount, receiptUrl, paidByUserId, splits },
      {
        groupId,
        currentUserId,
        allowedParticipantIds: participants.map(
          (participant) => participant.id,
        ),
      },
    );
    dispatch({
      type: "setValidationError",
      error: typeof result === "string" ? result : undefined,
    });
    if (typeof result !== "string") void onSubmit(result);
  };
  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <Stack gap="md">
      {error || validationError ? (
        <FeedbackBanner
          tone="error"
          message={validationError ? t(validationError) : (error ?? "")}
          onRetry={error ? handleSubmit : undefined}
          isRetrying={isLoading}
          testID="expense-form-error"
        />
      ) : null}

      <Card>
        <Stack gap="md">
          <InputField
            label={t("expenses.form.title")}
            value={title}
            onChangeText={(value) => dispatch({ type: "setTitle", value })}
            placeholder={t("expenses.form.titlePlaceholder")}
            testID="expense-title-input"
          />
          <InputField
            label={t("expenses.form.amount")}
            value={amount}
            onChangeText={(value) => dispatch({ type: "setAmount", value })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            testID="expense-amount-input"
          />
          <InputField
            label={t("expenses.form.receipt")}
            value={receiptUrl}
            onChangeText={(value) =>
              dispatch({ type: "setReceiptUrl", value })
            }
            placeholder={t("expenses.form.receiptPlaceholder")}
            testID="expense-receipt-input"
          />
        </Stack>
      </Card>

      <PaidByPicker
        participants={participants}
        currentUserId={currentUserId}
        paidByUserId={paidByUserId}
        onSelect={(userId) => dispatch({ type: "setPaidBy", userId })}
      />

      <SplitBetween
        participants={participants}
        currentUserId={currentUserId}
        selectedUserIds={splits.map((split) => split.userId)}
        splitMode={splitMode}
        onToggle={(userId, selected) =>
          dispatch({ type: "toggleParticipant", userId, selected, groupId })
        }
        onSplitModeChange={(mode) => dispatch({ type: "setSplitMode", mode })}
      >
        {splits.length === 0 ? (
          <Text size="sm" tone="muted">
            {t("expenses.form.selectParticipant")}
          </Text>
        ) : (
          <Stack gap="sm">
            {splits.map((split) => (
              <SplitAmountRow
                key={split.userId}
                name={
                  participants.find((item) => item.id === split.userId)
                    ?.displayName ?? t("groups.memberFallback")
                }
                amount={split.amount}
                editable={splitMode === "custom"}
                onChangeAmount={(value) =>
                  dispatch({
                    type: "setSplitAmount",
                    userId: split.userId,
                    value,
                  })
                }
                testID={`expense-split-${split.userId}`}
              />
            ))}
          </Stack>
        )}
      </SplitBetween>
    </Stack>
  );
}

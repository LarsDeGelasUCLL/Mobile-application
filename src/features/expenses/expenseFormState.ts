import {
  createEqualExpenseSplits,
  type ExpenseFormDraft,
} from "../../services/expenses/expenseValidation";
import type { TranslationKey } from "../../i18n";
import type { ExpenseDto } from "../../types";

export type ExpenseSplitDraft = ExpenseFormDraft["splits"][number];
export type SplitMode = "equal" | "custom";

export interface ExpenseFormState {
  title: string;
  amount: string;
  receiptUrl: string;
  paidByUserId: string;
  splitMode: SplitMode;
  splits: ExpenseSplitDraft[];
  validationError?: TranslationKey;
}

export type ExpenseFormAction =
  | { type: "setTitle"; value: string }
  | { type: "setAmount"; value: string }
  | { type: "setReceiptUrl"; value: string }
  | { type: "setPaidBy"; userId: string }
  | {
      type: "toggleParticipant";
      userId: string;
      selected: boolean;
      /** Personal expenses (null) move the payer to a remaining participant. */
      groupId: string | null;
    }
  | { type: "setSplitMode"; mode: SplitMode }
  | { type: "setSplitAmount"; userId: string; value: string }
  | { type: "setValidationError"; error: TranslationKey | undefined };

type InitialExpense = Pick<
  ExpenseDto,
  "title" | "amount" | "receiptUrl" | "paidByUserId"
> & { splits: Pick<ExpenseDto["splits"][number], "userId" | "amountOwed">[] };

/** Equal shares; zero shares while the amount is not a valid positive number. */
function equalSplitRows(
  amount: string,
  userIds: string[],
): ExpenseSplitDraft[] {
  if (userIds.length === 0) return [];
  try {
    return createEqualExpenseSplits(amount, userIds);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return userIds.map((userId) => ({ userId, amount: "0.00" }));
  }
}

/** A new expense: the current user pays and takes an equal share.
 * An existing expense: its values, with its splits as custom amounts. */
export function initialExpenseFormState({
  currentUserId,
  initialExpense,
}: {
  currentUserId: string;
  initialExpense?: InitialExpense;
}): ExpenseFormState {
  if (!initialExpense) {
    return {
      title: "",
      amount: "",
      receiptUrl: "",
      paidByUserId: currentUserId,
      splitMode: "equal",
      splits: [{ userId: currentUserId, amount: "0.00" }],
    };
  }
  return {
    title: initialExpense.title,
    amount: initialExpense.amount.toFixed(2),
    receiptUrl: initialExpense.receiptUrl ?? "",
    paidByUserId: initialExpense.paidByUserId,
    splitMode: "custom",
    splits: initialExpense.splits.map((split) => ({
      userId: split.userId,
      amount: split.amountOwed.toFixed(2),
    })),
  };
}

function toggleParticipant(
  state: ExpenseFormState,
  {
    userId,
    selected,
    groupId,
  }: { userId: string; selected: boolean; groupId: string | null },
): ExpenseFormState {
  const currentIds = state.splits.map((split) => split.userId);
  const userIds = selected
    ? [...currentIds, userId]
    : currentIds.filter((id) => id !== userId);
  const splits =
    state.splitMode === "equal"
      ? equalSplitRows(state.amount, userIds)
      : selected
        ? [...state.splits, { userId, amount: "0.00" }]
        : state.splits.filter((split) => split.userId !== userId);
  const paidByUserId =
    groupId === null && !userIds.includes(state.paidByUserId)
      ? (userIds[0] ?? "")
      : state.paidByUserId;
  return { ...state, splits, paidByUserId, validationError: undefined };
}

export function expenseFormReducer(
  state: ExpenseFormState,
  action: ExpenseFormAction,
): ExpenseFormState {
  switch (action.type) {
    case "setTitle":
      return { ...state, title: action.value, validationError: undefined };
    case "setAmount":
      return {
        ...state,
        amount: action.value,
        splits:
          state.splitMode === "equal"
            ? equalSplitRows(
                action.value,
                state.splits.map((split) => split.userId),
              )
            : state.splits,
        validationError: undefined,
      };
    case "setReceiptUrl":
      return { ...state, receiptUrl: action.value, validationError: undefined };
    case "setPaidBy":
      return { ...state, paidByUserId: action.userId };
    case "toggleParticipant":
      return toggleParticipant(state, action);
    case "setSplitMode":
      return {
        ...state,
        splitMode: action.mode,
        splits:
          action.mode === "equal"
            ? equalSplitRows(
                state.amount,
                state.splits.map((split) => split.userId),
              )
            : state.splits,
        validationError: undefined,
      };
    case "setSplitAmount":
      return {
        ...state,
        splits: state.splits.map((split) =>
          split.userId === action.userId
            ? { ...split, amount: action.value }
            : split,
        ),
        splitMode: "custom",
        validationError: undefined,
      };
    case "setValidationError":
      return { ...state, validationError: action.error };
  }
}

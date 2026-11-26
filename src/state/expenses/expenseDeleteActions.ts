import { calculateGroupBalances, deleteExpense } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { errorMessage, t } from "../../i18n";

export const createExpenseDeleteActions: ExpenseActionCreator<
  "removeExpense"
> = (set, get) => ({
  removeExpense: async (expenseId, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteExpense(expenseId);
      const groupExpenses = get().groupExpenses.filter(
        (expense) => expense.id !== expenseId,
      );
      const individualExpenses = get().individualExpenses.filter(
        (expense) => expense.id !== expenseId,
      );
      set({
        groupExpenses,
        individualExpenses,
        selectedExpense:
          get().selectedExpense?.id === expenseId
            ? null
            : get().selectedExpense,
      });

      if (typeof groupId !== "string") {
        set({ isLoading: false });
        return;
      }

      try {
        const groupBalances = await calculateGroupBalances(groupId);
        set({
          groupBalances,
          groupBalancesGroupId: groupId,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: t("errors.partial.expenseDeleted", {
            reason: errorMessage(error, "errors.fallback.tryAgain"),
          }),
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.deleteExpense"),
        isLoading: false,
      });
      throw error;
    }
  },
});

import type {
  ExpenseDto,
  ExpenseSplitDto,
  PublicUserProfileDto,
} from "../../types";
import type { Database } from "../../types/database.types";

export function mapRowToExpenseSplitDto(
  row: Database["public"]["Tables"]["expense_splits"]["Row"],
  profile?: PublicUserProfileDto,
): ExpenseSplitDto {
  return {
    id: String(row.id ?? ""),
    expenseId: String(row.expense_id ?? ""),
    userId: String(row.user_id ?? ""),
    amountOwed: Number(row.amount_owed ?? 0),
    isSettled: Boolean(row.is_settled ?? false),
    userProfile: profile,
  };
}

export function mapRowToExpenseDto(
  row: Database["public"]["Tables"]["expenses"]["Row"],
  paidByProfile?: PublicUserProfileDto,
  splits: ExpenseSplitDto[] = [],
): ExpenseDto {
  return {
    id: String(row.id ?? ""),
    groupId: typeof row.group_id === "string" ? row.group_id : null,
    paidByUserId: String(row.paid_by_user_id ?? ""),
    title: String(row.title ?? ""),
    amount: Number(row.amount ?? 0),
    receiptUrl: typeof row.receipt_url === "string" ? row.receipt_url : null,
    recordCreated: String(row.record_created ?? ""),
    paidByProfile,
    splits,
  };
}

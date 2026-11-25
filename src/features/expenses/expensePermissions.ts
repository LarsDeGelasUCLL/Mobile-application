import type {
  ExpenseDto,
  ExpenseSplitDto,
  User,
  UserGroupDto,
} from "../../types";

type PermissionUser = Pick<User, "id"> | null;

/** Edit and delete: a group admin of the expense's group, its creator, or its payer. */
export function canManageExpense(
  user: PermissionUser,
  expense: Pick<
    ExpenseDto,
    "groupId" | "createdByUserId" | "paidByUserId"
  > | null,
  groups: Pick<UserGroupDto, "group" | "groupRole">[],
): boolean {
  if (!user || !expense) return false;
  const membership = expense.groupId
    ? groups.find((item) => item.group.id === expense.groupId)
    : undefined;
  return (
    membership?.groupRole === "ADMIN" ||
    expense.createdByUserId === user.id ||
    expense.paidByUserId === user.id
  );
}

/** Settle or unsettle: the split's user or the payer, never the payer's own split. */
export function canSettleSplit(
  user: PermissionUser,
  expense: Pick<ExpenseDto, "paidByUserId">,
  split: Pick<ExpenseSplitDto, "userId">,
): boolean {
  const isPayer = split.userId === expense.paidByUserId;
  return (
    !!user &&
    !isPayer &&
    (split.userId === user.id || expense.paidByUserId === user.id)
  );
}

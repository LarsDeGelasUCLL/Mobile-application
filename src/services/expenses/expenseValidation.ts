import type { CreateExpenseSplitInput } from "../../types";

export interface ExpenseFormDraft {
  title: string;
  amount: string;
  receiptUrl: string;
  paidByUserId: string;
  splits: { userId: string; amount: string }[];
}

export interface ValidExpenseForm {
  title: string;
  amount: number;
  receiptUrl: string | null;
  paidByUserId: string;
  splits: CreateExpenseSplitInput[];
}

interface ExpenseValidationContext {
  groupId: string | null;
  currentUserId: string;
  allowedParticipantIds?: string[];
}

function parseCents(value: string | number): number | undefined {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    const cents = Math.round(value * 100);
    return Number.isSafeInteger(cents) && Math.abs(value * 100 - cents) <= 1e-8
      ? cents
      : undefined;
  }

  const match = /^(-?\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return undefined;

  const sign = match[1].startsWith("-") ? -1 : 1;
  const whole = Math.abs(Number(match[1]));
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const cents = sign * (whole * 100 + fraction);
  return Number.isSafeInteger(cents) ? cents : undefined;
}

export function normalizeReceiptUrl(
  receiptUrl: string | null | undefined,
): string | null {
  const trimmed = receiptUrl?.trim();
  return trimmed ? trimmed : null;
}

function validateValues(
  draft: {
    title: string;
    amount: string | number;
    receiptUrl?: string | null;
    paidByUserId: string;
    splits: { userId: string; amount: string | number }[];
  },
  context: ExpenseValidationContext,
): ValidExpenseForm | string {
  const title = draft.title.trim();
  if (!title) return "Expense title is required.";
  if ([...title].length > 150) {
    return "Expense title must be 150 characters or fewer.";
  }
  const paidByUserId = draft.paidByUserId.trim();
  if (!paidByUserId) return "Payer is required.";

  const amountCents = parseCents(draft.amount);
  if (amountCents === undefined || amountCents <= 0) {
    return "Expense amount must be positive and have at most two decimal places.";
  }
  if (draft.splits.length === 0)
    return "At least one expense split is required.";

  const allowedParticipants = context.allowedParticipantIds
    ? new Set(context.allowedParticipantIds)
    : null;
  const splitUsers = new Set<string>();
  const splits: CreateExpenseSplitInput[] = [];
  let totalSplitCents = 0;
  for (const split of draft.splits) {
    const userId = split.userId.trim();
    const amountOwedCents = parseCents(split.amount);
    if (!userId || amountOwedCents === undefined || amountOwedCents < 0) {
      return "Split amounts must be nonnegative and have at most two decimal places.";
    }
    if (splitUsers.has(userId)) {
      return "An expense cannot contain duplicate users in its splits.";
    }
    if (allowedParticipants && !allowedParticipants.has(userId)) {
      return "Split participants must be selected from available participants.";
    }

    splitUsers.add(userId);
    totalSplitCents += amountOwedCents;
    splits.push({ userId, amountOwed: amountOwedCents / 100 });
  }

  if (allowedParticipants && !allowedParticipants.has(paidByUserId)) {
    return "Payer must be selected from available participants.";
  }
  if (totalSplitCents !== amountCents) {
    return "Split amounts must equal the expense amount.";
  }
  if (context.groupId === null && !splitUsers.has(paidByUserId)) {
    return "The payer must be included in the expense split.";
  }
  if (
    context.groupId === null &&
    paidByUserId !== context.currentUserId &&
    !splitUsers.has(context.currentUserId)
  ) {
    return "You must be involved in a personal expense.";
  }

  return {
    title,
    amount: amountCents / 100,
    receiptUrl: normalizeReceiptUrl(draft.receiptUrl),
    paidByUserId,
    splits,
  };
}

export function validateExpenseForm(
  draft: ExpenseFormDraft,
  context: ExpenseValidationContext,
): ValidExpenseForm | string {
  return validateValues(draft, context);
}

export function validateExpensePayload(
  payload: {
    groupId: string | null;
    title: string;
    amount: number;
    receiptUrl?: string | null;
    paidByUserId: string;
    splits: CreateExpenseSplitInput[];
  },
  currentUserId: string,
): void {
  const result = validateValues(
    {
      ...payload,
      splits: payload.splits.map((split) => ({
        userId: split.userId,
        amount: split.amountOwed,
      })),
    },
    {
      groupId: payload.groupId,
      currentUserId,
    },
  );
  if (typeof result === "string") {
    throw new Error(result);
  }
}

function formatCents(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

export function createEqualExpenseSplits(
  amount: string,
  userIds: string[],
): { userId: string; amount: string }[] {
  const amountCents = parseCents(amount);
  if (amountCents === undefined || amountCents <= 0) {
    throw new Error(
      "A positive amount with at most two decimal places is required.",
    );
  }
  if (
    userIds.length === 0 ||
    userIds.some((userId) => !userId.trim()) ||
    new Set(userIds).size !== userIds.length
  ) {
    throw new Error("At least one unique participant is required.");
  }

  const centsPerUser = Math.floor(amountCents / userIds.length);
  const remainder = amountCents % userIds.length;
  return userIds.map((userId, index) => ({
    userId,
    amount: formatCents(centsPerUser + (index < remainder ? 1 : 0)),
  }));
}

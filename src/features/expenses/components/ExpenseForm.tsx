import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { View } from "react-native";
import {
  Card,
  Checkbox,
  EmptyState,
  FeedbackBanner,
  InputField,
  Radio,
  Row,
  Stack,
  Text,
} from "../../../components/primitives";
import { StyledButton } from "../../../components/common/StyledButton";
import {
  createEqualExpenseSplits,
  validateExpenseForm,
  type ExpenseFormDraft,
  type ValidExpenseForm,
} from "../../../services/expenses/expenseValidation";
import type { ExpenseDto, PublicUserProfileDto } from "../../../types";
import { makeStyles, useTheme } from "../../../theme/ThemeProvider";

interface ExpenseFormProps {
  groupId: string | null;
  currentUserId: string;
  participants: PublicUserProfileDto[];
  initialExpense?: ExpenseDto;
  isLoading: boolean;
  error: string | null;
  onSubmit: (payload: ValidExpenseForm) => Promise<void>;
  /** The page's sticky footer button calls `submit()` (design §4). */
  ref?: Ref<ExpenseFormHandle>;
}

export interface ExpenseFormHandle {
  submit: () => void;
}

type ExpenseSplitDraft = ExpenseFormDraft["splits"][number];
type SplitMode = "equal" | "custom";

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
  const styles = useStyles();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [paidByUserId, setPaidByUserId] = useState(currentUserId);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [splits, setSplits] = useState<ExpenseSplitDraft[]>([
    { userId: currentUserId, amount: "0.00" },
  ]);
  const [validationError, setValidationError] = useState<string>();

  useEffect(() => {
    setTitle(initialExpense?.title ?? "");
    setAmount(initialExpense ? initialExpense.amount.toFixed(2) : "");
    setReceiptUrl(initialExpense?.receiptUrl ?? "");
    setPaidByUserId(initialExpense?.paidByUserId ?? currentUserId);
    setSplitMode(initialExpense ? "custom" : "equal");
    setSplits(
      initialExpense
        ? initialExpense.splits.map((split) => ({
            userId: split.userId,
            amount: split.amountOwed.toFixed(2),
          }))
        : [{ userId: currentUserId, amount: "0.00" }],
    );
    setValidationError(undefined);
  }, [currentUserId, initialExpense?.id]);

  const setAmountValue = (value: string) => {
    setAmount(value);
    if (splitMode === "equal") {
      setSplits((current) =>
        equalSplitRows(
          value,
          current.map((split) => split.userId),
        ),
      );
    }
    setValidationError(undefined);
  };

  const toggleParticipant = (userId: string, selected: boolean) => {
    const userIds = selected
      ? [...splits.map((split) => split.userId), userId]
      : splits.map((split) => split.userId).filter((id) => id !== userId);
    setSplits(
      splitMode === "equal"
        ? equalSplitRows(amount, userIds)
        : selected
          ? [...splits, { userId, amount: "0.00" }]
          : splits.filter((split) => split.userId !== userId),
    );
    if (groupId === null && !userIds.includes(paidByUserId)) {
      setPaidByUserId(userIds[0] ?? "");
    }
    setValidationError(undefined);
  };

  const handleSplitMode = (mode: string) => {
    if (mode !== "equal" && mode !== "custom") return;
    setSplitMode(mode);
    if (mode === "equal") {
      setSplits((current) =>
        equalSplitRows(
          amount,
          current.map((split) => split.userId),
        ),
      );
    }
    setValidationError(undefined);
  };

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
    if (typeof result === "string") {
      setValidationError(result);
      return;
    }
    setValidationError(undefined);
    void onSubmit(result);
  };
  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <Stack gap="md">
      {error || validationError ? (
        <FeedbackBanner tone="error" testID="expense-form-error">
          <Text size="sm" color={colors.error}>
            {validationError ?? error}
          </Text>
          {error ? (
            <StyledButton
              label="Retry"
              onPress={handleSubmit}
              variant="secondary"
              isLoading={isLoading}
            />
          ) : null}
        </FeedbackBanner>
      ) : null}

      <Card>
        <Stack gap="md">
          <InputField
            label="Expense title"
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              setValidationError(undefined);
            }}
            placeholder="Dinner"
            testID="expense-title-input"
          />
          <InputField
            label="Amount"
            value={amount}
            onChangeText={setAmountValue}
            placeholder="0.00"
            keyboardType="decimal-pad"
            testID="expense-amount-input"
          />
          <InputField
            label="Receipt URL (optional)"
            value={receiptUrl}
            onChangeText={(value) => {
              setReceiptUrl(value);
              setValidationError(undefined);
            }}
            placeholder="https://..."
            testID="expense-receipt-input"
          />
        </Stack>
      </Card>

      <Card>
        <Stack gap="sm">
          <Text size="md" weight="bold">
            Paid by
          </Text>
          {participants.map((participant) => (
            <Radio
              key={participant.id}
              label={
                participant.id === currentUserId
                  ? `${participant.displayName} (you)`
                  : participant.displayName
              }
              value={participant.id}
              selected={paidByUserId === participant.id}
              onSelect={setPaidByUserId}
            />
          ))}
        </Stack>
      </Card>

      <Card>
        <Stack gap="md">
          <Text size="md" weight="bold">
            Split between
          </Text>
          {participants.length === 0 ? (
            <EmptyState
              title="No participants available"
              description="Add an active group member or use someone from your personal expense history."
            />
          ) : (
            <Stack gap="sm">
              {participants.map((participant) => (
                <Checkbox
                  key={participant.id}
                  label={
                    participant.id === currentUserId
                      ? `${participant.displayName} (you)`
                      : participant.displayName
                  }
                  checked={splits.some(
                    (split) => split.userId === participant.id,
                  )}
                  onChange={(selected) =>
                    toggleParticipant(participant.id, selected)
                  }
                />
              ))}
            </Stack>
          )}
          <Row gap="md">
            <Radio
              label="Split equally"
              value="equal"
              selected={splitMode === "equal"}
              onSelect={handleSplitMode}
            />
            <Radio
              label="Custom amounts"
              value="custom"
              selected={splitMode === "custom"}
              onSelect={handleSplitMode}
            />
          </Row>
          {splits.length === 0 ? (
            <Text size="sm" color={colors.textMuted}>
              Select at least one participant.
            </Text>
          ) : (
            <Stack gap="sm">
              {splits.map((split) => {
                const participant = participants.find(
                  (item) => item.id === split.userId,
                );
                return (
                  <View key={split.userId} style={styles.splitRow}>
                    <Text size="sm" weight="medium">
                      {participant?.displayName ?? "Group member"}
                    </Text>
                    <View style={styles.splitAmount}>
                      <InputField
                        label="Share"
                        value={split.amount}
                        onChangeText={(value) => {
                          setSplits((current) =>
                            current.map((item) =>
                              item.userId === split.userId
                                ? { ...item, amount: value }
                                : item,
                            ),
                          );
                          setSplitMode("custom");
                          setValidationError(undefined);
                        }}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        editable={splitMode === "custom"}
                        testID={`expense-split-${split.userId}`}
                      />
                    </View>
                  </View>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

const useStyles = makeStyles((t) => ({
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
  },
  splitAmount: {
    flex: 1,
  },
}));

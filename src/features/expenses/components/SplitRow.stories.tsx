import type { Meta, StoryObj } from "@storybook/react";
import { SplitRow } from "./SplitRow";
import { storyExpense } from "../storyData/expenseStoryData";

const meta: Meta<typeof SplitRow> = {
  title: "Expenses/SplitRow",
  component: SplitRow,
};
export default meta;
type Story = StoryObj<typeof SplitRow>;

const [payerSplit, openSplit, settledSplit] = storyExpense.splits;
const base = { isLoading: false, onToggleSettled: () => {} };

export const Payer: Story = {
  args: { ...base, split: payerSplit, isPayer: true, canSettle: false },
};
export const CanSettle: Story = {
  args: { ...base, split: openSplit, isPayer: false, canSettle: true },
};
export const CanUnsettle: Story = {
  args: { ...base, split: settledSplit, isPayer: false, canSettle: true },
};
export const ReadOnly: Story = {
  args: { ...base, split: openSplit, isPayer: false, canSettle: false },
};

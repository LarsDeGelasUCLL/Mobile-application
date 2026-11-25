import type { Meta, StoryObj } from "@storybook/react";
import { SplitBreakdown } from "./SplitBreakdown";
import { storyExpense } from "./expenseStoryData";

const meta: Meta<typeof SplitBreakdown> = {
  title: "Expenses/SplitBreakdown",
  component: SplitBreakdown,
};
export default meta;
type Story = StoryObj<typeof SplitBreakdown>;

// Viewed by the payer: every share but their own can be settled.
export const AsPayer: Story = {
  args: {
    expense: storyExpense,
    canSettle: (split) => split.userId !== storyExpense.paidByUserId,
    isLoading: false,
    onToggleSettled: () => {},
  },
};
export const ReadOnly: Story = {
  args: { ...AsPayer.args, canSettle: () => false },
};

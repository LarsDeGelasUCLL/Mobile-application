import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseRow } from "./ExpenseRow";
import { storyExpense } from "./expenseStoryData";

// ExpenseRow opens the expense detail with router.push itself, so a press
// does nothing useful in Storybook.
const meta: Meta<typeof ExpenseRow> = {
  title: "Expenses/ExpenseRow",
  component: ExpenseRow,
};
export default meta;
type Story = StoryObj<typeof ExpenseRow>;

export const Default: Story = { args: { expense: storyExpense } };
export const UnknownPayer: Story = {
  args: { expense: { ...storyExpense, paidByProfile: undefined } },
};
export const LongTitleAndAmount: Story = {
  args: {
    expense: {
      ...storyExpense,
      title: "Train tickets, museum passes and dinner for the whole group",
      amount: 1234.5,
    },
  },
};

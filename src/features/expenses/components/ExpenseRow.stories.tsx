import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseRow } from "./ExpenseRow";
import { storyExpense } from "../storyData/expenseStoryData";

const meta: Meta<typeof ExpenseRow> = {
  title: "Expenses/ExpenseRow",
  component: ExpenseRow,
};
export default meta;
type Story = StoryObj<typeof ExpenseRow>;

export const Default: Story = {
  args: { expense: storyExpense, onOpen: () => {} },
};
export const UnknownPayer: Story = {
  args: {
    ...Default.args,
    expense: { ...storyExpense, paidByProfile: undefined },
  },
};
export const LongTitleAndAmount: Story = {
  args: {
    ...Default.args,
    expense: {
      ...storyExpense,
      title: "Train tickets, museum passes and dinner for the whole group",
      amount: 1234.5,
    },
  },
};

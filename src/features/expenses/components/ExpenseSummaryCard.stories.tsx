import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseSummaryCard } from "./ExpenseSummaryCard";
import { storyExpense } from "./expenseStoryData";

const meta: Meta<typeof ExpenseSummaryCard> = {
  title: "Expenses/ExpenseSummaryCard",
  component: ExpenseSummaryCard,
};
export default meta;
type Story = StoryObj<typeof ExpenseSummaryCard>;

export const GroupExpense: Story = { args: { expense: storyExpense } };
export const PersonalWithoutReceipt: Story = {
  args: { expense: { ...storyExpense, groupId: null, receiptUrl: null } },
};

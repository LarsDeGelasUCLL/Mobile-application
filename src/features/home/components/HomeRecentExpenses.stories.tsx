import type { Meta, StoryObj } from "@storybook/react";
import { HomeRecentExpenses } from "./HomeRecentExpenses";
import { storyExpense } from "../../expenses/components/expenseStoryData";

const meta: Meta<typeof HomeRecentExpenses> = {
  title: "Home/HomeRecentExpenses",
  component: HomeRecentExpenses,
};
export default meta;
type Story = StoryObj<typeof HomeRecentExpenses>;

const expenses = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    ...storyExpense,
    groupId: null,
    id: `expense-${index + 1}`,
    title: `Expense ${index + 1}`,
  }));

export const FewExpenses: Story = {
  args: {
    expenses: expenses(2),
    isLoading: false,
    error: null,
    onRetry: () => {},
    onSeeAll: () => {},
    onAddExpense: () => {},
  },
};
export const WithSeeAll: Story = {
  args: { ...FewExpenses.args, expenses: expenses(5) },
};
export const Loading: Story = {
  args: { ...FewExpenses.args, expenses: [], isLoading: true },
};
export const Empty: Story = { args: { ...FewExpenses.args, expenses: [] } };
export const Failed: Story = {
  args: {
    ...FewExpenses.args,
    expenses: [],
    error: "Could not load expenses.",
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { RecentExpensesSection } from "./RecentExpensesSection";
import { storyExpense } from "../../expenses/components/expenseStoryData";

const meta: Meta<typeof RecentExpensesSection> = {
  title: "Groups/RecentExpensesSection",
  component: RecentExpensesSection,
};
export default meta;
type Story = StoryObj<typeof RecentExpensesSection>;

const expenses = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    ...storyExpense,
    id: `expense-${index + 1}`,
    title: `Expense ${index + 1}`,
  }));

export const FewExpenses: Story = {
  args: {
    expenses: expenses(3),
    isLoading: false,
    hasError: false,
    onSeeAll: () => {},
  },
};
export const WithSeeAll: Story = {
  args: { ...FewExpenses.args, expenses: expenses(8) },
};
export const Loading: Story = {
  args: { ...FewExpenses.args, expenses: [], isLoading: true },
};
export const Empty: Story = {
  args: { ...FewExpenses.args, expenses: [] },
};

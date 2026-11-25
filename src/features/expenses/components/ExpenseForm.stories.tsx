import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseForm } from "./ExpenseForm";
import { storyExpense, storyParticipants } from "../storyData/expenseStoryData";

const meta: Meta<typeof ExpenseForm> = {
  title: "Expenses/ExpenseForm",
  component: ExpenseForm,
};
export default meta;
type Story = StoryObj<typeof ExpenseForm>;

export const NewExpense: Story = {
  args: {
    groupId: "group-1",
    currentUserId: "sam",
    participants: storyParticipants,
    isLoading: false,
    error: null,
    onSubmit: async () => {},
  },
};
export const EditExpense: Story = {
  args: { ...NewExpense.args, initialExpense: storyExpense },
};
export const SaveFailed: Story = {
  args: { ...EditExpense.args, error: "Could not update expense." },
};

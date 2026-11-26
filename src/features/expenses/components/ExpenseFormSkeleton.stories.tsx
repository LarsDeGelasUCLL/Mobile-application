import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseFormSkeleton } from "./ExpenseFormSkeleton";

const meta: Meta<typeof ExpenseFormSkeleton> = {
  title: "Expenses/ExpenseFormSkeleton",
  component: ExpenseFormSkeleton,
};
export default meta;
type Story = StoryObj<typeof ExpenseFormSkeleton>;

export const Default: Story = {};

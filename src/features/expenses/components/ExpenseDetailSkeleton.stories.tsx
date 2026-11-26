import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseDetailSkeleton } from "./ExpenseDetailSkeleton";

const meta: Meta<typeof ExpenseDetailSkeleton> = {
  title: "Expenses/ExpenseDetailSkeleton",
  component: ExpenseDetailSkeleton,
};
export default meta;
type Story = StoryObj<typeof ExpenseDetailSkeleton>;

export const Default: Story = {};

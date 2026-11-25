import type { Meta, StoryObj } from "@storybook/react";
import { ExpenseMissingState } from "./ExpenseMissingState";

const meta: Meta<typeof ExpenseMissingState> = {
  title: "Expenses/ExpenseMissingState",
  component: ExpenseMissingState,
};
export default meta;
type Story = StoryObj<typeof ExpenseMissingState>;

export const Unavailable: Story = {};
export const WithBackButton: Story = { args: { onBack: () => {} } };
export const DeletedBalancesPending: Story = {
  args: { deleted: true, onBack: () => {} },
};

import type { Meta, StoryObj } from "@storybook/react";
import { BalanceSummaryCard } from "./BalanceSummaryCard";

const meta: Meta<typeof BalanceSummaryCard> = {
  title: "Home/BalanceSummaryCard",
  component: BalanceSummaryCard,
};
export default meta;
type Story = StoryObj<typeof BalanceSummaryCard>;

export const Open: Story = {
  args: { youAreOwed: 42.5, youOwe: 12, isLoading: false },
};
export const SettledUp: Story = {
  args: { ...Open.args, youAreOwed: 0, youOwe: 0 },
};
export const Loading: Story = { args: { ...Open.args, isLoading: true } };

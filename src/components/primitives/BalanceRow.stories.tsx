import type { Meta, StoryObj } from "@storybook/react";
import { BalanceRow } from "./BalanceRow";

const meta: Meta<typeof BalanceRow> = {
  title: "Primitives/BalanceRow",
  component: BalanceRow,
};
export default meta;
type Story = StoryObj<typeof BalanceRow>;

export const GetsBack: Story = { args: { name: "You", amount: 24.5 } };
export const Owes: Story = { args: { name: "Sarah Peeters", amount: -12 } };
export const SettledUp: Story = { args: { name: "Tom", amount: 0 } };

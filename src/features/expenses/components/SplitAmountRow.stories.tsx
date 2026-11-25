import type { Meta, StoryObj } from "@storybook/react";
import { SplitAmountRow } from "./SplitAmountRow";

const meta: Meta<typeof SplitAmountRow> = {
  title: "Expenses/SplitAmountRow",
  component: SplitAmountRow,
};
export default meta;
type Story = StoryObj<typeof SplitAmountRow>;

export const Equal: Story = {
  args: {
    name: "Ann",
    amount: "15.00",
    editable: false,
    onChangeAmount: () => {},
  },
};
export const Custom: Story = { args: { ...Equal.args, editable: true } };

import type { Meta, StoryObj } from "@storybook/react";
import { PaidByPicker } from "./PaidByPicker";
import { storyParticipants } from "../storyData/expenseStoryData";

const meta: Meta<typeof PaidByPicker> = {
  title: "Expenses/PaidByPicker",
  component: PaidByPicker,
};
export default meta;
type Story = StoryObj<typeof PaidByPicker>;

export const YouPaid: Story = {
  args: {
    participants: storyParticipants,
    currentUserId: "sam",
    paidByUserId: "sam",
    onSelect: () => {},
  },
};
export const SomeoneElsePaid: Story = {
  args: { ...YouPaid.args, paidByUserId: "ann" },
};

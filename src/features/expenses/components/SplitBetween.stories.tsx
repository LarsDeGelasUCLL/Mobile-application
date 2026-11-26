import type { Meta, StoryObj } from "@storybook/react";
import { SplitBetween } from "./SplitBetween";
import { storyParticipants } from "../storyData/expenseStoryData";

const meta: Meta<typeof SplitBetween> = {
  title: "Expenses/SplitBetween",
  component: SplitBetween,
};
export default meta;
type Story = StoryObj<typeof SplitBetween>;

export const Equal: Story = {
  args: {
    participants: storyParticipants,
    currentUserId: "sam",
    selectedUserIds: ["sam", "ann"],
    splitMode: "equal",
    onToggle: () => {},
    onSplitModeChange: () => {},
  },
};
export const Custom: Story = { args: { ...Equal.args, splitMode: "custom" } };
export const NoParticipants: Story = {
  args: { ...Equal.args, participants: [], selectedUserIds: [] },
};

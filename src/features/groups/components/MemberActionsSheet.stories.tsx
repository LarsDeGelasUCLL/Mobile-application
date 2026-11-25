import type { Meta, StoryObj } from "@storybook/react";
import { MemberActionsSheet } from "./MemberActionsSheet";
import { storyMembers } from "../storyData/groupStoryData";

const meta: Meta<typeof MemberActionsSheet> = {
  title: "Groups/MemberActionsSheet",
  component: MemberActionsSheet,
};
export default meta;
type Story = StoryObj<typeof MemberActionsSheet>;

export const ForMember: Story = {
  args: {
    member: storyMembers[1],
    visible: true,
    onClose: () => {},
    onChangeRole: () => {},
    onRemove: () => {},
  },
};
export const ForAdmin: Story = {
  args: { ...ForMember.args, member: storyMembers[0] },
};

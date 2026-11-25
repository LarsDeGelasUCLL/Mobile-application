import type { Meta, StoryObj } from "@storybook/react";
import { MemberList } from "./MemberList";
import { storyMembers } from "../storyData/groupStoryData";

const meta: Meta<typeof MemberList> = {
  title: "Groups/MemberList",
  component: MemberList,
};
export default meta;
type Story = StoryObj<typeof MemberList>;

// Seen by the admin Sam: other members open their actions.
export const AsAdmin: Story = {
  args: {
    members: storyMembers,
    currentUserId: "sam",
    isLoading: false,
    onSelect: () => {},
  },
};
export const AsMember: Story = {
  args: { ...AsAdmin.args, currentUserId: "ann", onSelect: undefined },
};
export const Loading: Story = {
  args: { ...AsAdmin.args, members: [], isLoading: true },
};

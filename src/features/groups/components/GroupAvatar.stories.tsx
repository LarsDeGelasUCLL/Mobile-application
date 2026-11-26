import type { Meta, StoryObj } from "@storybook/react";
import { GroupAvatar } from "./GroupAvatar";
import { storyGroup, storyGroupImageUri } from "../storyData/groupStoryData";

const meta: Meta<typeof GroupAvatar> = {
  title: "Groups/GroupAvatar",
  component: GroupAvatar,
};
export default meta;
type Story = StoryObj<typeof GroupAvatar>;

export const Initials: Story = { args: { name: storyGroup.name } };
export const SmallInitials: Story = {
  args: { name: storyGroup.name, size: 40 },
};
export const LargeInitials: Story = {
  args: { name: storyGroup.name, size: 80 },
};
export const OneWordName: Story = { args: { name: "Flat" } };
export const WithImage: Story = {
  args: { name: storyGroup.name, imageUri: storyGroupImageUri },
};

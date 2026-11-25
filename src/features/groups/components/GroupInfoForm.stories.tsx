import type { Meta, StoryObj } from "@storybook/react";
import { GroupInfoForm } from "./GroupInfoForm";
import { storyGroup } from "./groupStoryData";

const meta: Meta<typeof GroupInfoForm> = {
  title: "Groups/GroupInfoForm",
  component: GroupInfoForm,
};
export default meta;
type Story = StoryObj<typeof GroupInfoForm>;

// Collapsed by default: tap "Group info" to edit.
export const Default: Story = {
  args: { group: storyGroup, isLoading: false, onSave: () => {} },
};
export const NoDescription: Story = {
  args: { ...Default.args, group: { ...storyGroup, description: null } },
};

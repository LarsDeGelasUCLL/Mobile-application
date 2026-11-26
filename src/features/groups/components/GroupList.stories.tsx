import type { Meta, StoryObj } from "@storybook/react";
import { GroupList } from "./GroupList";
import {
  storyJoinRequestCounts,
  storyUserGroups,
} from "../storyData/groupStoryData";

const meta: Meta<typeof GroupList> = {
  title: "Groups/GroupList",
  component: GroupList,
};
export default meta;
type Story = StoryObj<typeof GroupList>;

export const WithGroups: Story = {
  args: {
    groups: storyUserGroups,
    joinRequestCounts: storyJoinRequestCounts,
    isLoading: false,
    hasError: false,
    onOpenGroup: () => {},
    onCreate: () => {},
    onJoin: () => {},
  },
};
export const Loading: Story = {
  args: { ...WithGroups.args, groups: [], isLoading: true },
};
export const Empty: Story = {
  args: { ...WithGroups.args, groups: [] },
};
export const Failed: Story = {
  args: { ...WithGroups.args, groups: [], hasError: true },
};

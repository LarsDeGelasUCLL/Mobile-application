import type { Meta, StoryObj } from "@storybook/react";
import { GroupHighlights } from "./GroupHighlights";
import {
  storyGroupImageUri,
  storyUserGroups,
} from "../../groups/storyData/groupStoryData";

const meta: Meta<typeof GroupHighlights> = {
  title: "Home/GroupHighlights",
  component: GroupHighlights,
};
export default meta;
type Story = StoryObj<typeof GroupHighlights>;

const groups = [
  ...storyUserGroups.map(({ group }) => ({ id: group.id, name: group.name })),
  { id: "group-3", name: "Ski trip", imageUri: storyGroupImageUri },
  { id: "group-4", name: "Saturday morning running club" },
];

export const Filled: Story = {
  args: { groups, onSeeAllPress: () => {}, onGroupPress: () => {} },
};
export const Empty: Story = { args: { ...Filled.args, groups: [] } };

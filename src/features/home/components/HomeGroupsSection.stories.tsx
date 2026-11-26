import type { Meta, StoryObj } from "@storybook/react";
import { HomeGroupsSection } from "./HomeGroupsSection";

const meta: Meta<typeof HomeGroupsSection> = {
  title: "Home/HomeGroupsSection",
  component: HomeGroupsSection,
};
export default meta;
type Story = StoryObj<typeof HomeGroupsSection>;

export const WithGroups: Story = {
  args: {
    groups: [
      { id: "group-1", name: "Weekend Ghent" },
      { id: "group-2", name: "Flat 3B" },
      { id: "group-3", name: "Ski trip" },
    ],
    isLoading: false,
    error: null,
    onRetry: () => {},
    onBrowse: () => {},
    onOpenGroup: () => {},
  },
};
export const Loading: Story = {
  args: { ...WithGroups.args, groups: [], isLoading: true },
};
export const Empty: Story = { args: { ...WithGroups.args, groups: [] } };
export const Failed: Story = {
  args: { ...WithGroups.args, groups: [], error: "Could not load groups." },
};

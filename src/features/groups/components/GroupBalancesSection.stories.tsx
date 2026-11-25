import type { Meta, StoryObj } from "@storybook/react";
import { GroupBalancesSection } from "./GroupBalancesSection";
import { storyBalances } from "../storyData/groupStoryData";

const meta: Meta<typeof GroupBalancesSection> = {
  title: "Groups/GroupBalancesSection",
  component: GroupBalancesSection,
};
export default meta;
type Story = StoryObj<typeof GroupBalancesSection>;

// Seen by Sam: his row reads "You".
export const WithBalances: Story = {
  args: {
    balances: storyBalances,
    currentUserId: "sam",
    loaded: true,
    isLoading: false,
    hasError: false,
  },
};
export const Loading: Story = {
  args: { ...WithBalances.args, balances: [], loaded: false, isLoading: true },
};
export const NotLoaded: Story = {
  args: { ...WithBalances.args, balances: [], loaded: false },
};
export const Empty: Story = {
  args: { ...WithBalances.args, balances: [] },
};

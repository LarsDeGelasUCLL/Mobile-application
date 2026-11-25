import type { Meta, StoryObj } from "@storybook/react";
import { JoinRequestList } from "./JoinRequestList";
import { storyJoinRequests } from "./groupStoryData";

const meta: Meta<typeof JoinRequestList> = {
  title: "Groups/JoinRequestList",
  component: JoinRequestList,
};
export default meta;
type Story = StoryObj<typeof JoinRequestList>;

export const TwoRequests: Story = {
  args: { requests: storyJoinRequests, isLoading: false, onRespond: () => {} },
};
export const OneRequest: Story = {
  args: { ...TwoRequests.args, requests: storyJoinRequests.slice(0, 1) },
};

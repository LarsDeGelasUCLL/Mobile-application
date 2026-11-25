import type { Meta, StoryObj } from "@storybook/react";
import { SentRequestList } from "./SentRequestList";
import { storySentRequests } from "./groupStoryData";

const meta: Meta<typeof SentRequestList> = {
  title: "Groups/SentRequestList",
  component: SentRequestList,
};
export default meta;
type Story = StoryObj<typeof SentRequestList>;

// Collapsed by default: tap the header to see the requests.
export const TwoRequests: Story = {
  args: { requests: storySentRequests, isLoading: false, onCancel: () => {} },
};
export const OneRequest: Story = {
  args: { ...TwoRequests.args, requests: storySentRequests.slice(0, 1) },
};

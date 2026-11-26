import type { Meta, StoryObj } from "@storybook/react";
import { InvitationList } from "./InvitationList";
import { storyInvites } from "../storyData/groupStoryData";

const meta: Meta<typeof InvitationList> = {
  title: "Groups/InvitationList",
  component: InvitationList,
};
export default meta;
type Story = StoryObj<typeof InvitationList>;

// Collapsed by default: tap the header to see the invites.
export const TwoInvites: Story = {
  args: { invites: storyInvites, isLoading: false, onRespond: () => {} },
};
export const Busy: Story = {
  args: { ...TwoInvites.args, isLoading: true },
};

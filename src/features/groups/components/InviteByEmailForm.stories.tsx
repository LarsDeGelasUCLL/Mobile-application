import type { Meta, StoryObj } from "@storybook/react";
import { InviteByEmailForm } from "./InviteByEmailForm";

const meta: Meta<typeof InviteByEmailForm> = {
  title: "Groups/InviteByEmailForm",
  component: InviteByEmailForm,
};
export default meta;
type Story = StoryObj<typeof InviteByEmailForm>;

// Collapsed by default: tap "Invite by email" to open.
export const Default: Story = {
  args: { isLoading: false, onInvite: async () => true },
};
export const Sending: Story = { args: { ...Default.args, isLoading: true } };

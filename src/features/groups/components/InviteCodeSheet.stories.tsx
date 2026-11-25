import type { Meta, StoryObj } from "@storybook/react";
import { InviteCodeSheet } from "./InviteCodeSheet";
import { storyFullGroup } from "./groupStoryData";

const meta: Meta<typeof InviteCodeSheet> = {
  title: "Groups/InviteCodeSheet",
  component: InviteCodeSheet,
};
export default meta;
type Story = StoryObj<typeof InviteCodeSheet>;

export const Open: Story = {
  args: { group: storyFullGroup, visible: true, onClose: () => {} },
};

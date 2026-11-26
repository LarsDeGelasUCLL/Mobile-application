import type { Meta, StoryObj } from "@storybook/react";
import { AddGroupSheet } from "./AddGroupSheet";

const meta: Meta<typeof AddGroupSheet> = {
  title: "Groups/AddGroupSheet",
  component: AddGroupSheet,
};
export default meta;
type Story = StoryObj<typeof AddGroupSheet>;

export const Open: Story = {
  args: {
    visible: true,
    onClose: () => {},
    onCreate: () => {},
    onJoin: () => {},
  },
};

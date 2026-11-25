import type { Meta, StoryObj } from "@storybook/react";
import { NotificationSettings } from "./NotificationSettings";

const meta: Meta<typeof NotificationSettings> = {
  title: "Settings/NotificationSettings",
  component: NotificationSettings,
};
export default meta;
type Story = StoryObj<typeof NotificationSettings>;

export const Default: Story = {
  args: {
    settings: {
      notifyNewExpense: true,
      notifyReminders: false,
      notifyGroupUpdates: true,
    },
    onSave: () => {},
  },
};
export const AllOff: Story = {
  args: {
    ...Default.args,
    settings: {
      notifyNewExpense: false,
      notifyReminders: false,
      notifyGroupUpdates: false,
    },
  },
};

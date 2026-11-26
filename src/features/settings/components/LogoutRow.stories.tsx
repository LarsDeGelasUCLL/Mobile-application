import type { Meta, StoryObj } from "@storybook/react";
import { LogoutRow } from "./LogoutRow";

const meta: Meta<typeof LogoutRow> = {
  title: "Settings/LogoutRow",
  component: LogoutRow,
};
export default meta;
type Story = StoryObj<typeof LogoutRow>;

export const Default: Story = {
  args: {
    error: "",
    confirmVisible: false,
    isLoggingOut: false,
    onPress: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
};
export const Confirming: Story = {
  args: { ...Default.args, confirmVisible: true },
};
export const Failed: Story = {
  args: { ...Default.args, error: "Could not log out. Please retry." },
};

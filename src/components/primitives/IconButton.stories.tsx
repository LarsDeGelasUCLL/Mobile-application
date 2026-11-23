import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Primitives/IconButton",
  component: IconButton,
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Add: Story = {
  args: { icon: "add", accessibilityLabel: "Add", onPress: () => {} },
};
export const Settings: Story = {
  args: {
    icon: "settings-outline",
    accessibilityLabel: "Settings",
    onPress: () => {},
  },
};

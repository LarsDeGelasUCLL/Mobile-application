import type { Meta, StoryObj } from "@storybook/react";
import { StyledButton } from "./StyledButton";

const meta: Meta<typeof StyledButton> = {
  title: "Primitives/StyledButton",
  component: StyledButton,
};
export default meta;
type Story = StoryObj<typeof StyledButton>;

export const Primary: Story = {
  args: { label: "Create group", onPress: () => {} },
};
export const Secondary: Story = {
  args: { label: "Cancel", variant: "secondary", onPress: () => {} },
};
export const Danger: Story = {
  args: { label: "Delete group", variant: "danger", onPress: () => {} },
};
export const Loading: Story = {
  args: { label: "Saving", isLoading: true, onPress: () => {} },
};
export const Disabled: Story = {
  args: { label: "Save", disabled: true, onPress: () => {} },
};
export const Link: Story = {
  args: { label: "Forgot password?", variant: "link", onPress: () => {} },
};

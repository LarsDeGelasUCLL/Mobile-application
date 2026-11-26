import type { Meta, StoryObj } from "@storybook/react";
import { AuthPasswordField } from "./AuthPasswordField";

const meta: Meta<typeof AuthPasswordField> = {
  title: "Auth/AuthPasswordField",
  component: AuthPasswordField,
};
export default meta;
type Story = StoryObj<typeof AuthPasswordField>;

export const Empty: Story = { args: { value: "", onChangeText: () => {} } };
export const WithError: Story = {
  args: {
    value: "short",
    onChangeText: () => {},
    error: "Password must be at least 8 characters.",
  },
};

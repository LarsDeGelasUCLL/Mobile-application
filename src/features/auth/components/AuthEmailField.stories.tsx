import type { Meta, StoryObj } from "@storybook/react";
import { AuthEmailField } from "./AuthEmailField";

const meta: Meta<typeof AuthEmailField> = {
  title: "Auth/AuthEmailField",
  component: AuthEmailField,
};
export default meta;
type Story = StoryObj<typeof AuthEmailField>;

export const Empty: Story = { args: { value: "", onChangeText: () => {} } };
export const WithError: Story = {
  args: {
    value: "not-an-email",
    onChangeText: () => {},
    error: "Enter a valid email address.",
  },
};

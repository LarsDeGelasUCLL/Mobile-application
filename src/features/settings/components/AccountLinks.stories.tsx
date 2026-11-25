import type { Meta, StoryObj } from "@storybook/react";
import { AccountLinks } from "./AccountLinks";

const meta: Meta<typeof AccountLinks> = {
  title: "Settings/AccountLinks",
  component: AccountLinks,
};
export default meta;
type Story = StoryObj<typeof AccountLinks>;

export const Default: Story = { args: { email: "sam@example.com" } };
export const NoEmail: Story = { args: {} };

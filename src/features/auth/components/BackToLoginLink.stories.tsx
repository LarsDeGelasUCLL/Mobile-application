import type { Meta, StoryObj } from "@storybook/react";
import { BackToLoginLink } from "./BackToLoginLink";

const meta: Meta<typeof BackToLoginLink> = {
  title: "Auth/BackToLoginLink",
  component: BackToLoginLink,
};
export default meta;
type Story = StoryObj<typeof BackToLoginLink>;

export const Default: Story = { args: { onPress: () => {} } };

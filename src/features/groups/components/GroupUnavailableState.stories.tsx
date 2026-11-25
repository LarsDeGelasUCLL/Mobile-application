import type { Meta, StoryObj } from "@storybook/react";
import { GroupUnavailableState } from "./GroupUnavailableState";

const meta: Meta<typeof GroupUnavailableState> = {
  title: "Groups/GroupUnavailableState",
  component: GroupUnavailableState,
};
export default meta;
type Story = StoryObj<typeof GroupUnavailableState>;

export const Default: Story = { args: { onBack: () => {} } };

import type { Meta, StoryObj } from "@storybook/react";
import { GroupDangerZone } from "./GroupDangerZone";

const meta: Meta<typeof GroupDangerZone> = {
  title: "Groups/GroupDangerZone",
  component: GroupDangerZone,
};
export default meta;
type Story = StoryObj<typeof GroupDangerZone>;

export const AsAdmin: Story = {
  args: {
    canLeave: true,
    canDelete: true,
    onLeave: () => {},
    onDelete: () => {},
  },
};
export const AsMember: Story = { args: { ...AsAdmin.args, canDelete: false } };

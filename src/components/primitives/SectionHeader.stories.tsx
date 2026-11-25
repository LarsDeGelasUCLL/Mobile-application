import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "./SectionHeader";

const meta: Meta<typeof SectionHeader> = {
  title: "Primitives/SectionHeader",
  component: SectionHeader,
};
export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = { args: { title: "Recent expenses" } };
export const WithDescriptionAndBadge: Story = {
  args: {
    title: "Join requests",
    description: "People waiting for approval",
    badgeLabel: "2",
  },
};

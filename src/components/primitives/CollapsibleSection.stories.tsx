import type { Meta, StoryObj } from "@storybook/react";
import { CollapsibleSection } from "./CollapsibleSection";
import { Text } from "./Text";

const meta: Meta<typeof CollapsibleSection> = {
  title: "Primitives/CollapsibleSection",
  component: CollapsibleSection,
};
export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

export const Collapsed: Story = {
  args: {
    title: "Invitations",
    count: 2,
    children: <Text>Weekend Ghent invited you.</Text>,
  },
};
export const Open: Story = {
  args: {
    title: "Sent join requests",
    count: 1,
    defaultOpen: true,
    children: <Text>Roommates · waiting for an admin.</Text>,
  },
};

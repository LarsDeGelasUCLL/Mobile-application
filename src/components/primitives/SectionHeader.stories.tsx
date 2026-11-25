import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "./SectionHeader";

const meta: Meta<typeof SectionHeader> = {
  title: "Primitives/SectionHeader",
  component: SectionHeader,
};
export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Label: Story = { args: { title: "BALANCES" } };
export const WithCount: Story = { args: { title: "MEMBERS", count: 3 } };
export const Title: Story = {
  args: { title: "Recent expenses", variant: "title" },
};
export const WithAction: Story = {
  args: { title: "Groups", variant: "title", onAction: () => {} },
};

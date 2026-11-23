import type { Meta, StoryObj } from "@storybook/react";
import { InfoRow } from "./InfoRow";

const meta: Meta<typeof InfoRow> = {
  title: "Common/InfoRow",
  component: InfoRow,
};
export default meta;
type Story = StoryObj<typeof InfoRow>;

export const Default: Story = { args: { label: "Paid by", value: "Sarah" } };
export const Highlighted: Story = {
  args: { label: "Total", value: "€48.00", highlightValue: true },
};
export const WithDescription: Story = {
  args: {
    label: "Split",
    description: "Equal between 4 people",
    value: "€12.00 each",
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { BrandHeader } from "./BrandHeader";

const meta: Meta<typeof BrandHeader> = {
  title: "Auth/BrandHeader",
  component: BrandHeader,
};
export default meta;
type Story = StoryObj<typeof BrandHeader>;

export const Default: Story = {};

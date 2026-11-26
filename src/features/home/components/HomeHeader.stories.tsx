import type { Meta, StoryObj } from "@storybook/react";
import { HomeHeader } from "./HomeHeader";

const meta: Meta<typeof HomeHeader> = {
  title: "Home/HomeHeader",
  component: HomeHeader,
};
export default meta;
type Story = StoryObj<typeof HomeHeader>;

export const Default: Story = { args: { name: "Niels Jacobs" } };
export const OneWordName: Story = { args: { name: "Niels" } };

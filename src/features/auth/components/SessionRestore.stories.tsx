import type { Meta, StoryObj } from "@storybook/react";
import { SessionRestore } from "./SessionRestore";

const meta: Meta<typeof SessionRestore> = {
  title: "Auth/SessionRestore",
  component: SessionRestore,
};
export default meta;
type Story = StoryObj<typeof SessionRestore>;

export const CardRestoring: Story = {
  args: { variant: "card", isLoading: true, onRetry: () => {} },
};
export const CardFailed: Story = {
  args: { ...CardRestoring.args, isLoading: false },
};
export const BannerRestoring: Story = {
  args: { variant: "banner", isLoading: true, onRetry: () => {} },
};
export const BannerFailed: Story = {
  args: {
    ...BannerRestoring.args,
    isLoading: false,
    failedMessage: "Could not load your profile.",
  },
};

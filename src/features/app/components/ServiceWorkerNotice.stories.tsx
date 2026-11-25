import type { Meta, StoryObj } from "@storybook/react";
import { ServiceWorkerNotice } from "./ServiceWorkerNotice";

const meta: Meta<typeof ServiceWorkerNotice> = {
  title: "App/ServiceWorkerNotice",
  component: ServiceWorkerNotice,
};
export default meta;
type Story = StoryObj<typeof ServiceWorkerNotice>;

export const Default: Story = { args: { onRetry: () => {} } };

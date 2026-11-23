import type { Meta, StoryObj } from "@storybook/react";
import { ListRow } from "./ListRow";

const meta: Meta<typeof ListRow> = {
  title: "Primitives/ListRow",
  component: ListRow,
};
export default meta;
type Story = StoryObj<typeof ListRow>;

export const Navigation: Story = {
  args: { icon: "person-outline", label: "Edit profile", onPress: () => {} },
};
export const WithValue: Story = {
  args: {
    icon: "mail-outline",
    label: "Email",
    value: "sam@example.com",
    onPress: () => {},
  },
};
export const WithDescription: Story = {
  args: {
    label: "Weekend Ghent",
    description: "Admin · 2 requests",
    onPress: () => {},
  },
};
export const Static: Story = {
  args: { icon: "call-outline", label: "Phone", value: "+32 470 12 34 56" },
};
export const Destructive: Story = {
  args: {
    icon: "log-out-outline",
    label: "Log out",
    destructive: true,
    onPress: () => {},
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";
import { ScreenHeader } from "./ScreenHeader";

const meta: Meta<typeof ScreenHeader> = {
  title: "Primitives/ScreenHeader",
  component: ScreenHeader,
};
export default meta;
type Story = StoryObj<typeof ScreenHeader>;

export const TabTitle: Story = {
  args: {
    title: "Groups",
    actions: (
      <IconButton
        icon="add"
        accessibilityLabel="New group"
        onPress={() => {}}
      />
    ),
  },
};
export const WithBackAndTwoActions: Story = {
  args: {
    title: "Weekend Ghent",
    subtitle: "4 members",
    onBack: () => {},
    actions: (
      <>
        <IconButton
          icon="key-outline"
          accessibilityLabel="Invite code"
          onPress={() => {}}
        />
        <IconButton
          icon="settings-outline"
          accessibilityLabel="Group settings"
          onPress={() => {}}
        />
      </>
    ),
  },
};

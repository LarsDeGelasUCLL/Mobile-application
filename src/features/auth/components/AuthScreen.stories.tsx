import type { Meta, StoryObj } from "@storybook/react";
import { Stack, StyledButton, Text } from "../../../components/primitives";
import { AuthScreen } from "./AuthScreen";

const meta: Meta<typeof AuthScreen> = {
  title: "Auth/AuthScreen",
  component: AuthScreen,
};
export default meta;
type Story = StoryObj<typeof AuthScreen>;

export const Default: Story = {
  args: {
    children: (
      <Stack gap="lg" padding="md">
        <Text size="xxl" weight="bold" align="center">
          Welcome back
        </Text>
        <Text tone="muted">The form for the current mode goes here.</Text>
      </Stack>
    ),
    belowCard: (
      <StyledButton label="Create account" onPress={() => {}} variant="link" />
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { MaskedValue } from "./MaskedValue";

const meta: Meta<typeof MaskedValue> = {
  title: "Primitives/MaskedValue",
  component: MaskedValue,
};
export default meta;
type Story = StoryObj<typeof MaskedValue>;

export const InviteCode: Story = {
  args: {
    label: "Invite code",
    value: "K7P-2QX",
    shareMessage: "Join my group on Lumin with code K7P-2QX",
    testID: "invite-code",
  },
};
export const Iban: Story = {
  args: { label: "IBAN", value: "BE71 0961 2345 6769" },
};

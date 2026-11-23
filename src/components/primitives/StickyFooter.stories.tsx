import type { Meta, StoryObj } from "@storybook/react";
import { StyledButton } from "../common/StyledButton";
import { StickyFooter } from "./StickyFooter";

const meta: Meta<typeof StickyFooter> = {
  title: "Primitives/StickyFooter",
  component: StickyFooter,
};
export default meta;
type Story = StoryObj<typeof StickyFooter>;

export const PrimaryAction: Story = {
  args: { children: <StyledButton label="Add expense" onPress={() => {}} /> },
};

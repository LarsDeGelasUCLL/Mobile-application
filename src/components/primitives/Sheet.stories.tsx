import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StyledButton } from "./StyledButton";
import { ListRow } from "./ListRow";
import { Sheet } from "./Sheet";

const meta: Meta<typeof Sheet> = {
  title: "Primitives/Sheet",
  component: Sheet,
};
export default meta;
type Story = StoryObj<typeof Sheet>;

function SheetDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <StyledButton
        label="Open sheet"
        variant="secondary"
        onPress={() => setOpen(true)}
      />
      <Sheet visible={open} onClose={() => setOpen(false)} title="New">
        <ListRow
          icon="people-outline"
          label="Create group"
          onPress={() => setOpen(false)}
        />
        <ListRow
          icon="enter-outline"
          label="Join with code"
          onPress={() => setOpen(false)}
        />
      </Sheet>
    </>
  );
}

export const PlusMenu: Story = { render: () => <SheetDemo /> };

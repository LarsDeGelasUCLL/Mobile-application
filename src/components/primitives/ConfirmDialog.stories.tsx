import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StyledButton } from "../common/StyledButton";
import { ConfirmDialog } from "./ConfirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Primitives/ConfirmDialog",
  component: ConfirmDialog,
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

function Demo({
  destructive = true,
  isLoading,
}: {
  destructive?: boolean;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <StyledButton
        label="Open dialog"
        variant="secondary"
        onPress={() => setOpen(true)}
      />
      <ConfirmDialog
        visible={open}
        title={destructive ? "Leave 'Weekend Ghent'?" : "Send join request?"}
        message={
          destructive
            ? "You lose access to its expenses until someone invites you again."
            : "An admin has to approve it."
        }
        confirmLabel={destructive ? "Leave group" : "Send"}
        destructive={destructive}
        isLoading={isLoading}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const Destructive: Story = { render: () => <Demo /> };
export const Neutral: Story = { render: () => <Demo destructive={false} /> };
export const Loading: Story = { render: () => <Demo isLoading /> };

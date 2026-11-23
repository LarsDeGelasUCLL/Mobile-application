import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
};
export default meta;
type Story = StoryObj<typeof Select>;

function ThemeSelect() {
  const [value, setValue] = useState<"SYSTEM" | "LIGHT" | "DARK">("SYSTEM");
  return (
    <Select
      label="Theme"
      value={value}
      onChange={setValue}
      testID="theme-select"
      options={[
        { label: "System", value: "SYSTEM" },
        { label: "Light", value: "LIGHT" },
        { label: "Dark", value: "DARK" },
      ]}
    />
  );
}

export const Theme: Story = { render: () => <ThemeSelect /> };

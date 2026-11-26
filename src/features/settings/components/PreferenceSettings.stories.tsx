import type { Meta, StoryObj } from "@storybook/react";
import { PreferenceSettings } from "./PreferenceSettings";

const meta: Meta<typeof PreferenceSettings> = {
  title: "Settings/PreferenceSettings",
  component: PreferenceSettings,
};
export default meta;
type Story = StoryObj<typeof PreferenceSettings>;

export const Default: Story = {
  args: {
    settings: { uiTheme: "SYSTEM", languageCode: "en" },
    onSave: () => {},
  },
};
export const DarkDutch: Story = {
  args: { ...Default.args, settings: { uiTheme: "DARK", languageCode: "nl" } },
};

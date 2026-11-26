import type { Meta, StoryObj } from "@storybook/react";
import { NewPasswordFields } from "./NewPasswordFields";

const meta: Meta<typeof NewPasswordFields> = {
  title: "Auth/NewPasswordFields",
  component: NewPasswordFields,
};
export default meta;
type Story = StoryObj<typeof NewPasswordFields>;

export const Empty: Story = {
  args: {
    password: "",
    confirmPassword: "",
    onChangePassword: () => {},
    onChangeConfirmPassword: () => {},
    errors: {},
  },
};
export const WithErrors: Story = {
  args: {
    ...Empty.args,
    password: "short",
    confirmPassword: "other",
    errors: {
      passwordError: "validation.passwordTooShort",
      confirmPasswordError: "validation.passwordsMustMatch",
    },
  },
};

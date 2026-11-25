import type { Meta, StoryObj } from "@storybook/react";
import { ProfileForm } from "./ProfileForm";

const meta: Meta<typeof ProfileForm> = {
  title: "Profile/ProfileForm",
  component: ProfileForm,
};
export default meta;
type Story = StoryObj<typeof ProfileForm>;

export const Filled: Story = {
  args: {
    initialValues: {
      displayName: "Sam Peeters",
      phoneNumber: "+32 470 12 34 56",
      iban: "BE71096123456769",
      profilePictureUrl: "",
      customBio: "Splits the bill, never the pizza.",
    },
    fieldErrors: {},
    isLoading: false,
    onChangeField: () => {},
    onSubmit: () => {},
  },
};
export const WithErrors: Story = {
  args: {
    ...Filled.args,
    initialValues: {
      displayName: "",
      phoneNumber: "abc",
      iban: "NL00BANK0123456789",
      profilePictureUrl: "http://example.com/photo.jpg",
      customBio: "",
    },
    fieldErrors: {
      displayName: "Display name is required.",
      phoneNumber: "Enter a valid phone number.",
      iban: "Enter a valid IBAN.",
      profilePictureUrl: "Enter a valid HTTPS URL.",
    },
  },
};
export const Saving: Story = { args: { ...Filled.args, isLoading: true } };

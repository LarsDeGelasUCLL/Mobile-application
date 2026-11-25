import { useImperativeHandle, useState, type Ref } from "react";
import { InputField, Stack } from "../../../components/primitives";
import type {
  ProfileFieldErrors,
  ProfileFormValues,
} from "../profileValidation";

interface ProfileFormProps {
  /** Read once on mount; give the form a new `key` to re-seed it. */
  initialValues: ProfileFormValues;
  fieldErrors: ProfileFieldErrors;
  isLoading: boolean;
  /** Called on every edit, e.g. to clear that field's error. */
  onChangeField: (field: keyof ProfileFormValues) => void;
  onSubmit: (values: ProfileFormValues) => void;
  /** The page's sticky footer button calls `submit()`. */
  ref?: Ref<ProfileFormHandle>;
  testID?: string;
}

export interface ProfileFormHandle {
  submit: () => void;
}

/** The edit-profile fields: name, phone, IBAN, picture URL and bio. */
export function ProfileForm({
  initialValues,
  fieldErrors,
  isLoading,
  onChangeField,
  onSubmit,
  ref,
  testID,
}: ProfileFormProps) {
  const [values, setValues] = useState(initialValues);
  useImperativeHandle(ref, () => ({ submit: () => onSubmit(values) }));

  // Each field's value, onChangeText, error and editable state.
  const field = (name: keyof ProfileFormValues) => ({
    value: values[name],
    onChangeText: (value: string) => {
      setValues((current) => ({ ...current, [name]: value }));
      onChangeField(name);
    },
    error: fieldErrors[name],
    editable: !isLoading,
  });

  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label="Display name"
        placeholder="Your name"
        testID="profile-name-input"
        {...field("displayName")}
      />
      <InputField
        label="Phone number"
        placeholder="+32 123 456 789"
        keyboardType="phone-pad"
        testID="profile-phone-input"
        {...field("phoneNumber")}
      />
      <InputField
        label="IBAN for reimbursements"
        placeholder="BE00 0000 0000 0000"
        autoCapitalize="characters"
        testID="profile-iban-input"
        {...field("iban")}
      />
      <InputField
        label="Profile picture URL"
        placeholder="https://example.com/photo.jpg"
        keyboardType="url"
        autoCapitalize="none"
        testID="profile-picture-input"
        {...field("profilePictureUrl")}
      />
      <InputField
        label="Bio"
        placeholder="A short introduction"
        multiline
        maxLength={500}
        testID="profile-bio-input"
        {...field("customBio")}
      />
    </Stack>
  );
}

import { useImperativeHandle, useState, type Ref } from "react";
import { InputField, Stack } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
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

/** What the parent can call through `ref`. */
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
  const { t } = useI18n();
  const [values, setValues] = useState(initialValues);
  useImperativeHandle(ref, () => ({ submit: () => onSubmit(values) }));

  // Each field's value, onChangeText, error and editable state.
  const field = (name: keyof ProfileFormValues) => ({
    value: values[name],
    onChangeText: (value: string) => {
      setValues((current) => ({ ...current, [name]: value }));
      onChangeField(name);
    },
    error: fieldErrors[name] && t(fieldErrors[name]),
    editable: !isLoading,
  });

  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label={t("auth.field.displayName")}
        placeholder={t("auth.field.displayNamePlaceholder")}
        testID="profile-name-input"
        {...field("displayName")}
      />
      <InputField
        label={t("profile.field.phone")}
        placeholder={t("profile.field.phonePlaceholder")}
        keyboardType="phone-pad"
        testID="profile-phone-input"
        {...field("phoneNumber")}
      />
      <InputField
        label={t("profile.ibanLong")}
        placeholder={t("profile.field.ibanPlaceholder")}
        autoCapitalize="characters"
        testID="profile-iban-input"
        {...field("iban")}
      />
      <InputField
        label={t("profile.field.picture")}
        placeholder={t("profile.field.picturePlaceholder")}
        keyboardType="url"
        autoCapitalize="none"
        testID="profile-picture-input"
        {...field("profilePictureUrl")}
      />
      <InputField
        label={t("profile.field.bio")}
        placeholder={t("profile.field.bioPlaceholder")}
        multiline
        maxLength={500}
        testID="profile-bio-input"
        {...field("customBio")}
      />
    </Stack>
  );
}

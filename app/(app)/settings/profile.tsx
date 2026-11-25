import { useRef } from "react";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import {
  ProfileForm,
  type ProfileFormHandle,
} from "../../../src/features/profile/components/ProfileForm";
import { useEditProfile } from "../../../src/features/profile/useEditProfile";

export default function EditProfileScreen() {
  const formRef = useRef<ProfileFormHandle>(null);
  const page = useEditProfile();

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label={page.profileError ? "Retry save" : "Save changes"}
          onPress={() => formRef.current?.submit()}
          isLoading={page.isLoading}
          testID="save-profile-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Edit profile"
          onBack={() => goBackOr("/settings")}
          testID="edit-profile-header"
        />
        <ProfileForm
          key={page.formKey}
          ref={formRef}
          initialValues={page.initialValues}
          fieldErrors={page.fieldErrors}
          isLoading={page.isLoading}
          onChangeField={page.changeField}
          onSubmit={(values) => void page.save(values)}
        />
        {page.profileError !== "" ? (
          <FeedbackBanner
            tone="error"
            message={page.profileError}
            testID="profile-save-error"
          />
        ) : null}
        {page.savedMessage !== "" ? (
          <FeedbackBanner
            tone="success"
            message={page.savedMessage}
            testID="profile-saved-message"
          />
        ) : null}
        {page.partialSuccessWarning !== "" ? (
          <FeedbackBanner
            tone="warning"
            message={page.partialSuccessWarning}
            testID="profile-save-warning"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}

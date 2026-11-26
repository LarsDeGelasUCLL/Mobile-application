import { useRef } from "react";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";
import {
  ProfileForm,
  type ProfileFormHandle,
} from "../../../src/features/profile/components/ProfileForm";
import { useEditProfile } from "../../../src/features/profile/useEditProfile";

export default function EditProfileScreen() {
  const { t } = useI18n();
  const formRef = useRef<ProfileFormHandle>(null);
  const page = useEditProfile();

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label={t(
            page.profileError ? "profile.edit.retrySave" : "common.saveChanges",
          )}
          onPress={() => formRef.current?.submit()}
          isLoading={page.isLoading}
          testID="save-profile-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("profile.edit.title")}
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

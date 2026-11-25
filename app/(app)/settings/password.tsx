import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { NewPasswordFields } from "../../../src/features/auth/components/NewPasswordFields";
import { useChangePassword } from "../../../src/features/auth/useChangePassword";

export default function ChangePasswordScreen() {
  const page = useChangePassword();

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label="Update password"
          onPress={page.submit}
          isLoading={page.isLoading}
          testID="change-password-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Password"
          onBack={() => goBackOr("/settings")}
          testID="change-password-header"
        />
        <NewPasswordFields
          password={page.password}
          confirmPassword={page.confirmPassword}
          onChangePassword={page.changePassword}
          onChangeConfirmPassword={page.changeConfirmPassword}
          errors={page.errors}
          passwordTestID="settings-new-password-input"
          confirmPasswordTestID="settings-confirm-password-input"
        />
        {page.requestError !== "" ? (
          <FeedbackBanner
            tone="error"
            message={page.requestError}
            testID="change-password-error"
          />
        ) : null}
        {page.message !== "" ? (
          <FeedbackBanner
            tone="success"
            message={page.message}
            testID="change-password-success"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}

import { useState } from "react";
import { useAuthStore } from "../../state/useAuthStore";
import { errorMessage, t } from "../../i18n";
import { validateNewPassword, type NewPasswordErrors } from "./authValidation";

/** The settings password page: the two fields, their errors, and the
 * update's success / error message. */
export function useChangePassword() {
  const setPassword = useAuthStore((state) => state.setPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const submit = async () => {
    const nextErrors = validateNewPassword(password, confirmPassword);
    setErrors(nextErrors);
    setMessage("");
    setRequestError("");
    if (nextErrors.passwordError || nextErrors.confirmPasswordError) return;

    try {
      await setPassword({ password });
      setPasswordValue("");
      setConfirmPassword("");
      setMessage(t("feedback.passwordUpdated"));
    } catch (error) {
      setRequestError(
        errorMessage(error, "errors.fallback.updatePassword"),
      );
    }
  };

  return {
    password,
    changePassword: setPasswordValue,
    confirmPassword,
    changeConfirmPassword: setConfirmPassword,
    errors,
    message,
    requestError,
    isLoading,
    submit,
  };
}

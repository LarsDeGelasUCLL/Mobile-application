import { useState } from "react";
import { useAuthStore } from "../../state/useAuthStore";
import { getErrorMessage } from "../../utils/errors";
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
      setMessage("Your password was updated.");
    } catch (error) {
      setRequestError(
        getErrorMessage(error, "Could not update the password. Please retry."),
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

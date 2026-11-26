import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../../state/useAuthStore";
import { errorMessage } from "../../i18n";

/** The settings page's log out: the confirm dialog, the logout itself and
 * its error. Returns the props `LogoutRow` takes. */
export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const confirm = async () => {
    setError("");
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (logoutError) {
      setConfirmVisible(false);
      setError(
        errorMessage(logoutError, "errors.fallback.logout"),
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    error,
    confirmVisible,
    isLoggingOut,
    onPress: () => setConfirmVisible(true),
    onConfirm: () => void confirm(),
    onCancel: () => setConfirmVisible(false),
  };
}

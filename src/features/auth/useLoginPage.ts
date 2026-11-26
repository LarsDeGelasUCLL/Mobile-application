import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useI18n } from "../../i18n";
import { useAuthStore } from "../../state/useAuthStore";
import {
  AUTH_TITLES,
  authLinkErrorMessage,
  parseAuthMode,
  type AuthLinkParams,
  type AuthMode,
} from "./authMode";
import type { AuthFieldProps, AuthFields } from "./types";

const EMPTY_FIELDS: AuthFields = {
  email: "",
  password: "",
  displayName: "",
  phoneNumber: "",
};

/** The login page: the mode, the values shared between its forms, session
 * restore and the redirect once signed in. Each form owns its own submit. */
export function useLoginPage() {
  const { t } = useI18n();
  const params = useLocalSearchParams<AuthLinkParams>();
  const [mode, setMode] = useState<AuthMode>(() => parseAuthMode(params));
  const [linkError, setLinkError] = useState(() =>
    authLinkErrorMessage(params),
  );
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const { initialize, isLoading, isAuthenticated, isInitialized } =
    useAuthStore(
      useShallow((state) => ({
        initialize: state.initialize,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      })),
    );

  // Signed in: go to the app, except in the modes that must stay on this page
  // (choosing a new password after a link, or waiting for email confirmation).
  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      mode !== "set-password" &&
      mode !== "confirmation"
    ) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, mode]);

  /** Each form keeps its own errors, so a new form starts without them. */
  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLinkError(undefined);
  };

  const changeField = (field: keyof AuthFields, value: string) =>
    setFields((current) => ({ ...current, [field]: value }));

  const fieldProps: AuthFieldProps = { fields, onChangeField: changeField };

  // After signup when the account must be confirmed by email first.
  const requireConfirmation = (email: string) => {
    setConfirmationEmail(email);
    setMode("confirmation");
  };

  return {
    mode,
    title: t(AUTH_TITLES[mode]),
    linkError: linkError ? t(linkError) : "",
    fieldProps,
    confirmationEmail,
    switchMode,
    backToLogin: () => switchMode("login"),
    requireConfirmation,
    goHome: () => router.replace("/"),
    retryRestore: () => void initialize(),
    isLoading,
    isInitialized,
  };
}

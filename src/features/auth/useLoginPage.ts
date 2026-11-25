import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../state/useAuthStore";
import {
  AUTH_TITLES,
  authLinkErrorMessage,
  parseAuthMode,
  type AuthLinkParams,
  type AuthMode,
} from "./authMode";

/** The values that carry over when the user switches mode. */
export interface AuthFields {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
}

/** What each login form gets for its carried-over values. */
export interface AuthFieldProps {
  fields: AuthFields;
  onChangeField: (field: keyof AuthFields, value: string) => void;
}

const EMPTY_FIELDS: AuthFields = {
  email: "",
  password: "",
  displayName: "",
  phoneNumber: "",
};

/** The login page: the mode, the values shared between its forms, session
 * restore and the redirect once signed in. Each form owns its own submit. */
export function useLoginPage() {
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
    setLinkError("");
  };

  const changeField = (field: keyof AuthFields, value: string) =>
    setFields((current) => ({ ...current, [field]: value }));

  const requireConfirmation = (email: string) => {
    setConfirmationEmail(email);
    setMode("confirmation");
  };

  return {
    mode,
    title: AUTH_TITLES[mode],
    linkError,
    fields,
    changeField,
    confirmationEmail,
    switchMode,
    requireConfirmation,
    goHome: () => router.replace("/"),
    retryRestore: () => void initialize(),
    isLoading,
    isInitialized,
  };
}

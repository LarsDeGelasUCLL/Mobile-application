import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../state/useAuthStore";
import { useSettingsStore } from "../../state/useSettingsStore";
import type { UpdateUserSettingsDto } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { canRetrySettingsLoad } from "./settingsLoadRetry";

/** The settings page's saved preferences: load on open, save each change,
 * and the retry for a failed load or save. */
export function useSettingsSaver() {
  const userId = useAuthStore((state) => state.user?.id);
  const { settings, isLoading, error, fetchSettings, updateSettings } =
    useSettingsStore(
      useShallow((state) => ({
        settings: state.settings,
        isLoading: state.isLoading,
        error: state.error,
        fetchSettings: state.fetchSettings,
        updateSettings: state.updateSettings,
      })),
    );
  const [settingsActionError, setSettingsActionError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [pendingSettings, setPendingSettings] =
    useState<UpdateUserSettingsDto | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!userId) return;
    setSettingsActionError("");
    try {
      await fetchSettings(userId);
    } catch (loadError) {
      setSettingsActionError(
        getErrorMessage(loadError, "Could not load settings."),
      );
    }
  }, [userId, fetchSettings]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async (payload: UpdateUserSettingsDto) => {
    if (!userId || isSavingSettings) return;
    setPendingSettings(payload);
    setSettingsActionError("");
    setSettingsMessage("");
    setIsSavingSettings(true);
    try {
      await updateSettings(userId, payload);
      setPendingSettings(null);
      setSettingsMessage("Settings saved.");
    } catch (updateError) {
      setSettingsActionError(
        getErrorMessage(updateError, "Could not save settings. Please retry."),
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  return {
    settings,
    isLoading,
    /** The failed load or save, else the store's error; "" when none. */
    errorMessage: settingsActionError || error || "",
    settingsMessage,
    pendingSettings,
    isSavingSettings,
    showLoadRetry: canRetrySettingsLoad({
      pendingSettings,
      isLoading,
      settings,
      settingsActionError,
      error,
    }),
    loadSettings,
    saveSettings,
  };
}

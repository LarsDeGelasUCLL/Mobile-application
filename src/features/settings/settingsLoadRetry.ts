import type { UpdateUserSettingsDto, UserSettingsDto } from "../../types";

export interface SettingsLoadRetryInput {
  pendingSettings: UpdateUserSettingsDto | null;
  isLoading: boolean;
  settings: UserSettingsDto | null;
  /** The settings page's failed load or save; "" when none. */
  settingsActionError: string;
  /** The settings store's error. */
  error: string | null;
}

/** Offer to reload settings when none are cached or the last load or save
 * failed, unless a save is pending or a load is running. */
export function canRetrySettingsLoad({
  pendingSettings,
  isLoading,
  settings,
  settingsActionError,
  error,
}: SettingsLoadRetryInput): boolean {
  return Boolean(
    !pendingSettings &&
    !isLoading &&
    (!settings || settingsActionError || error),
  );
}

import type { StateCreator } from "zustand";
import type { UpdateUserSettingsDto, UserSettingsDto } from "../../types";

export interface SettingsState {
  /** `null` until fetched, and after logout. */
  settings: UserSettingsDto | null;
  isLoading: boolean;
  /** Translated message of the last failed fetch or update. */
  error: string | null;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (
    userId: string,
    payload: UpdateUserSettingsDto,
  ) => Promise<UserSettingsDto>;
  resetSettings: () => void;
}

/** Typed creator for the actions only (the store adds the state fields). */
export type SettingsActionCreator = StateCreator<
  SettingsState,
  [],
  [],
  Omit<SettingsState, "settings" | "isLoading" | "error">
>;

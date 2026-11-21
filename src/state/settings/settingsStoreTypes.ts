import type { StateCreator } from "zustand";
import type { UpdateUserSettingsDto, UserSettingsDto } from "../../types";

export interface SettingsState {
  settings: UserSettingsDto | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (
    userId: string,
    payload: UpdateUserSettingsDto,
  ) => Promise<UserSettingsDto>;
  resetSettings: () => void;
}

export type SettingsActionCreator = StateCreator<
  SettingsState,
  [],
  [],
  Omit<SettingsState, "settings" | "isLoading" | "error">
>;

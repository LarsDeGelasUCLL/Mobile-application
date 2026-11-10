import type { StateCreator } from "zustand";
import type { UpdateUserProfileDto, User } from "../../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateProfile: (payload: UpdateUserProfileDto) => Promise<void>;
}

export type AuthActionCreator = StateCreator<
  AuthState,
  [],
  [],
  Omit<AuthState, "user" | "isAuthenticated" | "isLoading">
>;

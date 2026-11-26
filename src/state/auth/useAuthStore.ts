import { create } from "zustand";
import { createAuthActions } from "./authStoreActions";
import type { AuthState } from "./authStoreTypes";

/** Session and signed-in user. Call `initialize()` once at app start. */
export const useAuthStore = create<AuthState>()((...args) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  ...createAuthActions(...args),
}));

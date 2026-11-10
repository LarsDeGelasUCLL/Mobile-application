import { create } from "zustand";
import { createAuthActions } from "./authStoreActions";
import type { AuthState } from "./authStoreTypes";

export const useAuthStore = create<AuthState>()((...args) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  ...createAuthActions(...args),
}));

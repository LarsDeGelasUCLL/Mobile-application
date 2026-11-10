import {
  changeEmail,
  login,
  logout,
  register,
  requestPasswordReset,
  resendConfirmation,
  setPassword,
  updateProfileName,
  updateUserProfile,
} from "../../services";
import type { AuthActionCreator } from "./authStoreTypes";
import { useExpenseStore } from "../expenses/useExpenseStore";
import { useGroupStore } from "../groups/useGroupStore";

export const createAuthActions: AuthActionCreator = (set, get) => ({
  login: async (payload) => {
    set({ isLoading: true });
    try {
      const user = await login(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const user = await register(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  requestPasswordReset: async (payload) => {
    set({ isLoading: true });
    try {
      await requestPasswordReset(payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setPassword: async (payload) => {
    set({ isLoading: true });
    try {
      await setPassword(payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  changeEmail: async (payload) => {
    set({ isLoading: true });
    try {
      await changeEmail(payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resendConfirmation: async (payload) => {
    set({ isLoading: true });
    try {
      await resendConfirmation(payload);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await logout();
    useGroupStore.getState().resetGroupStore();
    useExpenseStore.getState().resetExpenseStore();
    set({ user: null, isAuthenticated: false });
  },

  updateName: async (name) => {
    set({ isLoading: true });
    try {
      await updateProfileName(name);
      const currentUser = get().user;
      set({
        user: currentUser
          ? { ...currentUser, displayName: name.trim(), name: name.trim() }
          : null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (payload) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error("Not logged in.");
    }

    set({ isLoading: true });
    try {
      const updatedProfile = await updateUserProfile(currentUser.id, payload);
      set({
        user: {
          ...currentUser,
          ...updatedProfile,
          email: updatedProfile.emailAddress,
          name: updatedProfile.displayName,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
});

import {
  login,
  logout,
  register,
  updateProfileName,
  updateUserProfile,
} from "../../services";
import type { AuthActionCreator } from "./authStoreTypes";
import { useExpenseStore } from "../expenses/useExpenseStore";
import { useGroupStore } from "../groups/useGroupStore";

export const createAuthActions: AuthActionCreator = (set, get) => ({
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, displayName, phoneNumber) => {
    set({ isLoading: true });
    try {
      const user = await register(email, password, displayName, phoneNumber);
      set({ user, isAuthenticated: true, isLoading: false });
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
    if (!currentUser) return;

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

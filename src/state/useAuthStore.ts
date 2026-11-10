import { create } from "zustand";
import {
  login,
  register,
  logout,
  updateProfileName,
  updateUserProfile,
} from "../services";
import type { User, UpdateUserProfileDto } from "../types";
import { useExpenseStore } from "./useExpenseStore";
import { useGroupStore } from "./useGroupStore";

interface AuthState {
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

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

  updateName: async (name: string) => {
    set({ isLoading: true });
    try {
      await updateProfileName(name);
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            displayName: name.trim(),
            name: name.trim(),
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (payload: UpdateUserProfileDto) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({ isLoading: true });
    try {
      const updatedDto = await updateUserProfile(currentUser.id, payload);
      set({
        user: {
          ...currentUser,
          ...updatedDto,
          email: updatedDto.emailAddress,
          name: updatedDto.displayName,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

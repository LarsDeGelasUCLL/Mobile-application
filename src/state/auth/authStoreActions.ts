import {
  changeEmail,
  getCurrentUser,
  login,
  logout,
  register,
  requestPasswordReset,
  resendConfirmation,
  setPassword,
  supabase,
  updateProfileName,
  updateUserProfile,
} from "../../services";
import type { AuthActionCreator } from "./authStoreTypes";
import { useExpenseStore } from "../expenses/useExpenseStore";
import { useGroupStore } from "../groups/useGroupStore";
import { useSettingsStore } from "../settings/useSettingsStore";

let initializationPromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

function resetUserStores() {
  useGroupStore.getState().resetGroupStore();
  useExpenseStore.getState().resetExpenseStore();
  useSettingsStore.getState().resetSettings();
}

export const createAuthActions: AuthActionCreator = (set, get) => ({
  initialize: async () => {
    if (get().isInitialized) {
      return;
    }
    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      set({ isLoading: true });

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT" || !session) {
            resetUserStores();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }

          set((state) => ({
            user: state.user?.id === session.user.id ? state.user : null,
            isAuthenticated: true,
          }));
          void getCurrentUser(session)
            .then((user) =>
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
              }),
            )
            .catch((error) => {
              console.error(
                "Could not load the authenticated user profile.",
                error,
              );
              set((state) => ({
                user: state.user?.id === session.user.id ? state.user : null,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: false,
              }));
            });
        });
        authSubscription = data.subscription;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw new Error(error.message);
        }
        const session = data.session;
        if (!session) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          return;
        }

        set((state) => ({
          user: state.user?.id === session.user.id ? state.user : null,
          isAuthenticated: true,
        }));
        const user = await getCurrentUser(session);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Could not initialize authentication.", error);
        set({ isLoading: false, isInitialized: false });
      } finally {
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  },

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
    resetUserStores();
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

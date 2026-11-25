import {
  changeEmail,
  exchangeCodeForSession,
  getCurrentUser,
  login,
  logout,
  register,
  requestPasswordReset,
  resendConfirmation,
  setPassword,
  supabase,
  updateUserProfile,
  ProfileUpdatePartialSuccessError,
} from "../../services";
import type { Session } from "@supabase/supabase-js";
import type { AuthActionCreator, AuthState } from "./authStoreTypes";
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

export const createAuthActions: AuthActionCreator = (set, get) => {
  // Keeps the cached user while the session's profile reloads, then sets it.
  const applySession = async (session: Session) => {
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
  };

  // isLoading around an auth call; on success also sets the state it returns.
  const withLoading = async (
    action: () => Promise<Pick<AuthState, "user" | "isAuthenticated"> | void>,
  ) => {
    set({ isLoading: true });
    try {
      const result = await action();
      set({ ...result, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  };

  return {
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

            void applySession(session).catch((error) => {
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

          await applySession(session);
        } catch (error) {
          console.error("Could not initialize authentication.", error);
          set({ isLoading: false, isInitialized: false });
        } finally {
          initializationPromise = null;
        }
      })();

      return initializationPromise;
    },

    login: (payload) =>
      withLoading(async () => ({
        user: await login(payload),
        isAuthenticated: true,
      })),

    register: (payload) =>
      withLoading(async () => ({
        user: await register(payload),
        isAuthenticated: true,
      })),

    // No loading state: the auth listener applies the new session.
    exchangeCodeForSession: (code) => exchangeCodeForSession(code),

    requestPasswordReset: (payload) =>
      withLoading(() => requestPasswordReset(payload)),

    setPassword: (payload) => withLoading(() => setPassword(payload)),

    changeEmail: (payload) => withLoading(() => changeEmail(payload)),

    resendConfirmation: (payload) =>
      withLoading(() => resendConfirmation(payload)),

    logout: async () => {
      await logout();
      resetUserStores();
      set({ user: null, isAuthenticated: false });
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
          user: { ...currentUser, ...updatedProfile },
          isLoading: false,
        });
      } catch (error) {
        if (error instanceof ProfileUpdatePartialSuccessError) {
          set({
            user: { ...currentUser, ...error.profile },
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
        throw error;
      }
    },
  };
};

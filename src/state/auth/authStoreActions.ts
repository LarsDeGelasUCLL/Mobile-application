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

// Module-level so concurrent `initialize()` calls share one run, and the auth
// listener is registered only once for the app's lifetime.
let initializationPromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

/** Clears the previous user's data from the other stores (on sign-out). */
function resetUserStores() {
  useGroupStore.getState().resetGroupStore();
  useExpenseStore.getState().resetExpenseStore();
  useSettingsStore.getState().resetSettings();
}

/** The auth store's actions; the state fields are in useAuthStore. */
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
    // Restores the stored session and subscribes to auth changes. Runs once;
    // after a failure (`isInitialized` stays false) the app can call it again.
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

            // Signed in, but the profile failed to load: stay uninitialized so
            // the app layout shows SessionRestore with a retry.
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

    // Also clears state here, without waiting for the SIGNED_OUT event.
    logout: async () => {
      await logout();
      resetUserStores();
      set({ user: null, isAuthenticated: false });
    },

    updateProfile: async (payload) => {
      const currentUser = get().user;
      if (!currentUser) {
        // A translation key: errorMessage() shows its text.
        throw new Error("errors.store.notLoggedIn");
      }

      set({ isLoading: true });
      try {
        const updatedProfile = await updateUserProfile(currentUser.id, payload);
        set({
          user: { ...currentUser, ...updatedProfile },
          isLoading: false,
        });
      } catch (error) {
        // The profile row was saved even though the call threw: keep the saved data.
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

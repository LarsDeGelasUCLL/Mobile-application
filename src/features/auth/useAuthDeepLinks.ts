import { router } from "expo-router";
import { useEffect } from "react";
import { Linking, Platform } from "react-native";
import { useAuthStore } from "../../state/useAuthStore";
import { exchangeAuthLinkCode } from "./authLink";

/**
 * Native only: signs in with the code of an auth email link (cold start or
 * while open) and opens set-password; a failed link opens reset with an error.
 */
export function useAuthDeepLinks() {
  const exchangeCodeForSession = useAuthStore(
    (state) => state.exchangeCodeForSession,
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    const showAuthLinkFailure = () =>
      router.replace("/login?mode=reset&authLinkError=1");
    const handleAuthDeepLink = async (url: string | null | undefined) => {
      if (!url) return;
      // The store throws on failure; exchangeAuthLinkCode maps that to "failed".
      const result = await exchangeAuthLinkCode(url, async (code) => {
        await exchangeCodeForSession(code);
        return { error: null };
      });
      if (result === "failed") {
        showAuthLinkFailure();
      } else if (result === "completed") {
        router.replace("/login?mode=set-password");
      }
    };

    void Linking.getInitialURL()
      .then(handleAuthDeepLink)
      .catch(showAuthLinkFailure);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleAuthDeepLink(url).catch(showAuthLinkFailure);
    });
    return () => subscription.remove();
  }, [exchangeCodeForSession]);
}

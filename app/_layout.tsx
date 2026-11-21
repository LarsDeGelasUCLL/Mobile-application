import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { Linking, Platform } from "react-native";
import { useAuthStore } from "../src/state/useAuthStore";
import { supabase } from "../src/services";
import { exchangeAuthLinkCode } from "../src/features/auth/authLink";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();

    const showAuthLinkFailure = () =>
      router.replace("/login?mode=reset&authLinkError=1");
    const handleAuthDeepLink = async (url: string | null | undefined) => {
      if (!url) return;
      const result = await exchangeAuthLinkCode(url, async (code) => {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return { error };
      });
      if (result === "failed") {
        showAuthLinkFailure();
      } else if (result === "completed") {
        router.replace("/login?mode=set-password");
      }
    };

    if (Platform.OS !== "web") {
      void Linking.getInitialURL()
        .then(handleAuthDeepLink)
        .catch(showAuthLinkFailure);
      const subscription = Linking.addEventListener("url", ({ url }) => {
        void handleAuthDeepLink(url).catch(showAuthLinkFailure);
      });
      return () => subscription.remove();
    }

    if (Platform.OS === "web" && typeof document !== "undefined") {
      if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement("link");
        link.rel = "manifest";
        link.href = "/manifest.json";
        document.head.appendChild(link);
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) =>
            console.log("Service Worker geregistreerd:", reg.scope),
          )
          .catch((err) => console.error("Service Worker fout:", err));
      }
    }
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Slot />
    </SafeAreaProvider>
  );
}

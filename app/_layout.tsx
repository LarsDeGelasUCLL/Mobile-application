import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { useAuthStore } from "../src/state/useAuthStore";
import { supabase } from "../src/services";
import { exchangeAuthLinkCode } from "../src/features/auth/authLink";
import { FeedbackBanner, Text } from "../src/components/primitives";
import { StyledButton } from "../src/components/common/StyledButton";
import { colors } from "../src/theme/colors";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const [serviceWorkerError, setServiceWorkerError] = useState(false);

  const registerServiceWorker = useCallback(async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      setServiceWorkerError(false);
    } catch (error) {
      console.error("Could not register the service worker.", error);
      setServiceWorkerError(true);
    }
  }, []);

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
        void registerServiceWorker();
      }
    }
  }, [initialize, registerServiceWorker]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {serviceWorkerError ? (
        <View style={styles.serviceWorkerNotice}>
          <FeedbackBanner tone="warning" testID="service-worker-error">
            <Text size="sm" color={colors.warning}>
              Offline support could not start. The app is still available
              online.
            </Text>
            <StyledButton
              label="Retry offline support"
              onPress={() => void registerServiceWorker()}
              variant="secondary"
            />
          </FeedbackBanner>
        </View>
      ) : null}
      <Slot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  serviceWorkerNotice: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

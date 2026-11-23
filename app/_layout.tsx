import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  router,
  Slot,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useAuthStore } from "../src/state/useAuthStore";
import { useSettingsStore } from "../src/state/useSettingsStore";
import { supabase } from "../src/services";
import { exchangeAuthLinkCode } from "../src/features/auth/authLink";
import { FeedbackBanner, Text } from "../src/components/primitives";
import { StyledButton } from "../src/components/common/StyledButton";
import { darkPalette, lightPalette } from "../src/theme/palettes";
import { resolveScheme } from "../src/theme/scheme";
import { ThemeProvider } from "../src/theme/ThemeProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const uiTheme = useSettingsStore((state) => state.settings?.uiTheme);
  const scheme = resolveScheme(uiTheme, useColorScheme());
  const colors = scheme === "dark" ? darkPalette : lightPalette;
  const navigationTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
    };
  }, [scheme, colors]);
  const [serviceWorkerError, setServiceWorkerError] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  // On font error we still start; unknown fontFamily falls back to the system font.
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsReady) void SplashScreen.hideAsync();
  }, [fontsReady]);

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

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = colors.surface;
    document.documentElement.style.colorScheme = scheme;
    document.body.style.backgroundColor = colors.background;
  }, [scheme, colors]);

  if (!fontsReady) return null;

  return (
    <ThemeProvider scheme={scheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <SafeAreaProvider>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
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
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  serviceWorkerNotice: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

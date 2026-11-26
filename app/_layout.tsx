import { ThemeProvider as NavigationThemeProvider, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "../src/state/useAuthStore";
import { useSettingsStore } from "../src/state/useSettingsStore";
import { ServiceWorkerNotice } from "../src/features/app/components/ServiceWorkerNotice";
import { useDocumentLanguage } from "../src/features/app/useDocumentLanguage";
import { useNavigationTheme } from "../src/features/app/useNavigationTheme";
import { useServiceWorker } from "../src/features/app/useServiceWorker";
import { useWebThemeColor } from "../src/features/app/useWebThemeColor";
import { useAuthDeepLinks } from "../src/features/auth/useAuthDeepLinks";
import { resolveScheme } from "../src/theme/scheme";
import { ThemeProvider } from "../src/theme/ThemeProvider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const uiTheme = useSettingsStore((state) => state.settings?.uiTheme);
  const scheme = resolveScheme(uiTheme, useColorScheme());
  const navigationTheme = useNavigationTheme(scheme);
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

  // Starts auth (and its session listener) before any deep link is handled.
  useEffect(() => {
    void initialize();
  }, [initialize]);
  useAuthDeepLinks();
  const serviceWorker = useServiceWorker();
  useWebThemeColor(scheme);
  useDocumentLanguage();

  if (!fontsReady) return null;

  return (
    <ThemeProvider scheme={scheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <SafeAreaProvider>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          {serviceWorker.hasError ? (
            <ServiceWorkerNotice onRetry={serviceWorker.retry} />
          ) : null}
          <Slot />
        </SafeAreaProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

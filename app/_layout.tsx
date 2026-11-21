import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "../src/state/useAuthStore";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();

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

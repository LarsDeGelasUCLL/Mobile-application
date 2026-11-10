import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    if (typeof window !== "undefined") {
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
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Slot />
    </SafeAreaProvider>
  );
}

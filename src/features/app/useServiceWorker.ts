import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

/**
 * Web only: links the PWA manifest and registers `/sw.js` once.
 * `hasError` is true after a failed registration; `retry` registers again.
 */
export function useServiceWorker() {
  const [hasError, setHasError] = useState(false);

  const register = useCallback(async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      setHasError(false);
    } catch (error) {
      console.error("Could not register the service worker.", error);
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    // The PWA manifest link, unless the page already has one.
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
    }

    if ("serviceWorker" in navigator) {
      void register();
    }
  }, [register]);

  return { hasError, retry: () => void register() };
}

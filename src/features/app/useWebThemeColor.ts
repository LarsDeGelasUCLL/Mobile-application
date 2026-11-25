import { useEffect } from "react";
import { Platform } from "react-native";
import { darkPalette, lightPalette } from "../../theme/palettes";

/** Web only: browser `theme-color`, `color-scheme` and page background follow `scheme`. */
export function useWebThemeColor(scheme: "light" | "dark") {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const colors = scheme === "dark" ? darkPalette : lightPalette;
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
  }, [scheme]);
}

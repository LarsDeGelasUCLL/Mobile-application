import { useEffect } from "react";
import { Platform } from "react-native";
import { paletteFor } from "../../theme/palettes";
import type { Scheme } from "../../theme/scheme";

/** Web only: browser `theme-color`, `color-scheme` and page background follow `scheme`. */
export function useWebThemeColor(scheme: Scheme) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const colors = paletteFor(scheme);
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

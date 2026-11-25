import { DarkTheme, DefaultTheme } from "expo-router";
import { useMemo } from "react";
import { paletteFor } from "../../theme/palettes";
import type { Scheme } from "../../theme/scheme";

/** React Navigation theme built from the app palette for `scheme`. */
export function useNavigationTheme(scheme: Scheme) {
  return useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    const colors = paletteFor(scheme);
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
  }, [scheme]);
}

import { DarkTheme, DefaultTheme } from "expo-router";
import { useMemo } from "react";
import { darkPalette, lightPalette } from "../../theme/palettes";

/** React Navigation theme built from the app palette for `scheme`. */
export function useNavigationTheme(scheme: "light" | "dark") {
  return useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    const colors = scheme === "dark" ? darkPalette : lightPalette;
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

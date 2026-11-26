import { createContext, useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { darkPalette, lightPalette, type Palette } from "./palettes";
import type { Scheme } from "./scheme";
import {
  controlSize,
  fontFamily,
  iconSize,
  motion,
  radius,
  spacing,
  typeScale,
} from "./tokens";

/** Everything `makeStyles` and `useTheme` hand to components: colours plus the shared tokens. */
export interface Theme {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof typeScale;
  fontFamily: typeof fontFamily;
  iconSize: typeof iconSize;
  controlSize: typeof controlSize;
  motion: typeof motion;
  scheme: Scheme;
}

const lightTheme: Theme = {
  colors: lightPalette,
  spacing,
  radius,
  type: typeScale,
  fontFamily,
  iconSize,
  controlSize,
  motion,
  scheme: "light",
};

const darkTheme: Theme = { ...lightTheme, colors: darkPalette, scheme: "dark" };

// Default value lets primitives render outside the provider (Storybook).
const ThemeContext = createContext<Theme>(lightTheme);

/** Provides the light or dark theme to everything below it. */
export function ThemeProvider({
  children,
  scheme = "light",
}: {
  children: React.ReactNode;
  scheme?: Theme["scheme"];
}) {
  // The app root resolves the scheme (resolveScheme in ./scheme); Storybook passes its toolbar value.
  return (
    <ThemeContext.Provider value={scheme === "dark" ? darkTheme : lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

/** The current theme, for values a stylesheet cannot hold (icon colours, inline styles). */
export function useTheme() {
  return useContext(ThemeContext);
}

/** `const useStyles = makeStyles((t) => ({ ... }))`, then `useStyles()` in the component. */
export function makeStyles<T extends Parameters<typeof StyleSheet.create>[0]>(
  factory: (theme: Theme) => T,
) {
  return function useStyles() {
    const theme = useTheme();
    // Rebuild the stylesheet only when the theme (light/dark) changes.
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

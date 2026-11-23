import { createContext, useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { darkPalette, lightPalette, type Palette } from "./palettes";
import {
  fontFamily,
  iconSize,
  motion,
  radius,
  spacing,
  typeScale,
} from "./tokens";

export interface Theme {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof typeScale;
  fontFamily: typeof fontFamily;
  iconSize: typeof iconSize;
  motion: typeof motion;
  scheme: "light" | "dark";
}

const lightTheme: Theme = {
  colors: lightPalette,
  spacing,
  radius,
  type: typeScale,
  fontFamily,
  iconSize,
  motion,
  scheme: "light",
};

const darkTheme: Theme = { ...lightTheme, colors: darkPalette, scheme: "dark" };

// Default value lets primitives render outside the provider (Storybook).
const ThemeContext = createContext<Theme>(lightTheme);

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

export function useTheme() {
  return useContext(ThemeContext);
}

/** `const useStyles = makeStyles((t) => ({ ... }))`, then `useStyles()` in the component. */
export function makeStyles<T extends Parameters<typeof StyleSheet.create>[0]>(
  factory: (theme: Theme) => T,
) {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

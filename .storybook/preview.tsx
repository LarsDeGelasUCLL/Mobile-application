import React from "react";
import type { Preview } from "@storybook/react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isLanguage, languages } from "../src/i18n/languages";
import { useLanguageStore } from "../src/state/language/useLanguageStore";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { paletteFor } from "../src/theme/palettes";
import { fontFamily } from "../src/theme/tokens";
import regular from "@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf";
import semibold from "@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf";
import bold from "@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf";

// The app loads these via useFonts in app/_layout.tsx; Storybook needs its own @font-face.
const fontStyle = document.createElement("style");
fontStyle.textContent = [
  [fontFamily.regular, regular],
  [fontFamily.semibold, semibold],
  [fontFamily.bold, bold],
]
  .map(
    ([family, url]) => `@font-face{font-family:"${family}";src:url(${url});}`,
  )
  .join("");
document.head.appendChild(fontStyle);

// Toolbar switches for theme and language, applied to every story.
const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Colour palette",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    language: {
      description: "App language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: Object.entries(languages).map(([value, { label }]) => ({
          value,
          title: label,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", language: "en" },
  decorators: [
    (Story, context) => {
      // Stories read the language from the store, like the app does.
      const language = context.globals.language;
      useLanguageStore
        .getState()
        .setLanguage(isLanguage(language) ? language : "en");
      const scheme = context.globals.theme === "dark" ? "dark" : "light";
      const palette = paletteFor(scheme);
      document.body.style.backgroundColor = palette.background;
      return (
        <SafeAreaProvider>
          <ThemeProvider scheme={scheme}>
            <View
              style={{
                padding: 16,
                minHeight: "100%",
                backgroundColor: palette.background,
              }}
            >
              <Story />
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

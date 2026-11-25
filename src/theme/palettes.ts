import type { Scheme } from "./scheme";

// Semantic colour tokens. Screens and primitives use these names, never hex.
// Contrast for every text/fill pair is enforced by tests/theme.test.mjs.
// `border` = decorative edge; `borderStrong` = input/checkbox edge (3:1, WCAG 1.4.11).
export const lightPalette = {
  background: "#F7F5FA",
  surface: "#FFFFFF",
  surfaceTint: "#F1ECF8",
  border: "#E8E2EF",
  borderStrong: "#8A8298",
  text: "#282333",
  textMuted: "#6B6576",
  primary: "#6D4BC3",
  onPrimary: "#FFFFFF",
  primaryText: "#6D4BC3",
  primaryPressed: "#5435A3",
  primarySoft: "#EFE8FB",
  primaryBorder: "#DCCDF5",
  success: "#217861",
  successSoft: "#E5F4EE",
  warning: "#916116",
  warningSoft: "#FFF4DA",
  error: "#B54747",
  errorSoft: "#FCEAEA",
  scrim: "rgba(20,17,28,0.45)",
  shadow: "#14111C",
};

export type Palette = typeof lightPalette;

export const darkPalette: Palette = {
  background: "#14111C",
  surface: "#1E1A29",
  surfaceTint: "#2A2438",
  border: "#342D45",
  borderStrong: "#7D7494",
  text: "#F2EEF8",
  textMuted: "#A9A1B8",
  primary: "#7C5CDB",
  onPrimary: "#FFFFFF",
  primaryText: "#A78BF0",
  primaryPressed: "#6A4AC9",
  primarySoft: "#2E2546",
  primaryBorder: "#4A3D6B",
  success: "#4CC19A",
  successSoft: "#16322A",
  warning: "#E0A845",
  warningSoft: "#3A2E14",
  error: "#E57373",
  errorSoft: "#3B1C1F",
  scrim: "rgba(0,0,0,0.6)",
  shadow: "#000000",
};

export function paletteFor(scheme: Scheme): Palette {
  return scheme === "dark" ? darkPalette : lightPalette;
}

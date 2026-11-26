import type { Palette } from "./palettes";

/**
 * Semantic foreground colour for `Text`, `Icon`, `IconButton` and `Spinner`.
 * `onPrimary` = on a `primary` fill; `inverse` = on a `text` fill.
 */
export type Tone =
  | "default"
  | "muted"
  | "primary"
  | "onPrimary"
  | "inverse"
  | "error"
  | "success"
  | "warning";

const paletteKeyByTone: Record<Tone, keyof Palette> = {
  default: "text",
  muted: "textMuted",
  primary: "primaryText",
  onPrimary: "onPrimary",
  inverse: "background",
  error: "error",
  success: "success",
  warning: "warning",
};

/** The palette colour for `tone` in the current palette. */
export function toneColor(colors: Palette, tone: Tone): string {
  return colors[paletteKeyByTone[tone]];
}

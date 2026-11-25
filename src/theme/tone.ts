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

export function toneColor(colors: Palette, tone: Tone): string {
  const byTone: Record<Tone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primaryText,
    onPrimary: colors.onPrimary,
    inverse: colors.background,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  };
  return byTone[tone];
}

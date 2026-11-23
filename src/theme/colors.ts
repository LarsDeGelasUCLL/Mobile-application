import { lightPalette } from "./palettes";

/** @deprecated Use `useTheme().colors`. Removed in revamp Phase 9. */
export const colors = {
  ...lightPalette,
  muted: lightPalette.textMuted,
  primaryDark: lightPalette.primaryPressed,
};

import type { UiTheme } from "../types/User";

export type Scheme = "light" | "dark";

/** Saved `ui_theme` wins; SYSTEM (or no settings yet) follows the device, light when unknown. */
export function resolveScheme(
  uiTheme: UiTheme | undefined,
  deviceScheme: string | null | undefined,
): Scheme {
  if (uiTheme === "LIGHT") return "light";
  if (uiTheme === "DARK") return "dark";
  return deviceScheme === "dark" ? "dark" : "light";
}

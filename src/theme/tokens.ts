// Theme-independent design tokens (design.md §3.2–3.3).
// Each `as const` keeps literal types (for `keyof typeof`); it asserts no type.

// as const: literal spacing keys and values.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// as const: literal radius keys and values.
export const radius = { sm: 8, md: 12, lg: 16, full: 9999 } as const;

// as const: literal keys so `keyof typeof typeScale` gives the size names.
export const typeScale = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  md: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 22, lineHeight: 28 },
  xxl: { fontSize: 28, lineHeight: 34 },
} as const;

// One family per weight: Android ignores fontWeight on custom fonts.
// as const: literal font-family names.
export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

// as const: literal icon-size keys and values.
export const iconSize = { sm: 16, md: 20, lg: 24 } as const;

// as const: literal animation durations in ms.
export const motion = { press: 150, sheet: 250 } as const;

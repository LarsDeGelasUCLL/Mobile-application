import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { importModule } from "./support/loadModule.mjs";

// WCAG 2.x relative luminance + contrast ratio for #RRGGBB.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const textOnPage = [
  "text",
  "textMuted",
  "primaryText",
  "success",
  "warning",
  "error",
];
const pages = ["background", "surface", "surfaceTint"];
const textPairs = [
  ...textOnPage.flatMap((fg) => pages.map((bg) => [fg, bg])),
  ["onPrimary", "primary"],
  ["onPrimary", "primaryPressed"],
  ["primaryText", "primarySoft"],
  ["success", "successSoft"],
  ["warning", "warningSoft"],
  ["error", "errorSoft"],
];
// Non-text UI (button fill, input/checkbox edge against the page) needs 3:1.
const uiPairs = [
  ["primary", "background"],
  ["primary", "surface"],
  ...pages.map((bg) => ["borderStrong", bg]),
];

const { lightPalette, darkPalette } = await importModule(
  "src/theme/palettes.ts",
);

test("light and dark palettes have identical keys", () => {
  assert.deepEqual(
    Object.keys(darkPalette).sort(),
    Object.keys(lightPalette).sort(),
  );
});

for (const [name, palette] of [
  ["light", lightPalette],
  ["dark", darkPalette],
]) {
  const failures = (pairs, min) =>
    pairs
      .map(([fg, bg]) => [fg, bg, contrast(palette[fg], palette[bg])])
      .filter(([, , ratio]) => ratio < min)
      .map(([fg, bg, ratio]) => `${fg} on ${bg} = ${ratio.toFixed(2)}:1`);

  test(`${name} palette: text pairs reach 4.5:1`, () => {
    assert.deepEqual(failures(textPairs, 4.5), []);
  });

  test(`${name} palette: UI pairs reach 3:1`, () => {
    assert.deepEqual(failures(uiPairs, 3), []);
  });
}

test("resolveScheme follows the saved theme, SYSTEM follows the device", async () => {
  const { resolveScheme } = await importModule("src/theme/scheme.ts");
  assert.equal(resolveScheme("LIGHT", "dark"), "light");
  assert.equal(resolveScheme("DARK", "light"), "dark");
  assert.equal(resolveScheme("SYSTEM", "dark"), "dark");
  assert.equal(resolveScheme("SYSTEM", "light"), "light");
  // No saved settings (logged out) or unknown device scheme → light fallback.
  assert.equal(resolveScheme(undefined, "dark"), "dark");
  assert.equal(resolveScheme("SYSTEM", null), "light");
  assert.equal(resolveScheme(undefined, undefined), "light");
});

test("colours live only in src/theme: no hex literals elsewhere, deprecated colors.ts gone", async () => {
  const files = [
    ...(await fs.readdir("app", { recursive: true })).map((f) => `app/${f}`),
    ...(await fs.readdir("src", { recursive: true })).map((f) => `src/${f}`),
  ].filter(
    (f) =>
      /\.(ts|tsx)$/.test(f) &&
      !f.replaceAll("\\", "/").startsWith("src/theme/"),
  );
  const offenders = [];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    if (/["'`]#[0-9A-Fa-f]{3,8}\b/.test(source)) offenders.push(file);
    if (/theme\/colors["']/.test(source))
      offenders.push(`${file} (imports colors.ts)`);
  }
  assert.deepEqual(offenders, []);
  await assert.rejects(fs.access("src/theme/colors.ts"));
});

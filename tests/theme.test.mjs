import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import ts from "typescript";

async function loadTypeScriptModule(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

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
// Non-text UI (button fill against the page) needs 3:1.
const uiPairs = [
  ["primary", "background"],
  ["primary", "surface"],
];

const { lightPalette, darkPalette } = await loadTypeScriptModule(
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

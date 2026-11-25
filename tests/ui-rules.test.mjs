// Project-wide UI rules that Cypress on web cannot see: accessibility props,
// native-only wiring, config consistency and source-wide bans.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const read = (file) => fs.readFile(file, "utf8");

/** Every `.ts`/`.tsx` file under `app/` and `src/`. */
async function sourceFiles() {
  const files = [];
  for (const dir of ["app", "src"]) {
    for (const file of await fs.readdir(dir, { recursive: true })) {
      if (/\.tsx?$/.test(file)) files.push(`${dir}/${file}`);
    }
  }
  return files;
}

/** Source files whose text matches `pattern`. */
async function filesMatching(pattern) {
  const hits = [];
  for (const file of await sourceFiles()) {
    if (pattern.test(await read(file))) hits.push(file);
  }
  return hits;
}

test("StyledButton's link variant is announced as a link", async () => {
  assert.match(
    await read("src/components/primitives/StyledButton.tsx"),
    /accessibilityRole=\{variant === "link" \? "link" : "button"\}/,
  );
});

test("native auth redirects use the scheme app.json registers", async () => {
  const { expo } = JSON.parse(await read("app.json"));
  assert.ok(
    (await read("src/features/auth/components/ResetForm.tsx")).includes(
      `${expo.scheme}://login?mode=`,
    ),
  );
});

test("status messages use the shared accessible FeedbackBanner, never a hand-styled banner", async () => {
  const feedback = await read("src/components/primitives/FeedbackBanner.tsx");
  assert.match(feedback, /accessibilityRole="alert"/);
  assert.match(feedback, /error:/);
  assert.match(feedback, /success:/);
  assert.match(feedback, /warning:/);
  assert.match(
    await read("src/components/primitives/index.ts"),
    /FeedbackBanner/,
  );
  assert.deepEqual(
    await filesMatching(/styles\.(?:error|success|warning)Banner/),
    [],
  );
});

test("no console.log in app/ or src/", async () => {
  assert.deepEqual(await filesMatching(/console\.log/), []);
});

test("the root layout starts auth before it handles auth deep links", async () => {
  // Native only: a cold-start link must not be exchanged before the session listener exists.
  const root = await read("app/_layout.tsx");
  const initializeAt = root.indexOf("initialize()");
  const deepLinksAt = root.indexOf("useAuthDeepLinks()");
  assert.ok(initializeAt >= 0, "initialize() is called");
  assert.ok(deepLinksAt >= 0, "useAuthDeepLinks() is called");
  assert.ok(initializeAt < deepLinksAt, "initialize() runs first");
});

test("the saved theme applies app-wide, sets the web theme-color and keeps the active tab readable", async () => {
  assert.match(await read("app/_layout.tsx"), /useWebThemeColor\(scheme\)/);
  assert.match(
    await read("src/features/app/useWebThemeColor.ts"),
    /theme-color/,
  );

  // Saved theme applies app-wide, not only after opening Settings.
  assert.match(await read("app/(app)/_layout.tsx"), /fetchSettings\(/);

  // Active tab label is text: dark `primary` on `surface` is only 3.57:1.
  assert.match(
    await read("app/(app)/(tabs)/_layout.tsx"),
    /tabBarActiveTintColor: colors\.primaryText/,
  );
});

test("phase 9 a11y: skeleton honours reduced motion, icons are decorative, carousel tiles give pressed feedback", async () => {
  const read = (file) => fs.readFile(file, "utf8");
  const skeleton = await read("src/components/primitives/Skeleton.tsx");
  assert.match(skeleton, /isReduceMotionEnabled\(\)/);
  assert.match(skeleton, /reduceMotionChanged/);
  // Native driver does not exist on web; asking for it only logs a warning.
  assert.match(skeleton, /useNativeDriver: Platform\.OS !== "web"/);

  // Icons sit beside visible text or inside a labelled IconButton.
  assert.match(await read("src/components/primitives/Icon.tsx"), /aria-hidden/);

  const highlights = await read(
    "src/features/home/components/GroupHighlights.tsx",
  );
  assert.match(highlights, /style=\{\(\{ pressed \}\) =>/);
  // Accessible name matches the visible label (WCAG 2.5.3).
  assert.match(highlights, /accessibilityLabel="Find groups"/);
});

test("phase 9 layout: text controls grow with font scale; tab bar keeps the home-indicator inset", async () => {
  const read = (file) => fs.readFile(file, "utf8");
  // A fixed height clips the label at large Dynamic Type / font scale.
  for (const file of [
    "src/components/primitives/StyledButton.tsx",
    "src/components/primitives/InputField.tsx",
    "src/components/primitives/Select.tsx",
  ]) {
    const source = await read(file);
    assert.doesNotMatch(source, /^\s+height: (44|48),/m, file);
    assert.match(source, /minHeight: (44|48),/, file);
  }

  const tabs = await read("app/(app)/(tabs)/_layout.tsx");
  assert.match(tabs, /useSafeAreaInsets\(\)/);
  assert.doesNotMatch(tabs, /height: 64,/);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { i18nFileDeps, loadI18n } from "./support/i18n.mjs";
import { loadModule } from "./support/loadModule.mjs";

const require = createRequire(import.meta.url);

test("resolveLanguage: saved wins, then device, then en", async () => {
  const { resolveLanguage } = await loadI18n();
  assert.equal(resolveLanguage("nl", "en"), "nl");
  assert.equal(resolveLanguage(undefined, "nl"), "nl");
  assert.equal(resolveLanguage(null, "de"), "en");
  assert.equal(resolveLanguage("fr", "nl"), "nl");
  assert.equal(resolveLanguage("", undefined), "en");
  assert.equal(resolveLanguage("EN", "xx"), "en"); // case-sensitive codes: unsupported → fallback
  assert.equal(resolveLanguage("toString", "constructor"), "en"); // no prototype keys
});

test("translate interpolates, pluralises and falls back", async () => {
  const { translate } = await loadI18n();
  assert.equal(translate("en", "home.highlights.open", { name: "Ada" }), "Open Ada");
  assert.equal(translate("en", "home.invitations", { count: 1 }), "1 invitation");
  assert.equal(translate("en", "home.invitations", { count: 3 }), "3 invitations");
  assert.equal(translate("en", "home.invitations", { count: 0 }), "0 invitations");
  assert.equal(translate("nl", "common.cancel"), "Annuleren");
  assert.equal(translate("nl", "home.highlights.open", { name: "Ada" }), "Ada openen");
  // A missing param leaves the placeholder visible rather than "undefined".
  assert.equal(translate("en", "home.highlights.open"), "Open {name}");
});

test("translate pluralises without Intl.PluralRules (Hermes lacks it)", async () => {
  const languages = await loadModule("src/i18n/languages.ts");
  const dictionaries = await loadModule("src/i18n/dictionaries/index.ts", {
    "./en": await loadModule("src/i18n/dictionaries/en.ts"),
    "./nl": await loadModule("src/i18n/dictionaries/nl.ts"),
  });
  const { translate } = await loadModule(
    "src/i18n/translate.ts",
    { "./languages": languages, "./dictionaries": dictionaries },
    { Intl: { ...Intl, PluralRules: undefined } },
  );
  for (const language of ["en", "nl"]) {
    const one = dictionaries.dictionaries[language]["home.invitations_one"];
    const other = dictionaries.dictionaries[language]["home.invitations_other"];
    assert.equal(translate(language, "home.invitations", { count: 1 }), one.replace("{count}", "1"));
    assert.equal(translate(language, "home.invitations", { count: 0 }), other.replace("{count}", "0"));
    assert.equal(translate(language, "home.invitations", { count: 2 }), other.replace("{count}", "2"));
  }
});

test("isTranslationKey only accepts dictionary keys", async () => {
  const { isTranslationKey } = await loadI18n();
  assert.equal(isTranslationKey("common.cancel"), true);
  assert.equal(isTranslationKey("Invalid invite code"), false);
  assert.equal(isTranslationKey("toString"), false);
});

test("every dictionary has en's keys, no empty values, same placeholders", async () => {
  const { dictionaries } = await loadI18n();
  const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [code, dict] of Object.entries(dictionaries)) {
    assert.deepEqual(Object.keys(dict).sort(), Object.keys(dictionaries.en).sort(), code);
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(value.trim(), `${code}.${key} is empty`);
      assert.deepEqual(placeholders(value), placeholders(dictionaries.en[key]), `${code}.${key}`);
    }
  }
});

test("registry: every language has a dictionary and an Intl locale", async () => {
  const { languages, dictionaries, intlLocale } = await loadI18n();
  assert.deepEqual(Object.keys(languages).sort(), Object.keys(dictionaries).sort());
  assert.equal(intlLocale("en"), "en-GB");
  assert.equal(intlLocale("nl"), "nl-BE");
});

test("translateError: key, known server message, then fallback", async () => {
  const { translateError } = await loadI18n();
  assert.equal(translateError(new Error("common.retry"), "common.close", "nl"), "Opnieuw proberen");
  assert.equal(
    translateError(new Error("Invalid invite code"), "common.retry", "en"),
    "Invalid invite code",
  );
  assert.equal(
    translateError(new Error("Invalid invite code"), "common.retry", "nl"),
    "Ongeldige uitnodigingscode",
  );
  // Supabase Auth wording drifts on the trailing period.
  assert.equal(
    translateError(new Error("Password should be at least 6 characters."), "common.retry", "en"),
    "Password should be at least 6 characters",
  );
  assert.equal(translateError(new Error("duplicate key value violates…"), "common.retry", "en"), "Retry");
  assert.equal(translateError(new Error("toString"), "common.retry", "en"), "Retry");
  assert.equal(translateError("boom", "common.retry", "nl"), "Opnieuw proberen");
  assert.equal(translateError({ message: "Invalid invite code" }, "common.retry", "en"), "Retry");
});

test("every mapped server message points at a real key", async () => {
  const { serverMessageKeys, dictionaries } = await loadI18n();
  for (const key of Object.values(serverMessageKeys)) assert.ok(key in dictionaries.en, key);
});

test("every RAISE EXCEPTION message and literal service error is mapped", async () => {
  const { serverMessageKeys } = await loadI18n();
  // supabase/ is gitignored: on a clone without it only the services are scanned.
  const read = (dir) =>
    (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }) : [])
      .filter((f) => /\.(sql|ts)$/.test(f))
      .map((f) => fs.readFileSync(path.join(dir, f), "utf8"));
  const messages = new Set();
  for (const sql of read("supabase/migrations")) {
    for (const m of sql.matchAll(/raise exception '([^']+)'/gi)) messages.add(m[1]);
  }
  for (const source of read("src/services")) {
    for (const m of source.matchAll(/new Error\(\s*(?:[\w?.]+\s*\?\?\s*)?"([^"]+)"/g)) messages.add(m[1]);
  }
  assert.ok(messages.size > 10, "scan found the messages");
  for (const message of messages) assert.ok(message in serverMessageKeys, message);
});

test("deviceLanguage returns undefined when locales are unavailable", async () => {
  const { deviceLanguage } = await loadModule("src/i18n/deviceLanguage.ts", {
    "expo-localization": {
      getLocales: () => {
        throw new Error("no navigator");
      },
    },
  });
  assert.equal(deviceLanguage(), undefined);
});

test("deviceLanguage reads the first locale's language code", async () => {
  const { deviceLanguage } = await loadModule("src/i18n/deviceLanguage.ts", {
    "expo-localization": { getLocales: () => [{ languageCode: "nl" }, { languageCode: "en" }] },
  });
  assert.equal(deviceLanguage(), "nl");
  const empty = await loadModule("src/i18n/deviceLanguage.ts", {
    "expo-localization": { getLocales: () => [] },
  });
  assert.equal(empty.deviceLanguage(), undefined);
});

test("logged out (no settings) follows the device; saved language wins", async () => {
  const { languageFromSettings } = await loadModule("src/state/language/useLanguageStore.ts", {
    zustand: { create: () => () => () => ({}) },
    ...(await i18nFileDeps()),
  });
  assert.equal(languageFromSettings(null, "nl"), "nl");
  assert.equal(languageFromSettings({ languageCode: "en" }, "nl"), "en");
  assert.equal(languageFromSettings({ languageCode: "fr" }, "de"), "en");
});

test("the language store follows settings: fetch, switch, logout", async () => {
  const zustand = require("zustand");
  const deps = await i18nFileDeps("nl");
  const languageStore = await loadModule("src/state/language/useLanguageStore.ts", {
    zustand,
    ...deps,
  });
  const { useSettingsStore } = await loadModule("src/state/settings/useSettingsStore.ts", {
    zustand,
    "./settingsStoreActions": { createSettingsActions: () => ({}) },
    "../language/useLanguageStore": languageStore,
    "../../i18n/deviceLanguage": deps["../../i18n/deviceLanguage"],
  });
  const language = () => languageStore.useLanguageStore.getState().language;

  assert.equal(language(), "nl"); // before login: device
  useSettingsStore.setState({ settings: { languageCode: "en" } });
  assert.equal(language(), "en"); // settings fetched
  useSettingsStore.setState({ settings: { languageCode: "nl" } });
  assert.equal(language(), "nl"); // switched in Settings
  useSettingsStore.setState({ settings: { languageCode: "en" } });
  useSettingsStore.setState({ settings: null });
  assert.equal(language(), "nl"); // logout: back to device
});

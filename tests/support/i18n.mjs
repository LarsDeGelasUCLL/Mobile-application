// Loaders for `src/i18n/`: each module runs with its real relative imports.
import { loadModule } from "./loadModule.mjs";

/** The pure i18n modules, wired together the way the app imports them. */
export async function loadI18n() {
  const languages = await loadModule("src/i18n/languages.ts");
  const en = await loadModule("src/i18n/dictionaries/en.ts");
  const nl = await loadModule("src/i18n/dictionaries/nl.ts");
  const dictionaryIndex = await loadModule("src/i18n/dictionaries/index.ts", {
    "./en": en,
    "./nl": nl,
  });
  const translateModule = await loadModule("src/i18n/translate.ts", {
    "./languages": languages,
    "./dictionaries": dictionaryIndex,
  });
  const { resolveLanguage } = await loadModule("src/i18n/resolveLanguage.ts", {
    "./languages": languages,
  });
  const errors = await loadModule("src/i18n/errors.ts", {
    "./dictionaries/en": en,
    "./translate": translateModule,
  });
  return {
    languages: languages.languages,
    intlLocale: languages.intlLocale,
    dictionaries: dictionaryIndex.dictionaries,
    translate: translateModule.translate,
    isTranslationKey: translateModule.isTranslationKey,
    resolveLanguage,
    translateError: errors.translateError,
    serverMessageKeys: errors.serverMessageKeys,
  };
}

/** `src/i18n/deviceLanguage` dependency reporting `device` as the device language. */
export async function fakeDeviceLanguage(device) {
  return loadModule("src/i18n/deviceLanguage.ts", {
    "expo-localization": { getLocales: () => [{ languageCode: device }] },
  });
}

/** Deps of `src/state/language/useLanguageStore.ts` (real i18n files, fake device). */
export async function i18nFileDeps(device = "en") {
  const languages = await loadModule("src/i18n/languages.ts");
  return {
    "../../i18n/languages": languages,
    "../../i18n/resolveLanguage": await loadModule("src/i18n/resolveLanguage.ts", {
      "./languages": languages,
    }),
    "../../i18n/deviceLanguage": await fakeDeviceLanguage(device),
  };
}

/** Fake `../../i18n` for store / hook tests: `t` and `errorMessage` in a fixed language. */
export async function i18nStub(language = "en") {
  const { translate, translateError } = await loadI18n();
  return {
    t: (key, params) => translate(language, key, params),
    errorMessage: (error, fallbackKey) => translateError(error, fallbackKey, language),
  };
}

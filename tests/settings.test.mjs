import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, serviceDeps } from "./support/loadModule.mjs";
import { i18nStub } from "./support/i18n.mjs";

const i18nEn = await i18nStub("en");

test("settings service rejects requests for another authenticated user", async () => {
  let queriedSettings = false;
  const { getUserSettings } = await loadModule(
    "src/services/profiles/settingsService.ts",
    {
      ...serviceDeps({
        auth: {
          getUser: async () => ({
            data: { user: { id: "authenticated-user" } },
            error: null,
          }),
        },
        from: () => {
          queriedSettings = true;
          throw new Error("Settings must not be queried.");
        },
      }),
      "./profileMappers": { mapRowToUserSettingsDto: (row) => row },
    },
  );

  await assert.rejects(
    getUserSettings("different-user"),
    /Not logged in as this user/,
  );
  assert.equal(queriedSettings, false);
});

test("settings store loads settings and persists returned updates", async () => {
  const settings = {
    userId: "user-1",
    pushNotificationToken: null,
    uiTheme: "SYSTEM",
    languageCode: "en",
    notifyNewExpense: true,
    notifyReminders: true,
    notifyGroupUpdates: false,
  };
  const { createSettingsActions } = await loadModule(
    "src/state/settings/settingsStoreActions.ts",
    {
      "../../services": {
        getUserSettings: async () => settings,
        updateUserSettings: async (_userId, update) => ({
          ...settings,
          ...update,
        }),
      },
      "../../i18n": i18nEn,
    },
  );
  const state = { settings: null, isLoading: false, error: null };
  const actions = createSettingsActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await actions.fetchSettings("user-1");
  assert.equal(state.settings, settings);

  const updated = await actions.updateSettings("user-1", {
    uiTheme: "DARK",
    languageCode: "nl",
    notifyGroupUpdates: true,
  });
  assert.equal(updated.uiTheme, "DARK");
  assert.equal(updated.languageCode, "nl");
  assert.equal(updated.notifyGroupUpdates, true);
  assert.equal(state.settings.uiTheme, "DARK");
  assert.equal(state.settings.languageCode, "nl");
  assert.equal(state.settings.notifyGroupUpdates, true);
});

test("a failed settings load shows the fallback in the app language", async () => {
  const load = async (language) => {
    const { createSettingsActions } = await loadModule(
      "src/state/settings/settingsStoreActions.ts",
      {
        "../../services": {
          getUserSettings: async () => {
            throw new Error("socket hang up");
          },
        },
        "../../i18n": await i18nStub(language),
      },
    );
    const state = { settings: null, isLoading: false, error: null };
    const actions = createSettingsActions(
      (update) => Object.assign(state, update),
      () => state,
    );
    await assert.rejects(actions.fetchSettings("user-1"), /socket hang up/);
    return state.error;
  };
  assert.equal(await load("en"), "Could not load settings.");
  assert.equal(await load("nl"), "Kon de instellingen niet laden.");
});

test("canRetrySettingsLoad offers a retry when settings are missing or failed and nothing is in flight", async () => {
  const { canRetrySettingsLoad } = await loadModule(
    "src/features/settings/settingsLoadRetry.ts",
  );
  const idle = {
    pendingSettings: null,
    isLoading: false,
    settings: null,
    settingsActionError: "",
    error: null,
  };
  const cached = { uiTheme: "SYSTEM" };

  assert.equal(canRetrySettingsLoad(idle), true);
  assert.equal(canRetrySettingsLoad({ ...idle, settings: cached }), false);
  assert.equal(
    canRetrySettingsLoad({
      ...idle,
      settings: cached,
      settingsActionError: "Could not load settings.",
    }),
    true,
  );
  assert.equal(
    canRetrySettingsLoad({ ...idle, settings: cached, error: "Offline" }),
    true,
  );
  assert.equal(canRetrySettingsLoad({ ...idle, isLoading: true }), false);
  assert.equal(
    canRetrySettingsLoad({
      ...idle,
      pendingSettings: { uiTheme: "DARK" },
      error: "Offline",
    }),
    false,
  );
});

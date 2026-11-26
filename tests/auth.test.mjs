import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, serviceDeps } from "./support/loadModule.mjs";

const { parseAuthMode, authLinkErrorMessage, AUTH_TITLES } =
  await loadModule("src/features/auth/authMode.ts");
const { validateNewPassword } = await loadModule(
  "src/features/auth/authValidation.ts",
);

const LINK_ERROR = "auth.reset.linkFailed";

test("parseAuthMode opens the mode named in the link", () => {
  assert.equal(parseAuthMode({}), "login");
  assert.equal(parseAuthMode({ mode: "signup" }), "signup");
  assert.equal(parseAuthMode({ mode: "reset" }), "reset");
  assert.equal(parseAuthMode({ mode: "set-password" }), "set-password");
});

test("parseAuthMode falls back to login for unknown or link-only modes", () => {
  assert.equal(parseAuthMode({ mode: "confirmation" }), "login");
  assert.equal(parseAuthMode({ mode: "login" }), "login");
  assert.equal(parseAuthMode({ mode: "bogus" }), "login");
  assert.equal(parseAuthMode({ mode: "" }), "login");
});

test("parseAuthMode sends any failed auth link to reset", () => {
  for (const key of ["authLinkError", "error", "error_code"]) {
    assert.equal(parseAuthMode({ [key]: "1" }), "reset", key);
    assert.equal(
      parseAuthMode({ [key]: "1", mode: "set-password" }),
      "reset",
      key,
    );
    assert.equal(parseAuthMode({ [key]: "1", mode: "signup" }), "reset", key);
  }
  // An empty value is not an error.
  assert.equal(parseAuthMode({ error: "", mode: "signup" }), "signup");
});

test("authLinkErrorMessage explains a failed auth link and is empty otherwise", () => {
  assert.equal(authLinkErrorMessage({}), undefined);
  assert.equal(authLinkErrorMessage({ mode: "set-password" }), undefined);
  assert.equal(authLinkErrorMessage({ error_code: "" }), undefined);
  for (const key of ["authLinkError", "error", "error_code"]) {
    assert.equal(authLinkErrorMessage({ [key]: "x" }), LINK_ERROR, key);
  }
});

test("AUTH_TITLES names every auth mode", () => {
  assert.deepEqual(
    { ...AUTH_TITLES },
    {
      login: "auth.title.login",
      signup: "auth.title.signup",
      reset: "auth.title.reset",
      "set-password": "auth.title.setPassword",
      confirmation: "auth.title.confirmation",
    },
  );
});

test("validateNewPassword checks the password and its confirmation", () => {
  assert.deepEqual(
    { ...validateNewPassword("", "") },
    { passwordError: "validation.passwordRequired", confirmPasswordError: undefined },
  );
  assert.deepEqual(
    { ...validateNewPassword("short", "other") },
    {
      passwordError: "validation.passwordTooShort",
      confirmPasswordError: "validation.passwordsMustMatch",
    },
  );
  assert.deepEqual(
    { ...validateNewPassword("long-enough", "long-enough") },
    { passwordError: undefined, confirmPasswordError: undefined },
  );
});

test("auth field validation returns specific required and format errors", async () => {
  const { validateEmail, validatePassword, validateDisplayName } =
    await loadModule("src/features/auth/authValidation.ts");

  assert.equal(validateEmail(""), "validation.emailRequired");
  assert.equal(validateEmail("not-an-email"), "validation.emailInvalid");
  assert.equal(validateEmail("ada@example.com"), undefined);

  assert.equal(validatePassword(""), "validation.passwordRequired");
  assert.equal(
    validatePassword("short"),
    "validation.passwordTooShort",
  );
  assert.equal(validatePassword("long-enough"), undefined);

  assert.equal(validateDisplayName(""), "validation.displayNameRequired");
  assert.equal(validateDisplayName("Ada"), undefined);
});

test("password confirmation must match the password", async () => {
  const { validatePasswordConfirmation } = await loadModule(
    "src/features/auth/authValidation.ts",
  );

  assert.equal(
    validatePasswordConfirmation("long-enough", "long-enoug"),
    "validation.passwordsMustMatch",
  );
  assert.equal(
    validatePasswordConfirmation("long-enough", ""),
    "validation.passwordsMustMatch",
  );
  assert.equal(
    validatePasswordConfirmation("long-enough", "long-enough"),
    undefined,
  );
  assert.equal(validatePasswordConfirmation("", ""), undefined);
});

test("auth deep-link exchange distinguishes unrelated, completed, and failed links", async () => {
  const { exchangeAuthLinkCode } = await loadModule(
    "src/features/auth/authLink.ts",
  );
  const codes = [];

  assert.equal(
    await exchangeAuthLinkCode("laruna://groups", async () => ({
      error: null,
    })),
    "unrelated",
  );
  assert.equal(
    await exchangeAuthLinkCode(
      "laruna://login?code=valid-code",
      async (code) => {
        codes.push(code);
        return { error: null };
      },
    ),
    "completed",
  );
  assert.equal(
    await exchangeAuthLinkCode("laruna://login?code=expired-code", async () => {
      throw new Error("expired");
    }),
    "failed",
  );
  assert.equal(
    await exchangeAuthLinkCode(
      "laruna://login?error=access_denied",
      async () => ({ error: null }),
    ),
    "failed",
  );
  assert.deepEqual(codes, ["valid-code"]);
});

test("auth service exchanges an auth link code and throws the Supabase message", async () => {
  const codes = [];
  let exchangeError = null;
  const { exchangeCodeForSession } = await loadModule(
    "src/services/auth/authService.ts",
    {
      "../profiles/profileService": {},
      ...serviceDeps({
        auth: {
          exchangeCodeForSession: async (code) => {
            codes.push(code);
            return { data: {}, error: exchangeError };
          },
        },
      }),
    },
  );

  await exchangeCodeForSession("valid-code");
  exchangeError = { message: "Invalid code verifier" };
  await assert.rejects(exchangeCodeForSession("expired-code"), {
    message: "Invalid code verifier",
  });
  assert.deepEqual(codes, ["valid-code", "expired-code"]);
});

test("auth store exchanges an auth link code through the service", async () => {
  const codes = [];
  const { createAuthActions } = await loadModule(
    "src/state/auth/authStoreActions.ts",
    {
      "../../services": {
        exchangeCodeForSession: async (code) => {
          codes.push(code);
          if (code === "expired-code") throw new Error("Invalid code");
        },
      },
      "../expenses/useExpenseStore": {
        useExpenseStore: { getState: () => ({}) },
      },
      "../groups/useGroupStore": { useGroupStore: { getState: () => ({}) } },
      "../settings/useSettingsStore": {
        useSettingsStore: { getState: () => ({}) },
      },
    },
  );
  const state = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true,
  };
  const before = { ...state };
  const actions = createAuthActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await actions.exchangeCodeForSession("valid-code");
  await assert.rejects(actions.exchangeCodeForSession("expired-code"), {
    message: "Invalid code",
  });
  assert.deepEqual(codes, ["valid-code", "expired-code"]);
  // The auth listener applies the new session; the action sets no state.
  assert.deepEqual(state, before);
});

test("auth initialization retries transient session and profile failures", async () => {
  let currentUserCalls = 0;
  let sessionCalls = 0;
  let listenerCalls = 0;
  let authListener;
  const session = { user: { id: "user-1" } };
  const user = { id: "user-1", displayName: "Ada" };
  const serviceFunctions = {
    getCurrentUser: async () => {
      currentUserCalls += 1;
      if (currentUserCalls === 1 || currentUserCalls === 3) {
        throw new Error("Temporary profile failure");
      }
      return user;
    },
  };
  const { createAuthActions } = await loadModule(
    "src/state/auth/authStoreActions.ts",
    {
      "../../services": {
        ...serviceFunctions,
        supabase: {
          auth: {
            getSession: async () => {
              sessionCalls += 1;
              return sessionCalls === 1
                ? {
                    data: { session: null },
                    error: { message: "Temporary session failure" },
                  }
                : { data: { session }, error: null };
            },
            onAuthStateChange: (callback) => {
              listenerCalls += 1;
              authListener = callback;
              return { data: { subscription: { unsubscribe() {} } } };
            },
          },
        },
      },
      "../expenses/useExpenseStore": {
        useExpenseStore: { getState: () => ({ resetExpenseStore() {} }) },
      },
      "../groups/useGroupStore": {
        useGroupStore: { getState: () => ({ resetGroupStore() {} }) },
      },
      "../settings/useSettingsStore": {
        useSettingsStore: { getState: () => ({ resetSettings() {} }) },
      },
    },
  );
  const state = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  };
  const actions = createAuthActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await actions.initialize();
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.isInitialized, false);
  assert.equal(state.isLoading, false);
  assert.equal(listenerCalls, 1);

  await actions.initialize();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, false);
  assert.equal(state.isLoading, false);
  assert.equal(listenerCalls, 1);

  await actions.initialize();
  assert.equal(state.user, user);
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, true);
  assert.equal(listenerCalls, 1);
  assert.equal(typeof authListener, "function");

  authListener("TOKEN_REFRESHED", session);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.user, user);
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, false);

  await actions.initialize();
  assert.equal(state.isInitialized, true);
  assert.equal(listenerCalls, 1);
});

test("profile store preserves database updates after auth metadata partial success", async () => {
  class ProfileUpdatePartialSuccessError extends Error {
    constructor(profile) {
      super("Auth metadata update failed");
      this.profile = profile;
    }
  }
  const updatedProfile = {
    displayName: "Ada Updated",
    phoneNumber: "+32123456789",
    iban: "GB82WEST12345698765432",
    profilePictureUrl: "https://example.com/avatar.png",
    customBio: "Updated bio",
  };
  const { createAuthActions } = await loadModule(
    "src/state/auth/authStoreActions.ts",
    {
      "../../services": {
        ProfileUpdatePartialSuccessError,
        updateUserProfile: async () => {
          throw new ProfileUpdatePartialSuccessError(updatedProfile);
        },
      },
      "./authStoreTypes": {},
      "../expenses/useExpenseStore": {
        useExpenseStore: { getState: () => ({}) },
      },
      "../groups/useGroupStore": { useGroupStore: { getState: () => ({}) } },
      "../settings/useSettingsStore": {
        useSettingsStore: { getState: () => ({}) },
      },
    },
  );
  const state = {
    user: {
      id: "user-1",
      displayName: "Ada",
      name: "Ada",
      emailAddress: "ada@example.com",
      email: "ada@example.com",
    },
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
  };
  const actions = createAuthActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await assert.rejects(
    actions.updateProfile({ displayName: "Ada Updated" }),
    ProfileUpdatePartialSuccessError,
  );
  assert.equal(state.user.displayName, updatedProfile.displayName);
  assert.equal(state.user.phoneNumber, updatedProfile.phoneNumber);
  assert.equal(state.user.iban, updatedProfile.iban);
  assert.equal(state.user.profilePictureUrl, updatedProfile.profilePictureUrl);
  assert.equal(state.user.customBio, updatedProfile.customBio);
  assert.equal(state.isLoading, false);
});

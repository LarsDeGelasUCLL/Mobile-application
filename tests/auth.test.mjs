import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Loads a dependency-free TS source as CommonJS.
async function loadTypeScriptModule(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(
    output,
    {
      exports: module.exports,
      module,
      require: (specifier) => {
        throw new Error(`Unexpected dependency: ${specifier}`);
      },
    },
    { filename: filePath },
  );
  return module.exports;
}

const { parseAuthMode, authLinkErrorMessage, AUTH_TITLES } =
  await loadTypeScriptModule("src/features/auth/authMode.ts");
const { validateNewPassword } = await loadTypeScriptModule(
  "src/features/auth/authValidation.ts",
);

const LINK_ERROR =
  "That reset link could not be completed. Request a new reset email and try again.";

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
  assert.equal(authLinkErrorMessage({}), "");
  assert.equal(authLinkErrorMessage({ mode: "set-password" }), "");
  assert.equal(authLinkErrorMessage({ error_code: "" }), "");
  for (const key of ["authLinkError", "error", "error_code"]) {
    assert.equal(authLinkErrorMessage({ [key]: "x" }), LINK_ERROR, key);
  }
});

test("AUTH_TITLES names every auth mode", () => {
  assert.deepEqual(
    { ...AUTH_TITLES },
    {
      login: "Welcome back",
      signup: "Create your account",
      reset: "Reset your password",
      "set-password": "Choose a new password",
      confirmation: "Confirm your email",
    },
  );
});

test("validateNewPassword checks the password and its confirmation", () => {
  assert.deepEqual(
    { ...validateNewPassword("", "") },
    { passwordError: "Password is required.", confirmPasswordError: undefined },
  );
  assert.deepEqual(
    { ...validateNewPassword("short", "other") },
    {
      passwordError: "Password must be at least 8 characters.",
      confirmPasswordError: "Passwords must match.",
    },
  );
  assert.deepEqual(
    { ...validateNewPassword("long-enough", "long-enough") },
    { passwordError: undefined, confirmPasswordError: undefined },
  );
});

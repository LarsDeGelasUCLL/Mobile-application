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

const { profileFormValues } = await loadTypeScriptModule(
  "src/features/profile/profileValidation.ts",
);

const EMPTY = {
  displayName: "",
  phoneNumber: "",
  iban: "",
  profilePictureUrl: "",
  customBio: "",
};

test("profileFormValues is empty without a user", () => {
  assert.deepEqual({ ...profileFormValues(null) }, EMPTY);
});

test("profileFormValues copies the user's profile fields", () => {
  assert.deepEqual(
    {
      ...profileFormValues({
        id: "user-1",
        emailAddress: "ada@example.com",
        recordCreated: "2026-01-01T00:00:00Z",
        displayName: "Ada",
        phoneNumber: "+32 123 456 789",
        iban: "BE71096123456769",
        profilePictureUrl: "https://example.com/ada.png",
        customBio: "Hi",
      }),
    },
    {
      displayName: "Ada",
      phoneNumber: "+32 123 456 789",
      iban: "BE71096123456769",
      profilePictureUrl: "https://example.com/ada.png",
      customBio: "Hi",
    },
  );
});

test("profileFormValues shows missing optional fields as empty text", () => {
  assert.deepEqual(
    {
      ...profileFormValues({
        displayName: "Ada",
        phoneNumber: null,
        iban: null,
        profilePictureUrl: null,
        customBio: null,
      }),
    },
    { ...EMPTY, displayName: "Ada" },
  );
});

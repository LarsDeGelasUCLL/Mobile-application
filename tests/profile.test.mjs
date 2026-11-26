// Unit tests for the edit-profile form values, key and validation.
// Run with `npm test`.
import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./support/loadModule.mjs";

const { profileFormKey, profileFormValues } = await loadModule(
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

test("profile validation accepts valid details and rejects invalid values", async () => {
  const { validateProfile } = await loadModule(
    "src/features/profile/profileValidation.ts",
  );

  const valid = validateProfile({
    displayName: " Ada Lovelace ",
    phoneNumber: "+32 123 456 789",
    iban: "GB82 WEST 1234 5698 7654 32",
    profilePictureUrl: "https://example.com/avatar.png",
    customBio: "Hello!",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(valid.values)), {
    displayName: "Ada Lovelace",
    phoneNumber: "+32 123 456 789",
    iban: "GB82WEST12345698765432",
    profilePictureUrl: "https://example.com/avatar.png",
    customBio: "Hello!",
  });
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        validateProfile({
          displayName: " ",
          phoneNumber: "123",
          iban: "not-an-iban",
          profilePictureUrl: "javascript:alert(1)",
          customBio: "x".repeat(501),
        }).errors,
      ),
    ),
    {
      displayName: "validation.displayNameRequired",
      phoneNumber: "validation.phoneInvalid",
      iban: "validation.ibanInvalid",
      profilePictureUrl: "validation.httpsUrlInvalid",
      customBio: "validation.bioTooLong",
    },
  );
});

test("profileFormKey is stable for the same inputs", () => {
  const values = { ...EMPTY, displayName: "Ada", customBio: "Hi" };
  assert.equal(
    profileFormKey(1, "user-1", values),
    profileFormKey(1, "user-1", { ...values }),
  );
});

test("profileFormKey changes when any input changes", () => {
  const values = { ...EMPTY, displayName: "Ada" };
  const key = profileFormKey(0, "user-1", values);
  assert.notEqual(profileFormKey(1, "user-1", values), key);
  assert.notEqual(profileFormKey(0, "user-2", values), key);
  assert.notEqual(
    profileFormKey(0, "user-1", { ...values, iban: "BE71096123456769" }),
    key,
  );
});

test("profileFormKey does not collide on a bio with line breaks", () => {
  // Joined with "\n", these two gave the same key.
  assert.notEqual(
    profileFormKey(0, "user-1", {
      ...EMPTY,
      profilePictureUrl: "a",
      customBio: "b\nc",
    }),
    profileFormKey(0, "user-1", {
      ...EMPTY,
      profilePictureUrl: "a\nb",
      customBio: "c",
    }),
  );
});

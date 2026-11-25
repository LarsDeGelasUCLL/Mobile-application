import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./support/loadModule.mjs";

test("getErrorMessage uses the Error message, else the fallback", async () => {
  // The loader shares this realm's Error, so `instanceof Error` sees the test's errors.
  const { getErrorMessage } = await loadModule("src/utils/errors.ts");

  assert.equal(getErrorMessage(new Error("Boom"), "Fallback"), "Boom");
  assert.equal(getErrorMessage(new TypeError("Typed"), "Fallback"), "Typed");
  assert.equal(getErrorMessage(new Error(""), "Fallback"), "");
  assert.equal(getErrorMessage("Boom", "Fallback"), "Fallback");
  assert.equal(getErrorMessage({ message: "Boom" }, "Fallback"), "Fallback");
  assert.equal(getErrorMessage(undefined, "Fallback"), "Fallback");
});

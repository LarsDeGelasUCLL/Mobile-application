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

const { memberName } = await loadTypeScriptModule(
  "src/features/groups/memberName.ts",
);
const { groupSummary } = await loadTypeScriptModule(
  "src/features/groups/groupSummary.ts",
);

test("memberName shows the profile display name", () => {
  assert.equal(memberName({ userProfile: { displayName: "Ann" } }), "Ann");
});

test("memberName falls back when the profile is missing", () => {
  assert.equal(memberName({}), "Group member");
  assert.equal(memberName({ userProfile: undefined }), "Group member");
});

test("groupSummary shows the member role without requests", () => {
  assert.equal(groupSummary("g1", false, {}), "Member");
});

test("groupSummary ignores request counts for members", () => {
  assert.equal(groupSummary("g1", false, { g1: 3 }), "Member");
});

test("groupSummary shows the admin role when the group has no count", () => {
  assert.equal(groupSummary("g1", true, { other: 2 }), "Admin");
});

test("groupSummary shows the admin role when the count is zero", () => {
  assert.equal(groupSummary("g1", true, { g1: 0 }), "Admin");
});

test("groupSummary shows one request in the singular", () => {
  assert.equal(groupSummary("g1", true, { g1: 1 }), "Admin · 1 request");
});

test("groupSummary shows more requests in the plural", () => {
  assert.equal(groupSummary("g1", true, { g1: 2 }), "Admin · 2 requests");
});

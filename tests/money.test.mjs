import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import ts from "typescript";

const source = await fs.readFile("src/utils/money.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { describeBalance } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
);

test("positive balance: plus sign, 'gets back', success tone", () => {
  const b = describeBalance(24.5);
  assert.equal(b.tone, "success");
  assert.equal(b.label, "gets back");
  assert.match(b.amount, /^\+.*24[.,]50/);
});

test("negative balance: minus sign (U+2212), 'owes', error tone", () => {
  const b = describeBalance(-12);
  assert.equal(b.tone, "error");
  assert.equal(b.label, "owes");
  assert.match(b.amount, /^\u2212.*12[.,]00/);
});

test("zero and sub-cent balances read as settled up", () => {
  for (const value of [0, -0, 0.004, -0.004]) {
    const b = describeBalance(value);
    assert.equal(b.tone, "muted");
    assert.equal(b.label, "settled up");
    assert.doesNotMatch(b.amount, /^[+\u2212-]/);
  }
});

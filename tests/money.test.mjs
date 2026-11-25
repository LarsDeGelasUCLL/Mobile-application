import assert from "node:assert/strict";
import test from "node:test";
import { importModule } from "./support/loadModule.mjs";

const { describeBalance, summarizeBalances } = await importModule(
  "src/utils/money.ts",
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

test("summarizeBalances totals open splits the user owes and is owed", () => {
  const me = "me";
  const expenses = [
    // I paid 30: Ann owes 10 (open), Bob owes 10 (settled), my own share skipped.
    {
      paidByUserId: me,
      splits: [
        { userId: me, amountOwed: 10, isSettled: false },
        { userId: "ann", amountOwed: 10, isSettled: false },
        { userId: "bob", amountOwed: 10, isSettled: true },
      ],
    },
    // Ann paid: I owe 7.25 (open); Bob's share is not mine.
    {
      paidByUserId: "ann",
      splits: [
        { userId: me, amountOwed: 7.25, isSettled: false },
        { userId: "bob", amountOwed: 5, isSettled: false },
      ],
    },
    // Bob paid: my 2 is settled.
    {
      paidByUserId: "bob",
      splits: [{ userId: me, amountOwed: 2, isSettled: true }],
    },
  ];
  assert.deepEqual(summarizeBalances(expenses, me), {
    youAreOwed: 10,
    youOwe: 7.25,
  });
  assert.deepEqual(summarizeBalances([], me), { youAreOwed: 0, youOwe: 0 });
});

test("summarizeBalances adds in cents (no float drift)", () => {
  const expenses = [0.1, 0.2].map((amountOwed) => ({
    paidByUserId: "ann",
    splits: [{ userId: "me", amountOwed, isSettled: false }],
  }));
  assert.equal(summarizeBalances(expenses, "me").youOwe, 0.3);
});

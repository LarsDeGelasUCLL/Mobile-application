// Unit tests for money and date formatting and the personal balance summary.
// Run with `npm test`.
import assert from "node:assert/strict";
import test from "node:test";
import { importModule } from "./support/loadModule.mjs";

const { describeBalance, formatCurrency, summarizeBalances } =
  await importModule("src/utils/money.ts");
const { formatDate, formatDateTime } = await importModule("src/utils/dates.ts");

test("positive balance: plus sign, 'gets back' key, success tone", () => {
  assert.deepEqual(describeBalance(24.5, "en-GB"), {
    amount: "+€24.50",
    labelKey: "balance.getsBack",
    tone: "success",
  });
});

test("negative balance: minus sign (U+2212), 'owes' key, error tone", () => {
  const b = describeBalance(-12, "en-GB");
  assert.equal(b.tone, "error");
  assert.equal(b.labelKey, "balance.owes");
  assert.equal(b.amount, "\u2212€12.00");
});

test("zero and sub-cent balances read as settled up", () => {
  for (const value of [0, -0, 0.004, -0.004]) {
    const b = describeBalance(value, "en-GB");
    assert.equal(b.tone, "muted");
    assert.equal(b.labelKey, "balance.settledUp");
    assert.doesNotMatch(b.amount, /^[+\u2212-]/);
  }
});

test("amounts follow the given locale", () => {
  assert.equal(formatCurrency(12.5, "en-GB"), "€12.50");
  assert.match(formatCurrency(12.5, "nl-BE"), /12,50/);
  assert.match(describeBalance(-12, "nl-BE").amount, /^\u2212.*12,00/);
});

test("formatDate is short and day-first in both app locales", () => {
  assert.equal(formatDate("2026-11-26T10:00:00Z", "en-GB"), "26/11/2026");
  assert.equal(formatDate("2026-11-26T10:00:00Z", "nl-BE"), "26/11/2026");
});

test("formatDateTime adds the time to the short date", () => {
  for (const locale of ["en-GB", "nl-BE"]) {
    assert.match(
      formatDateTime("2026-11-26T10:00:00Z", locale),
      /^26\/11\/2026.*\d{1,2}:00$/,
    );
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

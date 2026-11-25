import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Loads a TS source as CommonJS; `dependencies` maps each import to a module.
async function loadTypeScriptModule(filePath, dependencies = {}) {
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
      // One Error class across modules, so `instanceof Error` holds.
      Error,
      require: (specifier) => {
        if (!(specifier in dependencies)) {
          throw new Error(`Unexpected dependency: ${specifier}`);
        }
        return dependencies[specifier];
      },
    },
    { filename: filePath },
  );
  return module.exports;
}

// vm objects have another realm's prototypes; compare them as plain data.
const plain = (value) => JSON.parse(JSON.stringify(value));

const permissions = await loadTypeScriptModule(
  "src/features/expenses/expensePermissions.ts",
);
const participantsHelpers = await loadTypeScriptModule(
  "src/features/expenses/expenseParticipants.ts",
);
const formState = await loadTypeScriptModule(
  "src/features/expenses/expenseFormState.ts",
  {
    "../../services/expenses/expenseValidation": await loadTypeScriptModule(
      "src/services/expenses/expenseValidation.ts",
    ),
  },
);

const me = { id: "me" };
const expense = {
  id: "expense-1",
  groupId: "group-1",
  createdByUserId: "creator",
  paidByUserId: "payer",
};
const groups = (groupRole) => [
  { group: { id: "other-group" }, groupRole: "ADMIN" },
  { group: { id: "group-1" }, groupRole },
];

test("canManageExpense: group admin, creator or payer", () => {
  const { canManageExpense } = permissions;
  assert.equal(canManageExpense(me, expense, groups("ADMIN")), true);
  assert.equal(
    canManageExpense({ id: "creator" }, expense, groups("MEMBER")),
    true,
  );
  assert.equal(canManageExpense({ id: "payer" }, expense, []), true);
});

test("canManageExpense: plain members, outsiders and missing data cannot", () => {
  const { canManageExpense } = permissions;
  assert.equal(canManageExpense(me, expense, groups("MEMBER")), false);
  // Admin of another group only.
  assert.equal(
    canManageExpense(me, expense, [groups("MEMBER")[0]]),
    false,
  );
  assert.equal(canManageExpense(null, expense, groups("ADMIN")), false);
  assert.equal(canManageExpense(me, null, groups("ADMIN")), false);
});

test("canManageExpense: a personal expense ignores group roles", () => {
  const { canManageExpense } = permissions;
  const personal = { ...expense, groupId: null };
  assert.equal(
    canManageExpense(me, personal, [
      { group: { id: null }, groupRole: "ADMIN" },
    ]),
    false,
  );
  assert.equal(canManageExpense({ id: "creator" }, personal, []), true);
});

test("canSettleSplit: the split's user or the payer, never the payer's own split", () => {
  const { canSettleSplit } = permissions;
  const ownSplit = { userId: "me" };
  const payerSplit = { userId: "payer" };
  const otherSplit = { userId: "someone" };

  assert.equal(canSettleSplit(me, expense, ownSplit), true);
  assert.equal(canSettleSplit({ id: "payer" }, expense, otherSplit), true);
  assert.equal(canSettleSplit({ id: "payer" }, expense, payerSplit), false);
  assert.equal(canSettleSplit(me, expense, otherSplit), false);
  assert.equal(canSettleSplit(me, expense, payerSplit), false);
  assert.equal(canSettleSplit(null, expense, ownSplit), false);
});

const profile = (id, displayName = id) => ({
  id,
  displayName,
  profilePictureUrl: null,
  customBio: null,
  recordCreated: "2026-01-01",
});
const user = {
  ...profile("me", "Ada"),
  emailAddress: "ada@example.com",
  phoneNumber: null,
  iban: null,
};

test("includeCurrentUser appends the current user once and keeps order", () => {
  const { includeCurrentUser } = participantsHelpers;
  const others = [profile("ann"), profile("bob")];

  assert.deepEqual(plain(includeCurrentUser(others, user)), [
    profile("ann"),
    profile("bob"),
    profile("me", "Ada"),
  ]);
  // Already listed: not duplicated, not moved, no private fields added.
  const listed = [profile("ann"), profile("me", "Ada"), profile("bob")];
  assert.deepEqual(plain(includeCurrentUser(listed, user)), listed);
  assert.deepEqual(plain(includeCurrentUser(others, null)), others);
  assert.deepEqual(plain(includeCurrentUser([], user)), [profile("me", "Ada")]);
});

test("participantLabel marks the current user with (you)", () => {
  const { participantLabel } = participantsHelpers;
  assert.equal(participantLabel(profile("me", "Ada"), "me"), "Ada (you)");
  assert.equal(participantLabel(profile("ann", "Ann"), "me"), "Ann");
});

const createState = () =>
  formState.initialExpenseFormState({ currentUserId: "me" });
const splitsOf = (state) => plain(state.splits);

test("form state starts empty with an equal split for the current user", () => {
  assert.deepEqual(plain(createState()), {
    title: "",
    amount: "",
    receiptUrl: "",
    paidByUserId: "me",
    splitMode: "equal",
    splits: [{ userId: "me", amount: "0.00" }],
  });
});

test("form state starts from an existing expense in custom mode", () => {
  const state = formState.initialExpenseFormState({
    currentUserId: "me",
    initialExpense: {
      title: "Dinner",
      amount: 30,
      receiptUrl: null,
      paidByUserId: "ann",
      splits: [
        { userId: "ann", amountOwed: 10 },
        { userId: "me", amountOwed: 20 },
      ],
    },
  });
  assert.deepEqual(plain(state), {
    title: "Dinner",
    amount: "30.00",
    receiptUrl: "",
    paidByUserId: "ann",
    splitMode: "custom",
    splits: [
      { userId: "ann", amount: "10.00" },
      { userId: "me", amount: "20.00" },
    ],
  });
});

test("amount edits re-split equally, and invalid amounts give zero shares", () => {
  const { expenseFormReducer } = formState;
  let state = expenseFormReducer(createState(), {
    type: "toggleParticipant",
    userId: "ann",
    selected: true,
    groupId: null,
  });
  state = expenseFormReducer(state, { type: "setAmount", value: "10.01" });
  assert.equal(state.amount, "10.01");
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "5.01" },
    { userId: "ann", amount: "5.00" },
  ]);
  state = expenseFormReducer(state, { type: "setAmount", value: "abc" });
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "0.00" },
    { userId: "ann", amount: "0.00" },
  ]);
});

test("toggling a participant re-splits in equal mode", () => {
  const { expenseFormReducer } = formState;
  let state = expenseFormReducer(createState(), {
    type: "setAmount",
    value: "9",
  });
  state = expenseFormReducer(state, {
    type: "toggleParticipant",
    userId: "ann",
    selected: true,
    groupId: "group-1",
  });
  state = expenseFormReducer(state, {
    type: "toggleParticipant",
    userId: "bob",
    selected: true,
    groupId: "group-1",
  });
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "3.00" },
    { userId: "ann", amount: "3.00" },
    { userId: "bob", amount: "3.00" },
  ]);
  state = expenseFormReducer(state, {
    type: "toggleParticipant",
    userId: "ann",
    selected: false,
    groupId: "group-1",
  });
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "4.50" },
    { userId: "bob", amount: "4.50" },
  ]);
});

test("toggling a participant in custom mode keeps the other amounts", () => {
  const { expenseFormReducer } = formState;
  let state = expenseFormReducer(createState(), {
    type: "setSplitMode",
    mode: "custom",
  });
  state = expenseFormReducer(state, {
    type: "setSplitAmount",
    userId: "me",
    value: "7.00",
  });
  state = expenseFormReducer(state, {
    type: "toggleParticipant",
    userId: "ann",
    selected: true,
    groupId: null,
  });
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "7.00" },
    { userId: "ann", amount: "0.00" },
  ]);
  state = expenseFormReducer(state, {
    type: "toggleParticipant",
    userId: "me",
    selected: false,
    groupId: null,
  });
  assert.deepEqual(splitsOf(state), [{ userId: "ann", amount: "0.00" }]);
});

test("deselecting the payer moves a personal expense's payer, not a group's", () => {
  const { expenseFormReducer } = formState;
  const withAnn = (groupId) =>
    expenseFormReducer(createState(), {
      type: "toggleParticipant",
      userId: "ann",
      selected: true,
      groupId,
    });
  const deselectMe = (state, groupId) =>
    expenseFormReducer(state, {
      type: "toggleParticipant",
      userId: "me",
      selected: false,
      groupId,
    });

  assert.equal(deselectMe(withAnn(null), null).paidByUserId, "ann");
  assert.equal(deselectMe(withAnn("group-1"), "group-1").paidByUserId, "me");
  // Nobody left: the personal payer becomes empty.
  assert.equal(deselectMe(createState(), null).paidByUserId, "");
  assert.deepEqual(splitsOf(deselectMe(createState(), null)), []);
});

test("switching split modes: equal recomputes, custom keeps the amounts", () => {
  const { expenseFormReducer } = formState;
  let state = formState.initialExpenseFormState({
    currentUserId: "me",
    initialExpense: {
      title: "Taxi",
      amount: 10,
      receiptUrl: "https://example.com/r",
      paidByUserId: "me",
      splits: [
        { userId: "me", amountOwed: 7 },
        { userId: "ann", amountOwed: 3 },
      ],
    },
  });
  state = expenseFormReducer(state, { type: "setSplitMode", mode: "equal" });
  assert.equal(state.splitMode, "equal");
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "5.00" },
    { userId: "ann", amount: "5.00" },
  ]);
  state = expenseFormReducer(state, { type: "setSplitMode", mode: "custom" });
  assert.equal(state.splitMode, "custom");
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "5.00" },
    { userId: "ann", amount: "5.00" },
  ]);
});

test("editing a share switches to custom and changes only that share", () => {
  const { expenseFormReducer } = formState;
  let state = expenseFormReducer(createState(), {
    type: "toggleParticipant",
    userId: "ann",
    selected: true,
    groupId: null,
  });
  state = expenseFormReducer(state, { type: "setAmount", value: "4" });
  state = expenseFormReducer(state, {
    type: "setSplitAmount",
    userId: "ann",
    value: "1.5",
  });
  assert.equal(state.splitMode, "custom");
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "2.00" },
    { userId: "ann", amount: "1.5" },
  ]);
  // Custom mode: an amount edit no longer re-splits.
  state = expenseFormReducer(state, { type: "setAmount", value: "8" });
  assert.deepEqual(splitsOf(state), [
    { userId: "me", amount: "2.00" },
    { userId: "ann", amount: "1.5" },
  ]);
});

test("changing the payer keeps the splits", () => {
  const { expenseFormReducer } = formState;
  const before = expenseFormReducer(createState(), {
    type: "setAmount",
    value: "6",
  });
  const after = expenseFormReducer(before, { type: "setPaidBy", userId: "ann" });
  assert.equal(after.paidByUserId, "ann");
  assert.deepEqual(splitsOf(after), splitsOf(before));
});

test("edits clear the validation error, choosing a payer does not", () => {
  const { expenseFormReducer } = formState;
  const failed = expenseFormReducer(createState(), {
    type: "setValidationError",
    error: "Expense title is required.",
  });
  assert.equal(failed.validationError, "Expense title is required.");
  for (const action of [
    { type: "setTitle", value: "Lunch" },
    { type: "setAmount", value: "5" },
    { type: "setReceiptUrl", value: "https://example.com" },
    { type: "toggleParticipant", userId: "ann", selected: true, groupId: null },
    { type: "setSplitMode", mode: "custom" },
    { type: "setSplitAmount", userId: "me", value: "1" },
  ]) {
    assert.equal(
      expenseFormReducer(failed, action).validationError,
      undefined,
      action.type,
    );
  }
  assert.equal(
    expenseFormReducer(failed, { type: "setPaidBy", userId: "ann" })
      .validationError,
    "Expense title is required.",
  );
});

test("fetchExpenseParticipants loads the personal history, then its participants", async () => {
  const calls = [];
  const history = [{ id: "expense-1" }];
  const participants = [profile("ann")];
  const { createExpenseLoadActions } = await loadTypeScriptModule(
    "src/state/expenses/expenseLoadActions.ts",
    {
      "../../services": {
        getUserExpenseParticipants: async (userId, expenses) => {
          calls.push(["participants", userId, expenses]);
          return participants;
        },
      },
      "../../utils/errors": { getErrorMessage: (error) => String(error) },
    },
  );
  const state = {};
  const actions = createExpenseLoadActions(
    (update) => Object.assign(state, update),
    () => state,
  );
  Object.assign(state, actions, {
    fetchIndividualExpenses: async (userId) => {
      calls.push(["history", userId]);
      state.individualExpenses = history;
    },
  });

  assert.equal(await actions.fetchExpenseParticipants("me"), participants);
  assert.deepEqual(calls, [
    ["history", "me"],
    ["participants", "me", history],
  ]);
});

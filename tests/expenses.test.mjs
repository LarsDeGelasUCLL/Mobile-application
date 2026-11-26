import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, plain, serviceDeps } from "./support/loadModule.mjs";
import { i18nStub } from "./support/i18n.mjs";

const i18nEn = await i18nStub("en");

const permissions = await loadModule(
  "src/features/expenses/expensePermissions.ts",
);
const participantsHelpers = await loadModule(
  "src/features/expenses/expenseParticipants.ts",
);
const formState = await loadModule(
  "src/features/expenses/expenseFormState.ts",
  {
    "../../services/expenses/expenseValidation": await loadModule(
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

test("participantLabel marks the current user with (you)", async () => {
  const { participantLabel } = participantsHelpers;
  const nl = await i18nStub("nl");
  assert.equal(participantLabel(profile("me", "Ada"), "me", i18nEn.t), "Ada (you)");
  assert.equal(participantLabel(profile("me", "Ada"), "me", nl.t), "Ada (jij)");
  assert.equal(participantLabel(profile("ann", "Ann"), "me", i18nEn.t), "Ann");
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
    error: "validation.expense.titleRequired",
  });
  assert.equal(failed.validationError, "validation.expense.titleRequired");
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
    "validation.expense.titleRequired",
  );
});

test("fetchExpenseParticipants loads the personal history, then its participants", async () => {
  const calls = [];
  const history = [{ id: "expense-1" }];
  const participants = [profile("ann")];
  const { createExpenseLoadActions } = await loadModule(
    "src/state/expenses/expenseLoadActions.ts",
    {
      "../../services": {
        getUserExpenseParticipants: async (userId, expenses) => {
          calls.push(["participants", userId, expenses]);
          return participants;
        },
      },
      "../../i18n": i18nEn,
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

test("loading group expenses calculates balances from the same fetch", async () => {
  let fetchCount = 0;
  const expenses = [
    {
      paidByUserId: "payer",
      paidByProfile: { displayName: "Payer" },
      splits: [
        {
          userId: "debtor",
          amountOwed: 12,
          isSettled: false,
          userProfile: { displayName: "Debtor" },
        },
      ],
    },
  ];
  const { calculateGroupBalances } = await loadModule(
    "src/services/expenses/expenseBalanceService.ts",
    {
      "./expenseQueries": {
        getGroupExpenses: async () => {
          fetchCount += 1;
          return expenses;
        },
      },
    },
  );
  const { createExpenseLoadActions } = await loadModule(
    "src/state/expenses/expenseLoadActions.ts",
    {
      "../../services": {
        getGroupExpenses: async () => {
          fetchCount += 1;
          return expenses;
        },
        calculateGroupBalances,
        getExpenseById: async () => null,
        getIndividualExpenses: async () => [],
      },
      "../../i18n": i18nEn,
    },
  );
  const state = {};
  const actions = createExpenseLoadActions((update) =>
    Object.assign(state, update),
  );

  await actions.fetchGroupExpensesAndBalances("group-1");

  assert.equal(fetchCount, 1);
  assert.equal(state.groupExpenses, expenses);
  assert.equal(state.groupBalances[0].netBalance, 12);
  assert.equal(state.groupBalances[1].netBalance, -12);
  assert.equal(state.groupBalancesGroupId, "group-1");
});

test("expense form validation normalizes receipt URLs and enforces personal participation", async () => {
  const { validateExpenseForm } = await loadModule(
    "src/services/expenses/expenseValidation.ts",
  );
  const participants = ["user-1", "user-2"];
  const valid = validateExpenseForm(
    {
      title: "  Shared lunch  ",
      amount: "10.00",
      receiptUrl: " https://example.com/receipt ",
      paidByUserId: "user-2",
      splits: [
        { userId: "user-1", amount: "4.00" },
        { userId: "user-2", amount: "6.00" },
      ],
    },
    {
      groupId: null,
      currentUserId: "user-1",
      allowedParticipantIds: participants,
    },
  );

  assert.equal(typeof valid, "object");
  assert.equal(valid.title, "Shared lunch");
  assert.equal(valid.receiptUrl, "https://example.com/receipt");
  assert.equal(valid.amount, 10);
  assert.equal(valid.paidByUserId, "user-2");

  const blankReceipt = validateExpenseForm(
    {
      title: "Lunch",
      amount: "1.25",
      receiptUrl: "   ",
      paidByUserId: "user-1",
      splits: [{ userId: "user-1", amount: "1.25" }],
    },
    {
      groupId: null,
      currentUserId: "user-1",
      allowedParticipantIds: ["user-1"],
    },
  );
  assert.equal(blankReceipt.receiptUrl, null);

  const payerOutsideSplit = validateExpenseForm(
    {
      title: "Lunch",
      amount: "1.00",
      receiptUrl: "",
      paidByUserId: "user-2",
      splits: [{ userId: "user-1", amount: "1.00" }],
    },
    {
      groupId: null,
      currentUserId: "user-1",
      allowedParticipantIds: participants,
    },
  );
  assert.equal(payerOutsideSplit, "validation.expense.payerMustBeIncluded");

  const callerOutsideSplit = validateExpenseForm(
    {
      title: "Lunch",
      amount: "1.00",
      receiptUrl: "",
      paidByUserId: "user-2",
      splits: [{ userId: "user-2", amount: "1.00" }],
    },
    {
      groupId: null,
      currentUserId: "user-1",
      allowedParticipantIds: participants,
    },
  );
  assert.equal(callerOutsideSplit, "validation.expense.youMustBeInvolved");
});

test("expense form validation rejects invalid amounts and split rows", async () => {
  const { validateExpenseForm } = await loadModule(
    "src/services/expenses/expenseValidation.ts",
  );
  const validate = (amount, splits, title = "Trip") =>
    validateExpenseForm(
      {
        title,
        amount,
        receiptUrl: "",
        paidByUserId: "user-1",
        splits,
      },
      {
        groupId: "group-1",
        currentUserId: "user-1",
        allowedParticipantIds: ["user-1", "user-2"],
      },
    );

  assert.equal(
    validate("0", [{ userId: "user-1", amount: "0" }]),
    "validation.expense.amountInvalid",
  );
  assert.equal(
    validate("1.234", [{ userId: "user-1", amount: "1.234" }]),
    "validation.expense.amountInvalid",
  );
  assert.equal(
    validate("2.00", [
      { userId: "user-1", amount: "1.00" },
      { userId: "user-1", amount: "1.00" },
    ]),
    "validation.expense.duplicateSplitUsers",
  );
  assert.equal(
    validate("2.00", [{ userId: "user-1", amount: "-1.00" }]),
    "validation.expense.splitAmountsInvalid",
  );
  assert.equal(
    validate("2.00", [{ userId: "user-1", amount: "-0.01" }]),
    "validation.expense.splitAmountsInvalid",
  );
  assert.equal(
    validate("2.00", [
      { userId: "user-1", amount: "1.00" },
      { userId: "user-2", amount: "0.99" },
    ]),
    "validation.expense.splitsMustEqualAmount",
  );
  assert.equal(
    validate("2.00", [{ userId: "outsider", amount: "2.00" }]),
    "validation.expense.participantNotAvailable",
  );
  const longTitle = validate(
    "2.00",
    [{ userId: "user-1", amount: "2.00" }],
    "x".repeat(151),
  );
  assert.equal(longTitle, "validation.expense.titleTooLong");
  const maximumUnicodeTitle = validate(
    "2.00",
    [{ userId: "user-1", amount: "2.00" }],
    "🍱".repeat(150),
  );
  assert.equal(typeof maximumUnicodeTitle, "object");
});

test("equal expense splits distribute every cent including remainders", async () => {
  const { createEqualExpenseSplits } = await loadModule(
    "src/services/expenses/expenseValidation.ts",
  );

  assert.deepEqual(
    createEqualExpenseSplits("10.01", ["user-1", "user-2", "user-3"]).map(
      (split) => [split.userId, split.amount],
    ),
    [
      ["user-1", "3.34"],
      ["user-2", "3.34"],
      ["user-3", "3.33"],
    ],
  );
  assert.deepEqual(
    createEqualExpenseSplits("0.02", ["user-1", "user-2", "user-3"]).map(
      (split) => split.amount,
    ),
    ["0.01", "0.01", "0.00"],
  );
  assert.throws(() => createEqualExpenseSplits("1.00", []), /participant/i);
});

test("expense RPCs send the selected payer while creator identity stays server-derived", async () => {
  const rpcCalls = [];
  const expenseRow = {
    id: "expense-1",
    group_id: "group-1",
    paid_by_user_id: "payer-2",
    created_by_user_id: "creator-1",
    title: "Lunch",
    amount: 12,
    receipt_url: null,
    record_created: "2026-11-21T12:00:00Z",
  };
  const expenseValidation = await loadModule(
    "src/services/expenses/expenseValidation.ts",
  );
  const { createExpense, updateExpense } = await loadModule(
    "src/services/expenses/expenseService.ts",
    {
      "./expenseEnrichment": {
        enrichExpenses: async (rows) =>
          rows.map((row) => ({
            ...row,
            createdByUserId: row.created_by_user_id,
            splits: [],
          })),
      },
      "./expenseMappers": {
        mapRowToExpenseSplitDto: (row) => row,
      },
      ...serviceDeps({
        auth: {
          getUser: async () => ({
            data: { user: { id: "creator-1" } },
            error: null,
          }),
        },
        rpc: async (name, args) => {
          rpcCalls.push({ name, args });
          return { data: expenseRow, error: null };
        },
      }),
      "./expenseValidation": expenseValidation,
      "./expenseQueries": {
        getExpenseById: async () => null,
        getGroupExpenses: async () => [],
        getIndividualExpenses: async () => [],
      },
      "./expenseBalanceService": {
        calculateGroupBalances: async () => [],
      },
    },
  );
  const splits = [
    { userId: "creator-1", amountOwed: 6 },
    { userId: "payer-2", amountOwed: 6 },
  ];

  await createExpense({
    groupId: "group-1",
    paidByUserId: "payer-2",
    title: "Lunch",
    amount: 12,
    receiptUrl: " https://example.com/receipt ",
    splits,
  });
  await updateExpense("expense-1", {
    groupId: "group-1",
    paidByUserId: "payer-2",
    title: "Lunch",
    amount: 12,
    receiptUrl: " https://example.com/receipt ",
    splits,
  });

  assert.deepEqual(
    rpcCalls.map(({ name, args }) => [
      name,
      args._paid_by_user_id,
      args._receipt_url,
    ]),
    [
      ["create_expense_with_splits", "payer-2", "https://example.com/receipt"],
      ["update_expense_with_splits", "payer-2", "https://example.com/receipt"],
    ],
  );
  assert.equal("_created_by_user_id" in rpcCalls[0].args, false);
  assert.equal("_created_by_user_id" in rpcCalls[1].args, false);
});

test("expense service validation requires the creator and payer in personal splits", async () => {
  const { validateExpensePayload } = await loadModule(
    "src/services/expenses/expenseValidation.ts",
  );
  const payload = {
    groupId: null,
    paidByUserId: "user-2",
    title: "Lunch",
    amount: 10,
    splits: [
      { userId: "user-1", amountOwed: 4 },
      { userId: "user-2", amountOwed: 6 },
    ],
  };

  assert.doesNotThrow(() => validateExpensePayload(payload, "user-1"));
  assert.throws(
    () =>
      validateExpensePayload(
        { ...payload, splits: [{ userId: "user-2", amountOwed: 10 }] },
        "user-1",
      ),
    { message: "validation.expense.youMustBeInvolved" },
  );
  assert.throws(
    () =>
      validateExpensePayload({ ...payload, paidByUserId: "user-3" }, "user-1"),
    { message: "validation.expense.payerMustBeIncluded" },
  );
});

test("expense creation remains locally successful when balance refresh fails", async () => {
  const created = {
    id: "expense-1",
    groupId: "group-1",
    paidByUserId: "payer-1",
    title: "Lunch",
    amount: 12,
    receiptUrl: null,
    recordCreated: "2026-11-21T12:00:00Z",
    splits: [],
  };
  const { createExpenseCreateActions } = await loadModule(
    "src/state/expenses/expenseCreateActions.ts",
    {
      "../../services": {
        createExpense: async () => created,
        updateExpense: async () => created,
        calculateGroupBalances: async () => {
          throw new Error("Balance refresh failed");
        },
      },
      "../../i18n": i18nEn,
    },
  );
  const state = {
    groupExpenses: [],
    individualExpenses: [],
    selectedExpense: null,
    groupBalances: [],
    isLoading: false,
    error: null,
  };
  const actions = createExpenseCreateActions(
    (update) => Object.assign(state, update),
    () => state,
  );
  const result = await actions.addExpense({
    groupId: "group-1",
    paidByUserId: "payer-1",
    title: "Lunch",
    amount: 12,
    splits: [{ userId: "payer-1", amountOwed: 12 }],
  });

  assert.equal(result, created);
  assert.equal(state.groupExpenses[0], created);
  assert.equal(state.isLoading, false);
  assert.match(state.error, /created, but.*balances could not be refreshed/i);
});

test("expense store refuses to settle or unsettle the payer's own split", async () => {
  let settleCalls = 0;
  const expense = {
    id: "expense-1",
    groupId: "group-1",
    paidByUserId: "payer-1",
    title: "Lunch",
    amount: 12,
    receiptUrl: null,
    recordCreated: "2026-11-21T12:00:00Z",
    splits: [
      {
        id: "payer-split",
        expenseId: "expense-1",
        userId: "payer-1",
        amountOwed: 6,
        isSettled: true,
      },
    ],
  };
  const { createExpenseSplitActions } = await loadModule(
    "src/state/expenses/expenseSplitActions.ts",
    {
      "../../services": {
        calculateGroupBalances: async () => [],
        settleExpenseSplit: async () => {
          settleCalls += 1;
        },
      },
      "../../i18n": i18nEn,
    },
  );
  const state = {
    groupExpenses: [expense],
    individualExpenses: [],
    selectedExpense: expense,
    groupBalances: [],
    isLoading: false,
    error: null,
  };
  const actions = createExpenseSplitActions(
    (update) => Object.assign(state, update),
    () => state,
  );

  await assert.rejects(
    actions.toggleSettleSplit("payer-split", false, "group-1"),
    { message: "errors.store.payerOwnSplit" },
  );
  assert.equal(settleCalls, 0);
  assert.equal(state.isLoading, false);
});

test("settling and unsettling a split updates cached expenses and group balances", async () => {
  const expense = {
    id: "expense-1",
    groupId: "group-1",
    paidByUserId: "payer-1",
    title: "Lunch",
    amount: 12,
    receiptUrl: null,
    recordCreated: "2026-11-21T12:00:00Z",
    splits: [
      {
        id: "debtor-split",
        expenseId: "expense-1",
        userId: "debtor-1",
        amountOwed: 6,
        isSettled: false,
      },
    ],
  };
  const settledBalances = [{ userId: "payer-1", balance: 0 }];
  const unsettledBalances = [{ userId: "debtor-1", balance: -6 }];
  const settleCalls = [];
  let balanceCall = 0;
  const { createExpenseSplitActions } = await loadModule(
    "src/state/expenses/expenseSplitActions.ts",
    {
      "../../services": {
        calculateGroupBalances: async (groupId) => {
          assert.equal(groupId, "group-1");
          balanceCall += 1;
          return balanceCall === 1 ? settledBalances : unsettledBalances;
        },
        settleExpenseSplit: async (...args) => settleCalls.push(args),
      },
      "../../i18n": i18nEn,
    },
  );
  const state = {
    groupExpenses: [expense],
    individualExpenses: [],
    selectedExpense: expense,
    groupBalances: [],
    isLoading: false,
    error: null,
  };
  const actions = createExpenseSplitActions(
    (update) => Object.assign(state, update),
    () => state,
  );

  await actions.toggleSettleSplit("debtor-split", true, "group-1");
  assert.deepEqual(settleCalls, [["debtor-split", true]]);
  assert.equal(state.groupExpenses[0].splits[0].isSettled, true);
  assert.equal(state.selectedExpense.splits[0].isSettled, true);
  assert.deepEqual(state.groupBalances, settledBalances);
  assert.equal(state.groupBalancesGroupId, "group-1");

  await actions.toggleSettleSplit("debtor-split", false, "group-1");
  assert.deepEqual(settleCalls, [
    ["debtor-split", true],
    ["debtor-split", false],
  ]);
  assert.equal(state.groupExpenses[0].splits[0].isSettled, false);
  assert.equal(state.selectedExpense.splits[0].isSettled, false);
  assert.deepEqual(state.groupBalances, unsettledBalances);
  assert.equal(state.isLoading, false);
});

test("personal expense participants merge group members and all known expense profiles", async () => {
  const { getUserExpenseParticipants } = await loadModule(
    "src/services/expenses/expenseQueries.ts",
    {
      "./expenseEnrichment": { enrichExpenses: async () => [] },
      ...serviceDeps({}),
      "../groups": {
        getUserActiveGroups: async () => [
          { group: { id: "group-1" } },
          { group: { id: "group-2" } },
        ],
        getGroupMembers: async (groupId) =>
          groupId === "group-1"
            ? [
                {
                  userId: "group-user",
                  userProfile: { id: "group-user", displayName: "Group User" },
                },
                {
                  userId: "shared-user",
                  userProfile: { id: "shared-user", displayName: "Shared" },
                },
              ]
            : [
                {
                  userId: "shared-user",
                  userProfile: { id: "shared-user", displayName: "Shared" },
                },
              ],
      },
    },
  );
  assert.equal(typeof getUserExpenseParticipants, "function");

  const profile = (id) => ({
    id,
    displayName: id,
    profilePictureUrl: null,
    customBio: null,
    recordCreated: "2026-01-01",
  });
  const participants = await getUserExpenseParticipants("user-1", [
    {
      paidByProfile: profile("history-payer"),
      createdByProfile: profile("history-creator"),
      splits: [{ userProfile: profile("history-split") }],
    },
    {
      paidByProfile: profile("history-payer"),
      createdByProfile: profile("history-creator"),
      splits: [{ userProfile: profile("shared-user") }],
    },
  ]);

  assert.deepEqual(
    Array.from(participants, (participant) => participant.id).sort(),
    [
      "group-user",
      "history-creator",
      "history-payer",
      "history-split",
      "shared-user",
    ],
  );
});

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

async function loadTypeScriptModule(filePath, dependencies = {}) {
  const source = await fs.readFile(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: (specifier) => {
      if (!(specifier in dependencies)) {
        throw new Error(`Unexpected dependency: ${specifier}`);
      }
      return dependencies[specifier];
    },
    console: { error() {} },
    setTimeout: (callback) => {
      callback();
      return 0;
    },
  }, { filename: filePath });
  return module.exports;
}

test("settings service rejects requests for another authenticated user", async () => {
  let queriedSettings = false;
  const { getUserSettings } = await loadTypeScriptModule(
    "src/services/profiles/settingsService.ts",
    {
      "../supabase": {
        supabase: {
          auth: {
            getUser: async () => ({
              data: { user: { id: "authenticated-user" } },
              error: null,
            }),
          },
          from: () => {
            queriedSettings = true;
            throw new Error("Settings must not be queried.");
          },
        },
      },
      "./profileMappers": { mapRowToUserSettingsDto: (row) => row },
    },
  );

  await assert.rejects(
    getUserSettings("different-user"),
    /Not logged in as this user/,
  );
  assert.equal(queriedSettings, false);
});

test("auth initialization retries transient session and profile failures", async () => {
  let currentUserCalls = 0;
  let sessionCalls = 0;
  let listenerCalls = 0;
  let authListener;
  const session = { user: { id: "user-1" } };
  const user = { id: "user-1", displayName: "Ada" };
  const serviceFunctions = {
    getCurrentUser: async () => {
      currentUserCalls += 1;
      if (currentUserCalls === 1 || currentUserCalls === 3) {
        throw new Error("Temporary profile failure");
      }
      return user;
    },
  };
  const { createAuthActions } = await loadTypeScriptModule(
    "src/state/auth/authStoreActions.ts",
    {
      "../../services": {
        ...serviceFunctions,
        supabase: {
          auth: {
            getSession: async () => {
              sessionCalls += 1;
              return sessionCalls === 1
                ? {
                    data: { session: null },
                    error: { message: "Temporary session failure" },
                  }
                : { data: { session }, error: null };
            },
            onAuthStateChange: (callback) => {
              listenerCalls += 1;
              authListener = callback;
              return { data: { subscription: { unsubscribe() {} } } };
            },
          },
        },
      },
      "../expenses/useExpenseStore": {
        useExpenseStore: { getState: () => ({ resetExpenseStore() {} }) },
      },
      "../groups/useGroupStore": {
        useGroupStore: { getState: () => ({ resetGroupStore() {} }) },
      },
      "../settings/useSettingsStore": {
        useSettingsStore: { getState: () => ({ resetSettings() {} }) },
      },
    },
  );
  const state = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  };
  const actions = createAuthActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await actions.initialize();
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.isInitialized, false);
  assert.equal(state.isLoading, false);
  assert.equal(listenerCalls, 1);

  await actions.initialize();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, false);
  assert.equal(state.isLoading, false);
  assert.equal(listenerCalls, 1);

  await actions.initialize();
  assert.equal(state.user, user);
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, true);
  assert.equal(listenerCalls, 1);
  assert.equal(typeof authListener, "function");

  authListener("TOKEN_REFRESHED", session);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.user, user);
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isInitialized, false);

  await actions.initialize();
  assert.equal(state.isInitialized, true);
  assert.equal(listenerCalls, 1);
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
  const { calculateGroupBalances } = await loadTypeScriptModule(
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
  const { createExpenseLoadActions } = await loadTypeScriptModule(
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
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
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
});

test("group member queries exclude pending invitations", async () => {
  const membershipRows = [
    {
      id: "active",
      user_id: "user-active",
      group_id: "group-1",
      group_role: "MEMBER",
      status: "ACTIVE",
      invited_by: null,
      joined_at: "2026-01-01",
    },
    {
      id: "pending",
      user_id: "user-pending",
      group_id: "group-1",
      group_role: "MEMBER",
      status: "PENDING",
      invited_by: "user-active",
      joined_at: "",
    },
  ];
  const membershipFilters = [];
  const { getGroupMembers } = await loadTypeScriptModule(
    "src/services/groups/groupQueries.ts",
    {
      "./groupMappers": {
        mapRowToGroupDto: (row) => row,
        mapRowToMembershipDto: (row) => ({ id: row.id, status: row.status }),
      },
      "../profiles/profileMappers": {
        mapRowToPublicUserProfileDto: (row) => row,
      },
      "../supabase": {
        supabase: {
          from: (table) => {
            const filters = [];
            return {
              select() {
                return this;
              },
              eq(column, value) {
                filters.push([column, value]);
                if (table === "memberships") {
                  membershipFilters.push([column, value]);
                }
                return this;
              },
              in() {
                return this;
              },
              then(resolve, reject) {
                const rows =
                  table === "memberships"
                    ? membershipRows.filter((row) =>
                        filters.every(
                          ([column, value]) => row[column] === value,
                        ),
                      )
                    : [];
                return Promise.resolve({ data: rows, error: null }).then(
                  resolve,
                  reject,
                );
              },
            };
          },
        },
      },
    },
  );

  const members = await getGroupMembers("group-1");
  assert.deepEqual(membershipFilters, [
    ["group_id", "group-1"],
    ["status", "ACTIVE"],
  ]);
  assert.deepEqual(members.map((member) => member.status), ["ACTIVE"]);
});

test("sending an invitation does not add a pending member to active members", async () => {
  const pendingMembership = {
    id: "membership-1",
    status: "PENDING",
  };
  const { createGroupInviteActions } = await loadTypeScriptModule(
    "src/state/groups/groupInviteActions.ts",
    {
      "../../services": {
        getUserActiveGroups: async () => [],
        getUserPendingInvites: async () => [],
        inviteUserByEmail: async () => pendingMembership,
        joinGroupByInviteCode: async () => ({}),
        respondToGroupInvite: async () => {},
      },
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
    },
  );
  const state = {
    selectedGroupId: "group-1",
    activeGroupMembers: [],
    isLoading: false,
    error: null,
  };
  const actions = createGroupInviteActions(
    (update) => Object.assign(state, update),
    () => state,
  );

  await actions.inviteMemberByEmail("group-1", "sender-1", "invitee@test.com");

  assert.deepEqual(state.activeGroupMembers, []);
});

test("settings store loads settings and persists returned updates", async () => {
  const settings = {
    userId: "user-1",
    pushNotificationToken: null,
    uiTheme: "SYSTEM",
    languageCode: "en",
    notifyNewExpense: true,
    notifyReminders: true,
    notifyGroupUpdates: false,
  };
  const { createSettingsActions } = await loadTypeScriptModule(
    "src/state/settings/settingsStoreActions.ts",
    {
      "../../services": {
        getUserSettings: async () => settings,
        updateUserSettings: async (_userId, update) => ({
          ...settings,
          ...update,
        }),
      },
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
    },
  );
  const state = { settings: null, isLoading: false, error: null };
  const actions = createSettingsActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await actions.fetchSettings("user-1");
  assert.equal(state.settings, settings);

  const updated = await actions.updateSettings("user-1", {
    notifyGroupUpdates: true,
  });
  assert.equal(updated.notifyGroupUpdates, true);
  assert.equal(state.settings.notifyGroupUpdates, true);
});

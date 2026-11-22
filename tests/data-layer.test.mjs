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
  vm.runInNewContext(
    output,
    {
      exports: module.exports,
      module,
      require: (specifier) => {
        if (!(specifier in dependencies)) {
          throw new Error(`Unexpected dependency: ${specifier}`);
        }
        return dependencies[specifier];
      },
      console: { error() {} },
      URL,
      setTimeout: (callback) => {
        callback();
        return 0;
      },
    },
    { filename: filePath },
  );
  return module.exports;
}

test("auth field validation returns specific required and format errors", async () => {
  const { validateEmail, validatePassword, validateDisplayName } =
    await loadTypeScriptModule("src/features/auth/authValidation.ts");

  assert.equal(validateEmail(""), "Email is required.");
  assert.equal(validateEmail("not-an-email"), "Enter a valid email address.");
  assert.equal(validateEmail("ada@example.com"), undefined);

  assert.equal(validatePassword(""), "Password is required.");
  assert.equal(
    validatePassword("short"),
    "Password must be at least 8 characters.",
  );
  assert.equal(validatePassword("long-enough"), undefined);

  assert.equal(validateDisplayName(""), "Display name is required.");
  assert.equal(validateDisplayName("Ada"), undefined);
});

test("profile validation accepts valid details and rejects invalid values", async () => {
  const { validateProfile } = await loadTypeScriptModule(
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
      displayName: "Display name is required.",
      phoneNumber: "Enter a valid phone number.",
      iban: "Enter a valid IBAN.",
      profilePictureUrl: "Enter a valid HTTPS URL.",
      customBio: "Bio must be 500 characters or fewer.",
    },
  );
});

test("group forms validate required names, invite codes, and email addresses", async () => {
  const authValidation = await loadTypeScriptModule(
    "src/features/auth/authValidation.ts",
  );
  const { validateGroupName, validateInviteCode, validateInviteEmail } =
    await loadTypeScriptModule("src/features/groups/groupValidation.ts", {
      "../auth/authValidation": authValidation,
    });

  assert.equal(validateGroupName("   "), "Group name is required.");
  assert.equal(validateGroupName("  Weekend trip  "), undefined);
  assert.equal(validateInviteCode(" "), "Invite code is required.");
  assert.equal(validateInviteCode(" abcd-1234 "), undefined);
  assert.equal(
    validateInviteEmail("not-an-email"),
    "Enter a valid email address.",
  );
  assert.equal(validateInviteEmail("  ada@example.com "), undefined);
});

test("refreshing group details reloads the group list before its members", async () => {
  const { loadGroupDetail } = await loadTypeScriptModule(
    "src/features/groups/groupDetailLoader.ts",
  );
  const calls = [];
  let groupIsActive = true;

  const isActive = await loadGroupDetail(
    "user-1",
    "group-1",
    async () => calls.push("groups"),
    async () => calls.push("members"),
    () => groupIsActive,
  );

  assert.equal(isActive, true);
  assert.deepEqual(calls, ["groups", "members"]);

  groupIsActive = false;
  calls.length = 0;
  assert.equal(
    await loadGroupDetail(
      "user-1",
      "group-1",
      async () => calls.push("groups"),
      async () => calls.push("members"),
      () => groupIsActive,
    ),
    false,
  );
  assert.deepEqual(calls, ["groups"]);
});

test("group details are a sibling route to tabs in the authenticated stack", async () => {
  const appLayout = await fs.readFile("app/(app)/_layout.tsx", "utf8");
  const tabsLayout = await fs.readFile("app/(app)/(tabs)/_layout.tsx", "utf8");

  assert.match(appLayout, /<Stack/);
  assert.match(appLayout, /name="\(tabs\)"/);
  assert.match(appLayout, /name="group\/\[groupId\]"/);
  assert.match(tabsLayout, /<Tabs/);
  assert.doesNotMatch(tabsLayout, /name="group"/);
});

test("expense create, detail, and edit routes are sibling stack screens", async () => {
  const appLayout = await fs.readFile("app/(app)/_layout.tsx", "utf8");
  const tabsLayout = await fs.readFile("app/(app)/(tabs)/_layout.tsx", "utf8");

  assert.match(appLayout, /name="expense\/create"/);
  assert.match(appLayout, /name="expense\/\[expenseId\]"/);
  assert.match(appLayout, /name="expense\/edit\/\[expenseId\]"/);
  assert.doesNotMatch(tabsLayout, /name="expense\//);
});

test("home stays the event placeholder and expenses use the fifth tab", async () => {
  const home = await fs.readFile("app/(app)/(tabs)/index.tsx", "utf8");
  const tabsLayout = await fs.readFile("app/(app)/(tabs)/_layout.tsx", "utf8");
  const tabFiles = await fs.readdir("app/(app)/(tabs)");

  assert.match(home, /<GroupHighlights/);
  assert.match(home, /<FeedPostCard/);
  assert.doesNotMatch(home, /useExpenseStore/);
  assert.ok(tabFiles.includes("expenses.tsx"));

  const expenses = await fs.readFile("app/(app)/(tabs)/expenses.tsx", "utf8");
  assert.match(expenses, /fetchIndividualExpenses/);
  assert.match(tabsLayout, /name="expenses"/);
  assert.ok(
    tabsLayout.indexOf('name="profile"') <
      tabsLayout.indexOf('name="expenses"'),
  );

  const expenseDetail = await fs.readFile(
    "app/(app)/expense/[expenseId].tsx",
    "utf8",
  );
  assert.match(expenseDetail, /router\.replace\("\/expenses"\)/);
});

test("auth deep-link exchange distinguishes unrelated, completed, and failed links", async () => {
  const { exchangeAuthLinkCode } = await loadTypeScriptModule(
    "src/features/auth/authLink.ts",
  );
  const codes = [];

  assert.equal(
    await exchangeAuthLinkCode("lumin://groups", async () => ({
      error: null,
    })),
    "unrelated",
  );
  assert.equal(
    await exchangeAuthLinkCode(
      "lumin://login?code=valid-code",
      async (code) => {
        codes.push(code);
        return { error: null };
      },
    ),
    "completed",
  );
  assert.equal(
    await exchangeAuthLinkCode("lumin://login?code=expired-code", async () => {
      throw new Error("expired");
    }),
    "failed",
  );
  assert.equal(
    await exchangeAuthLinkCode(
      "lumin://login?error=access_denied",
      async () => ({ error: null }),
    ),
    "failed",
  );
  assert.deepEqual(codes, ["valid-code"]);
});

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
  assert.equal(state.groupBalancesGroupId, "group-1");
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
  assert.deepEqual(
    members.map((member) => member.status),
    ["ACTIVE"],
  );
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

test("responding to an invitation updates the store before refresh completes", async () => {
  let markResponseComplete;
  const responseComplete = new Promise((resolve) => {
    markResponseComplete = resolve;
  });
  let resolveGroups;
  const groupRefresh = new Promise((resolve) => {
    resolveGroups = resolve;
  });
  const group = { id: "group-1", name: "Trip" };
  const activeGroup = {
    membershipId: "membership-1",
    groupRole: "MEMBER",
    group,
  };
  const { createGroupInviteActions } = await loadTypeScriptModule(
    "src/state/groups/groupInviteActions.ts",
    {
      "../../services": {
        getUserActiveGroups: async () => groupRefresh,
        getUserPendingInvites: async () => {
          throw new Error("Refresh failed");
        },
        inviteUserByEmail: async () => ({}),
        joinGroupByInviteCode: async () => ({}),
        respondToGroupInvite: async () => markResponseComplete(),
      },
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
    },
  );
  const state = {
    groups: [],
    pendingInvites: [
      {
        membershipId: "membership-1",
        joinedAt: "",
        group,
        invitedByProfile: null,
      },
    ],
    isLoading: false,
    error: null,
  };
  const actions = createGroupInviteActions(
    (update) => Object.assign(state, update),
    () => state,
  );
  const action = actions.respondToInvite("user-1", "membership-1", true);
  const actionAssertion = assert.rejects(action, /Refresh failed/);

  await responseComplete;
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(state.pendingInvites, []);
  assert.equal(state.groups[0].group.id, "group-1");

  resolveGroups([activeGroup]);
  await actionAssertion;
  assert.deepEqual(state.pendingInvites, []);
  assert.equal(state.groups[0].group.id, "group-1");
  assert.match(
    state.error,
    /Invitation accepted, but group data could not be refreshed/,
  );

  state.pendingInvites = [
    {
      membershipId: "membership-2",
      joinedAt: "",
      group,
      invitedByProfile: null,
    },
  ];
  const declineAction = actions.respondToInvite(
    "user-1",
    "membership-2",
    false,
  );
  const declineAssertion = assert.rejects(declineAction, /Refresh failed/);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(state.pendingInvites, []);
  assert.equal(state.groups.length, 1);
  await declineAssertion;
  assert.match(
    state.error,
    /Invitation declined, but group data could not be refreshed/,
  );
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
    uiTheme: "DARK",
    languageCode: "nl",
    notifyGroupUpdates: true,
  });
  assert.equal(updated.uiTheme, "DARK");
  assert.equal(updated.languageCode, "nl");
  assert.equal(updated.notifyGroupUpdates, true);
  assert.equal(state.settings.uiTheme, "DARK");
  assert.equal(state.settings.languageCode, "nl");
  assert.equal(state.settings.notifyGroupUpdates, true);
});

test("settings exposes load retry when refresh fails with cached preferences", async () => {
  const screen = await fs.readFile("app/(app)/(tabs)/settings.tsx", "utf8");

  assert.match(
    screen,
    /!pendingSettings\s+&&\s+!isLoading\s+&&\s+\(!settings\s+\|\|\s+settingsActionError\s+\|\|\s+error\)/,
  );
});

test("profile store preserves database updates after auth metadata partial success", async () => {
  class ProfileUpdatePartialSuccessError extends Error {
    constructor(profile) {
      super("Auth metadata update failed");
      this.profile = profile;
    }
  }
  const updatedProfile = {
    displayName: "Ada Updated",
    phoneNumber: "+32123456789",
    iban: "GB82WEST12345698765432",
    profilePictureUrl: "https://example.com/avatar.png",
    customBio: "Updated bio",
  };
  const { createAuthActions } = await loadTypeScriptModule(
    "src/state/auth/authStoreActions.ts",
    {
      "../../services": {
        ProfileUpdatePartialSuccessError,
        updateUserProfile: async () => {
          throw new ProfileUpdatePartialSuccessError(updatedProfile);
        },
      },
      "./authStoreTypes": {},
      "../expenses/useExpenseStore": {
        useExpenseStore: { getState: () => ({}) },
      },
      "../groups/useGroupStore": { useGroupStore: { getState: () => ({}) } },
      "../settings/useSettingsStore": {
        useSettingsStore: { getState: () => ({}) },
      },
    },
  );
  const state = {
    user: {
      id: "user-1",
      displayName: "Ada",
      name: "Ada",
      emailAddress: "ada@example.com",
      email: "ada@example.com",
    },
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
  };
  const actions = createAuthActions(
    (update) =>
      Object.assign(
        state,
        typeof update === "function" ? update(state) : update,
      ),
    () => state,
  );

  await assert.rejects(
    actions.updateProfile({ displayName: "Ada Updated" }),
    ProfileUpdatePartialSuccessError,
  );
  assert.equal(state.user.displayName, updatedProfile.displayName);
  assert.equal(state.user.phoneNumber, updatedProfile.phoneNumber);
  assert.equal(state.user.iban, updatedProfile.iban);
  assert.equal(state.user.profilePictureUrl, updatedProfile.profilePictureUrl);
  assert.equal(state.user.customBio, updatedProfile.customBio);
  assert.equal(state.isLoading, false);
});

test("expense form validation normalizes receipt URLs and enforces personal participation", async () => {
  const { validateExpenseForm } = await loadTypeScriptModule(
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
  assert.equal(typeof payerOutsideSplit, "string");
  assert.match(payerOutsideSplit, /payer must be included/i);

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
  assert.equal(typeof callerOutsideSplit, "string");
  assert.match(callerOutsideSplit, /you must be involved/i);
});

test("expense form validation rejects invalid amounts and split rows", async () => {
  const { validateExpenseForm } = await loadTypeScriptModule(
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

  assert.match(validate("0", [{ userId: "user-1", amount: "0" }]), /positive/i);
  assert.match(
    validate("1.234", [{ userId: "user-1", amount: "1.234" }]),
    /two decimal/i,
  );
  assert.match(
    validate("2.00", [
      { userId: "user-1", amount: "1.00" },
      { userId: "user-1", amount: "1.00" },
    ]),
    /duplicate/i,
  );
  assert.match(
    validate("2.00", [{ userId: "user-1", amount: "-1.00" }]),
    /nonnegative/i,
  );
  assert.match(
    validate("2.00", [{ userId: "user-1", amount: "-0.01" }]),
    /nonnegative/i,
  );
  assert.match(
    validate("2.00", [
      { userId: "user-1", amount: "1.00" },
      { userId: "user-2", amount: "0.99" },
    ]),
    /equal the expense amount/i,
  );
  assert.match(
    validate("2.00", [{ userId: "outsider", amount: "2.00" }]),
    /available participants/i,
  );
  const longTitle = validate(
    "2.00",
    [{ userId: "user-1", amount: "2.00" }],
    "x".repeat(151),
  );
  assert.equal(typeof longTitle, "string");
  assert.match(longTitle, /150 characters/i);
  const maximumUnicodeTitle = validate(
    "2.00",
    [{ userId: "user-1", amount: "2.00" }],
    "🍱".repeat(150),
  );
  assert.equal(typeof maximumUnicodeTitle, "object");
});

test("equal expense splits distribute every cent including remainders", async () => {
  const { createEqualExpenseSplits } = await loadTypeScriptModule(
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

test("expense mapper preserves the recorded creator separately from the payer", async () => {
  const { mapRowToExpenseDto } = await loadTypeScriptModule(
    "src/services/expenses/expenseMappers.ts",
  );
  const expense = mapRowToExpenseDto({
    id: "expense-1",
    group_id: "group-1",
    paid_by_user_id: "payer-1",
    created_by_user_id: "creator-1",
    title: "Lunch",
    amount: 12,
    receipt_url: null,
    record_created: "2026-11-21T12:00:00Z",
  });

  assert.equal(expense.paidByUserId, "payer-1");
  assert.equal(expense.createdByUserId, "creator-1");
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
  const expenseValidation = await loadTypeScriptModule(
    "src/services/expenses/expenseValidation.ts",
  );
  const { createExpense, updateExpense } = await loadTypeScriptModule(
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
      "../supabase": {
        supabase: {
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
        },
      },
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
  const { validateExpensePayload } = await loadTypeScriptModule(
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
    /you must be involved/i,
  );
  assert.throws(
    () =>
      validateExpensePayload({ ...payload, paidByUserId: "user-3" }, "user-1"),
    /payer must be included/i,
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
  const { createExpenseCreateActions } = await loadTypeScriptModule(
    "src/state/expenses/expenseCreateActions.ts",
    {
      "../../services": {
        createExpense: async () => created,
        updateExpense: async () => created,
        calculateGroupBalances: async () => {
          throw new Error("Balance refresh failed");
        },
      },
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
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
  const { createExpenseSplitActions } = await loadTypeScriptModule(
    "src/state/expenses/expenseSplitActions.ts",
    {
      "../../services": {
        calculateGroupBalances: async () => [],
        settleExpenseSplit: async () => {
          settleCalls += 1;
        },
      },
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
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
    /payer's own split/i,
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
  const { createExpenseSplitActions } = await loadTypeScriptModule(
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
      "../shared/storeUtils": {
        getErrorMessage: (error) => String(error),
      },
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
  const { getUserExpenseParticipants } = await loadTypeScriptModule(
    "src/services/expenses/expenseQueries.ts",
    {
      "./expenseEnrichment": { enrichExpenses: async () => [] },
      "../supabase": { supabase: {} },
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

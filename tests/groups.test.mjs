import assert from "node:assert/strict";
import test from "node:test";
import { loadModule, plain, serviceDeps } from "./support/loadModule.mjs";

const { memberName } = await loadModule(
  "src/features/groups/memberName.ts",
);
const { groupSummary } = await loadModule(
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

test("group forms validate required names, invite codes, and email addresses", async () => {
  const authValidation = await loadModule(
    "src/features/auth/authValidation.ts",
  );
  const { validateGroupName, validateInviteCode, validateInviteEmail } =
    await loadModule("src/features/groups/groupValidation.ts", {
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
  const { loadGroupDetail } = await loadModule(
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
  const { getGroupMembers } = await loadModule(
    "src/services/groups/groupQueries.ts",
    {
      "./groupMappers": {
        mapRowToGroupDto: (row) => row,
        mapRowToMembershipDto: (row) => ({ id: row.id, status: row.status }),
      },
      "../profiles/profileMappers": {
        mapRowToPublicUserProfileDto: (row) => row,
      },
      ...serviceDeps({
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
      }),
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

test("pending invite depends on the invitee being able to read the group row", async () => {
  const pendingRow = {
    id: "membership-1",
    user_id: "user-2",
    group_id: "group-1",
    status: "PENDING",
    invited_by: "user-1",
    joined_at: null,
  };
  const group = { id: "group-1", name: "Trip" };
  const inviter = { id: "user-1", display_name: "Ada" };
  const loadWithVisibleGroups = (visibleGroups) =>
    loadModule("src/services/groups/groupQueries.ts", {
      "./groupMappers": {
        mapRowToGroupDto: (row) => row,
        mapRowToMembershipDto: (row) => row,
      },
      "../profiles/profileMappers": {
        mapRowToPublicUserProfileDto: (row) => row,
      },
      ...serviceDeps({
        auth: {
          getUser: async () => ({
            data: { user: { id: "user-2" } },
            error: null,
          }),
        },
        from: (table) => ({
          select() {
            return this;
          },
          eq() {
            return this;
          },
          in() {
            return this;
          },
          then(resolve, reject) {
            const rows = {
              memberships: [pendingRow],
              // RLS on groups filters silently: no error, just fewer rows.
              groups: visibleGroups,
              user_profiles: [inviter],
            }[table];
            return Promise.resolve({ data: rows, error: null }).then(
              resolve,
              reject,
            );
          },
        }),
      }),
    });

  // Current RLS: "View groups" hides the group from a PENDING invitee, so the invite is dropped.
  const hidden = await loadWithVisibleGroups([]);
  assert.deepEqual(await hidden.getUserPendingInvites("user-2"), []);

  // After sql_v1-3.sql (has_pending_invite) the group row is visible and the invite is returned.
  const visible = await loadWithVisibleGroups([group]);
  const invites = await visible.getUserPendingInvites("user-2");
  assert.equal(invites.length, 1);
  assert.equal(invites[0].membershipId, "membership-1");
  assert.equal(invites[0].group.name, "Trip");
  assert.equal(invites[0].invitedByProfile.display_name, "Ada");
});

// Fake supabase client: applies eq/in filters to in-memory rows and logs every query.
function createFakeSupabase(tables, { userId = "user-1", rpc } = {}) {
  const queries = [];
  return {
    queries,
    supabase: {
      auth: {
        getUser: async () => ({ data: { user: { id: userId } }, error: null }),
      },
      rpc: async (name, args) => {
        queries.push({ rpc: name, args });
        return rpc(name, args);
      },
      from: (table) => {
        const query = { table, eq: [], in: [] };
        queries.push(query);
        return {
          select() {
            return this;
          },
          eq(column, value) {
            query.eq.push([column, value]);
            return this;
          },
          in(column, values) {
            query.in.push([column, values]);
            return this;
          },
          then(resolve, reject) {
            const rows = (tables[table] ?? []).filter(
              (row) =>
                query.eq.every(([column, value]) => row[column] === value) &&
                query.in.every(([column, values]) =>
                  values.includes(row[column]),
                ),
            );
            return Promise.resolve({ data: rows, error: null }).then(
              resolve,
              reject,
            );
          },
        };
      },
    },
  };
}

const membershipRow = (id, userId, groupId, status) => ({
  id,
  user_id: userId,
  group_id: groupId,
  group_role: "MEMBER",
  status,
  invited_by: null,
  joined_at: "2026-11-23T10:00:00Z",
});

const loadGroupQueries = (fake) =>
  loadModule("src/services/groups/groupQueries.ts", {
    "./groupMappers": {
      mapRowToGroupDto: (row) => row,
      mapRowToMembershipDto: (row, profile) => ({
        id: row.id,
        status: row.status,
        userProfile: profile,
      }),
    },
    "../profiles/profileMappers": {
      mapRowToPublicUserProfileDto: (row) => row,
    },
    ...serviceDeps(fake.supabase),
  });

test("group join requests list only REQUESTED rows with requester profiles", async () => {
  const fake = createFakeSupabase({
    memberships: [
      membershipRow("active", "user-1", "group-1", "ACTIVE"),
      membershipRow("pending", "user-2", "group-1", "PENDING"),
      membershipRow("request", "user-3", "group-1", "REQUESTED"),
      membershipRow("other-group", "user-4", "group-2", "REQUESTED"),
    ],
    user_profiles: [{ id: "user-3", display_name: "Requester" }],
  });
  const { getGroupJoinRequests } = await loadGroupQueries(fake);

  const requests = await getGroupJoinRequests("group-1");

  assert.deepEqual(
    requests.map((request) => [request.id, request.status]),
    [["request", "REQUESTED"]],
  );
  assert.equal(requests[0].userProfile.display_name, "Requester");
});

test("sent join requests return the requester's open requests with their group", async () => {
  const fake = createFakeSupabase({
    memberships: [
      membershipRow("request", "user-1", "group-1", "REQUESTED"),
      membershipRow("invite", "user-1", "group-2", "PENDING"),
      membershipRow("someone-else", "user-2", "group-1", "REQUESTED"),
    ],
    groups: [
      { id: "group-1", name: "Trip" },
      { id: "group-2", name: "Flat" },
    ],
  });
  const { getUserJoinRequests } = await loadGroupQueries(fake);

  const requests = await getUserJoinRequests("user-1");

  assert.deepEqual(plain(requests), [
    {
      membershipId: "request",
      requestedAt: "2026-11-23T10:00:00Z",
      group: { id: "group-1", name: "Trip" },
    },
  ]);
  await assert.rejects(
    getUserJoinRequests("user-2"),
    /Not logged in as this user/,
  );
});

test("admin join request counts are grouped per group and skip the query without admin groups", async () => {
  const fake = createFakeSupabase({
    memberships: [
      membershipRow("r1", "user-2", "group-1", "REQUESTED"),
      membershipRow("r2", "user-3", "group-1", "REQUESTED"),
      membershipRow("r3", "user-4", "group-2", "REQUESTED"),
      membershipRow("active", "user-5", "group-1", "ACTIVE"),
      membershipRow("not-admin", "user-6", "group-3", "REQUESTED"),
    ],
  });
  const { getAdminJoinRequestCounts } = await loadGroupQueries(fake);

  assert.deepEqual(plain(await getAdminJoinRequestCounts([])), {});
  assert.equal(fake.queries.length, 0);

  assert.deepEqual(
    plain(await getAdminJoinRequestCounts(["group-1", "group-2"])),
    {
      "group-1": 2,
      "group-2": 1,
    },
  );
  assert.equal(fake.queries.length, 1);
});

test("approving a join request calls the approve RPC and maps the membership", async () => {
  const approved = membershipRow("request", "user-3", "group-1", "ACTIVE");
  const fake = createFakeSupabase(
    {},
    {
      rpc: (name) =>
        name === "approve_join_request"
          ? { data: approved, error: null }
          : { data: null, error: { message: "Join request not found" } },
    },
  );
  const { approveJoinRequest, joinGroupByInviteCode } =
    await loadModule(
      "src/services/groups/groupMembershipService.ts",
      {
        "./groupMappers": {
          mapRowToGroupDto: (row) => row,
          mapRowToMembershipDto: (row, profile) => ({
            id: row.id,
            status: row.status,
            userProfile: profile,
          }),
        },
        "../profiles/profileService": {
          getPublicUserProfile: async (id) => ({
            id,
            display_name: "Requester",
          }),
        },
        ...serviceDeps(fake.supabase),
      },
    );

  const membership = await approveJoinRequest("request");

  assert.deepEqual(plain(fake.queries[0]), {
    rpc: "approve_join_request",
    args: { _membership_id: "request" },
  });
  assert.equal(membership.status, "ACTIVE");
  assert.equal(membership.userProfile.display_name, "Requester");

  // Server errors such as "ongoing request" reach the caller verbatim.
  fake.supabase.rpc = async () => ({
    data: null,
    error: { message: "You already have an ongoing request for this group" },
  });
  await assert.rejects(
    joinGroupByInviteCode("user-1", "abc123"),
    /^Error: You already have an ongoing request for this group$/,
  );
});

// groupInviteActions imports the pure withoutJoinRequest helper from groupJoinRequestActions.
const loadJoinRequestActions = () =>
  loadModule("src/state/groups/groupJoinRequestActions.ts", {
    "../../services": {},
    "../../utils/errors": { getErrorMessage: (error) => String(error) },
  });

test("sending an invitation does not add a pending member to active members", async () => {
  const pendingMembership = {
    id: "membership-1",
    status: "PENDING",
  };
  const { createGroupInviteActions } = await loadModule(
    "src/state/groups/groupInviteActions.ts",
    {
      "../../services": {
        getUserActiveGroups: async () => [],
        getUserPendingInvites: async () => [],
        inviteUserByEmail: async () => pendingMembership,
        joinGroupByInviteCode: async () => ({}),
        respondToGroupInvite: async () => {},
      },
      "./groupJoinRequestActions": await loadJoinRequestActions(),
      "../../utils/errors": {
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
  const { createGroupInviteActions } = await loadModule(
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
      "./groupJoinRequestActions": await loadJoinRequestActions(),
      "../../utils/errors": {
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

// Loads one group action module with fake services and runs it against a plain state object.
async function createGroupActionsHarness(
  filePath,
  exportName,
  services,
  state,
) {
  const module = await loadModule(filePath, {
    "../../services": services,
    "./groupJoinRequestActions": await loadJoinRequestActions(),
    "../../utils/errors": {
      getErrorMessage: (error, fallback) =>
        error instanceof Error ? error.message : fallback,
    },
  });
  return module[exportName](
    (update) => Object.assign(state, update),
    () => state,
  );
}

const userGroup = (groupId, groupRole = "MEMBER") => ({
  membershipId: `membership-${groupId}`,
  groupRole,
  joinedAt: "",
  group: { id: groupId, name: groupId },
});

test("joining by code reports ACTIVE or REQUESTED and refreshes sent requests", async () => {
  let activeGroups = [];
  const sentRequest = {
    membershipId: "request-1",
    requestedAt: "",
    group: { id: "group-1", name: "group-1" },
  };
  const state = { groups: [], pendingInvites: [], sentJoinRequests: [] };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupInviteActions.ts",
    "createGroupInviteActions",
    {
      joinGroupByInviteCode: async () => ({ id: "group-1", name: "group-1" }),
      getUserActiveGroups: async () => activeGroups,
      getUserPendingInvites: async () => [],
      getUserJoinRequests: async () =>
        activeGroups.length ? [] : [sentRequest],
    },
    state,
  );

  const requested = await actions.joinByCode("user-1", "ABC123");
  assert.equal(requested.status, "REQUESTED");
  assert.equal(requested.group.id, "group-1");
  assert.deepEqual(state.sentJoinRequests, [sentRequest]);

  activeGroups = [userGroup("group-1")];
  const joined = await actions.joinByCode("user-1", "ABC123");
  assert.equal(joined.status, "ACTIVE");
  assert.deepEqual(state.sentJoinRequests, []);
});

test("joining by code says the code worked when only the refresh fails", async () => {
  const state = { groups: [], pendingInvites: [], sentJoinRequests: [] };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupInviteActions.ts",
    "createGroupInviteActions",
    {
      joinGroupByInviteCode: async () => ({ id: "group-1", name: "group-1" }),
      getUserActiveGroups: async () => {
        throw new Error("Refresh failed");
      },
      getUserPendingInvites: async () => [],
      getUserJoinRequests: async () => [],
    },
    state,
  );

  await assert.rejects(
    actions.joinByCode("user-1", "ABC123"),
    /Refresh failed/,
  );
  assert.match(
    state.error,
    /Invite code accepted, but group data could not be refreshed: Refresh failed/,
  );
  assert.equal(state.isLoading, false);
});

test("loading groups also loads sent requests and request counts for admin groups only", async () => {
  const countCalls = [];
  const state = {};
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupLoadActions.ts",
    "createGroupLoadActions",
    {
      getUserActiveGroups: async () => [
        userGroup("admin-group", "ADMIN"),
        userGroup("member-group"),
      ],
      getUserPendingInvites: async () => [],
      getUserJoinRequests: async () => ["sent"],
      getAdminJoinRequestCounts: async (groupIds) => {
        countCalls.push(groupIds);
        return { "admin-group": 2 };
      },
    },
    state,
  );

  await actions.fetchGroupsAndInvites("user-1");

  assert.deepEqual(plain(countCalls), [["admin-group"]]);
  assert.deepEqual(state.sentJoinRequests, ["sent"]);
  assert.deepEqual(state.joinRequestCounts, { "admin-group": 2 });
});

test("loading groups still shows groups when join request data fails to load", async () => {
  const state = { sentJoinRequests: ["old"], joinRequestCounts: { old: 1 } };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupLoadActions.ts",
    "createGroupLoadActions",
    {
      getUserActiveGroups: async () => [userGroup("admin-group", "ADMIN")],
      getUserPendingInvites: async () => [],
      getUserJoinRequests: async () => [],
      getAdminJoinRequestCounts: async () => {
        throw new Error("Counts failed");
      },
    },
    state,
  );

  await actions.fetchGroupsAndInvites("user-1");

  assert.equal(state.groups[0].group.id, "admin-group");
  assert.deepEqual(state.sentJoinRequests, ["old"]);
  assert.deepEqual(plain(state.joinRequestCounts), { old: 1 });
  assert.match(
    state.error,
    /Groups loaded, but join requests could not be loaded: Counts failed/,
  );
  assert.equal(state.isLoading, false);
});

test("join request actions approve, reject and cancel requests in the store", async () => {
  const request = (id) => ({ id, groupId: "group-1", status: "REQUESTED" });
  const removed = [];
  const state = {
    selectedGroupId: "group-1",
    activeGroupMembers: [],
    joinRequests: [],
    joinRequestCounts: { "group-1": 9 },
    sentJoinRequests: [{ membershipId: "sent-1" }, { membershipId: "sent-2" }],
    isLoading: false,
    error: null,
  };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupJoinRequestActions.ts",
    "createGroupJoinRequestActions",
    {
      getGroupJoinRequests: async () => [
        request("r1"),
        request("r2"),
        request("r3"),
      ],
      approveJoinRequest: async (id) => ({ ...request(id), status: "ACTIVE" }),
      removeMembership: async (id) => {
        if (id === "fails") throw new Error("Join request not found");
        removed.push(id);
      },
    },
    state,
  );

  await actions.fetchJoinRequestsForGroup("group-1");
  assert.deepEqual(plain(state.joinRequests.map((item) => item.id)), [
    "r1",
    "r2",
    "r3",
  ]);
  assert.equal(state.joinRequestCounts["group-1"], 3);

  await actions.approveJoinRequest("r1");
  assert.deepEqual(plain(state.joinRequests.map((item) => item.id)), [
    "r2",
    "r3",
  ]);
  assert.deepEqual(plain(state.activeGroupMembers.map((item) => item.id)), [
    "r1",
  ]);
  assert.equal(state.joinRequestCounts["group-1"], 2);

  await actions.rejectJoinRequest("r2");
  assert.deepEqual(removed, ["r2"]);
  assert.deepEqual(plain(state.joinRequests.map((item) => item.id)), ["r3"]);
  assert.equal(state.joinRequestCounts["group-1"], 1);

  await actions.cancelJoinRequest("sent-1");
  assert.deepEqual(removed, ["r2", "sent-1"]);
  assert.deepEqual(plain(state.sentJoinRequests), [{ membershipId: "sent-2" }]);

  await assert.rejects(
    actions.cancelJoinRequest("fails"),
    /Join request not found/,
  );
  assert.equal(state.error, "Join request not found");
  assert.equal(state.isLoading, false);
});

test("inviting a user with an open join request approves it in the store", async () => {
  const state = {
    selectedGroupId: "group-1",
    activeGroupMembers: [],
    joinRequests: [
      { id: "request-1", groupId: "group-1", status: "REQUESTED" },
    ],
    joinRequestCounts: { "group-1": 1 },
    isLoading: false,
    error: null,
  };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupInviteActions.ts",
    "createGroupInviteActions",
    {
      inviteUserByEmail: async () => ({
        id: "request-1",
        groupId: "group-1",
        status: "ACTIVE",
      }),
    },
    state,
  );

  await actions.inviteMemberByEmail("group-1", "admin-1", "requester@test.com");

  assert.deepEqual(plain(state.joinRequests), []);
  assert.equal(state.joinRequestCounts["group-1"], 0);
  assert.deepEqual(plain(state.activeGroupMembers.map((item) => item.id)), [
    "request-1",
  ]);
});

test("resetting the group store clears join request state", async () => {
  const state = {
    joinRequests: ["request"],
    sentJoinRequests: ["sent"],
    joinRequestCounts: { "group-1": 1 },
  };
  const actions = await createGroupActionsHarness(
    "src/state/groups/groupManagementActions.ts",
    "createGroupManagementActions",
    {},
    state,
  );

  actions.resetGroupStore();

  assert.deepEqual(plain(state.joinRequests), []);
  assert.deepEqual(plain(state.sentJoinRequests), []);
  assert.deepEqual(plain(state.joinRequestCounts), {});
});


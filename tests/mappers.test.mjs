import assert from "node:assert/strict";
import test from "node:test";
import { importModule } from "./support/loadModule.mjs";

test("membership mapper accepts join requests", async () => {
  const groups = await importModule(
    "src/services/groups/groupMappers.ts",
  );

  const membership = groups.mapRowToMembershipDto({
    id: "membership-id",
    user_id: "user-id",
    group_id: "group-id",
    group_role: "MEMBER",
    status: "REQUESTED",
    invited_by: null,
    joined_at: "2026-11-23T10:00:00Z",
  });

  assert.equal(membership.status, "REQUESTED");
});

test("mappers reject unexpected membership and settings database values", async () => {
  const groups = await importModule(
    "src/services/groups/groupMappers.ts",
  );
  const profiles = await importModule(
    "src/services/profiles/profileMappers.ts",
  );

  assert.throws(
    () =>
      groups.mapRowToMembershipDto({
        id: "membership-id",
        user_id: "user-id",
        group_id: "group-id",
        group_role: "OWNER",
        status: "ACTIVE",
        invited_by: null,
        joined_at: "2026-11-21T20:11:34Z",
      }),
    /Unexpected membership role: OWNER/,
  );
  assert.throws(
    () =>
      profiles.mapRowToUserSettingsDto({
        user_id: "user-id",
        push_notification_token: null,
        ui_theme: "NEON",
        language_code: "en",
        notify_new_expense: true,
        notify_reminders: true,
        notify_group_updates: true,
      }),
    /Unexpected UI theme: NEON/,
  );
});

test("expense mapper preserves the recorded creator separately from the payer", async () => {
  const { mapRowToExpenseDto } = await importModule(
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

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import ts from "typescript";

async function loadTypeScriptModule(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("mappers reject unexpected membership and settings database values", async () => {
  const groups = await loadTypeScriptModule(
    "src/services/groups/groupMappers.ts",
  );
  const profiles = await loadTypeScriptModule(
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

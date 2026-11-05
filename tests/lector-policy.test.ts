import { EDITOR_ROLES, isEditorGrantRole } from "../src/content/editor-access";
import assert from "node:assert/strict";
import { test } from "node:test";
import * as policy from "../src/lib/auth-policy";

test("lector role can manage schedules but cannot edit parish content or gain admin access", () => {
  assert.equal(policy.canManageLectors("lektorka"), true);
  assert.equal(policy.canEditContent("lektorka"), false);
  assert.equal(policy.canManageLectors("editor"), false);
  assert.equal(policy.canEditContent("editor"), true);
  assert.equal(policy.canManageLectors("admin"), true);
  assert.equal(policy.canEditContent("admin"), true);
  for (const role of [null, undefined, "administrator", "ADMIN", "owner"]) {
    assert.equal(policy.canManageLectors(role), false);
    assert.equal(policy.canEditContent(role), false);
  }
});

test("only editor and lector roles may be granted through CMS", () => {
  assert.deepEqual([...EDITOR_ROLES], ["editor", "lektorka"]);
  assert.equal(isEditorGrantRole("admin"), false);
  assert.equal(isEditorGrantRole("editor"), true);
  assert.equal(isEditorGrantRole("lektorka"), true);
});

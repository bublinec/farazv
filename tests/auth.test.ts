import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AccessError,
  assertEditorIdentity,
  assertSameOrigin,
  parseEditorAllowlist
} from "../src/lib/auth-policy";
import {
  getAuth,
  isAuthConfigured,
  requireEditorFromHeaders,
  assertEditorRequest
} from "../src/server/auth";
import { createEditorCookieHeader } from "./helpers/editor-session";

const editorEmail = "editor@example.test";
process.env.BETTER_AUTH_SECRET =
  "test-only-secret-32-characters-minimum-never-for-hosting";
process.env.BETTER_AUTH_URL = "http://localhost:3100";
process.env.GOOGLE_CLIENT_ID = "test-only-google-client";
process.env.GOOGLE_CLIENT_SECRET = "test-only-google-secret";
process.env.ADMIN_EMAIL_ALLOWLIST = editorEmail;

test("editor allowlist is exact and normalizes case without wildcards or domain access", () => {
  assert.deepEqual(
    [
      ...parseEditorAllowlist(
        " Editor@Example.Test,\nsecond@example.test, *@example.test,example.test"
      )
    ],
    [editorEmail, "second@example.test"]
  );
  assert.throws(
    () =>
      assertEditorIdentity({
        user: { email: "editor+other@example.test", emailVerified: true },
        session: { expiresAt: new Date(Date.now() + 1000) }
      }),
    (error) => error instanceof AccessError && error.status === 403
  );
});

test("editor mutations reject cross-origin, missing and opaque origins", () => {
  for (const origin of [
    undefined,
    "null",
    "https://attacker.test",
    "http://localhost:3100.attacker.test"
  ]) {
    const request = new Request("http://localhost:3100/api/admin/content", {
      method: "POST",
      headers: origin ? { origin } : {}
    });
    assert.throws(
      () => assertSameOrigin(request, "http://localhost:3100"),
      (error) => error instanceof AccessError && error.status === 403
    );
  }
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost:3100/api/admin/content", {
        method: "POST",
        headers: { origin: "http://localhost:3100" }
      }),
      "http://localhost:3100"
    )
  );
});

test("real Better Auth stateless cookies authorize only a verified allowlisted unexpired session", async () => {
  assert.equal(isAuthConfigured(), true);
  assert.equal("database" in getAuth().options, false);
  const allowed = await createEditorCookieHeader({ email: editorEmail });
  assert.equal(
    (await requireEditorFromHeaders(new Headers({ cookie: allowed }))).email,
    editorEmail
  );
  await assert.rejects(
    requireEditorFromHeaders(new Headers()),
    (error) => error instanceof AccessError && error.status === 401
  );
  const unlisted = await createEditorCookieHeader({
    email: "stranger@example.test"
  });
  await assert.rejects(
    requireEditorFromHeaders(new Headers({ cookie: unlisted })),
    (error) => error instanceof AccessError && error.status === 403
  );
  const unverified = await createEditorCookieHeader({
    email: editorEmail,
    emailVerified: false
  });
  await assert.rejects(
    requireEditorFromHeaders(new Headers({ cookie: unverified })),
    (error) => error instanceof AccessError && error.status === 403
  );
  const expired = await createEditorCookieHeader({
    email: editorEmail,
    expiresAt: new Date(Date.now() - 1000)
  });
  await assert.rejects(
    requireEditorFromHeaders(new Headers({ cookie: expired })),
    (error) => error instanceof AccessError && error.status === 401
  );
  const oldVersion = await createEditorCookieHeader({
    email: editorEmail,
    version: "old-version"
  });
  await assert.rejects(
    requireEditorFromHeaders(new Headers({ cookie: oldVersion })),
    (error) => error instanceof AccessError && error.status === 401
  );
  const tampered = allowed.replace(
    /farazv.session_data=./,
    "farazv.session_data=X"
  );
  await assert.rejects(
    requireEditorFromHeaders(new Headers({ cookie: tampered })),
    (error) => error instanceof AccessError && error.status === 401
  );
});

test("allowlist removal revokes an existing signed cookie at the next protected request", async () => {
  const cookie = await createEditorCookieHeader({ email: editorEmail });
  process.env.ADMIN_EMAIL_ALLOWLIST = "another@example.test";
  try {
    await assert.rejects(
      requireEditorFromHeaders(new Headers({ cookie })),
      (error) => error instanceof AccessError && error.status === 403
    );
  } finally {
    process.env.ADMIN_EMAIL_ALLOWLIST = editorEmail;
  }
});

test("authorized requests still require a same-origin mutation and configuration fails closed", async () => {
  const cookie = await createEditorCookieHeader({ email: editorEmail });
  await assert.rejects(
    assertEditorRequest(
      new Request("http://localhost:3100/api/admin/uploads/sign", {
        method: "POST",
        headers: { cookie, origin: "https://attacker.test" }
      })
    ),
    (error) => error instanceof AccessError && error.status === 403
  );
  assert.equal(
    (
      await assertEditorRequest(
        new Request("http://localhost:3100/api/admin/uploads/sign", {
          method: "POST",
          headers: { cookie, origin: "http://localhost:3100" }
        })
      )
    ).email,
    editorEmail
  );
  const secret = process.env.BETTER_AUTH_SECRET;
  delete process.env.BETTER_AUTH_SECRET;
  try {
    assert.equal(isAuthConfigured(), false);
    await assert.rejects(
      requireEditorFromHeaders(new Headers({ cookie })),
      (error) => error instanceof AccessError && error.status === 503
    );
  } finally {
    process.env.BETTER_AUTH_SECRET = secret;
  }
});

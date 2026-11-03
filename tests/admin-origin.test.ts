import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { canonicalAdminDestination } from "../src/lib/admin-origin";
import { config, proxy } from "../src/proxy";

const canonical = "https://fixed-preview.example.test";
const deployed = { VERCEL: "1", BETTER_AUTH_URL: canonical };

test("alternate admin hosts use the configured origin and retain every page path/query", () => {
  for (const path of [
    "/admin",
    "/admin/login?error=access",
    "/admin/records/abc-123?kind=article&return=%2Fadmin%3Fkind%3Darticle",
    "/admin/preview/abc-123?version=2&version=3"
  ]) {
    assert.equal(
      canonicalAdminDestination(
        `https://another-alias.example.test${path}`,
        "GET",
        deployed
      ),
      `${canonical}${path}`
    );
  }
  assert.equal(
    canonicalAdminDestination(
      "https://another-alias.example.test/admin/login",
      "HEAD",
      deployed
    ),
    `${canonical}/admin/login`
  );
});

test("canonical requests do not redirect, including equivalent HTTPS default port/case", () => {
  for (const url of [
    `${canonical}/admin/login`,
    "https://FIXED-PREVIEW.EXAMPLE.TEST:443/admin/records/one?mode=preview"
  ]) {
    assert.equal(canonicalAdminDestination(url, "GET", deployed), null);
  }
  assert.equal(
    canonicalAdminDestination(
      "http://fixed-preview.example.test/admin",
      "GET",
      deployed
    ),
    `${canonical}/admin`
  );
});

test("local development is unchanged unless Vercel is explicitly enabled", () => {
  for (const VERCEL of [undefined, "", "0", "true"]) {
    for (const host of ["127.0.0.1:3200", "localhost:3100"]) {
      assert.equal(
        canonicalAdminDestination(`http://${host}/admin/login`, "GET", {
          VERCEL,
          BETTER_AUTH_URL: canonical
        }),
        null
      );
    }
  }
  assert.equal(
    canonicalAdminDestination(
      "http://127.0.0.1:3200/admin/login",
      "GET",
      deployed
    ),
    `${canonical}/admin/login`
  );
});

test("missing or unsafe configured bases never become redirect destinations", () => {
  for (const BETTER_AUTH_URL of [
    undefined,
    "",
    "not-a-url",
    "//attacker.test",
    "https:attacker.test",
    "http://fixed-preview.example.test",
    "javascript:alert(1)",
    "https://user:password@fixed-preview.example.test",
    `${canonical}/admin`,
    `${canonical}?next=https://attacker.test`,
    `${canonical}#fragment`,
    "https://fixed-preview.example.test\\",
    "https://fixed-preview.exam\nple.test"
  ]) {
    assert.equal(
      canonicalAdminDestination(
        "https://another-alias.example.test/admin/login",
        "GET",
        {
          VERCEL: "1",
          BETTER_AUTH_URL
        }
      ),
      null
    );
  }
});

test("request-controlled hosts, query destinations and encoded paths cannot redirect elsewhere", () => {
  for (const path of [
    "/admin/login?next=https://attacker.test&callbackURL=//attacker.test",
    "/admin/%2f%2fattacker.test?next=%5C%5Cattacker.test",
    "/admin//attacker.test"
  ]) {
    const result = canonicalAdminDestination(
      `https://attacker.test${path}`,
      "GET",
      deployed
    );
    assert.ok(result);
    const url = new URL(result);
    assert.equal(url.origin, canonical);
    assert.equal(url.pathname + url.search, path);
    assert.equal(url.username, "");
    assert.equal(url.hash, "");
  }
});

test("public routes, lookalike paths, all API paths and mutations stay outside canonicalization", () => {
  for (const path of [
    "/",
    "/administer",
    "/api/admin/content",
    "/api/admin/uploads/sign",
    "/api/auth/sign-in/social",
    "/admin/../api/auth/sign-out"
  ]) {
    assert.equal(
      canonicalAdminDestination(
        `https://another-alias.example.test${path}`,
        "GET",
        deployed
      ),
      null
    );
  }
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    assert.equal(
      canonicalAdminDestination(
        "https://another-alias.example.test/admin/login",
        method,
        deployed
      ),
      null
    );
  }
  assert.equal(
    canonicalAdminDestination("/admin/login", "GET", deployed),
    null
  );
});

test("the page proxy emits an uncached temporary redirect and never redirects API mutations", () => {
  const previousVercel = process.env.VERCEL;
  const previousOrigin = process.env.BETTER_AUTH_URL;
  process.env.VERCEL = "1";
  process.env.BETTER_AUTH_URL = canonical;
  try {
    for (const url of ["/", "/kontakt", "/admin/login"])
      assert.equal(
        unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
        true
      );
    for (const url of [
      "/api/admin/content",
      "/api/auth/callback/google",
      "/_next/static/app.js"
    ])
      assert.equal(
        unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
        false
      );
    const response = proxy(
      new NextRequest(
        "https://another-alias.example.test/admin/login?error=access",
        {
          headers: { "x-forwarded-host": "attacker.test" }
        }
      )
    );
    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get("location"),
      `${canonical}/admin/login?error=access`
    );
    assert.match(
      response.headers.get("cache-control") ?? "",
      /private.*no-store/
    );
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    for (const [path, method] of [
      ["/admin/login", "POST"],
      ["/api/auth/sign-in/social", "POST"],
      ["/api/admin/content", "GET"]
    ]) {
      const unchanged = proxy(
        new NextRequest(`https://another-alias.example.test${path}`, { method })
      );
      assert.equal(unchanged.headers.get("location"), null);
      assert.equal(unchanged.headers.get("x-middleware-next"), "1");
    }
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousOrigin === undefined) delete process.env.BETTER_AUTH_URL;
    else process.env.BETTER_AUTH_URL = previousOrigin;
  }
});

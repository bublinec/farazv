import assert from "node:assert/strict";
import test from "node:test";
import { designReturnPath, resolvePublicDesign } from "../src/content/design";

test("design variants are opt-in, nonproduction presentation choices", () => {
  assert.equal(resolvePublicDesign(undefined), "current");
  assert.equal(resolvePublicDesign("current"), "current");
  assert.equal(resolvePublicDesign("parish", "preview"), "parish");
  assert.equal(resolvePublicDesign("parish", "production"), "current");
  assert.equal(resolvePublicDesign("unrecognized"), "current");
});

test("design comparison returns only to local public paths", () => {
  assert.equal(
    designReturnPath("/sviatosti/sviatost-krstu?example=1#priprava"),
    "/sviatosti/sviatost-krstu?example=1#priprava"
  );
  for (const value of [
    null,
    "https://attacker.test",
    "//attacker.test",
    "/\\attacker.test",
    "/admin",
    "/api/articles",
    "/design/v2",
    "/../admin"
  ])
    assert.equal(designReturnPath(value), "/");
});

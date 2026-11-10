import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("map markers keep MapLibre's absolute positioning so every pin stays on its place", async () => {
  const css = await readFile(
    new URL(
      "../src/components/information/ParishMap.module.css",
      import.meta.url
    ),
    "utf8"
  );
  const marker = /\.marker\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";

  // A positioned marker element stacks later markers below earlier ones, so a
  // second pin drifts from its coordinate while zooming.
  assert.doesNotMatch(marker, /position\s*:/);
});

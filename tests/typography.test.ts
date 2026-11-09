import assert from "node:assert/strict";
import test from "node:test";
import { keepShortWordsTogether } from "../src/lib/typography";

test("one-letter words never end a line in the hero", () => {
  assert.equal(
    keepShortWordsTogether("Piatok 32. týždňa v Cezročnom období"),
    "Piatok 32. týždňa v Cezročnom období"
  );
  assert.equal(
    keepShortWordsTogether("A v kostole s nami i k Bohu"),
    "A v kostole s nami i k Bohu"
  );
  assert.equal(keepShortWordsTogether("Všetkých svätých"), "Všetkých svätých");
  assert.equal(keepShortWordsTogether("Koniec v"), "Koniec v");
});

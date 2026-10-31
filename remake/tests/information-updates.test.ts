import assert from "node:assert/strict";
import test from "node:test";
import { publishedInformationContent } from "../src/content/information-content";
import { getPublicInformationContent } from "../src/content/information-updates";
import { richTextToPlainText, validateRichText } from "../src/lib/rich-text";

function source(route: string) {
  const page = publishedInformationContent.find((page) => page.route === route);
  assert.ok(page);
  return page;
}

function reading(route: string) {
  return getPublicInformationContent(source(route))
    .sections.map((section) => richTextToPlainText(section.body))
    .join("\n");
}

test("expired invitations are replaced without guessing new parish dates", () => {
  const confirmation = reading("/sviatosti/sviatost-birmovania");
  assert.doesNotMatch(
    confirmation,
    /16\. 10\. 2022|októbri 2021|protipandemických/
  );
  assert.match(confirmation, /aktuálnej príprave a termínoch stretnutí/);
  assert.match(confirmation, /Katechizmus Katolíckej cirkvi 1316/);

  const marriage = reading("/sviatosti/sviatost-manzelstva");
  assert.doesNotMatch(marriage, /roku 2026|Turnus:|13\. 03\.|28\. 08\./);
  assert.match(marriage, /Aktuálne termíny predmanželských kurzov si overte/);
  assert.match(marriage, /najneskôr však štyri mesiace/);
  assert.match(marriage, /Katechizmus Katolíckej cirkvi 1661/);

  const family = getPublicInformationContent(source("/den-farskej-rodiny"));
  assert.equal(
    family.sections[0].body.content.some((node) => node.type === "image"),
    false
  );
  assert.match(
    reading("/den-farskej-rodiny"),
    /O najbližšom Dni farskej rodiny/
  );
});

test("school cleanup removes stale current claims while preserving its foundation history", () => {
  const school = reading("/farnost/cirkevna-skola");
  assert.doesNotMatch(
    school,
    /2022\/2023|aktuálne máme 234|predminulom školskom roku/
  );
  assert.match(school, /1\. 7\. 1992/);
  assert.match(school, /v minulosti získali ocenenie/);
});

test("editorial updates leave raw provenance and unrelated historical or recurring content intact", () => {
  const original = structuredClone(publishedInformationContent);
  for (const page of publishedInformationContent) {
    const current = getPublicInformationContent(page);
    for (const section of current.sections) validateRichText(section.body);
  }
  assert.deepEqual(publishedInformationContent, original);
  for (const route of [
    "/farnost/kostol-sv-alzbety",
    "/farnost/kostol-sv-jana-pavla-v-lieskovci",
    "/spolocenstva/detsky-spevokol",
    "/sviatosti/sviatost-krstu"
  ])
    assert.equal(getPublicInformationContent(source(route)), source(route));
  assert.match(
    reading("/farnost/kostol-sv-jana-pavla-v-lieskovci"),
    /19\. november 2011/
  );
  assert.match(reading("/sviatosti/sviatost-krstu"), /vo štvrtok o 19:00/);
});

test("a newly supplied schedule cannot silently inherit the old expiry correction", () => {
  const updated = structuredClone(source("/sviatosti/sviatost-manzelstva"));
  const section = updated.sections.find(
    (section) => section.id === "components_sections_text-6"
  )!;
  section.body.content[5].content![0].text = "Termíny kurzov v roku 2027";
  assert.throws(
    () => getPublicInformationContent(updated),
    /no longer matches/
  );
});

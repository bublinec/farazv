import {
  currentLayouts,
  expectedPublicReading,
  movedCommunityContacts
} from "./fixtures/current-content-contract";
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateRichText } from "../src/lib/rich-text";
import { publishedInformationContent } from "../src/content/information-content";
import {
  informationPages,
  requirePublishedInformationContent
} from "../src/content/information";
import { richTextToPlainText } from "../src/lib/rich-text";
import { getPublicInformationContent } from "../src/content/information-updates";
import { getPageCover } from "../src/content/page-photographs";

const approved = JSON.parse(
  await readFile(
    new URL("./fixtures/approved-static-content.json", import.meta.url),
    "utf8"
  )
);

test("every information page has a photograph and the original sacrament details stay distinct", () => {
  for (const page of informationPages) {
    const image = getPageCover(`/${page.slug}`)?.image;
    assert.ok(image, page.slug);
    assert.ok(image.width > 0 && image.height > 0, page.slug);
    assert.match(image.src, /^https:\/\/res\.cloudinary\.com\/dmx3wfvko\//);
  }

  for (const route of [
    "/sviatosti/sviatost-krstu",
    "/sviatosti/sviatost-eucharistie",
    "/sviatosti/sviatost-birmovania",
    "/sviatosti/sviatost-manzelstva",
    "/sviatosti/sviatost-zmierenia"
  ])
    assert.deepEqual(
      getPageCover(route)?.image,
      publishedInformationContent.find((page) => page.route === route)?.cover
    );
});

test("published static export preserves all gallery collections and excludes private and unsafe source material", () => {
  const pages = publishedInformationContent;
  assert.equal(pages.length, 29);
  assert.equal(new Set(pages.map((page) => page.route)).size, 29);
  const gallery = pages.find((page) => page.route === "/farnost/galeria")!;
  assert.deepEqual(
    gallery.sections
      .filter((section) => section.kind === "galleries")
      .flatMap((section) =>
        section.body.content
          .filter((node) => node.type === "imageGallery")
          .map((node) => (node.attrs!.images as unknown[]).length)
      ),
    [44, 44, 32]
  );
  const serialized = JSON.stringify(pages);
  assert.equal(
    /wonderful360world|strapi_administrator|resetPasswordToken|created_by|provider_metadata/.test(
      serialized
    ),
    false
  );
  for (const page of pages) {
    validateRichText(page.preamble);
    assert.deepEqual(
      page.preamble.content,
      [],
      `Legacy SEO/editor-note field must not become visible reading copy: ${page.route}`
    );
    for (const section of page.sections) validateRichText(section.body);
  }
  assert.equal(gallery.unavailableTour, true);
  assert.ok(JSON.stringify(gallery).includes("ArtSohl"));
  assert.ok(JSON.stringify(gallery).includes("Pavol Albert"));
  assert.equal(pages.filter((page) => page.placeholderSource).length, 3);
  assert.ok(
    pages
      .filter((page) => page.placeholderSource)
      .every((page) => !page.preamble.content.length && !page.sections.length)
  );
});

test("approved raw source stays exact and public reading matches reviewed editorial updates", () => {
  assert.deepEqual(publishedInformationContent, approved.sourceRecords);

  assert.deepEqual(
    informationPages.map((page) => page.slug).sort(),
    currentLayouts.map((page) => page.slug).sort()
  );
  for (const contact of movedCommunityContacts) {
    const aside = informationPages.find(
      (page) => page.slug === contact.slug
    )!.aside;
    assert.ok(aside?.contact?.name.includes(contact.name));
    assert.deepEqual(aside?.contact?.phones, contact.phones);
  }

  const reading = informationPages.map((page) => ({
    route: `/${page.slug}`,
    blocks:
      (page.source
        ? getPublicInformationContent(page.source)
        : undefined
      )?.sections
        .filter(
          (section) =>
            ![
              "slides",
              "multi_paragraph_image_banners",
              "partners_sections"
            ].includes(section.kind)
        )
        .flatMap((section) => section.body.content)
        .filter((node) => !["image", "imageGallery"].includes(node.type))
        .map((node) => richTextToPlainText({ type: "doc", content: [node] }))
        .filter(
          (text) => text.trim() && !/^(galéria|galeria)$/i.test(text.trim())
        ) ?? []
  }));
  assert.deepEqual(
    reading,
    informationPages.map((page) => ({
      route: `/${page.slug}`,
      blocks: expectedPublicReading(`/${page.slug}`)
    }))
  );
});

test("source-backed layouts cannot silently use curated fallback prose", () => {
  assert.equal(
    informationPages.filter((page) => page.contentSource === "published")
      .length,
    18
  );
  assert.deepEqual(
    informationPages
      .filter((page) => page.contentSource === "curated")
      .map((page) => page.slug),
    [
      "farnost/kostol-sv-alzbety",
      "spolocenstva/akolyti",
      "spolocenstva/lektori",
      "objav-krista"
    ]
  );
  for (const page of informationPages) {
    if (page.contentSource === "published") {
      assert.ok(page.source);
      assert.equal("sections" in page, false);
    }
  }
  assert.throws(
    () => requirePublishedInformationContent("/missing-approved-source"),
    /Missing published information content/
  );
});

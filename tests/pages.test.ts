import assert from "node:assert/strict";
import test from "node:test";
import type { RichTextNode } from "../src/content/documents";
import { findInformationPage } from "../src/content/information";
import { getInformationReadingNodes } from "../src/content/information-presentation";
import { getPublicInformationContent } from "../src/content/information-updates";
import { navigationWithPages } from "../src/content/navigation";
import {
  pageGroupForRoute,
  pageRecordId,
  slugifyPageTitle,
  type PageDocument
} from "../src/content/page-documents";
import { getPageCover } from "../src/content/page-photographs";
import { sacramentPreparation } from "../src/content/sacrament-preparation";
import { serviceQuotations } from "../src/content/service-quotations";
import { richTextToPlainText } from "../src/lib/rich-text";
import {
  builtInEditablePages,
  emptyPageDocument,
  seedPageDocument
} from "../src/server/page-seed";
import { validateDocument } from "../src/server/validation";

const text = (nodes: RichTextNode[]) =>
  nodes
    .map((node) => richTextToPlainText({ type: "doc", content: [node] }).trim())
    .filter(Boolean);

const images = (nodes: RichTextNode[]): string[] =>
  nodes.flatMap((node) => [
    ...(node.type === "image" ? [String(node.attrs?.src)] : []),
    ...(node.type === "imageGallery"
      ? (node.attrs?.images as { src: string }[]).map((image) => image.src)
      : []),
    ...images(node.content ?? [])
  ]);

/** The reading copy a visitor sees today, as the code version renders it. */
function codeReading(route: string) {
  const page = findInformationPage(route)!;
  if (page.contentSource === "curated")
    return page.sections.flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
      ...(section.items ?? [])
    ]);

  const source = getPublicInformationContent(page.source);
  const nodes = source.sections
    .filter(
      (section, index) =>
        section.body.content.length &&
        !["multi_paragraph_image_banners", "partners_sections"].includes(
          section.kind
        ) &&
        !(
          index === 0 &&
          page.kind === "sacrament" &&
          section.kind === "quotation_sections"
        )
    )
    .flatMap((section) =>
      getInformationReadingNodes(section, page).map((entry) => entry.node)
    );
  return { text: text(nodes), images: images(nodes) };
}

function seededReading(document: PageDocument) {
  const nodes = document.blocks.flatMap((block) =>
    block.type === "text"
      ? [
          ...(block.title
            ? [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: block.title }]
                }
              ]
            : []),
          ...block.body.content
        ]
      : []
  );
  return { text: text(nodes), images: images(nodes) };
}

test("eleven sacrament and service pages can be taken over by the CMS", () => {
  const pages = builtInEditablePages();

  assert.equal(pages.length, 11);
  assert.equal(pages.filter((page) => page.group === "sacrament").length, 6);
  assert.deepEqual(
    pages.filter((page) => page.group === "service").map((page) => page.route),
    [
      "spolocenstva/detsky-spevokol",
      "spolocenstva/mladeznicky-zbor",
      "spolocenstva/ministranti",
      "spolocenstva/lektori",
      "spolocenstva/akolyti"
    ]
  );
});

test("the seeded draft preserves the complete current page", () => {
  for (const { route } of builtInEditablePages()) {
    const page = findInformationPage(route)!;
    const seeded = seedPageDocument(route);
    const published = validateDocument("page", structuredClone(seeded), true);

    // Validation keeps the whole copied document, so nothing is lost on save.
    assert.deepEqual(published, seeded, route);
    assert.equal(seeded.title, page.title, route);
    assert.equal(seeded.introduction, page.introduction, route);
    assert.equal(seeded.cover?.src, getPageCover(`/${route}`)?.image.src);
    assert.deepEqual(seeded.aside?.title, page.aside?.title, route);
    assert.deepEqual(seeded.facts, page.facts ?? [], route);
    assert.deepEqual(seeded.links, page.links ?? [], route);
    assert.deepEqual(
      seeded.preparation,
      sacramentPreparation[route]
        ? structuredClone(sacramentPreparation[route])
        : undefined,
      route
    );

    const code = codeReading(route);
    const copy = seededReading(seeded);
    if (Array.isArray(code)) assert.deepEqual(copy.text, code, route);
    else {
      assert.deepEqual(copy.text, code.text, route);
      assert.deepEqual(copy.images, code.images, route);
    }
  }
});

test("seeded quotations keep their exact text and source", () => {
  const baptism = seedPageDocument("sviatosti/sviatost-krstu");
  assert.match(baptism.quotation!.text, /^Svätý krst je základom/);
  assert.equal(
    baptism.quotation!.attribution,
    "Katechizmus Katolíckej cirkvi 1213"
  );

  const eucharist = seedPageDocument("sviatosti/sviatost-eucharistie");
  assert.equal(
    eucharist.quotation!.href,
    "https://dkc.kbs.sk/dkc.php?in=kkc1324"
  );

  const lectors = seedPageDocument("spolocenstva/lektori");
  assert.deepEqual(lectors.quotation, {
    text: serviceQuotations["spolocenstva/lektori"]!.text,
    attribution: serviceQuotations["spolocenstva/lektori"]!.attribution,
    href: serviceQuotations["spolocenstva/lektori"]!.href
  });
});

test("the marriage impediments question stays a closed block", () => {
  const marriage = seedPageDocument("sviatosti/sviatost-manzelstva");
  const question = marriage.blocks.find(
    (block) => block.type === "text" && block.collapsed
  );

  assert.equal(question?.type, "text");
  assert.equal(question?.title, "Aké sú manželské prekážky?");
});

test("page validation keeps editors to safe content", () => {
  const draft = seedPageDocument("spolocenstva/akolyti");

  assert.throws(
    () =>
      validateDocument("page", {
        ...draft,
        route: "farnost/o-farnosti",
        group: "service"
      }),
    /adresu/
  );
  assert.throws(
    () =>
      validateDocument("page", {
        ...draft,
        links: [{ label: "Zlé", href: "javascript:alert(1)" }]
      }),
    /bezpečná adresa/
  );
  assert.throws(
    () =>
      validateDocument("page", {
        ...draft,
        cover: {
          src: "https://example.com/photo.jpg",
          width: 10,
          height: 10,
          alt: ""
        }
      }),
    /Cloudinary/
  );
  assert.throws(
    () =>
      validateDocument("page", {
        ...draft,
        blocks: [{ type: "html", id: "x", html: "<script></script>" }]
      }),
    /nepodporovaný blok/
  );

  const stripped = validateDocument("page", {
    ...draft,
    unexpected: "kept out"
  }) as unknown as Record<string, unknown>;
  assert.equal(stripped.unexpected, undefined);
});

test("drafts may be incomplete, publication may not", () => {
  const empty = emptyPageDocument(
    "service",
    "spolocenstva/kostolnici",
    "Kostolníci"
  );

  assert.doesNotThrow(() => validateDocument("page", empty));
  assert.throws(() => validateDocument("page", empty, true), /úvod/);
  assert.throws(
    () =>
      validateDocument(
        "page",
        {
          ...empty,
          introduction: "Úvod",
          blocks: [
            {
              type: "text",
              id: "otazka",
              collapsed: true,
              body: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Odpoveď" }]
                  }
                ]
              }
            }
          ]
        },
        true
      ),
    /otázku/
  );
});

test("page routes, ids and menu entries", () => {
  assert.equal(pageGroupForRoute("sviatosti/sviatost-krstu"), "sacrament");
  assert.equal(pageGroupForRoute("spolocenstva/kostolnici"), "service");
  assert.equal(pageGroupForRoute("farnost/o-farnosti"), null);
  assert.equal(pageGroupForRoute("spolocenstva/a/b"), null);
  assert.equal(pageGroupForRoute("spolocenstva/Zlé"), null);
  assert.equal(
    pageRecordId("spolocenstva/kostolnici"),
    "page-spolocenstva-kostolnici"
  );
  assert.equal(slugifyPageTitle("Ružencové bratstvo"), "ruzencove-bratstvo");

  const menu = navigationWithPages([
    {
      route: "spolocenstva/kostolnici",
      group: "service",
      title: "Kostolníci",
      description: ""
    }
  ]);
  const services = menu.find((item) => item.label === "Služby vo farnosti");
  assert.deepEqual(services?.children?.at(-1), {
    label: "Kostolníci",
    href: "/spolocenstva/kostolnici"
  });
  assert.equal(
    menu.find((item) => item.label === "Sviatosti")?.children?.length,
    6
  );
});

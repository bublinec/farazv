import assert from "node:assert/strict";
import test from "node:test";
import { buildMigration } from "../scripts/migration/build-migration";
import {
  decodeCopyValue,
  parseCopyDump
} from "../scripts/migration/parse-dump";
import { markdownToDocument, nodeText } from "../src/lib/legacy-rich-text";
import { migrationExcerpt } from "../scripts/migration/excerpt";
import {
  attachMediaAudit,
  auditMedia,
  mediaInventoryHash
} from "../scripts/migration/audit-media";
import type { DumpSource, SourceRow } from "../scripts/migration/types";
import type {
  BulletinDocument,
  EditorialDocument,
  RichTextNode
} from "../src/content/documents";

const row = (values: SourceRow): SourceRow => ({ ...values });
function source(tables: DumpSource["tables"]): DumpSource {
  return { tables, skippedTables: [] };
}
function allNodes(node: RichTextNode): RichTextNode[] {
  return [node, ...(node.content?.flatMap(allNodes) ?? [])];
}
const date = "2025-02-02 23:30:00.12+00";

test("COPY decoding preserves null, literal escapes, tabs, backslashes and multiline source", () => {
  assert.equal(decodeCopyValue("\\N"), null);
  assert.equal(decodeCopyValue("\\\\N"), "\\N");
  assert.equal(decodeCopyValue("a\\tb\\nc\\\\d\\101\\x42"), "a\tb\nc\\dAB");
  assert.equal(
    decodeCopyValue("Slovensk\\303\\241 diakritika"),
    "Slovenská diakritika"
  );
  const parsed = parseCopyDump(
    "COPY public.posts (id, title, content) FROM stdin;\n1\tTest\tline one\\nline two\n\\.\nDROP TABLE posts;\n"
  );
  assert.equal(parsed.tables.posts[0].content, "line one\nline two");
});

test("COPY parser never materializes auth, submissions or other-schema values", () => {
  const parsed = parseCopyDump(
    "COPY public.strapi_administrator (id, password) FROM stdin;\n1\tPRIVATE_SENTINEL\n\\.\nCOPY public.form_submissions (id, body) FROM stdin;\n1\tPRIVATE_SENTINEL\n\\.\nCOPY _timescaledb_cache.cache_inval  FROM stdin;\n\\.\nCOPY public.articles (id, title) FROM stdin;\n2\tAllowed\n\\.\n"
  );
  assert.deepEqual(Object.keys(parsed.tables), ["articles"]);
  assert.equal(JSON.stringify(parsed).includes("PRIVATE_SENTINEL"), false);
  assert.equal(parsed.skippedTables.length, 3);
  assert.throws(
    () => parseCopyDump("COPY public.posts (id, title) FROM stdin;\n1\n\\.\n"),
    /column count/
  );
  assert.throws(
    () => parseCopyDump("COPY public.posts (id) FROM stdin;\n1\n"),
    /Truncated/
  );
});

test("all articles publish while incomplete news and other source drafts remain isolated", () => {
  const result = buildMigration(
    source({
      articles: [
        row({
          id: "2",
          title: "Magazine",
          slug: "shared",
          content: "Full body",
          published_at: null,
          created_at: date,
          updated_at: date
        })
      ],
      posts: [
        row({
          id: "151",
          title: null,
          slug: null,
          content: "Private draft sentinel",
          published_at: null,
          created_at: date
        }),
        row({
          id: "4",
          title: "News",
          slug: "shared",
          content: "Public news",
          published_at: date
        })
      ],
      announcements: [
        row({
          id: "1",
          title: "Notice",
          slug: "notice",
          content: "Private",
          published_at: null
        })
      ]
    })
  );
  const article = result.records.find((record) => record.kind === "article")!;
  assert.ok(article.published);
  assert.equal(article.source!.publishedAt, null);
  assert.equal((article.published as EditorialDocument).date, "2025-02-03");
  assert.equal(article.publishedAt, "2025-02-02T23:30:00.120Z");
  const incomplete = result.records.find(
    (record) => record.id === "legacy-news-151"
  )!;
  assert.equal(incomplete.published, null);
  assert.equal(incomplete.slug, null);
  assert.equal(
    (incomplete.draft as EditorialDocument).body!.content[0].content![0].text,
    "Private draft sentinel"
  );
  assert.equal(result.report.crossKindSlugCollisions, 1);
  assert.equal(result.report.records.news.draft, 1);
  assert.deepEqual(incomplete.source!.anomalies, [
    "missing-title",
    "missing-slug"
  ]);
});

test("ordered sections retain rich marks, author, gallery order and captions without repeating alternate text", () => {
  const data = source({
    articles: [
      row({
        id: "3",
        title: "Article",
        slug: "article",
        author: "7",
        content: "First text\n\n![Additional](https://example.test/extra.jpg)",
        created_at: date
      })
    ],
    writers: [
      row({ id: "7", name: "Test author", email: "private@example.test" })
    ],
    articles_components: [
      row({
        id: "20",
        article_id: "3",
        component_type: "components_sections_galleries",
        component_id: "4",
        order: "2"
      }),
      row({
        id: "21",
        article_id: "3",
        component_type: "components_sections_text",
        component_id: "5",
        order: "1"
      })
    ],
    components_sections_text: [
      row({ id: "5", title: "Heading", content: "First **text**" })
    ],
    components_sections_galleries: [row({ id: "4" })],
    upload_file: [
      row({
        id: "8",
        url: "https://example.test/a.jpg",
        mime: "image/jpeg",
        width: "600",
        height: "800",
        caption: "Caption A"
      }),
      row({
        id: "9",
        url: "https://example.test/b.jpg",
        mime: "image/jpeg",
        width: "900",
        height: "700",
        caption: "Caption B"
      })
    ],
    upload_file_morph: [
      row({
        id: "2",
        upload_file_id: "8",
        related_type: "components_sections_galleries",
        related_id: "4",
        field: "images",
        order: "2"
      }),
      row({
        id: "3",
        upload_file_id: "9",
        related_type: "components_sections_galleries",
        related_id: "4",
        field: "images",
        order: "1"
      })
    ]
  });
  const result = buildMigration(data);
  const document = result.records[0].draft as EditorialDocument;
  assert.equal(document.author, "Test author");
  assert.equal(
    JSON.stringify(document).includes("private@example.test"),
    false
  );
  assert.deepEqual(
    document.body!.content.map((node) => node.type),
    ["heading", "paragraph", "imageGallery", "image"]
  );
  const gallery = document.body!.content[2].attrs!.images as {
    src: string;
    caption: string;
  }[];
  assert.equal(gallery[0].src, "https://example.test/b.jpg");
  assert.equal(gallery[0].caption, "Caption B");
  assert.equal(result.report.bodyReconciliations[0].appendedImages, 1);
  assert.equal(result.report.bodyReconciliations[0].appendedParagraphs, 0);
  assert.equal(result.media.length, 2);
  assert.equal(
    result.records[0].source!.hash,
    buildMigration(data).records[0].source!.hash
  );
  data.tables.components_sections_text[0].content = "Edited source text";
  assert.notEqual(
    result.records[0].source!.hash,
    buildMigration(data).records[0].source!.hash
  );
});

test("Markdown converts nested structure and safe links without executing source HTML", () => {
  const body = markdownToDocument(
    "## Heading\n\nA **bold**, *italic*, ~~struck~~, `code`, <u>underlined</u> [safe](https://example.test) [unsafe](javascript:alert(1)).\n\n> Quote\n\n1. first\n2. second\n\n```txt\nsample\n```\n\n<p>Legacy paragraph</p>"
  );
  const nodes = allNodes(body);
  const marks = nodes.flatMap((node) => node.marks ?? []);
  for (const type of ["bold", "italic", "strike", "code", "underline", "link"])
    assert.ok(marks.some((mark) => mark.type === type));
  assert.equal(marks.filter((mark) => mark.type === "link").length, 1);
  assert.ok(nodes.some((node) => node.type === "orderedList"));
  assert.ok(nodes.some((node) => node.type === "codeBlock"));
  assert.ok(nodeText(body).includes("Legacy paragraph"));
  assert.equal(
    nodes.some((node) => node.type === "html"),
    false
  );
});

test("full Markdown descriptions become bounded plain leads while complete article bodies and short authored leads survive", () => {
  const full = `## Misie\n\n**Spoločenstvo** sa stretáva pri spoločnej modlitbe. ${"Nasleduje ďalšia úplná veta o farskom živote. ".repeat(
    18
  )}\n\nZáverečný odsek musí zostať v článku.`;
  const expectedBody = markdownToDocument(full);
  const migration = buildMigration(
    source({
      articles: [
        row({
          id: "20",
          title: "Misie",
          slug: "misie",
          description: full,
          content: full,
          created_at: date
        }),
        row({
          id: "21",
          title: "Správa",
          slug: "sprava",
          description: "Krátky **zámer autora**.",
          content: full,
          created_at: date
        }),
        row({
          id: "22",
          title: "Bez perexu",
          slug: "bez-perexu",
          description: null,
          content: full,
          created_at: date
        })
      ]
    })
  );
  const documents = migration.records.map(
    (record) => record.draft as EditorialDocument
  );
  for (const document of [documents[0], documents[2]]) {
    assert.ok(document.excerpt.length >= 240 && document.excerpt.length <= 320);
    assert.equal(/#{1,6}\s|\*\*|\n/.test(document.excerpt), false);
    assert.ok(document.excerpt.includes("Spoločenstvo"));
    assert.equal(document.excerpt.includes("Záverečný odsek"), false);
    assert.deepEqual(document.body, expectedBody);
    assert.ok(
      nodeText(document.body!).includes("Záverečný odsek musí zostať v článku.")
    );
  }
  assert.equal(documents[1].excerpt, "Krátky zámer autora.");
  assert.deepEqual(documents[1].body, expectedBody);
  assert.equal(
    migrationExcerpt("[Zmysluplný odkaz](https://example.test)", expectedBody),
    "Zmysluplný odkaz"
  );
  assert.equal(
    migrationExcerpt(
      "odpustky* za obvyklých podmienok** v kostole",
      expectedBody
    ),
    "odpustky za obvyklých podmienok v kostole"
  );
});

function bulletinSource(
  specifications: {
    id: string;
    published: boolean;
    monday: string;
    wrongTuesday?: boolean;
  }[]
): DumpSource {
  const tables: DumpSource["tables"] = {
    weekly_announcements: [],
    weekly_announcements_components: [],
    components_annoucnements_days: [],
    components_annoucnements_days_components: [],
    components_annoucnements_masses: []
  };
  for (const specification of specifications) {
    tables.weekly_announcements.push(
      row({
        id: specification.id,
        published_at: specification.published ? date : null,
        created_at: date
      })
    );
    for (let index = 0; index < 7; index += 1) {
      const dayId = `${specification.id}${index}`;
      const selectedDate = new Date(`${specification.monday}T12:00:00Z`);
      selectedDate.setUTCDate(
        selectedDate.getUTCDate() +
          index +
          (index === 1 && specification.wrongTuesday ? 1 : 0)
      );
      tables.components_annoucnements_days.push(
        row({
          id: dayId,
          date: selectedDate.toISOString().slice(0, 10),
          liturgy: "Liturgy"
        })
      );
      tables.weekly_announcements_components.push(
        row({
          id: dayId,
          weekly_announcement_id: specification.id,
          field: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday"
          ][index],
          component_type: "components_annoucnements_days",
          component_id: dayId,
          order: "1"
        })
      );
    }
  }
  return source(tables);
}

test("historical bulletins preserve bad dates and only quarantine published duplicate weeks", () => {
  const result = buildMigration(
    bulletinSource([
      { id: "1", published: true, monday: "2025-02-03" },
      { id: "2", published: false, monday: "2025-02-03", wrongTuesday: true },
      { id: "3", published: true, monday: "2025-02-10" },
      { id: "4", published: true, monday: "2025-02-10" }
    ])
  );
  assert.equal(result.records[0].readOnly, false);
  assert.ok(result.records.slice(1).every((record) => record.readOnly));
  assert.equal(result.records[0].source!.anomalies, undefined);
  assert.ok(
    result.records[1].source!.anomalies!.includes("inconsistent-tuesday-date")
  );
  assert.equal(
    (result.records[1].draft as BulletinDocument).days[1].date,
    "2025-02-05"
  );
  assert.equal(result.records[1].published, null);
  assert.ok(result.records[2].source!.anomalies!.includes("duplicate-week"));
  assert.ok(result.records[3].source!.anomalies!.includes("duplicate-week"));
});

test("unpublished static content stays private and external iframe content becomes a link fallback", () => {
  const result = buildMigration(
    source({
      admin_pages: [
        row({
          id: "1",
          title: "Private page",
          slug: "kontakt",
          published_at: null
        })
      ],
      admin_pages_components: [
        row({
          id: "1",
          admin_page_id: "1",
          component_type: "components_sections_iframes",
          component_id: "4",
          order: "1"
        })
      ],
      components_sections_iframes: [row({ id: "4" })],
      components_sections_iframes_components: [
        row({
          id: "2",
          components_sections_iframe_id: "4",
          component_type: "components_shared_iframes",
          component_id: "5",
          field: "iframes",
          order: "1"
        })
      ],
      components_shared_iframes: [
        row({ id: "5", url: "https://example.test/form" })
      ]
    })
  );
  assert.equal(result.staticPages[0].publishedAt, null);
  assert.equal(result.staticPages[0].route, "/kontakt");
  assert.equal(
    result.staticPages[0].body.content[0].content![0].marks![0].attrs!.href,
    "https://example.test/form"
  );
  assert.equal(result.report.unresolvedComponents.length, 0);
});

test("categorized donations preserve within-category order, amount-only entries and meaningful parents", () => {
  const data = bulletinSource([
    { id: "1", published: true, monday: "2025-02-03" }
  ]);
  data.tables.components_annoucnements_donations = [
    row({ id: "10", name: null, amount: null }),
    row({ id: "11", name: "Meaningful parent", amount: "50" }),
    row({ id: "12", name: null, amount: "25" })
  ];
  data.tables.weekly_announcements_components.push(
    ...["10", "11", "12"].map((id, index) =>
      row({
        id: `donation-${id}`,
        weekly_announcement_id: "1",
        field: "donations",
        component_type: "components_annoucnements_donations",
        component_id: id,
        order: String(index)
      })
    )
  );
  data.tables.components_annoucnements_donations_components = [
    row({
      id: "1",
      components_annoucnements_donation_id: "10",
      field: "funerals",
      component_type: "components_annoucnements_single_donations",
      component_id: "1",
      order: "2"
    }),
    row({
      id: "2",
      components_annoucnements_donation_id: "10",
      field: "charity",
      component_type: "components_annoucnements_single_donations",
      component_id: "2",
      order: "1"
    }),
    row({
      id: "3",
      components_annoucnements_donation_id: "10",
      field: "funerals",
      component_type: "components_annoucnements_single_donations",
      component_id: "3",
      order: "1"
    })
  ];
  data.tables.components_annoucnements_single_donations = [
    row({ id: "1", name: "Second family", amount: "20" }),
    row({ id: "2", name: null, amount: "12" }),
    row({ id: "3", name: "First family", amount: "30" })
  ];
  const result = buildMigration(data);
  assert.deepEqual((result.records[0].draft as BulletinDocument).donations, [
    { label: "First family", amount: "30", category: "Z pohrebu" },
    { label: "Second family", amount: "20", category: "Z pohrebu" },
    { label: "", amount: "12", category: "Na charitu" },
    { label: "Meaningful parent", amount: "50" },
    { label: "", amount: "25" }
  ]);
  assert.deepEqual(result.report.donationProjection, {
    droppedEmptyContainers: 1,
    categorizedEntries: 3,
    uncategorizedEntries: 2
  });
});

test("availability cannot apply to another snapshot and media auditing refuses non-Cloudinary URLs", async () => {
  const { media } = buildMigration(
    source({
      upload_file: [
        row({ id: "1", url: "http://127.0.0.1/private", mime: "image/jpeg" })
      ]
    })
  );
  const report = await auditMedia(media);
  assert.equal(report.unavailable, 1);
  assert.equal(report.failures[0].error, "untrusted-url");
  assert.equal(attachMediaAudit(media, report), true);
  assert.equal(media[0].metadata.availability!.available, false);
  const previousHash = mediaInventoryHash(media);
  media[0].sourceHash = "different-source";
  assert.notEqual(mediaInventoryHash(media), previousHash);
  assert.equal(attachMediaAudit(media, report), false);
});

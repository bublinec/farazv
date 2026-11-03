import assert from "node:assert/strict";
import { test } from "node:test";
import { validateDocument, validateMedia } from "../src/server/validation";
import { ContentError } from "../src/server/errors";
import { addDays } from "../src/lib/calendar";
import type {
  BulletinDocument,
  EditorialDocument,
  SettingsDocument
} from "../src/content/documents";
import { siteSettings, regularSchedule } from "../src/content/fixtures";

const image = {
  src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1/kostol.jpg",
  width: 1200,
  height: 800,
  alt: "Farský kostol"
};
function article(): EditorialDocument {
  return {
    id: "test-article",
    title: "Článok",
    slug: "clanok",
    date: "2026-10-31",
    excerpt: "",
    blocks: [],
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Úplný text príspevku." }]
        }
      ]
    }
  };
}
function bulletin(): BulletinDocument {
  const weekStart = "2026-11-02";
  return {
    id: "test-bulletin",
    weekStart,
    days: Array.from({ length: 7 }, (_, index) => ({
      date: addDays(weekStart, index),
      status: "unpublished",
      masses: []
    })),
    announcements: [],
    donations: []
  };
}
function settings(): SettingsDocument {
  return structuredClone({ ...siteSettings, regularSchedule, priests: [] });
}
function invalid(action: () => unknown) {
  assert.throws(
    action,
    (error) => error instanceof ContentError && error.status === 422
  );
}

test("incomplete editorial drafts remain editable while malformed field types are rejected", () => {
  const draft = {
    ...article(),
    title: "",
    slug: "",
    body: { type: "doc", content: [{ type: "paragraph" }] }
  };
  assert.equal(
    (validateDocument("news", draft) as EditorialDocument).title,
    ""
  );
  invalid(() => validateDocument("news", draft, true));
  for (const values of [
    { title: {} },
    { slug: [] },
    { cover: "image" },
    { date: "" },
    { excerpt: 42 },
    { isPoster: "false" },
    { body: { type: "doc", content: "text" } }
  ])
    invalid(() => validateDocument("news", { ...article(), ...values }));
});

test("legacy blocks normalize to the whitelisted rich-text body without mutating the input", () => {
  const input = {
    ...article(),
    body: undefined,
    blocks: [
      {
        type: "paragraph",
        text: "Zachovaný text",
        rawHtml: "private sentinel"
      },
      { type: "image", image }
    ],
    unexpected: "private sentinel"
  };
  const normalized = validateDocument(
    "article",
    input,
    true
  ) as EditorialDocument;
  assert.deepEqual(normalized.blocks, []);
  assert.equal(normalized.body?.content[0].content?.[0].text, "Zachovaný text");
  assert.equal(normalized.body?.content[1].attrs?.src, image.src);
  assert.equal(JSON.stringify(normalized).includes("private sentinel"), false);
  assert.equal(input.blocks.length, 2);
  invalid(() =>
    validateDocument("article", {
      ...article(),
      body: undefined,
      blocks: [{ type: "unknown", text: "Text" }]
    })
  );
  invalid(() =>
    validateDocument("article", {
      ...article(),
      body: undefined,
      blocks: [{ type: "link", label: "Klik", href: "javascript:alert(1)" }]
    })
  );
});

test("publication requires meaningful body content or a complete poster", () => {
  for (const content of [
    [],
    [{ type: "paragraph" }],
    [{ type: "paragraph", content: [{ type: "text", text: "  \n " }] }],
    [{ type: "horizontalRule" }]
  ])
    invalid(() =>
      validateDocument(
        "article",
        { ...article(), cover: image, body: { type: "doc", content } },
        true
      )
    );
  assert.doesNotThrow(() =>
    validateDocument(
      "article",
      {
        ...article(),
        body: { type: "doc", content: [{ type: "image", attrs: image }] }
      },
      true
    )
  );
  assert.doesNotThrow(() =>
    validateDocument(
      "news",
      {
        ...article(),
        isPoster: true,
        cover: image,
        body: { type: "doc", content: [] }
      },
      true
    )
  );
  invalid(() =>
    validateDocument(
      "news",
      { ...article(), isPoster: true, body: { type: "doc", content: [] } },
      true
    )
  );
});

test("draft and published media reject arbitrary hosts, other accounts, SVG/PDF and unsafe delivery URLs", () => {
  for (const src of [
    "https://attacker.test/kostol.jpg",
    "https://res.cloudinary.com/another-account/image/upload/kostol.jpg",
    "https://res.cloudinary.com/dmx3wfvko/image/upload/file.svg",
    "https://res.cloudinary.com/dmx3wfvko/image/upload/file.pdf",
    "https://res.cloudinary.com:8443/dmx3wfvko/image/upload/file.jpg",
    "https://res.cloudinary.com/dmx3wfvko/image/upload/file.jpg?token=secret",
    "/api/admin/private-image"
  ]) {
    assert.equal(validateMedia({ ...image, src }), false);
    invalid(() =>
      validateDocument("article", { ...article(), cover: { ...image, src } })
    );
    invalid(() =>
      validateDocument("article", {
        ...article(),
        body: {
          type: "doc",
          content: [{ type: "image", attrs: { ...image, src } }]
        }
      })
    );
  }
  assert.equal(validateMedia(image), true);
});

test("bulletin drafts keep typed incomplete Masses but reject malformed dates, arrays and nested values", () => {
  const draft = bulletin();
  draft.days[0].masses = [{ time: "", intention: "Rozpracovaný úmysel" }];
  draft.days[0].status = "scheduled";
  assert.doesNotThrow(() => validateDocument("bulletin", draft));
  invalid(() => validateDocument("bulletin", draft, true));
  for (const values of [
    { days: {} },
    { announcements: {} },
    { donations: [null] },
    { weekStart: "2026-11-03" },
    { days: [{ ...draft.days[0], masses: ["08:00"] }, ...draft.days.slice(1)] }
  ])
    invalid(() => validateDocument("bulletin", { ...bulletin(), ...values }));
  const wrongDate = bulletin();
  wrongDate.days[0].date = wrongDate.days[1].date;
  invalid(() => validateDocument("bulletin", wrongDate));
  const noMass = bulletin();
  noMass.days[0] = {
    ...noMass.days[0],
    status: "no-masses",
    masses: [{ time: "18:00" }]
  };
  invalid(() => validateDocument("bulletin", noMass, true));
});

test("settings preserve partial text drafts but reject malformed rows, unsafe photos and recurring intentions", () => {
  assert.doesNotThrow(() =>
    validateDocument("settings", {
      ...settings(),
      name: "",
      email: "",
      iban: ""
    })
  );
  invalid(() =>
    validateDocument("settings", { ...settings(), name: "" }, true)
  );
  for (const values of [
    { officeHours: {} },
    { officeHours: [{ day: null, time: "08:00" }] },
    { preparationMeetings: [null] },
    { regularSchedule: [] },
    { regularSchedule: { 7: [] } },
    { priests: [{ name: "Meno", role: {}, phone: 42 }] },
    { donationQr: { src: "/media/donations-qr.png" } }
  ])
    invalid(() => validateDocument("settings", { ...settings(), ...values }));
  invalid(() =>
    validateDocument("settings", {
      ...settings(),
      regularSchedule: { 0: [{ time: "07:00", intention: "Old intention" }] }
    })
  );
  assert.doesNotThrow(() =>
    validateDocument("settings", {
      ...settings(),
      donationQr: { ...image, src: "/media/donations-qr.png" }
    })
  );
});

test("oversized or deeply nested input cannot bypass structural validation through unknown fields", () => {
  let nested: unknown = "end";
  for (let index = 0; index < 40; index++) nested = { nested };
  invalid(() => validateDocument("article", { ...article(), nested }));
  invalid(() =>
    validateDocument("article", {
      ...article(),
      ignored: "x".repeat(2_000_001)
    })
  );
});

test("optional contact facts survive typed settings writes and maps accept only ordinary web URLs", () => {
  const fields = {
    contactNote: "Vopred sa ohláste.",
    officeNote: "Počas sviatkov podľa dohody.",
    mobile: "0900 000 000",
    ico: "12345678",
    mapLink: "https://maps.google.com/?q=Zvolen"
  };
  const document = validateDocument("settings", {
    ...settings(),
    ...fields
  }) as SettingsDocument;
  for (const [key, value] of Object.entries(fields))
    assert.equal(document[key as keyof SettingsDocument], value);
  for (const mapLink of [
    "javascript:alert(1)",
    "data:text/html,test",
    "<iframe src='https://maps.google.com'></iframe>",
    "https://user:password@maps.google.com",
    "/api/admin/private"
  ])
    invalid(() => validateDocument("settings", { ...settings(), mapLink }));
  invalid(() =>
    validateDocument("settings", { ...settings(), contactNote: {} })
  );
});

test("donations preserve categories and unnamed amounts without inventing an identity", () => {
  const donations = [
    { label: "", amount: "25 €", category: "Na kostol" },
    { label: "Rodina", category: "Poďakovanie" },
    { label: "", amount: "100 €" }
  ];
  const published = validateDocument(
    "bulletin",
    { ...bulletin(), donations },
    true
  ) as BulletinDocument;
  assert.deepEqual(published.donations, donations);
  assert.equal(published.donations?.[0].label, "");
  assert.doesNotThrow(() =>
    validateDocument("bulletin", {
      ...bulletin(),
      donations: [{ label: "", amount: "", category: "Rozpracovaná kategória" }]
    })
  );
  for (const donation of [
    { label: "", amount: "" },
    { label: "  ", amount: " \n ", category: "Na kostol" },
    { label: "", category: "Na kostol" }
  ])
    invalid(() =>
      validateDocument(
        "bulletin",
        { ...bulletin(), donations: [donation] },
        true
      )
    );
  invalid(() =>
    validateDocument("bulletin", {
      ...bulletin(),
      donations: [{ label: "", amount: "25 €", category: {} }]
    })
  );
  invalid(() =>
    validateDocument("bulletin", {
      ...bulletin(),
      donations: [{ label: "", amount: "25 €", category: "x".repeat(151) }]
    })
  );
});

test("settings address limits preserve the distinct draft and publication contracts", () => {
  const maximumPublic = { ...settings(), address: "a".repeat(500) };
  const longerDraft = { ...settings(), address: "a".repeat(1000) };

  assert.doesNotThrow(() => validateDocument("settings", maximumPublic, true));
  assert.doesNotThrow(() => validateDocument("settings", longerDraft));
  invalid(() => validateDocument("settings", longerDraft, true));
  invalid(() =>
    validateDocument("settings", { ...settings(), address: "a".repeat(1001) })
  );
});

test("poster destination parsing preserves incomplete draft links and stricter publication", () => {
  for (const posterDestination of ["#prihlaska", "https:"]) {
    const draft = { ...article(), posterDestination };
    assert.doesNotThrow(() => validateDocument("article", draft));
    invalid(() => validateDocument("article", draft, true));
  }

  for (const posterDestination of [
    "/sviatosti/krst",
    "https://example.test/prihlaska",
    "mailto:fara@example.test",
    "tel:+421123456789"
  ]) {
    assert.doesNotThrow(() =>
      validateDocument("article", { ...article(), posterDestination }, true)
    );
  }

  for (const posterDestination of [
    "//example.test",
    "javascript:alert(1)",
    "/bad path"
  ])
    invalid(() =>
      validateDocument("article", { ...article(), posterDestination })
    );
});

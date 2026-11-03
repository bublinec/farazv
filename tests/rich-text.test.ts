import test from "node:test";
import assert from "node:assert/strict";
import {
  contentBlocksToRichText,
  isSafeLink,
  richTextToPlainText,
  RichTextValidationError,
  validateRichText
} from "../src/lib/rich-text";
const text = (value: string) => ({ type: "text", text: value });
test("rich text accepts the migration reading schema and preserves order and captions", () => {
  const doc = validateRichText({
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 4 }, content: [text("Nadpis")] },
      {
        type: "paragraph",
        content: [
          {
            ...text("Text"),
            marks: [
              { type: "bold" },
              {
                type: "link",
                attrs: { href: "https://example.org", onclick: "alert(1)" }
              }
            ]
          }
        ]
      },
      {
        type: "imageGallery",
        attrs: {
          images: [
            {
              src: "https://res.cloudinary.com/demo/image/upload/1.jpg",
              alt: "Kostol",
              width: 800,
              height: 600,
              caption: "Pohľad"
            }
          ]
        }
      },
      {
        type: "codeBlock",
        attrs: { language: "text" },
        content: [text("A < B")]
      },
      {
        type: "image",
        attrs: {
          src: "/media/image.png",
          alt: "Obrázok",
          width: 500,
          height: 400,
          caption: "Titulok",
          onerror: "alert(1)"
        }
      }
    ]
  });
  assert.equal(doc.content[2].type, "imageGallery");
  assert.equal(
    (doc.content[2].attrs?.images as { caption: string }[])[0].caption,
    "Pohľad"
  );
  assert.equal(doc.content[4].attrs?.onerror, undefined);
  assert.equal(
    doc.content[1].content?.[0].marks?.[1].attrs?.onclick,
    undefined
  );
});
test("dangerous link and image protocols are rejected, including whitespace and protocol-relative URLs", () => {
  for (const href of [
    "javascript:alert(1)",
    "data:text/html,a",
    "//example.org",
    "https:\\evil.test",
    "java\nscript:x",
    " https://example.org"
  ]) {
    assert.equal(isSafeLink(href), false);
    assert.throws(
      () =>
        validateRichText({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { ...text("link"), marks: [{ type: "link", attrs: { href } }] }
              ]
            }
          ]
        }),
      RichTextValidationError
    );
  }
  for (const src of [
    "http://example.org/image.jpg",
    "data:image/png;base64,aaa",
    "//example.org/image.jpg"
  ]) {
    assert.throws(() =>
      validateRichText({
        type: "doc",
        content: [{ type: "image", attrs: { src, alt: "" } }]
      })
    );
  }
  for (const href of [
    "https://example.org/path",
    "http://example.org",
    "mailto:parish@example.org",
    "tel:+421123",
    "/kontakt",
    "#obsah"
  ])
    assert.equal(isSafeLink(href), true);
});
test("structurally invalid nodes, raw HTML, unsupported marks and oversized nesting fail closed", () => {
  for (const content of [
    [{ type: "script", text: "bad" }],
    [
      {
        type: "paragraph",
        content: [{ type: "image", attrs: { src: "/x", alt: "" } }]
      }
    ],
    [{ type: "heading", attrs: { level: 1 }, content: [] }],
    [{ type: "bulletList", content: [] }],
    [
      {
        type: "imageGallery",
        attrs: { images: [{ src: "/a", alt: "a", width: 0, height: 2 }] }
      }
    ],
    [
      {
        type: "paragraph",
        content: [
          {
            ...text("text"),
            marks: [{ type: "textStyle", attrs: { style: "color:red" } }]
          }
        ]
      }
    ]
  ])
    assert.throws(
      () => validateRichText({ type: "doc", content }),
      RichTextValidationError
    );
  let node: object = { type: "paragraph", content: [text("nested")] };
  for (let i = 0; i < 30; i++) node = { type: "blockquote", content: [node] };
  assert.throws(
    () => validateRichText({ type: "doc", content: [node] }),
    RichTextValidationError
  );
});
test("empty paragraph drafts and linebreaks round trip; node attributes are copied, not retained by reference", () => {
  const input = {
    type: "doc",
    content: [
      { type: "paragraph", content: [] },
      {
        type: "paragraph",
        content: [text("A"), { type: "hardBreak" }, text("B")]
      }
    ]
  };
  const doc = validateRichText(input);
  assert.equal(richTextToPlainText(doc), "A\nB");
  assert.notEqual(doc, input);
  assert.notEqual(doc.content, input.content);
});
test("fixture blocks convert to editable canonical rich text with stable reading order", () => {
  const doc = validateRichText(
    contentBlocksToRichText([
      { type: "paragraph", text: "Úvod" },
      { type: "heading", text: "Druhý" },
      { type: "list", items: ["prvý", "druhý"] },
      { type: "link", href: "/kontakt", label: "Kontakt" },
      {
        type: "gallery",
        images: [
          {
            src: "https://example.org/a.jpg",
            width: 500,
            height: 400,
            alt: "A"
          }
        ]
      }
    ])
  );
  assert.deepEqual(
    doc.content.map((node) => node.type),
    ["paragraph", "heading", "bulletList", "paragraph", "image"]
  );
  assert.match(richTextToPlainText(doc), /Úvod\nDruhý\nprvý\ndruhý\nKontakt/);
});

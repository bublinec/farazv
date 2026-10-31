import type { RichTextDocument, RichTextNode } from "@/content/documents";
import type { ContentBlock } from "@/content/types";

export class RichTextValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RichTextValidationError";
  }
}
export function isSafeLink(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > 4096 ||
    /[\u0000-\u0020\u007f\\]/.test(value)
  )
    return false;
  return (
    /^(https?:|mailto:|tel:)/i.test(value) ||
    /^\/(?!\/)/.test(value) ||
    /^#[\w-]+$/.test(value)
  );
}
export function isSafeImageSource(value: unknown): value is string {
  return (
    typeof value === "string" &&
    isSafeLink(value) &&
    (/^https:\/\//i.test(value) || /^\/(?!\/)/.test(value))
  );
}
const blockTypes = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "blockquote",
  "horizontalRule",
  "image",
  "imageGallery",
  "codeBlock"
]);
const inlineTypes = new Set(["text", "hardBreak"]);
const markTypes = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "link"
]);
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function fail(message: string): never {
  throw new RichTextValidationError(message);
}

/** Parse to a fresh, whitelisted JSON tree. No source HTML is rendered or stored here. */
export function validateRichText(value: unknown): RichTextDocument {
  let count = 0;
  let textLength = 0;
  function visit(input: unknown, parent: string, depth: number): RichTextNode {
    if (++count > 12000 || depth > 24)
      fail("Text je príliš rozsiahly alebo vnorený.");
    if (!record(input) || typeof input.type !== "string")
      fail("Neplatná štruktúra textu.");
    const type = input.type;
    const allowed =
      parent === "root"
        ? type === "doc"
        : parent === "doc" || parent === "blockquote" || parent === "listItem"
        ? blockTypes.has(type)
        : parent === "bulletList" || parent === "orderedList"
        ? type === "listItem"
        : parent === "paragraph" ||
          parent === "heading" ||
          parent === "codeBlock"
        ? inlineTypes.has(type)
        : false;
    if (!allowed) fail(`Nepodporovaný prvok textu: ${type}.`);
    const node: RichTextNode = { type };
    const attrs = record(input.attrs) ? input.attrs : {};
    if (type === "text") {
      if (typeof input.text !== "string" || !input.text.length)
        fail("Neplatný textový prvok.");
      textLength += input.text.length;
      if (textLength > 1_000_000) fail("Text je príliš dlhý.");
      node.text = input.text;
      if (input.marks !== undefined) {
        if (!Array.isArray(input.marks) || input.marks.length > 6)
          fail("Neplatné formátovanie textu.");
        node.marks = input.marks.map((mark) => {
          if (
            !record(mark) ||
            typeof mark.type !== "string" ||
            !markTypes.has(mark.type)
          )
            fail("Nepodporované formátovanie.");
          if (mark.type === "link") {
            if (!record(mark.attrs) || !isSafeLink(mark.attrs.href))
              fail(
                "Odkaz musí používať https, http, mailto, tel alebo miestnu cestu."
              );
            return { type: "link", attrs: { href: mark.attrs.href } };
          }
          return { type: mark.type };
        });
      }
      return node;
    }
    if (input.text !== undefined || input.marks !== undefined)
      fail("Text a formátovanie sú povolené iba v textových prvkoch.");
    if (type === "heading") {
      if (
        !Number.isInteger(attrs.level) ||
        Number(attrs.level) < 2 ||
        Number(attrs.level) > 6
      )
        fail("Povolené sú nadpisy druhej až šiestej úrovne.");
      node.attrs = { level: attrs.level };
    }
    if (type === "orderedList") {
      const start = attrs.start ?? 1;
      if (
        !Number.isInteger(start) ||
        Number(start) < 1 ||
        Number(start) > 10000
      )
        fail("Neplatné číslovanie zoznamu.");
      node.attrs = { start };
    }
    if (type === "image") {
      if (!isSafeImageSource(attrs.src)) fail("Neplatná adresa obrázka.");
      const alt = attrs.alt ?? "";
      if (typeof alt !== "string" || alt.length > 2000)
        fail("Neplatný opis obrázka.");
      node.attrs = { src: attrs.src, alt };
      for (const key of ["width", "height"] as const) {
        if (attrs[key] != null) {
          if (
            !Number.isInteger(attrs[key]) ||
            Number(attrs[key]) < 1 ||
            Number(attrs[key]) > 30000
          )
            fail("Neplatné rozmery obrázka.");
          node.attrs[key] = attrs[key];
        }
      }
      if (attrs.caption != null) {
        if (typeof attrs.caption !== "string" || attrs.caption.length > 2000)
          fail("Neplatný titulok obrázka.");
        node.attrs.caption = attrs.caption;
      }
      if (attrs.title != null) {
        if (typeof attrs.title !== "string" || attrs.title.length > 2000)
          fail("Neplatný titulok obrázka.");
        node.attrs.title = attrs.title;
      }
    }
    if (type === "imageGallery") {
      if (
        !Array.isArray(attrs.images) ||
        !attrs.images.length ||
        attrs.images.length > 200
      )
        fail("Neplatná galéria.");
      node.attrs = {
        images: attrs.images.map((image: unknown) => {
          if (
            !record(image) ||
            !isSafeImageSource(image.src) ||
            typeof image.alt !== "string" ||
            image.alt.length > 2000 ||
            !Number.isInteger(image.width) ||
            !Number.isInteger(image.height) ||
            Number(image.width) < 1 ||
            Number(image.height) < 1 ||
            Number(image.width) > 30000 ||
            Number(image.height) > 30000
          )
            fail("Neplatný obrázok v galérii.");
          if (
            image.caption != null &&
            (typeof image.caption !== "string" || image.caption.length > 2000)
          )
            fail("Neplatný titulok galérie.");
          return {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
            ...(image.caption ? { caption: image.caption } : {})
          };
        })
      };
    }
    if (type === "codeBlock" && attrs.language != null) {
      if (typeof attrs.language !== "string" || attrs.language.length > 100)
        fail("Neplatný jazyk kódu.");
      node.attrs = { language: attrs.language };
    }
    const leaf = [
      "image",
      "imageGallery",
      "hardBreak",
      "horizontalRule"
    ].includes(type);
    if (leaf) {
      if (input.content !== undefined)
        fail("Tento prvok nemôže obsahovať ďalší text.");
      return node;
    }
    if (input.content !== undefined && !Array.isArray(input.content))
      fail("Neplatný obsah textu.");
    node.content = ((input.content ?? []) as unknown[]).map((child) =>
      visit(child, type, depth + 1)
    );
    if (
      ["bulletList", "orderedList", "listItem", "blockquote"].includes(type) &&
      !node.content.length
    )
      fail("Zoznam alebo citát nesmie byť prázdny.");
    if (type === "listItem" && node.content[0]?.type !== "paragraph")
      fail("Položka zoznamu musí začínať odsekom.");
    return node;
  }
  return visit(value, "root", 0) as RichTextDocument;
}
export function richTextToPlainText(doc: RichTextDocument): string {
  function flatten(node: RichTextNode): string {
    return node.type === "text"
      ? node.text ?? ""
      : node.type === "hardBreak"
      ? "\n"
      : (node.content ?? [])
          .map(flatten)
          .join(
            [
              "doc",
              "bulletList",
              "orderedList",
              "blockquote",
              "listItem"
            ].includes(node.type)
              ? "\n"
              : ""
          );
  }
  return flatten(doc).trim();
}
function textNode(text: string): RichTextNode[] {
  return text ? [{ type: "text", text }] : [];
}
export function contentBlocksToRichText(
  blocks: ContentBlock[]
): RichTextDocument {
  return {
    type: "doc",
    content: blocks.flatMap((block): RichTextNode[] => {
      switch (block.type) {
        case "paragraph":
          return [{ type: "paragraph", content: textNode(block.text) }];
        case "heading":
          return [
            {
              type: "heading",
              attrs: { level: 2 },
              content: textNode(block.text)
            }
          ];
        case "quote":
          return [
            {
              type: "blockquote",
              content: [{ type: "paragraph", content: textNode(block.text) }]
            }
          ];
        case "list":
          return [
            {
              type: "bulletList",
              content: block.items.map((text) => ({
                type: "listItem",
                content: [{ type: "paragraph", content: textNode(text) }]
              }))
            }
          ];
        case "link":
          return isSafeLink(block.href)
            ? [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: block.label || block.href,
                      marks: [{ type: "link", attrs: { href: block.href } }]
                    }
                  ]
                }
              ]
            : [{ type: "paragraph", content: textNode(block.label) }];
        case "image":
          return [
            {
              type: "image",
              attrs: {
                src: block.image.src,
                width: block.image.width,
                height: block.image.height,
                alt: block.image.alt,
                ...(block.image.caption ? { title: block.image.caption } : {})
              }
            }
          ];
        case "gallery":
          return block.images.map((image) => ({
            type: "image",
            attrs: {
              src: image.src,
              width: image.width,
              height: image.height,
              alt: image.alt,
              ...(image.caption ? { title: image.caption } : {})
            }
          }));
      }
    })
  };
}

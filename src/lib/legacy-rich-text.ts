import { Lexer, type Token } from "marked";
import type { RichTextDocument, RichTextNode } from "../content/documents";
import type { ContentBlock, MediaAsset } from "../content/types";

type Mark = NonNullable<RichTextNode["marks"]>[number];
type LooseToken = Token & {
  tokens?: Token[];
  text?: string;
  raw?: string;
  href?: string;
  title?: string | null;
  depth?: number;
  items?: { tokens: Token[] }[];
  ordered?: boolean;
  start?: number | string;
  header?: { tokens: Token[] }[];
  rows?: { tokens: Token[] }[][];
  lang?: string;
};

export function safeContentUrl(value: string): string | null {
  const trimmed = value.trim();
  if (
    /^(?:https?:\/\/|mailto:|tel:)/i.test(trimmed) ||
    /^\/(?!\/)/.test(trimmed) ||
    /^#[\w-]+$/.test(trimmed)
  )
    return trimmed;
  return null;
}

export function decodeEntities(value: string): string {
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (whole, entity: string) => {
      if (entity.startsWith("#")) {
        const number =
          entity[1].toLowerCase() === "x"
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);
        return Number.isInteger(number) && number > 0 && number <= 0x10ffff
          ? String.fromCodePoint(number)
          : whole;
      }
      return (
        (
          {
            amp: "&",
            lt: "<",
            gt: ">",
            quot: '"',
            apos: "'",
            nbsp: " "
          } as Record<string, string>
        )[entity.toLowerCase()] ?? whole
      );
    }
  );
}

function textNode(text: string, marks: Mark[] = []): RichTextNode[] {
  if (!text) return [];
  return [
    {
      type: "text",
      text: decodeEntities(text),
      ...(marks.length ? { marks } : {})
    }
  ];
}

export function imageNode(image: MediaAsset): RichTextNode {
  return {
    type: "image",
    attrs: {
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      ...(image.caption ? { title: image.caption, caption: image.caption } : {})
    }
  };
}

function inline(tokens: Token[], marks: Mark[] = []): RichTextNode[] {
  const result: RichTextNode[] = [];
  let htmlMarks: Mark[] = [];
  for (const input of tokens) {
    const token = input as LooseToken;
    const combined = [...marks, ...htmlMarks];
    switch (token.type) {
      case "strong":
        result.push(
          ...inline(token.tokens ?? [], [...combined, { type: "bold" }])
        );
        break;
      case "em":
        result.push(
          ...inline(token.tokens ?? [], [...combined, { type: "italic" }])
        );
        break;
      case "del":
        result.push(
          ...inline(token.tokens ?? [], [...combined, { type: "strike" }])
        );
        break;
      case "codespan":
        result.push(
          ...textNode(token.text ?? "", [...combined, { type: "code" }])
        );
        break;
      case "link": {
        const href = safeContentUrl(token.href ?? "");
        result.push(
          ...inline(
            token.tokens ?? [],
            href
              ? [
                  ...combined,
                  {
                    type: "link",
                    attrs: {
                      href,
                      ...(token.title ? { title: token.title } : {})
                    }
                  }
                ]
              : combined
          )
        );
        break;
      }
      case "image": {
        const src = safeContentUrl(token.href ?? "");
        if (src)
          result.push(
            imageNode({
              src,
              width: 1200,
              height: 800,
              alt: decodeEntities(token.text ?? ""),
              ...(token.title ? { caption: token.title } : {})
            })
          );
        else result.push(...textNode(token.text ?? "", combined));
        break;
      }
      case "br":
        result.push({ type: "hardBreak" });
        break;
      case "html": {
        const html = token.raw ?? token.text ?? "";
        if (/^<u(?:\s[^>]*)?>$/i.test(html.trim()))
          htmlMarks.push({ type: "underline" });
        else if (/^<\/u>$/i.test(html.trim()))
          htmlMarks = htmlMarks.filter((mark) => mark.type !== "underline");
        else if (/^<br\s*\/?\s*>$/i.test(html.trim()))
          result.push({ type: "hardBreak" });
        else result.push(...textNode(html.replace(/<[^>]*>/g, ""), combined));
        break;
      }
      default:
        if (token.tokens) result.push(...inline(token.tokens, combined));
        else result.push(...textNode(token.text ?? token.raw ?? "", combined));
    }
  }
  return result;
}

function paragraphNodes(
  content: RichTextNode[],
  type = "paragraph",
  attrs?: Record<string, unknown>
): RichTextNode[] {
  const result: RichTextNode[] = [];
  let pending: RichTextNode[] = [];
  const flush = () => {
    if (pending.length)
      result.push({ type, ...(attrs ? { attrs } : {}), content: pending });
    pending = [];
  };
  for (const node of content) {
    if (node.type === "image") {
      flush();
      result.push(node);
    } else pending.push(node);
  }
  flush();
  return result;
}

function blocks(tokens: Token[]): RichTextNode[] {
  return tokens.flatMap((input): RichTextNode[] => {
    const token = input as LooseToken;
    switch (token.type) {
      case "space":
      case "def":
        return [];
      case "heading":
        return paragraphNodes(inline(token.tokens ?? []), "heading", {
          level: Math.min(6, Math.max(2, token.depth ?? 2))
        });
      case "paragraph":
      case "text":
        return paragraphNodes(
          inline(token.tokens ?? Lexer.lexInline(token.text ?? ""))
        );
      case "blockquote": {
        const content = blocks(token.tokens ?? []);
        return content.length ? [{ type: "blockquote", content }] : [];
      }
      case "list": {
        const items = (token.items ?? []).map((item) => {
          const content = blocks(item.tokens);
          if (content[0]?.type !== "paragraph")
            content.unshift({ type: "paragraph", content: [] });
          return { type: "listItem", content };
        });
        return items.length
          ? [
              {
                type: token.ordered ? "orderedList" : "bulletList",
                ...(token.ordered
                  ? { attrs: { start: Number(token.start) || 1 } }
                  : {}),
                content: items
              }
            ]
          : [];
      }
      case "code":
        return [
          {
            type: "codeBlock",
            ...(token.lang ? { attrs: { language: token.lang } } : {}),
            content: textNode(token.text ?? "")
          }
        ];
      case "hr":
        return [{ type: "horizontalRule" }];
      case "table":
        return [
          ...(token.header ? [token.header] : []),
          ...(token.rows ?? [])
        ].flatMap((row) =>
          paragraphNodes(
            row.flatMap((cell, index) => [
              ...(index ? textNode(" | ") : []),
              ...inline(cell.tokens)
            ])
          )
        );
      case "html": {
        // No source HTML is executed. Preserve visible text and line structure.
        const text = (token.raw ?? token.text ?? "")
          .replace(/<\/(?:p|div|h[1-6]|li)>/gi, "\n\n")
          .replace(/<br\s*\/?\s*>/gi, "\n")
          .replace(/<[^>]*>/g, "");
        return text
          .split(/\n\s*\n/)
          .filter((part) => part.trim())
          .flatMap((part) => paragraphNodes(textNode(part.trim())));
      }
      default:
        return paragraphNodes(textNode(token.text ?? token.raw ?? ""));
    }
  });
}

export function markdownToDocument(
  markdown: string | null | undefined
): RichTextDocument {
  return {
    type: "doc",
    content: markdown?.trim() ? blocks(Lexer.lex(markdown, { gfm: true })) : []
  };
}

export function nodeText(node: RichTextNode): string {
  if (node.type === "hardBreak") return "\n";
  return node.text ?? node.content?.map(nodeText).join("") ?? "";
}

/** Compatibility projection. Canonical body keeps marks, nested lists and links. */
export function documentToBlocks(document: RichTextDocument): ContentBlock[] {
  return document.content.flatMap((node): ContentBlock[] => {
    if (node.type === "image") {
      const attrs = node.attrs ?? {};
      return [
        {
          type: "image",
          image: {
            src: String(attrs.src ?? ""),
            width: Number(attrs.width) || 1200,
            height: Number(attrs.height) || 800,
            alt: String(attrs.alt ?? ""),
            ...(attrs.caption || attrs.title
              ? { caption: String(attrs.caption ?? attrs.title) }
              : {})
          }
        }
      ];
    }
    if (node.type === "heading")
      return [{ type: "heading", text: nodeText(node) }];
    if (node.type === "blockquote")
      return [
        { type: "quote", text: node.content?.map(nodeText).join("\n\n") ?? "" }
      ];
    if (node.type === "bulletList" || node.type === "orderedList")
      return [{ type: "list", items: node.content?.map(nodeText) ?? [] }];
    if (node.type === "horizontalRule") return [];
    return [{ type: "paragraph", text: nodeText(node) }];
  });
}

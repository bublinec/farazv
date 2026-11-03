import type { RichTextDocument } from "../../src/content/documents";
import { richTextToPlainText } from "../../src/lib/rich-text";
import { markdownToDocument } from "../../src/lib/legacy-rich-text";

function readingText(document: RichTextDocument): string {
  return (
    richTextToPlainText(document)
      // Some legacy descriptions have unbalanced emphasis. Keep those delimiters
      // out of summaries without rewriting the authoritative article body.
      .replace(/(^|[\s(])[*_]{1,3}(?=[\p{L}\p{N}])/gu, "$1")
      .replace(/(?<=[\p{L}\p{N}.,!?;:)])[*_]{1,3}(?=$|[\s).,;:!?])/gu, "")
      .replace(/\s+/gu, " ")
      .trim()
  );
}

/** Legacy descriptions often contain an entire Markdown article, not a lead. */
export function migrationExcerpt(
  description: string | null | undefined,
  body: RichTextDocument
): string {
  const authored = readingText(markdownToDocument(description));
  const plain = authored || readingText(body);
  if (plain.length <= 300) return plain;
  const prefix = plain.slice(0, 300);
  const lastSpace = prefix.lastIndexOf(" ");
  const boundary = lastSpace >= 240 ? lastSpace : 300;
  return `${prefix.slice(0, boundary).replace(/[\s,.;:!?]+$/u, "")}…`;
}

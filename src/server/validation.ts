import type { ContentDocumentMap, RecordKind } from "@/content/documents";
import {
  parseBulletinDraft,
  requirePublishedBulletin
} from "./validation/bulletin";
import {
  parseEditorialDraft,
  requirePublishedEditorial
} from "./validation/editorial";
import {
  parseSettingsDraft,
  requirePublishedSettings
} from "./validation/settings";
import { parsePageDraft, requirePublishedPage } from "./validation/page";
import { asObject, fail, validateInputBounds } from "./validation/shared";

export { isCalendarDate, validateMedia } from "./validation/shared";

export const recordKinds: RecordKind[] = [
  "article",
  "news",
  "notice",
  "event",
  "bulletin",
  "settings",
  "page"
];

/** Parse a safe editable draft, then apply publication-only completeness rules. */
export function validateDocument<K extends RecordKind>(
  kind: K,
  value: unknown,
  publishing = false
): ContentDocumentMap[K] {
  if (!recordKinds.includes(kind)) fail("Neplatný typ obsahu.");
  asObject(value, "Neplatný obsah formulára.");
  validateInputBounds(value);
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 2_000_000)
    fail("Obsah je príliš veľký.");

  const input = structuredClone(value) as Record<string, unknown>;
  switch (kind) {
    case "bulletin": {
      const document = parseBulletinDraft(input);
      if (publishing) requirePublishedBulletin(document);
      return document as ContentDocumentMap[K];
    }
    case "settings": {
      const document = parseSettingsDraft(input);
      if (publishing) requirePublishedSettings(document);
      return document as ContentDocumentMap[K];
    }
    case "page": {
      const document = parsePageDraft(input);
      if (publishing) requirePublishedPage(document);
      return document as ContentDocumentMap[K];
    }
    case "article":
    case "news":
    case "notice":
    case "event": {
      const document = parseEditorialDraft(input);
      if (publishing) requirePublishedEditorial(document);
      return document as ContentDocumentMap[K];
    }
    default: {
      const unhandled: never = kind;
      return fail(`Neplatný typ obsahu: ${unhandled}.`);
    }
  }
}

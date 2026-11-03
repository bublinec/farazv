import "server-only";

import {
  BULLETIN_IMPORT_MAX_BYTES,
  type BulletinImportResult
} from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { parseBulletinText } from "@/lib/bulletin-parser";
import {
  BulletinImportError,
  extractWordText,
  type ExtractedText
} from "./word-extraction";

export { BulletinImportError } from "./word-extraction";

function decodeText(buffer: Buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xfe)
    return {
      text: new TextDecoder("utf-16le").decode(buffer),
      legacyEncoding: false
    };

  if (buffer[0] === 0xfe && buffer[1] === 0xff)
    return {
      text: new TextDecoder("utf-16be").decode(buffer),
      legacyEncoding: false
    };

  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(buffer),
      legacyEncoding: false
    };
  } catch {
    // Older Slovak Windows exports commonly use this encoding. Keep the text
    // recoverable and flag the assumption rather than replacing every accent.
    return {
      text: new TextDecoder("windows-1250").decode(buffer),
      legacyEncoding: true
    };
  }
}

export async function importBulletinDocument(
  buffer: Buffer,
  filename: string,
  referenceWeekStart?: CalendarDate,
  signal?: AbortSignal
): Promise<BulletinImportResult> {
  if (signal?.aborted)
    throw new BulletinImportError("Import bol zrušený.", 499);

  if (!buffer.length)
    throw new BulletinImportError("Vybraný súbor je prázdny.", 400);

  if (buffer.length > BULLETIN_IMPORT_MAX_BYTES)
    throw new BulletinImportError("Dokument môže mať najviac 3 MB.", 413);

  const extension = filename.match(/\.(docx?|txt)$/i)?.[1].toLowerCase();
  if (!extension)
    throw new BulletinImportError(
      "Vyberte dokument DOC, DOCX alebo textový súbor TXT.",
      400
    );

  const ole = buffer
    .subarray(0, 8)
    .equals(Buffer.from("d0cf11e0a1b11ae1", "hex"));
  const zip = buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50;
  const format = ole
    ? "doc"
    : zip
    ? "docx"
    : extension === "txt"
    ? "text"
    : null;
  if (!format)
    throw new BulletinImportError(
      "Obsah súboru nezodpovedá dokumentu Word. Otvorte ho a uložte ako DOCX alebo vložte jeho text."
    );

  let extracted: ExtractedText;
  let legacyEncoding = false;

  if (format === "text") {
    const decoded = decodeText(buffer);
    extracted = { text: decoded.text, truncated: false };
    legacyEncoding = decoded.legacyEncoding;
  } else extracted = await extractWordText(buffer, format, signal);

  if (signal?.aborted)
    throw new BulletinImportError("Import bol zrušený.", 499);

  if (!extracted.text.trim())
    throw new BulletinImportError(
      "V dokumente sa nenašiel čitateľný text. Ak obsahuje iba naskenované obrázky, vložte text ručne."
    );

  const result = parseBulletinText(extracted.text, {
    filename,
    format,
    referenceWeekStart
  });

  if (legacyEncoding)
    result.warnings.unshift({
      code: "text-encoding",
      message:
        "Text nebol uložený v UTF-8. Použilo sa staršie stredoeurópske kódovanie Windows; skontrolujte diakritiku."
    });

  if (extracted.truncated)
    result.warnings.unshift({
      code: "text-truncated",
      message:
        "Dokument prekročil limit textu. Načítala sa iba úvodná časť; skontrolujte chýbajúce riadky a oznamy."
    });

  if (format !== (extension === "txt" ? "text" : extension))
    result.warnings.unshift({
      code: "format-mismatch",
      message:
        "Prípona súboru nezodpovedá jeho skutočnému formátu. Text sa načítal podľa obsahu; skontrolujte výsledok."
    });

  return result;
}

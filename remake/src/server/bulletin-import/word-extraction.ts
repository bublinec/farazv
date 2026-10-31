import "server-only";

import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";
import { BULLETIN_IMPORT_MAX_TEXT } from "@/content/bulletin-import";

const require = createRequire(import.meta.url);
const EXTRACTION_TIMEOUT_MS = 12_000;
const UNREADABLE_DOCUMENT =
  "Text dokumentu sa nepodarilo prečítať. Skúste ho vo Worde uložiť ako nový súbor DOCX alebo vložte jeho text.";

export class BulletinImportError extends Error {
  constructor(message: string, public readonly status = 422) {
    super(message);
    this.name = "BulletinImportError";
  }
}

/*
 * A fixed, local worker isolates the third-party binary/XML parser from the
 * request thread. Nothing in the uploaded document becomes executable code.
 * Pass the resolved package path so standalone deployments use the traced
 * external dependency rather than relying on a worker-specific module path.
 */
const EXTRACTION_WORKER = String.raw`
const { parentPort, workerData } = require("node:worker_threads");
const buffer = Buffer.from(workerData.bytes);

function checkCompoundDocument() {
  if (buffer.length < 512 || buffer.readUInt16LE(28) !== 0xfffe)
    throw new Error("unreadable");
  const sectorShift = buffer.readUInt16LE(30);
  if (![9, 12].includes(sectorShift) || buffer.readUInt16LE(32) !== 6)
    throw new Error("unreadable");
  const sectors = Math.floor(buffer.length / 2 ** sectorShift);
  for (const offset of [44, 64, 72]) {
    if (buffer.readUInt32LE(offset) > sectors) throw new Error("archive-limit");
  }
  if (buffer.readUInt32LE(56) > 65536) throw new Error("archive-limit");
}

function checkArchive() {
  // Check the central directory before the extractor inflates any OOXML.
  // Images are not needed; nevertheless bound all declared expansion sizes.
  const min = Math.max(0, buffer.length - 65557);
  let end = -1;
  for (let i = buffer.length - 22; i >= min; i--) {
    if (
      buffer.readUInt32LE(i) === 0x06054b50 &&
      i + 22 + buffer.readUInt16LE(i + 20) === buffer.length
    ) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("archive");
  const count = buffer.readUInt16LE(end + 10);
  const directorySize = buffer.readUInt32LE(end + 12);
  let offset = buffer.readUInt32LE(end + 16);
  const directoryStart = offset;
  const directoryEnd = offset + directorySize;
  if (
    count > 1500 ||
    directoryEnd > end ||
    buffer.readUInt16LE(end + 4) ||
    buffer.readUInt16LE(end + 6) ||
    buffer.readUInt16LE(end + 8) !== count
  )
    throw new Error("archive-limit");
  let expanded = 0;
  let wordDocument = false;
  for (let index = 0; index < count; index++) {
    if (
      offset + 46 > directoryEnd ||
      buffer.readUInt32LE(offset) !== 0x02014b50
    )
      throw new Error("archive");
    const compressed = buffer.readUInt32LE(offset + 20);
    const size = buffer.readUInt32LE(offset + 24);
    const length = buffer.readUInt16LE(offset + 28);
    const next =
      offset +
      46 +
      length +
      buffer.readUInt16LE(offset + 30) +
      buffer.readUInt16LE(offset + 32);
    if (next > directoryEnd) throw new Error("archive");
    const name = buffer
      .subarray(offset + 46, offset + 46 + length)
      .toString("utf8");
    if (name === "word/document.xml") wordDocument = true;
    if (buffer.readUInt16LE(offset + 8) & 0x41) throw new Error("encrypted");
    if (buffer.readUInt16LE(offset + 34)) throw new Error("archive-limit");
    expanded += size;
    if (
      size > 16_000_000 ||
      expanded > 32_000_000 ||
      (size > 1_000_000 && size / Math.max(1, compressed) > 250)
    )
      throw new Error("archive-limit");
    const local = buffer.readUInt32LE(offset + 42);
    if (
      local + 30 > directoryStart ||
      buffer.readUInt32LE(local) !== 0x04034b50
    )
      throw new Error("archive");
    const data =
      local +
      30 +
      buffer.readUInt16LE(local + 26) +
      buffer.readUInt16LE(local + 28);
    if (data + compressed > directoryStart) throw new Error("archive");
    offset = next;
  }
  if (!wordDocument) throw new Error("not-word");
}

(async () => {
  try {
    if (workerData.format === "docx") checkArchive();
    else checkCompoundDocument();
    const WordExtractor = require(workerData.extractorPath);
    const document = await new WordExtractor().extract(buffer);
    const options = { filterUnicode: false };
    let text = "";
    let truncated = false;
    function append(value, heading = "") {
      if (!value || !value.trim()) return;
      const addition =
        (text ? "\n\n" : "") + (heading ? heading + "\n" : "") + value;
      const remaining = workerData.maxText - text.length;
      if (addition.length > remaining) truncated = true;
      text += addition.slice(0, Math.max(0, remaining));
    }
    append(document.getBody(options));
    const textboxes = document.getTextboxes({
      ...options,
      includeHeadersAndFooters: false,
    });
    if (textboxes && !text.includes(textboxes.trim())) append(textboxes);
    const headerParts = [
      document.getHeaders({ ...options, includeFooters: false }),
      document.getFooters(options),
      document.getTextboxes({ ...options, includeBody: false }),
    ].filter((value) => value && value.trim());
    append(headerParts.join("\n"), "[Hlavičky a päty dokumentu]");
    append(document.getFootnotes(options), "[Poznámky dokumentu]");
    append(document.getEndnotes(options), "[Poznámky dokumentu]");
    append(document.getAnnotations(options), "[Komentáre dokumentu]");
    parentPort.postMessage({ text, truncated });
  } catch (error) {
    parentPort.postMessage({
      error: ["archive-limit", "encrypted", "not-word"].includes(error.message)
        ? error.message
        : "unreadable",
    });
  }
})();
`;

export type ExtractedText = { text: string; truncated: boolean };

function extractionFailure(reason: unknown): BulletinImportError {
  if (reason === "archive-limit")
    return new BulletinImportError(
      "Dokument má neprimerane veľký alebo zložitý komprimovaný obsah. Uložte jednoduchšiu kópiu DOCX alebo vložte text."
    );

  if (reason === "encrypted")
    return new BulletinImportError(
      "Dokument je chránený heslom. Nahrajte kópiu bez hesla alebo vložte text."
    );

  return new BulletinImportError(UNREADABLE_DOCUMENT);
}

export function extractWordText(
  buffer: Buffer,
  format: "doc" | "docx",
  signal?: AbortSignal
): Promise<ExtractedText> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new BulletinImportError("Import bol zrušený.", 499));
      return;
    }
    let worker: Worker;
    try {
      worker = new Worker(EXTRACTION_WORKER, {
        eval: true,
        workerData: {
          bytes: buffer,
          format,
          maxText: BULLETIN_IMPORT_MAX_TEXT,
          extractorPath: require.resolve("word-extractor")
        },
        execArgv: [],
        env: {},
        stdout: true,
        stderr: true,
        resourceLimits: {
          maxOldGenerationSizeMb: 64,
          maxYoungGenerationSizeMb: 16,
          stackSizeMb: 4
        }
      });
    } catch {
      reject(
        new BulletinImportError(
          "Spracovanie dokumentov momentálne nie je dostupné. Skúste vložiť text.",
          503
        )
      );
      return;
    }

    // Drain parser diagnostics without logging private document content or
    // letting an unread worker stream stall extraction.
    worker.stdout?.resume();
    worker.stderr?.resume();

    let settled = false;
    const finish = (error?: Error, result?: ExtractedText) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      void worker.terminate().catch(() => {});
      if (error) reject(error);
      else resolve(result!);
    };
    const timeout = setTimeout(
      () =>
        finish(
          new BulletinImportError(
            "Spracovanie dokumentu trvalo príliš dlho. Skúste ho vo Worde uložiť ako nový súbor DOCX alebo vložte jeho text."
          )
        ),
      EXTRACTION_TIMEOUT_MS
    );
    const abort = () =>
      finish(new BulletinImportError("Import bol zrušený.", 499));
    signal?.addEventListener("abort", abort, { once: true });
    worker.once("message", (message: ExtractedText & { error?: string }) => {
      if (message.error) {
        finish(extractionFailure(message.error));
      } else if (typeof message.text !== "string") {
        finish(new BulletinImportError("Dokument neposkytol čitateľný text."));
      } else
        finish(undefined, {
          text: message.text,
          truncated: Boolean(message.truncated)
        });
    });
    worker.once("error", (error: NodeJS.ErrnoException) =>
      finish(
        new BulletinImportError(
          error.code === "ERR_WORKER_OUT_OF_MEMORY"
            ? "Dokument sa nepodarilo spracovať v dostupnom pamäťovom limite. Skúste jednoduchšiu kópiu DOCX alebo vložte text."
            : UNREADABLE_DOCUMENT
        )
      )
    );
    worker.once("exit", () =>
      finish(
        new BulletinImportError(
          "Spracovanie dokumentu sa prerušilo. Skúste novú kópiu DOCX alebo vložte text."
        )
      )
    );
  });
}

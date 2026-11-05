import "server-only";
import { ContentError } from "./errors";

export const LECTOR_PDF_MAX_BYTES = 3 * 1024 * 1024;

export function validateLectorMonth(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^(20[0-9]{2})-(0[1-9]|1[0-2])$/.test(value)
  )
    throw new ContentError(
      422,
      "Vyberte platný mesiac rozpisu.",
      "INVALID_MONTH"
    );
  return value;
}

export function validateLectorVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new ContentError(
      422,
      "Chýba platná verzia. Obnovte zoznam rozpisov.",
      "INVALID_VERSION"
    );
  return value;
}

export function validateLectorPassword(value: unknown): string {
  if (
    typeof value !== "string" ||
    [...value].length < 8 ||
    [...value].length > 128 ||
    !value.trim()
  )
    throw new ContentError(
      422,
      "Heslo musí mať 8 až 128 znakov.",
      "INVALID_PASSWORD"
    );
  return value;
}

export function validateLectorPdf(bytes: Buffer): Buffer {
  if (!bytes.length || bytes.length > LECTOR_PDF_MAX_BYTES)
    throw new ContentError(413, "PDF môže mať najviac 3 MB.", "PDF_TOO_LARGE");
  if (
    !/^%PDF-(1\.[0-7]|2\.0)[\r\n]/.test(
      bytes.subarray(0, 12).toString("ascii")
    ) ||
    !/%%EOF[\s\0]*$/.test(bytes.subarray(-1024).toString("latin1"))
  )
    throw new ContentError(
      422,
      "Súbor nie je platný PDF dokument. Vyberte PDF export rozpisu.",
      "INVALID_PDF"
    );
  return bytes;
}

/** Bound actual streamed bytes; a missing or forged Content-Length is not trusted. */
export async function readLectorPdf(request: Request): Promise<Buffer> {
  if (
    request.headers
      .get("content-type")
      ?.split(";", 1)[0]
      .trim()
      .toLowerCase() !== "application/pdf"
  )
    throw new ContentError(
      415,
      "Nahrajte súbor vo formáte PDF.",
      "INVALID_PDF_TYPE"
    );
  const reader = request.body?.getReader();
  if (!reader)
    throw new ContentError(400, "Vyberte PDF súbor.", "PDF_REQUIRED");

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LECTOR_PDF_MAX_BYTES) {
        void reader.cancel().catch(() => {});
        throw new ContentError(
          413,
          "PDF môže mať najviac 3 MB.",
          "PDF_TOO_LARGE"
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return validateLectorPdf(Buffer.concat(chunks));
}

export function lectorRequestVersion(request: Request): number {
  const value = request.headers.get("if-match");
  if (!value || !/^"(0|[1-9][0-9]{0,9})"$/.test(value))
    throw new ContentError(
      422,
      "Chýba platná verzia. Obnovte zoznam rozpisov.",
      "INVALID_VERSION"
    );
  return validateLectorVersion(Number(value.slice(1, -1)));
}

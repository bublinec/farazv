import "server-only";
import { BULLETIN_IMPORT_MAX_BYTES } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { getMonday } from "@/lib/calendar";
import { ContentError } from "./errors";
import { isCalendarDate } from "./validation";

/** Authenticate before calling; raw streaming avoids buffering oversized form data. */
export async function readBulletinImportRequest(request: Request) {
  if (request.signal.aborted)
    throw new ContentError(499, "Import bol zrušený.", "IMPORT_CANCELLED");

  const query = new URL(request.url).searchParams;
  const filename = query.get("filename")?.trim();
  const weekStart = query.get("weekStart");

  if (
    !filename ||
    filename.length > 200 ||
    /[\u0000-\u001f]/.test(filename) ||
    !/\.(docx?|txt)$/i.test(filename)
  )
    throw new ContentError(
      400,
      "Vyberte súbor .doc, .docx alebo .txt.",
      "INVALID_FILE"
    );

  if (
    weekStart &&
    (!isCalendarDate(weekStart) || getMonday(weekStart) !== weekStart)
  )
    throw new ContentError(
      400,
      "Vyberte platný pondelok týždňa.",
      "INVALID_WEEK"
    );

  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  if (
    !contentType ||
    ![
      "application/octet-stream",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ].includes(contentType)
  )
    throw new ContentError(
      415,
      "Pošlite dokument ako súbor.",
      "INVALID_FILE_TYPE"
    );

  const tooLarge = () =>
    new ContentError(413, "Dokument môže mať najviac 3 MB.", "BODY_TOO_LARGE");
  if (Number(request.headers.get("content-length")) > BULLETIN_IMPORT_MAX_BYTES)
    throw tooLarge();

  const reader = request.body?.getReader();
  if (!reader) throw new ContentError(400, "Chýba dokument.", "EMPTY_FILE");

  const chunks: Uint8Array[] = [];
  let bytes = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > BULLETIN_IMPORT_MAX_BYTES) {
        // Cancellation must not delay or replace the size-limit response.
        void reader.cancel().catch(() => {});
        throw tooLarge();
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ContentError) throw error;
    if (request.signal.aborted)
      throw new ContentError(499, "Import bol zrušený.", "IMPORT_CANCELLED");

    throw new ContentError(
      400,
      "Dokument sa nepodarilo prijať. Vyberte ho znova.",
      "INVALID_FILE"
    );
  } finally {
    reader.releaseLock();
  }

  if (!bytes) throw new ContentError(400, "Dokument je prázdny.", "EMPTY_FILE");

  return {
    buffer: Buffer.concat(chunks, bytes),
    filename,
    referenceWeekStart: (weekStart || undefined) as CalendarDate | undefined
  };
}

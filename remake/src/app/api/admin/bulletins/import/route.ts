import { adminResponse } from "@/server/admin-http";
import { readBulletinImportRequest } from "@/server/bulletin-import-http";
import {
  importBulletinDocument,
  BulletinImportError
} from "@/server/bulletin-import";
import { ContentError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/** Parsing is private and read-only; saving remains an explicit editor action. */
export function POST(request: Request) {
  return adminResponse(request, async () => {
    const { buffer, filename, referenceWeekStart } =
      await readBulletinImportRequest(request);

    try {
      return await importBulletinDocument(
        buffer,
        filename,
        referenceWeekStart,
        request.signal
      );
    } catch (error) {
      if (error instanceof BulletinImportError)
        throw new ContentError(error.status, error.message, "IMPORT_FAILED");
      throw error;
    }
  });
}

import { adminResponse, readJson } from "@/server/admin-http";
import { restorePageRevision } from "@/server/page-store";
import { publicationResponse } from "@/server/publication-cache";
export const dynamic = "force-dynamic";

/** Restore an earlier page version; a public page updates immediately. */
export function POST(
  request: Request,
  context: { params: Promise<{ id: string; revisionId: string }> }
) {
  return adminResponse(request, async (identity) => {
    const body = await readJson(request);
    const { id, revisionId } = await context.params;
    const record = await restorePageRevision(
      id,
      revisionId,
      body.version as number,
      identity.email
    );

    return record.published ? publicationResponse(record) : record;
  });
}

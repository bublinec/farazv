import { adminResponse, readJson } from "@/server/admin-http";
import { getRecord, updateRecord } from "@/server/content-store";
import { ContentError } from "@/server/errors";
import { publicationResponse } from "@/server/publication-cache";
interface Context {
  params: Promise<{ id: string }>;
}
export const dynamic = "force-dynamic";
export function GET(request: Request, context: Context) {
  return adminResponse(request, async (identity) => {
    const record = await getRecord((await context.params).id);
    if (!record)
      throw new ContentError(404, "Záznam sa nenašiel.", "NOT_FOUND");
    return record;
  });
}
export function PUT(request: Request, context: Context) {
  return adminResponse(request, async (identity) => {
    const body = await readJson(request);
    if (body.document === undefined)
      throw new ContentError(400, "Chýba obsah formulára.", "INVALID_BODY");
    const record = await updateRecord(
      (
        await context.params
      ).id,
      body.version as number,
      body.document,
      "save",
      { actor: identity.email }
    );
    return record.published ? publicationResponse(record) : record;
  });
}

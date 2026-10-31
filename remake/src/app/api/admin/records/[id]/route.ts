import { adminResponse, readJson } from "@/server/admin-http";
import { getRecord, updateRecord } from "@/server/content-store";
import { ContentError } from "@/server/errors";
interface Context {
  params: Promise<{ id: string }>;
}
export const dynamic = "force-dynamic";
export function GET(request: Request, context: Context) {
  return adminResponse(request, async () => {
    const record = await getRecord((await context.params).id);
    if (!record)
      throw new ContentError(404, "Záznam sa nenašiel.", "NOT_FOUND");
    return record;
  });
}
export function PUT(request: Request, context: Context) {
  return adminResponse(request, async () => {
    const body = await readJson(request);
    if (body.document === undefined)
      throw new ContentError(400, "Chýba obsah formulára.", "INVALID_BODY");
    return updateRecord(
      (await context.params).id,
      body.version as number,
      body.document,
      "save"
    );
  });
}

import { publicationResponse } from "@/server/publication-cache";
import { adminResponse, readJson } from "@/server/admin-http";
import { updateRecord } from "@/server/content-store";
export const dynamic = "force-dynamic";
export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return adminResponse(request, async (identity) => {
    const body = await readJson(request);
    return publicationResponse(
      await updateRecord(
        (
          await context.params
        ).id,
        body.version as number,
        body.document,
        "publish",
        { actor: identity.email }
      )
    );
  });
}

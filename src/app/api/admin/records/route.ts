import { adminResponse, readJson } from "@/server/admin-http";
import { createRecord, listRecords } from "@/server/content-store";
import type { RecordKind } from "@/content/documents";
import { isPostRecordKind } from "@/content/posts";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return adminResponse(request, () => {
    const params = new URL(request.url).searchParams;
    return listRecords({
      kind: params.get("kind") || undefined,
      query: params.get("query") || undefined,
      weekStart: params.get("weekStart") || undefined,
      status: params.get("status") || undefined,
      cursor: params.get("cursor") || undefined
    });
  });
}
export function POST(request: Request) {
  return adminResponse(
    request,
    async () => {
      const body = await readJson(request);
      // Older clients may still send a historical category. All new posts share one kind.
      const kind =
        typeof body.kind === "string" && isPostRecordKind(body.kind)
          ? "news"
          : body.kind;
      return createRecord(
        kind as RecordKind,
        typeof body.weekStart === "string" ? body.weekStart : undefined
      );
    },
    201
  );
}

import { adminResponse, readJson } from "@/server/admin-http";
import { createRecord, listRecords } from "@/server/content-store";
import type { RecordKind } from "@/content/documents";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return adminResponse(request, () => {
    const params = new URL(request.url).searchParams;
    return listRecords({
      kind: params.get("kind") || undefined,
      query: params.get("query") || undefined,
      weekStart: params.get("weekStart") || undefined,
      cursor: params.get("cursor") || undefined
    });
  });
}
export function POST(request: Request) {
  return adminResponse(
    request,
    async () => {
      const body = await readJson(request);
      return createRecord(
        body.kind as RecordKind,
        typeof body.weekStart === "string" ? body.weekStart : undefined
      );
    },
    201
  );
}

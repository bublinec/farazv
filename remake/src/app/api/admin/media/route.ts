import { adminResponse } from "@/server/admin-http";
import { listMedia } from "@/server/media-store";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return adminResponse(request, () => {
    const params = new URL(request.url).searchParams;
    return listMedia({
      query: params.get("query") || undefined,
      cursor: params.get("cursor") || undefined
    });
  });
}

import { adminResponse } from "@/server/admin-http";
import { invalidatePublishedContent } from "@/server/publication-cache";
export function POST(request: Request) {
  return adminResponse(request, async () => {
    invalidatePublishedContent();
    return { ok: true };
  });
}

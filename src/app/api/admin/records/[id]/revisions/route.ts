import { adminResponse } from "@/server/admin-http";
import { listPageRevisions } from "@/server/page-store";
export const dynamic = "force-dynamic";

export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return adminResponse(request, async () =>
    listPageRevisions((await context.params).id)
  );
}

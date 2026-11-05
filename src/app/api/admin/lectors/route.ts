import { lectorAdminResponse } from "@/server/lector-http";
import { listAdminLectorSchedules } from "@/server/lector-store";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET(request: Request) {
  return lectorAdminResponse(request, () =>
    listAdminLectorSchedules(
      new URL(request.url).searchParams.get("cursor") ?? undefined
    )
  );
}

import { lectorResponse } from "@/server/lector-http";
import { lockLectorSchedules } from "@/server/lector-access";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function DELETE(request: Request) {
  return lectorResponse(() => lockLectorSchedules(request));
}

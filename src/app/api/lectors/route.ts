import { lectorResponse } from "@/server/lector-http";
import { listPublicLectorSchedules } from "@/server/lector-store";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET(request: Request) {
  return lectorResponse(() => listPublicLectorSchedules(request));
}

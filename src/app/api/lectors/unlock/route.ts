import { lectorResponse, readLectorJson } from "@/server/lector-http";
import { unlockLectorSchedules } from "@/server/lector-access";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function POST(request: Request) {
  return lectorResponse(async () =>
    unlockLectorSchedules((await readLectorJson(request)).password, request)
  );
}

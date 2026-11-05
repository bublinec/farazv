import { administratorResponse } from "@/server/admin-http";
import { readLectorJson } from "@/server/lector-http";
import {
  getLectorPasswordStatus,
  setLectorPassword
} from "@/server/lector-access";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET(request: Request) {
  return administratorResponse(request, () => getLectorPasswordStatus());
}
export function PUT(request: Request) {
  return administratorResponse(request, async (identity) => {
    const body = await readLectorJson(request);
    return setLectorPassword(body.password, body.revision, identity.email);
  });
}

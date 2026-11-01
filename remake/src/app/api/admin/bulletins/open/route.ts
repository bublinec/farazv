import { adminResponse, readJson } from "@/server/admin-http";
import { openBulletinWeek } from "@/server/content-store";

export function POST(request: Request) {
  return adminResponse(request, async () => {
    const body = await readJson(request);
    return openBulletinWeek(body.weekStart);
  });
}

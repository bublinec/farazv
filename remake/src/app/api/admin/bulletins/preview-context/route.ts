import { addDays, getMonday } from "@/lib/calendar";
import type { BulletinPreviewContext } from "@/content/bulletin-preview";
import { adminResponse } from "@/server/admin-http";
import { ContentError } from "@/server/errors";
import {
  getPublishedBulletins,
  getPublishedSettings
} from "@/server/published-store";
import { isCalendarDate } from "@/server/validation";

export function GET(request: Request) {
  return adminResponse(request, async (): Promise<BulletinPreviewContext> => {
    const weekStart = new URL(request.url).searchParams.get("weekStart");
    if (!isCalendarDate(weekStart) || getMonday(weekStart) !== weekStart)
      throw new ContentError(422, "Vyberte platný týždeň.", "INVALID_WEEK");

    const [bulletins, settings] = await Promise.all([
      getPublishedBulletins(addDays(weekStart, -1)),
      getPublishedSettings()
    ]);

    return {
      bulletins: bulletins
        .filter((bulletin) => bulletin.weekStart === addDays(weekStart, -7))
        .map((bulletin) => ({ ...bulletin, published: true as const })),
      regularSchedule: settings?.regularSchedule ?? {},
      ...(settings ? { phone: settings.phone } : {})
    };
  });
}

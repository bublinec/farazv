import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import { getPreviewDate } from "@/lib/preview-date";
import { getDailyLiturgy } from "@/server/liturgy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date") as CalendarDate | null;
  const monday = getMonday(getPreviewDate());

  // Only the displayed weeks are public fetch targets, never an arbitrary URL
  // or an unbounded calendar crawl through this endpoint.
  try {
    if (
      !date ||
      params.getAll("date").length !== 1 ||
      [...params.keys()].some((key) => key !== "date") ||
      addDays(date, 0) !== date ||
      date < addDays(monday, -8) ||
      date > addDays(monday, 13)
    )
      throw new RangeError("Date outside the displayed weeks");
  } catch {
    return Response.json(
      { error: "Vyberte deň z aktuálneho rozpisu." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    return Response.json(await getDailyLiturgy(date), {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch {
    return Response.json(
      { error: "Liturgické čítania sú dočasne nedostupné." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

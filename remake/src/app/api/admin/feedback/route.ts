import { feedbackStatuses, type FeedbackStatus } from "@/content/feedback";
import { administratorResponse } from "@/server/admin-http";
import { countNewFeedback, listFeedback } from "@/server/feedback-store";
import { ContentError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  return administratorResponse(request, async () => {
    const params = new URL(request.url).searchParams;
    if (params.get("summary") === "1")
      return { unreadCount: await countNewFeedback() };
    const status = params.get("status") ?? "new";
    if (!Object.hasOwn(feedbackStatuses, status))
      throw new ContentError(400, "Neplatný stav podnetov.", "INVALID_STATUS");
    return listFeedback(
      status as FeedbackStatus,
      params.get("cursor") ?? undefined
    );
  });
}

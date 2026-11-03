import { administratorResponse, readJson } from "@/server/admin-http";
import {
  changeFeedbackStatus,
  deleteFeedback,
  getFeedback
} from "@/server/feedback-store";
import { ContentError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
interface Context {
  params: Promise<{ id: string }>;
}

export function GET(request: Request, context: Context) {
  return administratorResponse(request, async () => {
    const entry = await getFeedback((await context.params).id);
    if (!entry) throw new ContentError(404, "Podnet sa nenašiel.", "NOT_FOUND");
    return entry;
  });
}

export function PATCH(request: Request, context: Context) {
  return administratorResponse(request, async () => {
    const { action } = await readJson(request);
    if (action !== "read" && action !== "archive" && action !== "restore")
      throw new ContentError(400, "Neplatná zmena podnetu.", "INVALID_ACTION");
    return changeFeedbackStatus((await context.params).id, action);
  });
}

export function DELETE(request: Request, context: Context) {
  return administratorResponse(request, async () => {
    await deleteFeedback((await context.params).id);
    return { ok: true };
  });
}

import { AccessError, assertSameOrigin } from "@/lib/auth-policy";
import { ContentError } from "@/server/errors";
import {
  JsonBodyError,
  PRIVATE_RESPONSE_HEADERS,
  readJsonBody
} from "@/server/http";
import { parseFeedback } from "@/server/feedback-validation";
import { submitFeedback } from "@/server/feedback-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request, new URL(request.url).origin);
    const body = await readJsonBody(request, 48_000);
    if (body && typeof body === "object" && "company" in body && body.company)
      return Response.json({ ok: true }, { headers: PRIVATE_RESPONSE_HEADERS });
    await submitFeedback(parseFeedback(body), request);
    return Response.json(
      { ok: true },
      { status: 201, headers: PRIVATE_RESPONSE_HEADERS }
    );
  } catch (error) {
    if (error instanceof ContentError || error instanceof AccessError)
      return Response.json(
        {
          error: error.message,
          code: error.code,
          ...(error instanceof ContentError && error.field
            ? { field: error.field }
            : {})
        },
        {
          status: error.status,
          headers: {
            ...PRIVATE_RESPONSE_HEADERS,
            ...(error.status === 429 ? { "Retry-After": "3600" } : {})
          }
        }
      );
    if (error instanceof JsonBodyError)
      return Response.json(
        {
          error:
            "Formulár sa nepodarilo spracovať. Skontrolujte dĺžku textu a skúste znova.",
          code: "INVALID_BODY"
        },
        {
          status: error.reason === "too-large" ? 413 : 400,
          headers: PRIVATE_RESPONSE_HEADERS
        }
      );
    // Never log the submitted message, optional email or client address.
    console.error("Feedback submission failed", {
      name: error instanceof Error ? error.name : "UnknownError"
    });
    return Response.json(
      {
        error:
          "Podnet sa nepodarilo odoslať. Váš text zostal vo formulári. Skúste to znova.",
        code: "SERVICE_UNAVAILABLE"
      },
      { status: 503, headers: PRIVATE_RESPONSE_HEADERS }
    );
  }
}

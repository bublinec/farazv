import "server-only";
import {
  assertLectorRequest,
  AccessError,
  type AuthorizedEditor
} from "./auth";
import { assertLectorOrigin } from "./lector-access";
import { ContentError } from "./errors";
import { JsonBodyError, PRIVATE_RESPONSE_HEADERS, readJsonBody } from "./http";

export async function lectorResponse(operation: () => Promise<unknown>) {
  try {
    const result = await operation();
    return result instanceof Response
      ? result
      : Response.json(result, { headers: PRIVATE_RESPONSE_HEADERS });
  } catch (error) {
    if (error instanceof AccessError || error instanceof ContentError)
      return Response.json(
        { error: error.message, code: error.code },
        {
          status: error.status,
          headers: {
            ...PRIVATE_RESPONSE_HEADERS,
            ...(error.status === 429 ? { "Retry-After": "900" } : {})
          }
        }
      );
    console.error("Lector request failed", {
      name: error instanceof Error ? error.name : "UnknownError"
    });
    return Response.json(
      {
        error: "Rozpisy sú dočasne nedostupné. Skúste to znova.",
        code: "LECTOR_UNAVAILABLE"
      },
      { status: 503, headers: PRIVATE_RESPONSE_HEADERS }
    );
  }
}

export function lectorAdminResponse(
  request: Request,
  operation: (identity: AuthorizedEditor) => Promise<unknown>
) {
  return lectorResponse(async () => {
    const identity = await assertLectorRequest(request);
    return operation(identity);
  });
}

export async function readLectorJson(
  request: Request
): Promise<Record<string, unknown>> {
  assertLectorOrigin(request);
  let value: unknown;
  try {
    value = await readJsonBody(request, 2048);
  } catch (error) {
    if (!(error instanceof JsonBodyError)) throw error;
    throw new ContentError(
      error.reason === "too-large" ? 413 : 400,
      "Neplatná požiadavka. Skúste to znova.",
      "INVALID_BODY"
    );
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ContentError(400, "Neplatná požiadavka.", "INVALID_BODY");
  return value as Record<string, unknown>;
}

export function lectorPdfResponse(pdf: Buffer, month: string) {
  return new Response(new Uint8Array(pdf), {
    headers: {
      ...PRIVATE_RESPONSE_HEADERS,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `attachment; filename="rozpis-lektorov-${month}.pdf"`,
      "Content-Length": String(pdf.length)
    }
  });
}

import "server-only";
import {
  AccessError,
  assertEditorRequest,
  assertAdministrator,
  type AuthorizedEditor
} from "./auth";
import { ContentError } from "./errors";

import { JsonBodyError, PRIVATE_RESPONSE_HEADERS, readJsonBody } from "./http";

export async function adminResponse(
  request: Request,
  operation: (identity: AuthorizedEditor) => Promise<unknown>,
  status = 200
) {
  try {
    const identity = await assertEditorRequest(request);
    return Response.json(await operation(identity), {
      status,
      headers: PRIVATE_RESPONSE_HEADERS
    });
  } catch (error) {
    if (error instanceof AccessError || error instanceof ContentError)
      return Response.json(
        {
          error: error.message,
          code: error.code,
          ...(error instanceof ContentError && error.field
            ? { field: error.field }
            : {})
        },
        { status: error.status, headers: PRIVATE_RESPONSE_HEADERS }
      );
    console.error("Admin request failed", {
      name: error instanceof Error ? error.name : "UnknownError"
    });
    return Response.json(
      {
        error:
          "Služba je dočasne nedostupná. Vaše údaje zostali vo formulári. Skúste to znova.",
        code: "SERVICE_UNAVAILABLE"
      },
      { status: 503, headers: PRIVATE_RESPONSE_HEADERS }
    );
  }
}

/** Private administration has a stronger boundary than content editing. */
export function administratorResponse(
  request: Request,
  operation: (identity: AuthorizedEditor) => Promise<unknown>,
  status = 200
) {
  return adminResponse(
    request,
    async (identity) => {
      assertAdministrator(identity);
      return operation(identity);
    },
    status
  );
}
export async function readJson(
  request: Request
): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await readJsonBody(request, 2_100_000);
  } catch (error) {
    if (!(error instanceof JsonBodyError)) throw error;
    switch (error.reason) {
      case "unsupported-type":
        throw new ContentError(
          415,
          "Požiadavka musí obsahovať JSON.",
          "INVALID_BODY"
        );
      case "missing":
        throw new ContentError(400, "Chýba obsah požiadavky.", "INVALID_BODY");
      case "too-large":
        throw new ContentError(413, "Obsah je príliš veľký.", "BODY_TOO_LARGE");
      case "invalid-json":
        throw new ContentError(
          400,
          "Neplatný obsah požiadavky.",
          "INVALID_BODY"
        );
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ContentError(400, "Neplatný obsah požiadavky.", "INVALID_BODY");
  return value as Record<string, unknown>;
}

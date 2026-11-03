import { administratorResponse, readJson } from "@/server/admin-http";
import {
  grantEditorAccess,
  listEditorAccess,
  revokeEditorAccess
} from "@/server/editor-access";
import { ContentError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function readEmail(request: Request) {
  const body = await readJson(request);
  if (Object.keys(body).some((key) => key !== "email"))
    throw new ContentError(
      400,
      "Požiadavka môže obsahovať iba e-mailovú adresu redaktora.",
      "INVALID_BODY"
    );
  return body.email;
}

export function GET(request: Request) {
  return administratorResponse(request, () => listEditorAccess());
}

export function POST(request: Request) {
  return administratorResponse(request, async (administrator) => {
    await grantEditorAccess(await readEmail(request), administrator.email);
    return listEditorAccess();
  });
}

export function DELETE(request: Request) {
  return administratorResponse(request, async (administrator) => {
    await revokeEditorAccess(await readEmail(request), administrator.email);
    return listEditorAccess();
  });
}

import { administratorResponse, readJson } from "@/server/admin-http";
import {
  grantEditorAccess,
  listEditorAccess,
  revokeEditorAccess,
  changeEditorRole
} from "@/server/editor-access";
import { ContentError } from "@/server/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function readAccess(request: Request, keys: string[]) {
  const body = await readJson(request);
  if (Object.keys(body).some((key) => !keys.includes(key)))
    throw new ContentError(
      400,
      "Požiadavka obsahuje nepovolené údaje.",
      "INVALID_BODY"
    );
  return body;
}
export function GET(request: Request) {
  return administratorResponse(request, () => listEditorAccess());
}
export function POST(request: Request) {
  return administratorResponse(request, async (administrator) => {
    const body = await readAccess(request, ["email", "role"]);
    await grantEditorAccess(
      body.email,
      administrator.email,
      body.role ?? "editor"
    );
    return listEditorAccess();
  });
}
export function PATCH(request: Request) {
  return administratorResponse(request, async (administrator) => {
    const body = await readAccess(request, ["email", "role", "previousRole"]);
    await changeEditorRole(
      body.email,
      body.role,
      body.previousRole,
      administrator.email
    );
    return listEditorAccess();
  });
}
export function DELETE(request: Request) {
  return administratorResponse(request, async (administrator) => {
    const body = await readAccess(request, ["email"]);
    await revokeEditorAccess(body.email, administrator.email);
    return listEditorAccess();
  });
}

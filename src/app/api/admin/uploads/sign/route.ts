import { PRIVATE_RESPONSE_HEADERS } from "@/server/http";
import { accessErrorResponse, assertEditorRequest } from "@/server/auth";
import {
  createUploadSignature,
  readUploadBody,
  UploadError,
  uploadErrorResponse
} from "@/server/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const editor = await assertEditorRequest(request);
    const result = createUploadSignature(
      await readUploadBody(request),
      editor.email
    );
    return Response.json(result, {
      headers: PRIVATE_RESPONSE_HEADERS
    });
  } catch (error) {
    return error instanceof UploadError
      ? uploadErrorResponse(error)
      : accessErrorResponse(error);
  }
}

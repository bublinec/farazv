import { PRIVATE_RESPONSE_HEADERS } from "@/server/http";
import { accessErrorResponse, assertEditorRequest } from "@/server/auth";
import { registerMediaAsset } from "@/server/media-store";
import {
  completeUpload,
  readUploadBody,
  UploadError,
  uploadErrorResponse
} from "@/server/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const editor = await assertEditorRequest(request);
    const asset = await completeUpload(
      await readUploadBody(request),
      editor.email
    );
    // Registration is an upsert, so a network retry never creates duplicate media.
    await registerMediaAsset(asset);
    return Response.json(
      { asset },
      {
        headers: PRIVATE_RESPONSE_HEADERS
      }
    );
  } catch (error) {
    return error instanceof UploadError
      ? uploadErrorResponse(error)
      : accessErrorResponse(error);
  }
}

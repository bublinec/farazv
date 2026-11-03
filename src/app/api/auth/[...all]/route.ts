import { PRIVATE_RESPONSE_HEADERS } from "@/server/http";
import { getAuth, accessErrorResponse } from "@/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(request: Request) {
  try {
    const response = await getAuth().handler(request);
    for (const [name, value] of Object.entries(PRIVATE_RESPONSE_HEADERS))
      response.headers.set(name, value);
    return response;
  } catch (error) {
    return accessErrorResponse(error);
  }
}

export const GET = handle;
export const POST = handle;

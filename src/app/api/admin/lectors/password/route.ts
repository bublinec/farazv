import { PRIVATE_RESPONSE_HEADERS } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Retire the old CMS URL explicitly; it must never fall through to a month route.
export function GET() {
  return new Response(null, { status: 404, headers: PRIVATE_RESPONSE_HEADERS });
}

export const PUT = GET;

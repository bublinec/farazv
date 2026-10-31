import { NextResponse } from "next/server";
import { DESIGN_COOKIE, designReturnPath } from "@/content/design";
import { PRIVATE_RESPONSE_HEADERS } from "@/server/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ version: string }> }
) {
  const { version } = await context.params;
  if (
    process.env.VERCEL_ENV === "production" ||
    !["v1", "v2"].includes(version)
  )
    return new Response(null, {
      status: 404,
      headers: PRIVATE_RESPONSE_HEADERS
    });

  const url = new URL(request.url);
  // Relative redirects preserve the browser's host behind local/proxy bindings.
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: designReturnPath(url.searchParams.get("returnTo")) }
  });
  response.cookies.set(DESIGN_COOKIE, version === "v2" ? "parish" : "current", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 60 * 60 * 24 * 7
  });
  for (const [name, value] of Object.entries(PRIVATE_RESPONSE_HEADERS))
    response.headers.set(name, value);
  return response;
}

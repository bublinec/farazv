import { NextResponse, type NextRequest } from "next/server";
import { canonicalAdminDestination } from "@/lib/admin-origin";

export function proxy(request: NextRequest) {
  const destination = canonicalAdminDestination(request.url, request.method, {
    VERCEL: process.env.VERCEL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
  });
  if (!destination) return NextResponse.next();

  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: "/admin/:path*" };

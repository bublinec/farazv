"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";

function isPrivatePath(pathname: string) {
  return /^\/(?:admin|api)(?:\/|$)/.test(pathname);
}

function publicPageView(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (isPrivatePath(url.pathname)) return null;

    // Page counts need only the public path, never query values or fragments.
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return null;
  }
}

export function VisitorAnalytics() {
  const pathname = usePathname();
  if (!pathname || isPrivatePath(pathname)) return null;

  return <Analytics beforeSend={publicPageView} />;
}

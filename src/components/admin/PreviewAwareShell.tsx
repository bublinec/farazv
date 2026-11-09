"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Full-page previews show the public site chrome instead of the admin shell. */
export function PreviewAwareShell({
  preview,
  children
}: {
  preview: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return pathname.startsWith("/admin/nahlad/") ? preview : children;
}

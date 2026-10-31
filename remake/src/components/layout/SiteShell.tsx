"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { DateRefresh } from "./DateRefresh";
import type { PublicDesign } from "@/content/design";
import { DesignReviewBar } from "@/components/design/DesignReviewBar";
import theme from "@/components/design/ParishTheme.module.css";

export function SiteShell({
  children,
  footer,
  previewLabel,
  design = "current",
  fixtureMode = false
}: {
  children: ReactNode;
  footer: ReactNode;
  previewLabel?: string;
  design?: PublicDesign;
  fixtureMode?: boolean;
}) {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return children;

  const content = (
    <>
      {design === "parish" ? (
        <DesignReviewBar fixtureMode={fixtureMode} />
      ) : null}
      <Header
        previewLabel={design === "parish" ? undefined : previewLabel}
        design={design}
      />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      {footer}
      <DateRefresh />
    </>
  );

  return design === "parish" ? (
    <div className={theme.parish} data-public-design="parish">
      {content}
    </div>
  ) : (
    content
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import type { NavigationItem } from "@/content/navigation";
import { Header } from "./Header";
import { DateRefresh } from "./DateRefresh";
import theme from "./ParishTheme.module.css";

export function SiteShell({
  children,
  footer,
  navigation
}: {
  children: ReactNode;
  footer: ReactNode;
  navigation?: NavigationItem[];
}) {
  const pathname = usePathname();
  const shell = useRef<HTMLDivElement>(null);
  const masthead = useRef<HTMLDivElement>(null);
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    const element = masthead.current;
    if (!element || isAdmin) return;

    const updateHeight = () => {
      shell.current?.style.setProperty(
        "--site-header-height",
        `${element.getBoundingClientRect().height}px`
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isAdmin]);

  if (isAdmin) return children;

  return (
    <div ref={shell} className={theme.parish}>
      <div ref={masthead}>
        <Header items={navigation} />
      </div>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      {footer}
      <DateRefresh />
    </div>
  );
}

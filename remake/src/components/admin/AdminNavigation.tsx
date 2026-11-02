"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Admin.module.css";
import { useActiveAdminSection } from "./AdminSectionContext";
import { FeedbackUnreadBadge } from "./FeedbackUnreadBadge";

const links = [
  { id: "bulletin", label: "Oznamy", href: "/admin" },
  { id: "posts", label: "Výveska", href: "/admin?section=posts" },
  { id: "article", label: "Naše spoločenstvo", href: "/admin?section=article" },
  { id: "settings", label: "Nastavenia", href: "/admin/nastavenia" },
  { id: "feedback", label: "Podnety", href: "/admin/podnety" },
  { id: "access", label: "Prístupy", href: "/admin/pristupy" }
];

export function AdminNavigation({
  canManageAccess
}: {
  canManageAccess: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const recordSection = useActiveAdminSection();
  let section: string | null = null;
  if (pathname.startsWith("/admin/nastavenia")) section = "settings";
  else if (pathname.startsWith("/admin/podnety")) section = "feedback";
  else if (pathname.startsWith("/admin/pristupy")) section = "access";
  else if (pathname.startsWith("/admin/records/")) section = recordSection;
  else if (pathname === "/admin") {
    const selected = params.get("section");
    section =
      selected === "posts" || selected === "article" ? selected : "bulletin";
  }

  return (
    <nav className={styles.topnav} aria-label="Správa farnosti">
      {links
        .filter(
          (link) => !["access", "feedback"].includes(link.id) || canManageAccess
        )
        .map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={section === link.id ? "page" : undefined}
          >
            {link.label}
            {link.id === "feedback" ? <FeedbackUnreadBadge /> : null}
          </Link>
        ))}
      {canManageAccess ? (
        <a
          href="https://vercel.com/bublinecs-projects/farazv/analytics"
          target="_blank"
          rel="noopener noreferrer"
        >
          Štatistiky ↗
        </a>
      ) : null}
    </nav>
  );
}

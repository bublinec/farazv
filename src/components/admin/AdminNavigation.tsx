"use client";

import Link from "next/link";
import type { EditorRole } from "@/content/editor-access";
import { canManageLectors } from "@/lib/auth-policy";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Admin.module.css";
import { useActiveAdminSection } from "./AdminSectionContext";
import { FeedbackUnreadBadge } from "./FeedbackUnreadBadge";

const links = [
  { id: "bulletin", label: "Oznamy", href: "/admin" },
  { id: "posts", label: "Výveska", href: "/admin?section=posts" },
  { id: "article", label: "Naše spoločenstvo", href: "/admin?section=article" },
  { id: "lectors", label: "Rozpisy lektorov", href: "/admin/lektori" },
  { id: "settings", label: "Nastavenia", href: "/admin/nastavenia" },
  { id: "feedback", label: "Podnety", href: "/admin/podnety" },
  { id: "access", label: "Prístupy", href: "/admin/pristupy" }
];

export function AdminNavigation({
  canManageAccess,
  role
}: {
  canManageAccess: boolean;
  role: EditorRole;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const recordSection = useActiveAdminSection();
  let section: string | null = null;
  if (pathname.startsWith("/admin/lektori")) section = "lectors";
  else if (pathname.startsWith("/admin/nastavenia")) section = "settings";
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
        .filter((link) =>
          role === "lektorka"
            ? link.id === "lectors"
            : link.id === "lectors"
            ? canManageLectors(role)
            : !["access", "feedback"].includes(link.id) || canManageAccess
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
    </nav>
  );
}

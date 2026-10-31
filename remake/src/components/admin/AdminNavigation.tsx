"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Admin.module.css";

const links = [
  { id: "bulletin", label: "Oznamy", href: "/admin" },
  { id: "posts", label: "Príspevky", href: "/admin?section=posts" },
  { id: "article", label: "Články", href: "/admin?section=article" },
  { id: "settings", label: "Nastavenia", href: "/admin/nastavenia" },
  { id: "access", label: "Prístupy", href: "/admin/pristupy" }
];

export function AdminNavigation({
  canManageAccess
}: {
  canManageAccess: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  let section: string | null = null;
  if (pathname.startsWith("/admin/nastavenia")) section = "settings";
  else if (pathname.startsWith("/admin/pristupy")) section = "access";
  else if (pathname === "/admin") {
    const selected = params.get("section");
    section =
      selected === "posts" || selected === "article" ? selected : "bulletin";
  }

  return (
    <nav className={styles.topnav} aria-label="Správa farnosti">
      {links
        .filter((link) => link.id !== "access" || canManageAccess)
        .map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={section === link.id ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { EditorRole } from "@/content/editor-access";
import { canManageLectors } from "@/lib/auth-policy";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Admin.module.css";
import { useActiveAdminSection } from "./AdminSectionContext";
import { FeedbackUnreadBadge } from "./FeedbackUnreadBadge";
import { SignOut } from "./SignOut";

const links = [
  { id: "bulletin", label: "Oznamy", href: "/admin" },
  { id: "posts", label: "Výveska", href: "/admin?section=posts" },
  { id: "article", label: "Naše spoločenstvo", href: "/admin?section=article" },
  { id: "pages", label: "Stránky", href: "/admin/stranky" },
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
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const location = `${pathname}?${params}`;

  // Close the phone menu whenever the editor moves to another section.
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Escape closes the open menu from anywhere and returns to its button.
  useEffect(() => {
    if (!open) return;

    function close(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    }

    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const recordSection = useActiveAdminSection();
  let section: string | null = null;
  if (pathname.startsWith("/admin/lektori")) section = "lectors";
  else if (pathname.startsWith("/admin/nastavenia")) section = "settings";
  else if (pathname.startsWith("/admin/stranky")) section = "pages";
  else if (pathname.startsWith("/admin/podnety")) section = "feedback";
  else if (pathname.startsWith("/admin/pristupy")) section = "access";
  else if (pathname.startsWith("/admin/records/")) section = recordSection;
  else if (pathname === "/admin") {
    const selected = params.get("section");
    section =
      selected === "posts" || selected === "article" ? selected : "bulletin";
  }

  const visibleLinks = links.filter((link) =>
    role === "lektorka"
      ? link.id === "lectors"
      : link.id === "lectors"
      ? canManageLectors(role)
      : !["access", "feedback"].includes(link.id) || canManageAccess
  );
  const current = visibleLinks.find((link) => link.id === section);

  return (
    <>
      {/* Phones show one menu button; wide screens keep the full row of links. */}
      <button
        ref={toggle}
        type="button"
        className={styles.menuToggle}
        aria-expanded={open}
        aria-controls="admin-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        <span>
          Menu
          {current ? (
            <small className={styles.menuCurrent}> · {current.label}</small>
          ) : null}
        </span>
      </button>
      <nav
        id="admin-menu"
        className={`${styles.topnav} ${open ? styles.menuOpen : ""}`}
        aria-label="Správa farnosti"
      >
        {visibleLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={section === link.id ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
            {link.id === "feedback" ? <FeedbackUnreadBadge /> : null}
          </Link>
        ))}
        <div className={styles.menuExtras}>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Web ↗
          </a>
          <SignOut />
        </div>
      </nav>
    </>
  );
}

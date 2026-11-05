import Link from "next/link";
import type { EditorRole } from "@/content/editor-access";
import { ParishLogo } from "@/components/layout/ParishLogo";
import styles from "./Admin.module.css";

import { SignOut } from "./SignOut";
import { AdminNavigation } from "./AdminNavigation";
import { AdminSectionProvider } from "./AdminSectionContext";
export function AdminShell({
  children,
  authenticated = false,
  canManageAccess = false,
  role = "editor"
}: {
  children: React.ReactNode;
  authenticated?: boolean;
  canManageAccess?: boolean;
  role?: EditorRole;
}) {
  return (
    <AdminSectionProvider>
      <div
        className={`${styles.shell} ${
          role === "lektorka" ? styles.lectorShell : ""
        }`}
      >
        <header className={styles.topbar}>
          <Link
            className={styles.brand}
            href={role === "lektorka" ? "/admin/lektori" : "/admin"}
          >
            <ParishLogo />
          </Link>
          {authenticated ? (
            <AdminNavigation canManageAccess={canManageAccess} role={role} />
          ) : null}
          <div className={styles.utilities}>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Web ↗
            </a>
            {authenticated ? <SignOut /> : null}
          </div>
        </header>
        <main id="main" tabIndex={-1} className={styles.content}>
          {children}
        </main>
      </div>
    </AdminSectionProvider>
  );
}

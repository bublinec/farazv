import Link from "next/link";
import { ParishLogo } from "@/components/layout/ParishLogo";
import styles from "./Admin.module.css";

import { SignOut } from "./SignOut";
import { AdminNavigation } from "./AdminNavigation";
import { AdminSectionProvider } from "./AdminSectionContext";
export function AdminShell({
  children,
  authenticated = false,
  canManageAccess = false
}: {
  children: React.ReactNode;
  authenticated?: boolean;
  canManageAccess?: boolean;
}) {
  return (
    <AdminSectionProvider>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/admin">
            <ParishLogo />
          </Link>
          {authenticated ? (
            <AdminNavigation canManageAccess={canManageAccess} />
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

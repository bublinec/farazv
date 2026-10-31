import Link from "next/link";
import { siteConfig } from "@/content/site";
import { ChurchMark } from "@/components/layout/ChurchMark";
import styles from "./Admin.module.css";

import { SignOut } from "./SignOut";
import { AdminNavigation } from "./AdminNavigation";
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
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link
          className={styles.brand}
          href="/admin"
          aria-label={`${siteConfig.name} — Admin`}
        >
          <ChurchMark className={styles.brandMark} />
          <span>
            <strong>{siteConfig.name}</strong>
            <small>{siteConfig.city}</small>
          </span>
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
  );
}

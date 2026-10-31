import Link from "next/link";
import styles from "./Admin.module.css";

import { SignOut } from "./SignOut";
export function AdminShell({
  children,
  authenticated = false
}: {
  children: React.ReactNode;
  authenticated?: boolean;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/admin">
          Správa farnosti<small>Farazv · Redakcia</small>
        </Link>
        <nav className={styles.topnav} aria-label="Navigácia redakcie">
          <Link href="/admin">Obsah</Link>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Otvoriť web ↗
          </a>
          {authenticated ? <SignOut /> : null}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.content}>
        {children}
      </main>
    </div>
  );
}

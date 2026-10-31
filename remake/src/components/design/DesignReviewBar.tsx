"use client";

import { usePathname } from "next/navigation";
import styles from "./DesignReviewBar.module.css";

export function DesignReviewBar({
  fixtureMode = false
}: {
  fixtureMode?: boolean;
}) {
  const pathname = usePathname();
  return (
    <aside className={styles.bar} aria-label="Porovnanie návrhov">
      <span>
        {fixtureMode ? "Ukážkový rozpis" : "Pracovný návrh"}{" "}
        <b>02 · Naša farnosť</b>
      </span>
      <div>
        <a href={`/design/v1?returnTo=${encodeURIComponent(pathname)}`}>
          Porovnať s návrhom 01
        </a>
        <a href="/design">O návrhoch</a>
      </div>
    </aside>
  );
}

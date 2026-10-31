"use client";

import Link from "next/link";
import { useState } from "react";
import { addDays, getLocalDate, getMonday } from "@/lib/calendar";
import type { CalendarDate } from "@/content/types";
import { BulletinImport } from "./BulletinImport";
import { useBulletinNavigation } from "./hooks/useBulletinNavigation";
import styles from "./Admin.module.css";

export function BulletinDashboard() {
  const [weekStart, setWeekStart] = useState(() =>
    getMonday(addDays(getLocalDate(), 1))
  );
  const [error, setError] = useState("");
  const { openWeek, opening } = useBulletinNavigation();

  async function openManually() {
    setError("");
    try {
      if (getMonday(weekStart) !== weekStart) {
        setError("Vyberte pondelok týždňa oznamov.");
        return;
      }
      await openWeek(weekStart);
    } catch (cause) {
      setError(
        cause instanceof RangeError
          ? "Vyberte platný pondelok týždňa oznamov."
          : cause instanceof Error
          ? cause.message
          : "Týždeň sa nepodarilo otvoriť."
      );
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.heading}>
        <h1>Farské oznamy</h1>
        <Link href="/admin?section=archive" className={styles.quietLink}>
          Archív oznamov ↗
        </Link>
      </div>
      <BulletinImport
        mode="start"
        weekStart={weekStart}
        disabled={opening}
        onTargetWeek={(week, result) => openWeek(week, result, true)}
      />
      {opening ? (
        <p className={styles.status} role="status">
          Otváram formulár…
        </p>
      ) : null}
      <details className={styles.disclosure}>
        <summary>Vyplniť oznamy ručne</summary>
        <div className={`${styles.panel} ${styles.manualWeek}`}>
          <label className={styles.field}>
            Týždeň od pondelka
            <input
              type="date"
              value={weekStart}
              disabled={opening}
              onChange={(event) =>
                setWeekStart(event.target.value as CalendarDate)
              }
            />
          </label>
          <button
            className={styles.secondary}
            type="button"
            disabled={opening}
            onClick={() => void openManually()}
          >
            Otvoriť formulár
          </button>
        </div>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </details>
    </div>
  );
}

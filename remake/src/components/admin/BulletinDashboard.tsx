"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays, getLocalDate, getMonday } from "@/lib/calendar";
import type { ContentRecordFor } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { BulletinImport } from "./BulletinImport";
import { loadEditableBulletin } from "./bulletin-records";
import { hasUnpublishedChanges } from "./record-state";
import { formatRecordDate } from "./admin-format";
import { useBulletinNavigation } from "./hooks/useBulletinNavigation";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

export function BulletinDashboard() {
  const [today] = useState(getLocalDate);
  const currentWeek = getMonday(addDays(today, 1));
  const nextWeek = addDays(currentWeek, 7);
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [weeks, setWeeks] = useState<
    (ContentRecordFor<"bulletin"> | undefined)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [technicalFailure, setTechnicalFailure] = useState(false);
  const [parsing, setParsing] = useState(false);
  const { openWeek, opening } = useBulletinNavigation();

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      loadEditableBulletin(currentWeek, controller.signal),
      loadEditableBulletin(nextWeek, controller.signal)
    ])
      .then((found) => {
        if (!controller.signal.aborted) setWeeks(found);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "Prehľad sa nepodarilo načítať."
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [currentWeek, nextWeek]);

  async function openManually(target = weekStart) {
    setError("");
    setTechnicalFailure(false);
    try {
      if (getMonday(target) !== target) {
        setError("Vyberte pondelok týždňa oznamov.");
        return;
      }
      await openWeek(target);
    } catch (cause) {
      setTechnicalFailure(!(cause instanceof RangeError));
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
          Archív oznamov
        </Link>
      </div>
      <BulletinImport
        mode="start"
        weekStart={weekStart}
        disabled={opening}
        onBusyChange={setParsing}
        onTargetWeek={(week, result) => openWeek(week, result)}
      />
      {opening ? (
        <p className={styles.status} role="status">
          Otváram oznamy…
        </p>
      ) : null}
      <div className={weekly.weekCards} aria-busy={loading}>
        {[currentWeek, nextWeek].map((week, index) => {
          const record = weeks[index];
          const scheduled = record?.published && addDays(week, -1) > today;
          const hasChanges = record && hasUnpublishedChanges(record);
          return (
            <section className={weekly.weekCard} key={week}>
              <div>
                <h2>{index === 0 ? "Aktuálne oznamy" : "Ďalší týždeň"}</h2>
                <p>
                  {formatRecordDate(addDays(week, -1))} –{" "}
                  {formatRecordDate(addDays(week, 6))}
                </p>
                <span className={styles.hint}>
                  {loading
                    ? "Načítavam…"
                    : loadError
                    ? "Stav nedostupný"
                    : record?.published
                    ? scheduled
                      ? `Naplánované od ${formatRecordDate(addDays(week, -1))}`
                      : "Zverejnené"
                    : record
                    ? "Koncept"
                    : "Zatiaľ nevytvorené"}
                  {hasChanges ? " · nezverejnené zmeny" : ""}
                </span>
              </div>
              {record ? (
                <Link
                  href={`/admin/records/${encodeURIComponent(record.id)}`}
                  className={styles.secondary}
                >
                  Upraviť
                </Link>
              ) : (
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={loading || opening || parsing}
                  onClick={() => void openManually(week)}
                >
                  Otvoriť
                </button>
              )}
            </section>
          );
        })}
      </div>
      {loadError ? (
        <p className={styles.error} role="alert">
          {loadError}
          <TechnicalSupport />
        </p>
      ) : null}
      <details className={styles.disclosure}>
        <summary>Vybrať iný týždeň alebo vyplniť ručne</summary>
        <div className={`${styles.panel} ${styles.manualWeek}`}>
          <label className={styles.field}>
            Týždeň od pondelka
            <input
              type="date"
              value={weekStart}
              disabled={opening || parsing}
              onChange={(event) =>
                setWeekStart(event.target.value as CalendarDate)
              }
            />
          </label>
          <button
            className={styles.secondary}
            type="button"
            disabled={opening || parsing}
            onClick={() => void openManually()}
          >
            Otvoriť oznamy
          </button>
        </div>
      </details>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
          {technicalFailure ? <TechnicalSupport /> : null}
        </p>
      ) : null}
    </div>
  );
}

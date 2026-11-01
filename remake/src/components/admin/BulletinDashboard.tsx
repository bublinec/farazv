"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import {
  addDays,
  getLocalDate,
  getMonday,
  getNextLocalMidnight
} from "@/lib/calendar";
import type { ContentRecordFor } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { loadEditableBulletin } from "./bulletin-records";
import { hasUnpublishedChanges } from "./record-state";
import { formatRecordDate } from "./admin-format";
import { useBulletinNavigation } from "./hooks/useBulletinNavigation";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

export function BulletinDashboard() {
  const [today, setToday] = useState(getLocalDate);
  const currentWeek = getMonday(today);
  const nextWeek = addDays(currentWeek, 7);
  const [weeks, setWeeks] = useState<
    (ContentRecordFor<"bulletin"> | undefined)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const { openWeek, opening } = useBulletinNavigation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function refreshDate() {
      clearTimeout(timer);
      setToday(getLocalDate());
      timer = setTimeout(
        refreshDate,
        getNextLocalMidnight().getTime() - Date.now() + 150
      );
    }

    refreshDate();
    window.addEventListener("focus", refreshDate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refreshDate);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    setWeeks([]);
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

  async function openWeekEditor(weekStart: CalendarDate) {
    setError("");
    try {
      await openWeek(weekStart);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Týždeň sa nepodarilo otvoriť."
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
      {opening ? (
        <p className={styles.status} role="status">
          Otváram oznamy…
        </p>
      ) : null}
      <div className={weekly.weekCards} aria-busy={loading}>
        {[currentWeek, nextWeek].map((week, index) => {
          const found = weeks[index];
          const record = found?.draft.weekStart === week ? found : undefined;
          const scheduled = record?.published && week > today;
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
                      ? `Naplánované od ${formatRecordDate(week)}`
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
                  disabled={loading || opening}
                  onClick={() => void openWeekEditor(week)}
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
      {error ? (
        <p className={styles.error} role="alert">
          {error}
          <TechnicalSupport />
        </p>
      ) : null}
    </div>
  );
}

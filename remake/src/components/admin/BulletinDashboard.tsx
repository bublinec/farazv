"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import {
  addDays,
  getBulletinWeekStart,
  getLocalDate,
  getMonday,
  getNextParishRefresh
} from "@/lib/calendar";
import type { ContentRecordFor } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { loadEditableBulletin } from "./bulletin-records";
import { formatBulletinStart, hasUnpublishedChanges } from "./record-state";
import { formatRecordDate } from "./admin-format";
import { useBulletinNavigation } from "./hooks/useBulletinNavigation";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

type Preparation = {
  label: string;
  tone: "pending" | "saved" | "ready";
  filled: boolean;
};

/** Dashboard records have been saved; merely opening an empty week is not preparation. */
function bulletinPreparation(
  record: ContentRecordFor<"bulletin"> | undefined
): Preparation {
  const document = record?.draft;
  const hasAnnouncements = document?.announcements.some((text) => text.trim());
  const hasSchedule =
    document?.days.length === 7 &&
    document.days.every((day) =>
      day.status === "no-masses"
        ? day.masses.length === 0
        : day.status === "scheduled" &&
          day.masses.length > 0 &&
          day.masses.every((mass) => mass.time.trim())
    );

  if (!record || !hasAnnouncements || !hasSchedule)
    return {
      label: "Treba doplniť a uložiť",
      tone: "pending",
      filled: false
    };

  if (!record.published)
    return { label: "Uložené · nezverejnené", tone: "saved", filled: true };

  if (hasUnpublishedChanges(record))
    return {
      label: "Uložené nezverejnené zmeny",
      tone: "pending",
      filled: true
    };

  return { label: "Pripravené", tone: "ready", filled: true };
}

export function BulletinDashboard() {
  const [now, setNow] = useState(() => new Date());
  // Editors keep the ending week through Sunday; public visibility switches earlier.
  const currentWeek = getMonday(getLocalDate(now));
  const nextWeek = addDays(currentWeek, 7);
  const publicWeek = getBulletinWeekStart(now);
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
      setNow(new Date());
      timer = setTimeout(
        refreshDate,
        getNextParishRefresh().getTime() - Date.now() + 150
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
          const preparation = bulletinPreparation(record);
          const showPreparation = !loading && !loadError;
          const scheduled = week > publicWeek;
          return (
            <section
              className={weekly.weekCard}
              data-pending={showPreparation && preparation.tone === "pending"}
              key={week}
            >
              <div>
                <h2>{index === 0 ? "Aktuálne oznamy" : "Ďalší týždeň"}</h2>
                <p>
                  {formatRecordDate(addDays(week, -1))} –{" "}
                  {formatRecordDate(addDays(week, 6))}
                </p>
                <span
                  className={weekly.weekStatus}
                  data-tone={showPreparation ? preparation.tone : undefined}
                >
                  {loading
                    ? "Načítavam…"
                    : loadError
                    ? "Stav nedostupný"
                    : preparation.label}
                </span>
                {showPreparation && record?.published ? (
                  <small className={weekly.weekPublication}>
                    {!preparation.filled
                      ? "Zverejnenie je zapnuté"
                      : scheduled
                      ? `Zverejnenie od ${formatBulletinStart(week)}`
                      : "Zverejnené"}
                  </small>
                ) : null}
              </div>
              {record ? (
                <Link
                  href={`/admin/records/${encodeURIComponent(record.id)}`}
                  className={styles.secondary}
                >
                  {preparation.filled ? "Upraviť" : "Doplniť"}
                </Link>
              ) : (
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={loading || opening}
                  onClick={() => void openWeekEditor(week)}
                >
                  Vyplniť
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

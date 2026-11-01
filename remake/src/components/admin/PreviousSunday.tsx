import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContentRecordFor } from "@/content/documents";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { sameMasses } from "@/lib/mass";
import { addDays } from "@/lib/calendar";
import { loadEditableBulletin } from "./bulletin-records";
import { formatRecordDate } from "./admin-format";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

function summarize(day: ScheduleDay) {
  const times =
    day.status === "no-masses"
      ? "Bez svätej omše"
      : day.status === "unpublished"
      ? "Pravidelné časy"
      : day.masses.map((mass) => mass.time).join(" · ") ||
        "Rozpis nie je vyplnený";
  return [times, day.liturgy].filter(Boolean).join(" · ");
}

/** Reference the public snapshot explicitly; an unpublished draft is never presented as live. */
export function PreviousSunday({
  weekStart,
  importedDay,
  onEditImportedSunday,
  disabled = false
}: {
  weekStart: CalendarDate;
  importedDay?: ScheduleDay;
  onEditImportedSunday?: () => void;
  disabled?: boolean;
}) {
  const [record, setRecord] = useState<ContentRecordFor<"bulletin"> | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const previousMonday = addDays(weekStart, -7);
  const sunday = addDays(weekStart, -1);

  useEffect(() => {
    let controller = new AbortController();
    setRecord(null);

    async function load() {
      controller.abort();
      controller = new AbortController();
      const request = controller;
      setError("");
      setLoading(true);
      try {
        const found = await loadEditableBulletin(
          previousMonday,
          request.signal
        );
        if (!request.signal.aborted) setRecord(found ?? null);
      } catch (cause) {
        if (!request.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Referenčný rozpis sa nepodarilo načítať."
          );
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }
    function refresh() {
      void load();
    }
    void load();
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("focus", refresh);
    };
  }, [previousMonday]);

  const publishedDay = record?.published?.days.find(
    (day) => day.date === sunday
  );
  const published =
    publishedDay?.status === "unpublished" ? undefined : publishedDay;
  const draft = record?.draft.days.find((day) => day.date === sunday);
  const draftChanged =
    draft &&
    (draft.status !== publishedDay?.status ||
      (draft.liturgy ?? "") !== (publishedDay?.liturgy ?? "") ||
      !sameMasses(draft.masses, publishedDay?.masses));

  const importedDiffers = Boolean(
    importedDay &&
      ((importedDay.liturgy && importedDay.liturgy !== published?.liturgy) ||
        ((importedDay.masses.length || importedDay.status === "no-masses") &&
          (importedDay.status !== published?.status ||
            !sameMasses(importedDay.masses, published?.masses))))
  );

  return (
    <aside className={weekly.previousSunday} aria-label="Úvodná nedeľa rozpisu">
      <div>
        <strong>Nedeľa {formatRecordDate(sunday)}</strong>
        <p>
          {loading
            ? "Načítavam rozpis…"
            : error
            ? error
            : published
            ? summarize(published)
            : "Použijú sa pravidelné časy, ak sú nastavené."}
        </p>
      </div>
      {error ? <TechnicalSupport /> : null}
      {importedDiffers && onEditImportedSunday ? (
        <button
          type="button"
          className={styles.secondary}
          disabled={disabled || loading}
          onClick={onEditImportedSunday}
        >
          Upraviť nedeľu v novom okne ↗
        </button>
      ) : record ? (
        <Link
          href={`/admin/records/${encodeURIComponent(record.id)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Upraviť nedeľu v novom okne ↗
        </Link>
      ) : null}
      {importedDiffers ? (
        <p className={weekly.warnings} role="alert">
          Dokument uvádza iný rozpis tejto nedele. Patrí do predchádzajúceho
          týždňa; tu sa nemení.
        </p>
      ) : null}
      {draftChanged ? (
        <details>
          <summary>Predchádzajúci týždeň má nezverejnené zmeny</summary>
          <p>
            Koncept: {summarize(draft)}. Na webe sa použije zverejnená verzia.
          </p>
        </details>
      ) : null}
    </aside>
  );
}

import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import { formatRecordDate } from "./admin-format";
import admin from "./Admin.module.css";
import styles from "./BulletinImport.module.css";

export type BulletinImportTargetWeek = (
  weekStart: CalendarDate,
  result: BulletinImportResult
) => void | Promise<void>;

/** A compact import receipt; the form below is the single editable review. */
export function BulletinImportPreview({
  result,
  weekStart,
  disabled,
  onApply,
  onTargetWeek,
  pending = false
}: {
  result: BulletinImportResult;
  weekStart: CalendarDate;
  disabled: boolean;
  onApply: (result: BulletinImportResult) => void;
  onTargetWeek?: BulletinImportTargetWeek;
  pending?: boolean;
}) {
  const mismatch = Boolean(
    result.suggestedWeekStart && result.suggestedWeekStart !== weekStart
  );
  const weekEnd = addDays(weekStart, 6);
  const daysInWeek = result.days.filter(
    (day) =>
      day.date >= weekStart &&
      day.date <= weekEnd &&
      (day.liturgy || day.masses.length || day.status === "no-masses")
  );
  const hasApplicableContent = Boolean(
    daysInWeek.length ||
      (!mismatch && (result.announcements.length || result.donations.length))
  );
  const massCount = daysInWeek.reduce(
    (count, day) => count + day.masses.length,
    0
  );
  const warnings = result.warnings.filter((warning) => !warning.date);
  const targetWeeks = [
    ...new Set([
      ...(result.suggestedWeekStart ? [result.suggestedWeekStart] : []),
      ...result.days
        .filter(
          (day) => day.date < addDays(weekStart, -1) || day.date > weekEnd
        )
        .map((day) => getMonday(day.date))
    ])
  ]
    .filter((week) => week !== weekStart)
    .sort();

  return (
    <div className={styles.preview}>
      <div className={styles.resultHeading} role="status">
        <strong>
          {!hasApplicableContent
            ? "Dokument načítaný"
            : pending
            ? "Dokument čaká na vloženie"
            : "Dokument je vo formulári"}
        </strong>
        <span className={admin.hint}>{result.filename}</span>
      </div>
      <p className={admin.hint}>
        {daysInWeek.length} dní · {massCount} omší ·{" "}
        {result.announcements.length} oznamov
        {result.donations.length
          ? ` · ${result.donations.length} darov a zbierok`
          : ""}
      </p>

      {warnings.length ? (
        <ul className={styles.warnings} role="alert">
          {warnings.map((warning, index) => (
            <li key={`${warning.code}-${index}`}>{warning.message}</li>
          ))}
        </ul>
      ) : null}
      {mismatch ? (
        <p className={admin.notice}>
          Dokument patrí k týždňu od{" "}
          {formatRecordDate(result.suggestedWeekStart!)}. Do tohto týždňa možno
          vložiť iba zodpovedajúce dni; oznamy a dary zostanú zachované.
        </p>
      ) : null}
      {!hasApplicableContent ? (
        <p className={admin.notice}>
          Pre tento týždeň sa nepodarilo rozpoznať údaje. Doplňte ich ručne
          podľa textu dokumentu.
        </p>
      ) : null}
      {result.unassigned.length ? (
        <p className={admin.notice} role="alert">
          Nezaradené časti dokumentu: {result.unassigned.length}. Skontrolujte
          ich v podrobnostiach importu.
        </p>
      ) : null}

      {pending || targetWeeks.length ? (
        <div className={admin.actions}>
          {pending && hasApplicableContent ? (
            <button
              type="button"
              className={admin.secondary}
              disabled={disabled}
              onClick={() => onApply(result)}
            >
              {mismatch
                ? "Vložiť iba dni tohto týždňa"
                : "Vložiť údaje do formulára"}
            </button>
          ) : null}
          {onTargetWeek
            ? targetWeeks.map((week) => (
                <button
                  key={week}
                  type="button"
                  className={admin.secondary}
                  disabled={disabled}
                  onClick={() => void onTargetWeek(week, result)}
                >
                  Otvoriť týždeň od {formatRecordDate(week)}
                </button>
              ))
            : null}
        </div>
      ) : null}

      <details className={styles.review}>
        <summary>Podrobnosti importu</summary>
        {result.unassigned.length ? (
          <>
            <strong>Nezaradený text</strong>
            <ul className={styles.list}>
              {result.unassigned.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </>
        ) : null}
        {result.warnings.some((warning) => warning.date) ? (
          <ul className={styles.list}>
            {result.warnings
              .filter((warning) => warning.date)
              .map((warning, index) => (
                <li key={`${warning.code}-${index}`}>
                  {formatRecordDate(warning.date!)}: {warning.message}
                </li>
              ))}
          </ul>
        ) : null}
        <pre className={styles.source}>{result.text}</pre>
      </details>
    </div>
  );
}

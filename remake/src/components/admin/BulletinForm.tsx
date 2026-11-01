"use client";

import { useEffect, useRef, useState } from "react";
import type { BulletinDocument } from "@/content/documents";
import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { StringList } from "./Fields";
import { BulletinDayFields } from "./BulletinDayFields";
import { BulletinDonations } from "./BulletinDonations";
import { formatRecordDate } from "./admin-format";
import { BulletinImport } from "./BulletinImport";
import { BulletinImportPreview } from "./BulletinImportPreview";
import { useBulletinImport } from "./hooks/useBulletinImport";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

export function BulletinForm({
  document,
  onChange,
  disabled = false,
  onBusyChange
}: {
  document: BulletinDocument;
  onChange: (doc: BulletinDocument) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const imported = useBulletinImport(document, onChange, !disabled);
  const importReview = useRef<HTMLDetailsElement>(null);
  const [parsing, setParsing] = useState(false);
  const [navigationError, setNavigationError] = useState("");
  const working = imported.opening || parsing;

  function reviewImport() {
    if (!importReview.current) return;
    importReview.current.open = true;
    importReview.current.scrollIntoView({ block: "start", behavior: "smooth" });
    importReview.current.querySelector<HTMLElement>("summary")?.focus();
  }

  useEffect(() => {
    onBusyChange?.(working);
    return () => onBusyChange?.(false);
  }, [working, onBusyChange]);

  async function openImportedWeek(
    weekStart: CalendarDate,
    result: BulletinImportResult
  ) {
    setNavigationError("");
    try {
      await imported.openWeek(weekStart, result);
    } catch (cause) {
      setNavigationError(
        cause instanceof Error ? cause.message : "Týždeň sa nepodarilo otvoriť."
      );
    }
  }

  function updateDay(index: number, patch: Partial<ScheduleDay>) {
    onChange({
      ...document,
      days: document.days.map((day, i) =>
        i === index ? { ...day, ...patch } : day
      )
    });
  }

  return (
    <fieldset
      className={`${styles.disabled} ${weekly.editor}`}
      disabled={disabled || imported.opening}
    >
      <BulletinImport
        weekStart={document.weekStart}
        onApply={imported.apply}
        onBusyChange={setParsing}
        disabled={disabled || imported.opening}
      />
      {navigationError ? (
        <p className={styles.error} role="alert">
          {navigationError}
          <TechnicalSupport />
        </p>
      ) : null}
      <fieldset className={styles.disabled} disabled={disabled || working}>
        {imported.pending ? (
          <p className={weekly.pendingImport} role="status">
            Dokument ešte nie je vložený do formulára.{" "}
            <button
              type="button"
              className={styles.quietLink}
              onClick={reviewImport}
            >
              Skontrolovať import
            </button>
          </p>
        ) : null}
        <section
          className={`${styles.panel} ${weekly.panel}`}
          id="bulletin-week"
          tabIndex={-1}
        >
          <h2>
            Týždeň od{" "}
            {formatRecordDate(document.weekStart, {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </h2>
          {document.days.map((day, index) => (
            <BulletinDayFields
              key={day.date}
              day={day}
              index={index}
              warnings={imported.result?.warnings}
              onChange={(patch) => updateDay(index, patch)}
            />
          ))}
        </section>
        <section
          className={`${styles.panel} ${weekly.panel}`}
          data-field="announcements"
        >
          <h2>Farské oznamy</h2>
          <StringList
            label="Oznam"
            values={document.announcements}
            onChange={(announcements) =>
              onChange({ ...document, announcements })
            }
          />
        </section>
        <BulletinDonations
          donations={document.donations}
          onChange={(donations) => onChange({ ...document, donations })}
        />
        {imported.result ? (
          <details className={weekly.importReceipt} ref={importReview}>
            <summary>
              Import dokumentu
              <span>
                {imported.result.filename}
                {imported.result.warnings.length
                  ? ` · Upozornenia: ${imported.result.warnings.length}`
                  : ""}
                {imported.result.unassigned.length
                  ? ` · Nezaradené časti: ${imported.result.unassigned.length}`
                  : ""}
              </span>
            </summary>
            <BulletinImportPreview
              result={imported.result}
              weekStart={document.weekStart}
              pending={imported.pending}
              disabled={disabled || working}
              onApply={imported.applyCurrentWeek}
              onTargetWeek={openImportedWeek}
            />
          </details>
        ) : null}
      </fieldset>
    </fieldset>
  );
}

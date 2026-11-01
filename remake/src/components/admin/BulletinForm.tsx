"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useEffect, useRef, useState } from "react";
import type { BulletinDocument } from "@/content/documents";
import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { Field, MassFields, StringList } from "./Fields";
import { formatRecordDate } from "./admin-format";
import { BulletinImport } from "./BulletinImport";
import { addDays } from "@/lib/calendar";
import { BulletinImportPreview } from "./BulletinImportPreview";
import { PreviousSunday } from "./PreviousSunday";
import { useBulletinImport } from "./hooks/useBulletinImport";
import { Icon } from "@/components/ui/Icon";
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
    result: BulletinImportResult,
    newTab = false
  ) {
    setNavigationError("");
    try {
      await imported.openWeek(weekStart, result, { newTab });
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
          <PreviousSunday
            weekStart={document.weekStart}
            importedDay={imported.result?.days.find(
              (day) => day.date === addDays(document.weekStart, -1)
            )}
            disabled={disabled || working}
            onEditImportedSunday={
              imported.result
                ? () =>
                    void openImportedWeek(
                      addDays(document.weekStart, -7),
                      imported.result!,
                      true
                    )
                : undefined
            }
          />
          {document.days.map((day, index) => (
            <details
              className={`${styles.day} ${weekly.day}`}
              key={day.date}
              open
              data-field={`days.${index}`}
            >
              <summary>
                <span className={weekly.daySummary}>
                  <strong>
                    {formatRecordDate(day.date, {
                      weekday: "long",
                      day: "numeric",
                      month: "numeric"
                    })}
                  </strong>
                  <small>
                    {day.liturgy || "Liturgia nie je vyplnená"}
                    {imported.result?.warnings.some(
                      (warning) => warning.date === day.date
                    )
                      ? " · Skontrolovať"
                      : ""}
                  </small>
                  <span className={weekly.times}>
                    {day.status === "no-masses"
                      ? "Bez omší"
                      : day.status === "unpublished"
                      ? "Pravidelné časy"
                      : day.masses.map((mass) => mass.time).join(" · ") ||
                        "Bez vyplnených omší"}
                  </span>
                </span>
              </summary>
              <div className={`${styles.dayContent} ${weekly.dayContent}`}>
                {imported.result?.warnings.some(
                  (warning) => warning.date === day.date
                ) ? (
                  <ul className={weekly.warnings} role="alert">
                    {imported.result.warnings
                      .filter((warning) => warning.date === day.date)
                      .map((warning, warningIndex) => (
                        <li key={`${warning.code}-${warningIndex}`}>
                          {warning.message}
                        </li>
                      ))}
                  </ul>
                ) : null}
                <div className={weekly.dayFields}>
                  <Field
                    label="Liturgia dňa"
                    path={`days.${index}.liturgy`}
                    value={day.liturgy}
                    onChange={(value) => updateDay(index, { liturgy: value })}
                  />
                  <label
                    className={styles.field}
                    data-field={`days.${index}.status`}
                  >
                    Stav rozpisu
                    <select
                      value={day.status}
                      onChange={(e) => {
                        const status = e.target.value as ScheduleDay["status"];
                        if (status === "no-masses" && day.masses.length) {
                          if (
                            !window.confirm(
                              "Vymazať vyplnené omše v tomto dni a potvrdiť, že je bez svätej omše?"
                            )
                          )
                            return;
                          updateDay(index, { status, masses: [] });
                        } else updateDay(index, { status });
                      }}
                    >
                      <option value="scheduled">Omše podľa rozpisu</option>
                      <option value="no-masses">Bez omší</option>
                      <option value="unpublished">
                        Použiť pravidelné časy
                      </option>
                    </select>
                  </label>
                </div>
                {day.status === "scheduled" ? (
                  <MassFields
                    masses={day.masses}
                    path={`days.${index}.masses`}
                    onChange={(masses) => updateDay(index, { masses })}
                  />
                ) : null}
              </div>
            </details>
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
        <details
          className={`${styles.panel} ${styles.disclosure} ${weekly.panel}`}
          open={Boolean(document.donations?.length)}
        >
          <summary>
            {document.donations?.length
              ? "Dary a zbierky"
              : "Pridať dary a zbierky"}
          </summary>
          {(document.donations ?? []).map((donation, index) => (
            <div
              className={styles.mass}
              key={index}
              data-field={`donations.${index}`}
            >
              <div className={styles.fields}>
                <Field
                  label="Označenie / meno"
                  value={donation.label}
                  onChange={(value) =>
                    onChange({
                      ...document,
                      donations: document.donations?.map((row, i) =>
                        i === index ? { ...row, label: value } : row
                      )
                    })
                  }
                />
                <Field
                  label="Suma / poznámka"
                  value={donation.amount}
                  onChange={(value) =>
                    onChange({
                      ...document,
                      donations: document.donations?.map((row, i) =>
                        i === index ? { ...row, amount: value } : row
                      )
                    })
                  }
                />
                <Field
                  label="Kategória daru (nepovinné)"
                  value={donation.category}
                  maxLength={150}
                  wide
                  onChange={(value) =>
                    onChange({
                      ...document,
                      donations: document.donations?.map((row, i) =>
                        i === index ? { ...row, category: value } : row
                      )
                    })
                  }
                />
              </div>
              <button
                type="button"
                className={styles.remove}
                title="Odobrať dar alebo zbierku"
                aria-label={`Odobrať dar alebo zbierku ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...document,
                    donations: document.donations?.filter((_, i) => i !== index)
                  })
                }
              >
                <Icon name="minus" size={17} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              onChange({
                ...document,
                donations: [
                  ...(document.donations ?? []),
                  { label: "", amount: "" }
                ]
              })
            }
          >
            + Pridať dar alebo zbierku
          </button>
        </details>
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

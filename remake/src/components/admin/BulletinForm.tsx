"use client";

import { formatRecordDate } from "./admin-format";
import { useEffect } from "react";
import type { BulletinDocument } from "@/content/documents";
import type { ScheduleDay } from "@/content/types";
import { Field, MassFields, StringList } from "./Fields";
import { BulletinImport } from "./BulletinImport";
import { PreviousSunday } from "./PreviousSunday";
import { useBulletinImport } from "./hooks/useBulletinImport";
import styles from "./Admin.module.css";

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

  useEffect(() => {
    onBusyChange?.(imported.opening);
    return () => onBusyChange?.(false);
  }, [imported.opening, onBusyChange]);

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
      className={styles.disabled}
      disabled={disabled || imported.opening}
    >
      <details
        className={styles.disclosure}
        open={
          !!imported.initialResult &&
          (imported.initialResult.warnings.length > 0 ||
            imported.initialResult.unassigned.length > 0)
        }
      >
        <summary>
          {imported.initialResult
            ? "Kontrola načítaného dokumentu"
            : "Načítať dokument"}
        </summary>
        <BulletinImport
          weekStart={document.weekStart}
          onApply={imported.apply}
          onTargetWeek={imported.openWeek}
          initialResult={imported.initialResult}
          disabled={disabled || imported.opening}
        />
      </details>
      {imported.message ? (
        <p role="status" className={styles.notice}>
          {imported.message}
        </p>
      ) : null}
      <section className={styles.panel} id="bulletin-week" tabIndex={-1}>
        <h2>
          Týždeň od{" "}
          {formatRecordDate(document.weekStart, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </h2>
        <p className={styles.hint}>
          Pondelok až nedeľa. Pred zverejnením skontrolujte časy a úmysly omší.
        </p>
        <PreviousSunday weekStart={document.weekStart} />
        {document.days.map((day, index) => (
          <details className={styles.day} key={day.date} open={index === 0}>
            <summary>
              {formatRecordDate(day.date, {
                weekday: "long",
                day: "numeric",
                month: "numeric"
              })}{" "}
              <span className={styles.badge}>
                {day.status === "no-masses"
                  ? "Bez omší"
                  : day.status === "unpublished"
                  ? "Rozpis nedostupný"
                  : `${day.masses.length} omší`}
              </span>
            </summary>
            <div className={styles.dayContent}>
              <div className={styles.fields}>
                <Field
                  label="Liturgia dňa"
                  value={day.liturgy}
                  onChange={(value) => updateDay(index, { liturgy: value })}
                />
                <label className={styles.field}>
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
                    <option value="scheduled">Zverejniť vyplnené omše</option>
                    <option value="no-masses">
                      Potvrdené: bez svätých omší
                    </option>
                    <option value="unpublished">
                      Rozpis nedostupný (pravidelné časy)
                    </option>
                  </select>
                </label>
              </div>
              {day.status === "scheduled" ? (
                <MassFields
                  masses={day.masses}
                  onChange={(masses) => updateDay(index, { masses })}
                />
              ) : (
                <p className={styles.hint}>
                  {day.status === "no-masses"
                    ? "Verejne sa zobrazí potvrdený deň bez svätých omší."
                    : "Verejne sa nezobrazia neoverené úmysly ani celebranti. Ak sú nastavené pravidelné časy, zobrazia sa s jasným označením."}
                </p>
              )}
            </div>
          </details>
        ))}
      </section>
      <section className={styles.panel}>
        <h2>Farské oznamy</h2>
        <StringList
          label="Oznam"
          values={document.announcements}
          onChange={(announcements) => onChange({ ...document, announcements })}
        />
      </section>
      <section className={styles.panel}>
        <h2>Dary a zbierky</h2>
        <p className={styles.hint}>
          Dobrovoľná súčasť verejných oznamov. Uvádzajte iba údaje určené na
          zverejnenie.
        </p>
        {(document.donations ?? []).map((donation, index) => (
          <div className={styles.mass} key={index}>
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
                hint="Napríklad z pohrebu, zo svadby alebo na charitu. Meno môže zostať prázdne, ak je uvedená suma."
              />
            </div>
            <button
              type="button"
              className={styles.remove}
              onClick={() =>
                onChange({
                  ...document,
                  donations: document.donations?.filter((_, i) => i !== index)
                })
              }
            >
              Odobrať
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
      </section>
    </fieldset>
  );
}

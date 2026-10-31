"use client";

import { formatRecordDate } from "./admin-format";
import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  AdminRecordSummary,
  BulletinDocument,
  ContentRecord
} from "@/content/documents";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { addDays } from "@/lib/calendar";
import { Field, MassFields, StringList } from "./Fields";
import styles from "./Admin.module.css";

function PreviousSunday({ weekStart }: { weekStart: CalendarDate }) {
  const [record, setRecord] = useState<ContentRecord | null>(null);
  const [failed, setFailed] = useState(false);
  const previousMonday = addDays(weekStart, -7);
  const sunday = addDays(weekStart, -1);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(
          `/api/admin/records?kind=bulletin&query=${previousMonday}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        const item = (data.items as AdminRecordSummary[]).find(
          (value) => value.weekStart === previousMonday
        );
        if (item) {
          const result = await fetch(
            `/api/admin/records/${encodeURIComponent(item.id)}`,
            { cache: "no-store" }
          );
          if (!result.ok) throw new Error();
          if (active) setRecord(await result.json());
        }
      } catch {
        if (active) setFailed(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [previousMonday]);

  const day =
    record?.kind === "bulletin"
      ? record.draft.days.find((value) => value.date === sunday)
      : null;

  return (
    <aside className={styles.notice}>
      <strong>Predchádzajúca nedeľa · {formatRecordDate(sunday)}</strong>
      <p>
        Verejný rozpis zobrazí aj túto nedeľu. Patrí do predchádzajúceho týždňa
        a upravuje sa iba tam.
      </p>
      {day ? (
        <p>
          {day.status === "no-masses"
            ? "Bez svätej omše"
            : day.masses.map((mass) => mass.time).join(" · ") ||
              "Rozpis nie je vyplnený"}
          {day.liturgy ? ` · ${day.liturgy}` : ""}
        </p>
      ) : (
        <p>
          {failed
            ? "Referenčný rozpis sa nepodarilo načítať. Formulár tohto týždňa môžete ďalej upravovať."
            : "Predchádzajúci týždeň sa nenašiel. Verejný web použije označené pravidelné časy, ak sú nastavené."}
        </p>
      )}
      {record ? (
        <Link href={`/admin/records/${encodeURIComponent(record.id)}`}>
          Otvoriť predchádzajúci týždeň →
        </Link>
      ) : null}
    </aside>
  );
}

export function BulletinForm({
  document,
  onChange
}: {
  document: BulletinDocument;
  onChange: (doc: BulletinDocument) => void;
}) {
  function updateDay(index: number, patch: Partial<ScheduleDay>) {
    onChange({
      ...document,
      days: document.days.map((day, i) =>
        i === index ? { ...day, ...patch } : day
      )
    });
  }

  return (
    <>
      <section className={styles.panel}>
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
          Upravujete pondelok až nedeľu. Nový týždeň preberá iba časy, miesta a
          označenia z pravidelnej šablóny; úmysly a celebrantov vyplňte
          osobitne. Prázdny alebo nedostupný deň odlíšte od potvrdeného dňa bez
          omší.
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
    </>
  );
}

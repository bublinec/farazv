import type { BulletinImportResult } from "@/content/bulletin-import";
import type { ScheduleDay } from "@/content/types";
import { splitLiturgy } from "@/lib/liturgy-day";
import { Field, MassFields } from "./Fields";
import { formatRecordDate } from "./admin-format";
import styles from "./Admin.module.css";
import weekly from "./WeeklyWorkspace.module.css";

function scheduleSummary(day: ScheduleDay) {
  if (day.status === "no-masses") return "Bez omší";
  if (day.status === "unpublished") return "Pravidelné časy";
  return (
    day.masses.map((mass) => mass.time).join(" · ") || "Bez vyplnených omší"
  );
}

export function BulletinDayFields({
  day,
  index,
  warnings = [],
  onChange
}: {
  day: ScheduleDay;
  index: number;
  warnings?: BulletinImportResult["warnings"];
  onChange: (patch: Partial<ScheduleDay>) => void;
}) {
  const path = `days.${index}`;
  const liturgy = splitLiturgy(day.liturgy, day.liturgyType);
  const dayWarnings = warnings.filter((warning) => warning.date === day.date);

  function updateStatus(status: ScheduleDay["status"]) {
    if (status !== "no-masses" || !day.masses.length) {
      onChange({ status });
      return;
    }

    if (
      window.confirm(
        "Vymazať vyplnené omše v tomto dni a potvrdiť, že je bez svätej omše?"
      )
    )
      onChange({ status, masses: [] });
  }

  return (
    <details className={`${styles.day} ${weekly.day}`} open data-field={path}>
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
            {liturgy.liturgy || "Liturgia nie je vyplnená"}
            {dayWarnings.length ? " · Skontrolovať" : ""}
            {liturgy.liturgyType ? (
              <span className={weekly.dayLiturgyType}>
                {liturgy.liturgyType}
              </span>
            ) : null}
          </small>
          <span className={weekly.times}>{scheduleSummary(day)}</span>
        </span>
      </summary>
      <div className={`${styles.dayContent} ${weekly.dayContent}`}>
        {dayWarnings.length ? (
          <ul className={weekly.warnings} role="alert">
            {dayWarnings.map((warning, warningIndex) => (
              <li key={`${warning.code}-${warningIndex}`}>{warning.message}</li>
            ))}
          </ul>
        ) : null}
        <div className={weekly.dayFields}>
          <Field
            label="Liturgia dňa"
            path={`${path}.liturgy`}
            value={liturgy.liturgy}
            onChange={(value) =>
              onChange({ liturgy: value, liturgyType: liturgy.liturgyType })
            }
          />
          <Field
            label="Typ liturgického dňa"
            path={`${path}.liturgyType`}
            value={liturgy.liturgyType}
            placeholder="Spomienka · Prvý piatok"
            maxLength={300}
            onChange={(value) =>
              onChange({ liturgy: liturgy.liturgy, liturgyType: value })
            }
          />
          <label className={styles.field} data-field={`${path}.status`}>
            Stav rozpisu
            <select
              value={day.status}
              onChange={(event) =>
                updateStatus(event.target.value as ScheduleDay["status"])
              }
            >
              <option value="scheduled">Omše podľa rozpisu</option>
              <option value="no-masses">Bez omší</option>
              <option value="unpublished">Použiť pravidelné časy</option>
            </select>
          </label>
        </div>
        {day.status === "scheduled" ? (
          <MassFields
            masses={day.masses}
            path={`${path}.masses`}
            onChange={(masses) => onChange({ masses })}
          />
        ) : null}
      </div>
    </details>
  );
}

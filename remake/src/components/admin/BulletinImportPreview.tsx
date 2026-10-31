import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import { formatRecordDate } from "./admin-format";
import admin from "./Admin.module.css";
import styles from "./BulletinImport.module.css";

export type BulletinImportTargetWeek = (
  weekStart: CalendarDate,
  result: BulletinImportResult
) => void | Promise<void>;

function ImportedDay({
  day,
  outsideWeek
}: {
  day: ScheduleDay;
  outsideWeek: boolean;
}) {
  return (
    <details className={styles.day}>
      <summary>
        <span>
          {formatRecordDate(day.date, {
            weekday: "long",
            day: "numeric",
            month: "numeric"
          })}
          {outsideWeek ? " · mimo otvoreného týždňa" : ""}
        </span>
        <span className={admin.badge}>
          {day.status === "no-masses"
            ? "Bez omší"
            : day.masses.length
            ? `${day.masses.length} omší`
            : "Bez rozpoznaných omší"}
        </span>
      </summary>
      <div className={styles.dayContent}>
        {day.liturgy ? <p>{day.liturgy}</p> : null}
        {day.masses.length ? (
          <div className={styles.tableScroll} tabIndex={0}>
            <table>
              <caption>Rozpoznané omše · {formatRecordDate(day.date)}</caption>
              <thead>
                <tr>
                  <th scope="col">Čas</th>
                  <th scope="col">Miesto</th>
                  <th scope="col">Úmysel</th>
                  <th scope="col">Celebrant</th>
                  <th scope="col">Označenie</th>
                </tr>
              </thead>
              <tbody>
                {day.masses.map((mass, index) => (
                  <tr key={`${mass.time}-${index}`}>
                    <td>{mass.time || "—"}</td>
                    <td>{mass.location || "—"}</td>
                    <td>{mass.intention || "—"}</td>
                    <td>{mass.celebrant || "—"}</td>
                    <td>{mass.label || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={admin.hint}>
            {day.status === "no-masses"
              ? "Dokument výslovne uvádza deň bez svätej omše."
              : "Omše sa nepodarilo rozpoznať. Skontrolujte pôvodný text; prázdny deň neznamená zrušené omše."}
          </p>
        )}
      </div>
    </details>
  );
}

export function BulletinImportPreview({
  result,
  weekStart,
  disabled,
  onApply,
  onTargetWeek
}: {
  result: BulletinImportResult;
  weekStart: CalendarDate;
  disabled: boolean;
  onApply: (result: BulletinImportResult) => void;
  onTargetWeek?: BulletinImportTargetWeek;
}) {
  const mismatch = Boolean(
    result.suggestedWeekStart && result.suggestedWeekStart !== weekStart
  );
  const identifiedDays = result.days.filter(
    (day) => day.liturgy || day.masses.length || day.status === "no-masses"
  );
  const weekEnd = addDays(weekStart, 6);
  const daysInWeek = identifiedDays.filter(
    (day) => day.date >= weekStart && day.date <= weekEnd
  );
  const outsideDays = identifiedDays.length - daysInWeek.length;
  const massCount = result.days.reduce(
    (count, day) => count + day.masses.length,
    0
  );
  const hasContent = Boolean(
    identifiedDays.length ||
      result.announcements.length ||
      result.donations.length
  );
  const hasApplicableContent =
    daysInWeek.length > 0 ||
    (!mismatch &&
      (result.announcements.length > 0 || result.donations.length > 0));
  const targetWeeks = [
    ...new Set([
      ...(result.suggestedWeekStart ? [result.suggestedWeekStart] : []),
      ...identifiedDays.map((day) => getMonday(day.date))
    ])
  ]
    .filter((week) => week !== weekStart)
    .sort();

  return (
    <div className={styles.preview}>
      <div className={styles.resultHeading}>
        <h3>Výsledok načítania</h3>
        <p className={admin.hint}>{result.filename}</p>
      </div>
      <p>
        {result.suggestedWeekStart
          ? `Týždeň ${formatRecordDate(
              result.suggestedWeekStart
            )} – ${formatRecordDate(addDays(result.suggestedWeekStart, 6))}. `
          : "Týždeň nebolo možné spoľahlivo určiť. Skontrolujte dátumy. "}
        Rozpoznané dni: <strong>{identifiedDays.length}</strong>, omše:{" "}
        <strong>{massCount}</strong>, oznamy:{" "}
        <strong>{result.announcements.length}</strong>, dary:{" "}
        <strong>{result.donations.length}</strong>.
      </p>

      {result.warnings.length ? (
        <div className={admin.notice}>
          <strong>Čo treba skontrolovať</strong>
          <ul className={styles.list}>
            {result.warnings.map((warning, index) => (
              <li key={`${warning.code}-${index}`}>
                {warning.date ? `${formatRecordDate(warning.date)}: ` : ""}
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className={styles.review} open>
        <summary>Rozpis svätých omší</summary>
        <p className={admin.hint}>
          Do otvoreného formulára patria rozpoznané dni: {daysInWeek.length}.
          {outsideDays
            ? ` Mimo tohto týždňa zostane ${outsideDays} dní; nižšie môžete otvoriť ich týždne.`
            : ""}{" "}
          Rozpoznané údaje nahradia príslušné polia; ostatné dni zostanú
          zachované.
        </p>
        {result.days.map((day) => (
          <ImportedDay
            key={day.date}
            day={day}
            outsideWeek={day.date < weekStart || day.date > weekEnd}
          />
        ))}
      </details>

      {result.announcements.length ? (
        <details className={styles.review}>
          <summary>Farské oznamy · {result.announcements.length}</summary>
          <ol className={styles.list}>
            {result.announcements.map((announcement, index) => (
              <li key={index}>{announcement}</li>
            ))}
          </ol>
        </details>
      ) : null}

      {result.donations.length ? (
        <details className={styles.review}>
          <summary>Dary a zbierky · {result.donations.length}</summary>
          <ul className={styles.list}>
            {result.donations.map((donation, index) => (
              <li key={index}>
                {[donation.category, donation.label, donation.amount]
                  .filter(Boolean)
                  .join(" · ")}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {result.unassigned.length ? (
        <details className={styles.review}>
          <summary>Nezaradený text · {result.unassigned.length}</summary>
          <p className={admin.hint}>
            Tieto časti sa nevyplnia automaticky. Ak patria do oznamov alebo
            rozpisu, doplňte ich vo formulári.
          </p>
          <ul className={styles.list}>
            {result.unassigned.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <details className={styles.review}>
        <summary>Celý extrahovaný text dokumentu</summary>
        <pre className={styles.source}>{result.text}</pre>
      </details>

      {mismatch ? (
        <p className={admin.notice}>
          Dokument patrí k týždňu od{" "}
          <strong>{formatRecordDate(result.suggestedWeekStart!)}</strong>.
          Otvorte alebo vytvorte oznamy pre tento týždeň a skontrolujte údaje
          tam. Aktuálny formulár je pre týždeň od {formatRecordDate(weekStart)}.
          {daysInWeek.length
            ? " Môžete prevziať iba rozpis dní, ktoré patria do otvoreného týždňa. Oznamy a dary patria k týždňu dokumentu a neprevezmú sa."
            : ""}
        </p>
      ) : null}
      {!hasContent ? (
        <p className={admin.notice}>
          Nepodarilo sa rozpoznať údaje na vyplnenie. Skúste vložiť skopírovaný
          text alebo vyplňte formulár ručne podľa pôvodného textu.
        </p>
      ) : null}
      <div className={admin.actions}>
        <button
          type="button"
          className={admin.button}
          disabled={disabled || !hasApplicableContent}
          onClick={() => onApply(result)}
        >
          {mismatch ? "Vyplniť iba dni tohto týždňa" : "Vyplniť formulár"}
        </button>
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
        <span className={admin.hint}>
          Potom údaje upravte a uložte bežným tlačidlom formulára.
          {targetWeeks.length && onTargetWeek
            ? " Ak cieľový týždeň ešte neexistuje, vytvorí sa prázdny koncept."
            : ""}
        </span>
      </div>
    </div>
  );
}

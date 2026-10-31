import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContentRecordFor } from "@/content/documents";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { addDays } from "@/lib/calendar";
import { readAdminJson } from "./admin-api";
import { findEditableBulletin } from "./bulletin-records";
import { formatRecordDate } from "./admin-format";
import styles from "./Admin.module.css";

function summarize(day: ScheduleDay) {
  const times =
    day.status === "no-masses"
      ? "Bez svätej omše"
      : day.masses.map((mass) => mass.time).join(" · ") ||
        "Rozpis nie je vyplnený";
  return [times, day.liturgy].filter(Boolean).join(" · ");
}

/** Reference the public snapshot explicitly; an unpublished draft is never presented as live. */
export function PreviousSunday({ weekStart }: { weekStart: CalendarDate }) {
  const [record, setRecord] = useState<ContentRecordFor<"bulletin"> | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const previousMonday = addDays(weekStart, -7);
  const sunday = addDays(weekStart, -1);

  useEffect(() => {
    const controller = new AbortController();
    setRecord(null);
    setError("");
    setLoading(true);

    async function load() {
      try {
        const item = await findEditableBulletin(
          previousMonday,
          controller.signal
        );
        if (!item || controller.signal.aborted) return;
        const found = await readAdminJson(
          await fetch(`/api/admin/records/${encodeURIComponent(item.id)}`, {
            cache: "no-store",
            signal: controller.signal
          })
        );
        if (!controller.signal.aborted && found.kind === "bulletin")
          setRecord(found);
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Referenčný rozpis sa nepodarilo načítať."
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [previousMonday]);

  const published = record?.published?.days.find(
    (day) => day.date === sunday && day.status !== "unpublished"
  );
  const draft = record?.draft.days.find((day) => day.date === sunday);
  const draftChanged =
    draft && JSON.stringify(draft) !== JSON.stringify(published);

  return (
    <aside className={styles.notice}>
      <strong>Predchádzajúca nedeľa · {formatRecordDate(sunday)}</strong>
      <p>
        Verejný rozpis používa zverejnenú verziu predchádzajúceho týždňa. Táto
        nedeľa sa upravuje iba tam.
      </p>
      {loading ? (
        <p>Načítavam referenčný rozpis…</p>
      ) : error ? (
        <p>{error} Formulár tohto týždňa môžete ďalej upravovať.</p>
      ) : (
        <>
          <p>
            {published
              ? `Zverejnené: ${summarize(published)}`
              : "Nedeľa nemá zverejnený rozpis. Web použije označené pravidelné časy, ak sú nastavené."}
          </p>
          {draftChanged ? (
            <p>
              Koncept: {summarize(draft)}. Táto verzia ešte nie je zverejnená.
            </p>
          ) : null}
        </>
      )}
      {record ? (
        <Link href={`/admin/records/${encodeURIComponent(record.id)}`}>
          Otvoriť predchádzajúci týždeň →
        </Link>
      ) : null}
    </aside>
  );
}

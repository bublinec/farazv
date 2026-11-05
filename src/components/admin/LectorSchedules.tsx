"use client";

import { useEffect, useRef, useState } from "react";
import type {
  LectorSchedule,
  LectorScheduleList
} from "@/content/lector-schedules";
import { lectorMonthLabel } from "@/lib/lector-schedules";
import { fetchLectorPdf } from "@/components/lectors/pdf-client";
import { readAdminJson } from "./admin-api";
import styles from "./Admin.module.css";
import layout from "./LectorSchedules.module.css";

export function LectorSchedules({
  initialList
}: {
  initialList: LectorScheduleList;
}) {
  const [list, setList] = useState(initialList);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const active = useRef<AbortController | null>(null);
  const urls = useRef(new Set<string>());
  useEffect(
    () => () => {
      active.current?.abort();
      for (const url of urls.current) URL.revokeObjectURL(url);
    },
    []
  );

  async function refresh(signal: AbortSignal, cursor?: string) {
    const next: LectorScheduleList = await readAdminJson(
      await fetch(`/api/admin/lectors${cursor ? `?cursor=${cursor}` : ""}`, {
        cache: "no-store",
        signal
      })
    );
    if (signal.aborted) return;
    setList((previous) =>
      cursor
        ? { ...next, history: [...previous.history, ...next.history] }
        : next
    );
  }
  async function perform(
    label: string,
    operation: (signal: AbortSignal) => Promise<void>
  ) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await operation(controller.signal);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Požiadavku sa nepodarilo dokončiť."
        );
    } finally {
      if (active.current === controller) {
        active.current = null;
        setBusy("");
      }
    }
  }
  function save(slot: LectorSchedule) {
    const file = files[slot.month];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("PDF môže mať najviac 3 MB.");
      return;
    }
    if (
      slot.available &&
      !window.confirm(
        `Nahradiť rozpis na ${lectorMonthLabel(slot.month)} novým PDF?`
      )
    )
      return;
    void perform(`save:${slot.month}`, async (signal) => {
      await readAdminJson(
        await fetch(`/api/admin/lectors/${slot.month}`, {
          method: "PUT",
          signal,
          headers: {
            "Content-Type": "application/pdf",
            "If-Match": `"${slot.version}"`
          },
          body: file
        })
      );
      setFiles((previous) => ({ ...previous, [slot.month]: undefined }));
      setMessage(`Rozpis na ${lectorMonthLabel(slot.month)} bol uložený.`);
      await refresh(signal);
    });
  }
  function remove(slot: LectorSchedule) {
    if (
      !window.confirm(
        `Odstrániť rozpis na ${lectorMonthLabel(
          slot.month
        )}? Čitatelia ho už nebudú môcť otvoriť.`
      )
    )
      return;
    void perform(`delete:${slot.month}`, async (signal) => {
      await readAdminJson(
        await fetch(`/api/admin/lectors/${slot.month}`, {
          method: "DELETE",
          signal,
          headers: { "If-Match": `"${slot.version}"` }
        })
      );
      setMessage("Rozpis bol odstránený.");
      await refresh(signal);
    });
  }
  function preview(slot: LectorSchedule) {
    void perform(`open:${slot.month}`, async (signal) => {
      urls.current.add(
        await fetchLectorPdf(`/api/admin/lectors/${slot.month}`, { signal })
      );
    });
  }
  function actions(slot: LectorSchedule) {
    return (
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={!!busy}
          onClick={() => preview(slot)}
        >
          Otvoriť PDF
        </button>
        <button
          type="button"
          className={styles.danger}
          disabled={!!busy}
          onClick={() => remove(slot)}
        >
          Odstrániť PDF
        </button>
      </div>
    );
  }
  return (
    <div className={layout.page}>
      <div className={styles.heading}>
        <div>
          <h1>Rozpisy lektorov</h1>
          <p>
            Nahrajte PDF na aktuálny alebo nasledujúci mesiac. Uložený rozpis je
            dostupný čitateľom, ktorí poznajú heslo, až v príslušnom mesiaci.
          </p>
        </div>
        <button
          type="button"
          className={styles.secondary}
          disabled={!!busy}
          onClick={() => void perform("refresh", (signal) => refresh(signal))}
        >
          Obnoviť zoznam
        </button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <p className={styles.status} role="status" aria-live="polite">
        {busy ? "Pracujem…" : message}
      </p>
      <div className={layout.months}>
        {list.months.map((slot, index) => (
          <section
            key={slot.month}
            className={styles.panel}
            aria-labelledby={`month-${slot.month}`}
          >
            <span className={styles.badge}>
              {index === 0 ? "Aktuálny mesiac" : "Nasledujúci mesiac"}
            </span>
            <h2 id={`month-${slot.month}`} className={layout.monthTitle}>
              {lectorMonthLabel(slot.month)}
            </h2>
            <p>
              {slot.available
                ? `PDF je nahrané (${Math.max(
                    1,
                    Math.round(slot.bytes / 1024)
                  )} kB).`
                : "Rozpis zatiaľ nie je nahraný."}
            </p>
            {slot.available ? actions(slot) : null}
            {slot.updatedAt ? (
              <p className={styles.hint}>
                Posledná zmena:{" "}
                {new Intl.DateTimeFormat("sk-SK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Europe/Bratislava"
                }).format(new Date(slot.updatedAt))}
              </p>
            ) : null}
            <form
              className={layout.upload}
              onSubmit={(event) => {
                event.preventDefault();
                save(slot);
              }}
            >
              <label className={styles.field}>
                PDF pre {lectorMonthLabel(slot.month)}
                <input
                  key={`${slot.month}-${slot.version}`}
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  disabled={!!busy}
                  onChange={(event) =>
                    setFiles((previous) => ({
                      ...previous,
                      [slot.month]: event.target.files?.[0]
                    }))
                  }
                />
              </label>
              <p className={styles.hint}>
                PDF, najviac 3 MB. Skontrolujte mesiac a kontakty pred nahratím.
              </p>
              <button
                className={styles.button}
                type="submit"
                disabled={!!busy || !files[slot.month]}
              >
                {busy === `save:${slot.month}`
                  ? "Ukladám PDF…"
                  : slot.available
                  ? "Nahradiť PDF"
                  : "Nahrať PDF"}
              </button>
            </form>
          </section>
        ))}
      </div>
      <section className={styles.panel} aria-labelledby="lector-archive-title">
        <h2 id="lector-archive-title">Archív rozpisov</h2>
        <p className={styles.hint}>
          Po skončení mesiaca sa rozpis automaticky presunie do tohto súkromného
          archívu. Zostáva tu až do ručného odstránenia PDF. Čitatelia vidia iba
          aktuálny mesiac.
        </p>
        {!list.history.length ? (
          <p>V archíve zatiaľ nie sú žiadne rozpisy.</p>
        ) : null}
        <ul className={layout.history}>
          {list.history.map((slot) => (
            <li key={slot.month}>
              <strong>{lectorMonthLabel(slot.month)}</strong>
              {actions(slot)}
            </li>
          ))}
        </ul>
        {list.nextCursor ? (
          <button
            type="button"
            className={styles.secondary}
            disabled={!!busy}
            onClick={() =>
              void perform("history", (signal) =>
                refresh(signal, list.nextCursor!)
              )
            }
          >
            Načítať staršie rozpisy
          </button>
        ) : null}
      </section>
    </div>
  );
}

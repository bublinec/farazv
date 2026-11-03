"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  feedbackStatuses,
  feedbackTopics,
  type FeedbackAction,
  type FeedbackEntry
} from "@/content/feedback";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { readAdminJson } from "./admin-api";
import { formatAdminTimestamp } from "./admin-format";
import admin from "./Admin.module.css";
import styles from "./FeedbackInbox.module.css";

export function FeedbackDetail({
  initialEntry
}: {
  initialEntry: FeedbackEntry;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState(initialEntry);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const working = useRef(false);

  useEffect(() => {
    if (initialEntry.status !== "new") return;
    const controller = new AbortController();
    working.current = true;
    setBusy(true);
    void (async () => {
      try {
        const updated: FeedbackEntry = await readAdminJson(
          await fetch(`/api/admin/feedback/${initialEntry.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "read" }),
            signal: controller.signal
          })
        );
        if (!controller.signal.aborted) {
          setEntry(updated);
          window.dispatchEvent(new Event("feedback:changed"));
          router.refresh();
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Podnet sa nepodarilo označiť ako prečítaný."
          );
      } finally {
        if (!controller.signal.aborted) {
          working.current = false;
          setBusy(false);
        }
      }
    })();
    return () => {
      controller.abort();
      working.current = false;
    };
  }, [initialEntry.id, initialEntry.status, router]);

  async function update(action: FeedbackAction | "delete") {
    if (working.current) return;
    if (
      action === "delete" &&
      !window.confirm(
        "Natrvalo odstrániť tento podnet aj prípadnú e-mailovú adresu? Túto akciu nemožno vrátiť."
      )
    )
      return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await readAdminJson(
        await fetch(`/api/admin/feedback/${entry.id}`, {
          method: action === "delete" ? "DELETE" : "PATCH",
          headers: { "Content-Type": "application/json" },
          ...(action !== "delete" ? { body: JSON.stringify({ action }) } : {})
        })
      );
      window.dispatchEvent(new Event("feedback:changed"));
      if (action === "delete") {
        router.push("/admin/podnety");
        router.refresh();
        return;
      }
      setEntry(result as FeedbackEntry);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Zmenu sa nepodarilo uložiť."
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  return (
    <div className={styles.workspace}>
      <Link
        href={`/admin/podnety?stav=${entry.status}`}
        className={admin.quietLink}
      >
        ← Podnety
      </Link>
      <header className={admin.heading}>
        <div>
          <h1>{entry.subject}</h1>
          <p>
            {feedbackTopics[entry.topic]} ·{" "}
            <time dateTime={entry.createdAt}>
              {formatAdminTimestamp(entry.createdAt)}
            </time>
          </p>
        </div>
        <span className={admin.badge}>{feedbackStatuses[entry.status]}</span>
      </header>
      {error ? (
        <div role="alert" className={admin.error}>
          {error}
          <TechnicalSupport />
          {entry.status === "new" ? (
            <button
              type="button"
              className={admin.secondary}
              disabled={busy}
              onClick={() => void update("read")}
            >
              Označiť ako prečítané
            </button>
          ) : null}
        </div>
      ) : null}
      <article className={`${admin.panel} ${styles.detail}`}>
        {entry.details.topic === "website" ? (
          <>
            <section>
              <h2>Čo chýba alebo nefunguje</h2>
              <p>{entry.details.problem}</p>
            </section>
            <section>
              <h2>Ako by to malo fungovať</h2>
              <p>{entry.details.proposal}</p>
            </section>
            {entry.details.benefit ? (
              <section>
                <h2>Komu by to pomohlo</h2>
                <p>{entry.details.benefit}</p>
              </section>
            ) : null}
            {entry.details.pageUrl ? (
              <section>
                <h2>Konkrétna stránka</h2>
                <a
                  href={entry.details.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.details.pageUrl}
                </a>
              </section>
            ) : null}
          </>
        ) : (
          <section>
            <h2>Podnet</h2>
            <p>{entry.details.message}</p>
          </section>
        )}
        <section>
          <h2>Kontakt</h2>
          {entry.email ? (
            <a href={`mailto:${encodeURIComponent(entry.email)}`}>
              {entry.email}
            </a>
          ) : (
            <p className={admin.hint}>
              Anonymný podnet · e-mail nebol uvedený.
            </p>
          )}
        </section>
      </article>
      <div className={styles.detailActions}>
        <button
          type="button"
          className={admin.secondary}
          disabled={busy}
          onClick={() =>
            void update(entry.status === "archived" ? "restore" : "archive")
          }
        >
          {entry.status === "archived" ? "Obnoviť z archívu" : "Archivovať"}
        </button>
        <button
          type="button"
          className={admin.danger}
          disabled={busy}
          onClick={() => void update("delete")}
        >
          Natrvalo odstrániť
        </button>
        {busy ? (
          <span className={admin.status} role="status">
            Ukladám…
          </span>
        ) : null}
      </div>
    </div>
  );
}

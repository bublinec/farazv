"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  feedbackStatuses,
  feedbackTopics,
  type FeedbackPage,
  type FeedbackStatus
} from "@/content/feedback";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { readAdminJson } from "./admin-api";
import { formatAdminTimestamp } from "./admin-format";
import admin from "./Admin.module.css";
import styles from "./FeedbackInbox.module.css";

export function FeedbackInbox({
  initialPage,
  status
}: {
  initialPage: FeedbackPage;
  status: FeedbackStatus;
}) {
  const [page, setPage] = useState(initialPage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const loading = useRef(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function more() {
    if (loading.current || !page.nextCursor) return;
    loading.current = true;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({ status, cursor: page.nextCursor });
      const next: FeedbackPage = await readAdminJson(
        await fetch(`/api/admin/feedback?${params}`, {
          cache: "no-store",
          signal: controller.signal
        })
      );
      if (controller.signal.aborted) return;
      setPage((previous) => {
        const known = new Set(previous.items.map((entry) => entry.id));
        return {
          ...next,
          items: [
            ...previous.items,
            ...next.items.filter((entry) => !known.has(entry.id))
          ]
        };
      });
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Podnety sa nepodarilo načítať."
        );
    } finally {
      loading.current = false;
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <div className={styles.workspace}>
      <div className={admin.heading}>
        <h1>Podnety</h1>
      </div>
      <nav className={styles.filters} aria-label="Stav podnetov">
        {Object.entries(feedbackStatuses).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/podnety?stav=${key}`}
            aria-current={status === key ? "page" : undefined}
          >
            {label}
            {key === "new" && page.unreadCount ? ` (${page.unreadCount})` : ""}
          </Link>
        ))}
      </nav>
      <div className={admin.recordList}>
        {page.items.map((entry) => (
          <Link
            href={`/admin/podnety/${entry.id}`}
            key={entry.id}
            className={`${admin.record} ${styles.item}`}
          >
            <div className={styles.copy}>
              <small>
                {feedbackTopics[entry.topic]} ·{" "}
                <time dateTime={entry.createdAt}>
                  {formatAdminTimestamp(entry.createdAt)}
                </time>
              </small>
              <strong>{entry.subject}</strong>
              <p>{entry.preview}</p>
            </div>
            {entry.status === "new" ? (
              <span className={admin.badge}>Nové</span>
            ) : null}
          </Link>
        ))}
      </div>
      {!page.items.length ? (
        <p className={admin.empty}>
          {status === "new"
            ? "Zatiaľ žiadne nové podnety."
            : status === "archived"
            ? "Archív podnetov je prázdny."
            : "Zatiaľ žiadne prečítané podnety."}
        </p>
      ) : null}
      {error ? (
        <div className={admin.error} role="alert">
          {error}
          <TechnicalSupport />
          <button
            className={admin.secondary}
            type="button"
            disabled={busy}
            onClick={() => void more()}
          >
            Skúsiť znova
          </button>
        </div>
      ) : null}
      {page.nextCursor ? (
        <button
          type="button"
          className={admin.secondary}
          disabled={busy}
          onClick={() => void more()}
        >
          {busy ? "Načítavam…" : "Načítať ďalšie"}
        </button>
      ) : null}
    </div>
  );
}

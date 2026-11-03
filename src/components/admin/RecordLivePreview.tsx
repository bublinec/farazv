"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import type { BulletinPreviewContext } from "@/content/bulletin-preview";
import type { ContentRecord, ContentRecordFor } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import {
  addDays,
  getLocalDate,
  getMonday,
  getPublicWeek
} from "@/lib/calendar";
import { BulletinContent } from "@/components/bulletin/BulletinContent";
import { EditorialDetail } from "@/components/editorial/EditorialDetail";
import { readAdminJson } from "./admin-api";
import styles from "./RecordLivePreview.module.css";

class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <p className={styles.message} role="alert">
        Náhľad nemožno zobraziť. Skontrolujte vyplnené údaje.
        <TechnicalSupport />
      </p>
    ) : (
      this.props.children
    );
  }
}

function validDate(value: string): value is CalendarDate {
  try {
    return addDays(value as CalendarDate, 0) === value;
  } catch {
    return false;
  }
}

type ContextState = {
  weekStart: string;
  data?: BulletinPreviewContext;
  error?: string;
};

function BulletinPreview({ record }: { record: ContentRecordFor<"bulletin"> }) {
  const weekStart = record.draft.weekStart;
  const validWeek = validDate(weekStart) && getMonday(weekStart) === weekStart;
  const [context, setContext] = useState<ContextState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!validWeek) return;
    const controller = new AbortController();
    setContext({ weekStart });

    async function load() {
      try {
        const query = new URLSearchParams({ weekStart });
        const data = (await readAdminJson(
          await fetch(`/api/admin/bulletins/preview-context?${query}`, {
            cache: "no-store",
            signal: controller.signal
          })
        )) as BulletinPreviewContext;
        if (!controller.signal.aborted) setContext({ weekStart, data });
      } catch (error) {
        if (!controller.signal.aborted)
          setContext({
            weekStart,
            error:
              error instanceof Error
                ? error.message
                : "Podklady náhľadu sa nepodarilo načítať."
          });
      }
    }

    void load();
    return () => controller.abort();
  }, [weekStart, validWeek, attempt]);

  if (!validWeek)
    return (
      <p className={styles.message} role="alert">
        Pre náhľad vyberte platný pondelok týždňa.
      </p>
    );
  if (context?.weekStart !== weekStart || (!context.data && !context.error))
    return (
      <p className={styles.message} role="status">
        Načítavam náhľad…
      </p>
    );
  if (context.error)
    return (
      <div className={styles.message} role="alert">
        <p>{context.error}</p>
        <TechnicalSupport />
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Skúsiť znova
        </button>
      </div>
    );

  const data = context.data!;
  const { days, bulletin } = getPublicWeek(
    [{ ...record.draft, published: true }, ...data.bulletins],
    weekStart,
    data.regularSchedule
  );

  return (
    <BulletinContent
      days={days}
      today={getLocalDate()}
      bulletin={bulletin}
      phone={data.phone}
    />
  );
}

/** Pure local draft rendering; opening this view never saves or publishes. */
export function RecordLivePreview({ record }: { record: ContentRecord }) {
  let content: ReactNode;

  if (record.kind === "bulletin") {
    content = <BulletinPreview record={record} />;
  } else if (record.kind === "settings") {
    content = <p className={styles.message}>Nastavenia farnosti</p>;
  } else if (!validDate(record.draft.date)) {
    content = (
      <p className={styles.message} role="alert">
        Pre náhľad doplňte platný dátum.
      </p>
    );
  } else {
    content = (
      <EditorialDetail
        entry={record.draft}
        preview
        kind={record.kind === "article" ? "article" : "news"}
      />
    );
  }

  return (
    <div className={styles.surface}>
      <PreviewBoundary key={JSON.stringify(record.draft)}>
        {content}
      </PreviewBoundary>
    </div>
  );
}

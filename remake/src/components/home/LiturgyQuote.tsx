"use client";

import { useEffect, useRef, useState } from "react";
import {
  liturgySourceUrl,
  type DailyLiturgy,
  type GospelVerse
} from "@/content/liturgy";
import type { CalendarDate } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import styles from "./LiturgyQuote.module.css";

function normalizedTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function selectVerse(verses: GospelVerse[], liturgy?: string) {
  const title = normalizedTitle(liturgy ?? "");
  // Prefer the parish's celebration when KBS offers optional memorials.
  // Otherwise use the first appointed set.
  return (
    (title &&
      verses.find((verse) => {
        const celebration = normalizedTitle(verse.celebration);
        return (
          celebration &&
          (title.includes(celebration) || celebration.includes(title))
        );
      })) ||
    verses[0]
  );
}

export function LiturgyQuote({
  date,
  liturgy
}: {
  date: CalendarDate;
  liturgy?: string;
}) {
  const cache = useRef(new Map<CalendarDate, DailyLiturgy>());
  const [loaded, setLoaded] = useState<DailyLiturgy | null>(null);

  useEffect(() => {
    const existing = cache.current.get(date);
    if (existing) {
      setLoaded(existing);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/liturgy?date=${date}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Liturgy unavailable");
        const data: DailyLiturgy = await response.json();
        if (controller.signal.aborted) return;
        if (
          data?.date !== date ||
          !Array.isArray(data.verses) ||
          !data.verses.every(
            (verse) =>
              typeof verse?.text === "string" &&
              typeof verse.celebration === "string" &&
              (verse.variant === undefined || typeof verse.variant === "string")
          )
        )
          throw new Error("Invalid liturgy response");

        cache.current.set(date, data);
        setLoaded(data);
      } catch {
        // Reflection is optional; the Mass schedule must not wait for a provider.
        if (!controller.signal.aborted) setLoaded({ date, verses: [] });
      }
    })();

    return () => controller.abort();
  }, [date]);

  // Never show yesterday's verse while another day's request is in flight.
  const current = loaded?.date === date ? loaded : null;
  const verse = current ? selectVerse(current.verses, liturgy) : undefined;
  if (current && !verse) return null;

  const calendarLabel = `Liturgický kalendár · ${formatDate(date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })}`;

  return (
    <div className={styles.space}>
      {verse ? (
        <a
          className={styles.calendarLink}
          href={liturgySourceUrl(date)}
          target="_blank"
          rel="noopener noreferrer"
          title={calendarLabel}
        >
          <figure className={styles.quote}>
            <blockquote cite={liturgySourceUrl(date)}>
              <span
                className={`${styles.mark} ${styles.openMark}`}
                aria-hidden="true"
              >
                “
              </span>
              <p>{verse.text}</p>
              <span
                className={`${styles.mark} ${styles.closeMark}`}
                aria-hidden="true"
              >
                ”
              </span>
            </blockquote>
          </figure>
          <span className="srOnly">
            {calendarLabel} (otvorí sa v novom okne)
          </span>
        </a>
      ) : null}
    </div>
  );
}

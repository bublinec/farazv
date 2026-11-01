"use client";

import { useEffect, useRef, useState } from "react";
import {
  liturgySourceUrl,
  type DailyLiturgy,
  type GospelVerse
} from "@/content/liturgy";
import type { CalendarDate } from "@/content/types";
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
  // Otherwise use the first appointed set, keeping its variant in the credit.
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

  return (
    <div className={styles.space}>
      {verse ? (
        <figure className={styles.quote}>
          <span className={styles.mark} aria-hidden="true">
            “
          </span>
          <blockquote cite={liturgySourceUrl(date)}>
            <p>{verse.text}</p>
          </blockquote>
          <figcaption>
            {verse.variant ? <span>{verse.variant} · </span> : null}
            <a
              href={liturgySourceUrl(date)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Liturgický kalendár
              <span className="srOnly"> (otvorí sa v novom okne)</span>
            </a>
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}

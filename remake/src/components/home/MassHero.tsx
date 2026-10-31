"use client";

import type { PublicDesign } from "@/content/design";
import Link from "next/link";
import { useRef, useState } from "react";
import type { CalendarDate, MediaAsset, ScheduleDay } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import styles from "./MassHero.module.css";

export function MassHero({
  days,
  today,
  image,
  design = "current"
}: {
  days: ScheduleDay[];
  today: CalendarDate;
  image: MediaAsset;
  design?: PublicDesign;
}) {
  const [selected, setSelected] = useState(today);
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const index = Math.max(
    0,
    days.findIndex((day) => day.date === selected)
  );
  const day = days[index];

  if (!day) return null;

  const isToday = day.date === today;
  const parishDesign = design === "parish";
  const move = (offset: number) => {
    const next = days[index + offset];

    if (next) setSelected(next.date);
  };

  return (
    <section
      className={`${styles.hero}${parishDesign ? ` ${styles.parish}` : ""}`}
      aria-label="Rozpis svätých omší"
    >
      <MediaImage
        image={image}
        priority
        sizes={parishDesign ? "(max-width: 750px) 100vw, 47vw" : "100vw"}
        className={styles.background}
      />
      {parishDesign ? (
        <Link href="/farnost/galeria" className={styles.photoCaption}>
          <strong>Kostol sv. Alžbety</strong>
          <span>Fotografia: Claudia Nemcová</span>
        </Link>
      ) : null}
      <div
        className={`container ${styles.inner}`}
        onTouchStart={(event) => {
          startTouch.current = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
          };
        }}
        onTouchEnd={(event) => {
          const start = startTouch.current;

          if (!start) return;

          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;

          if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5)
            move(dx < 0 ? 1 : -1);

          startTouch.current = null;
        }}
      >
        <div className={styles.content} aria-live="polite" aria-atomic="true">
          <p className={styles.eyebrow}>
            {day.isRegular
              ? day.masses.length
                ? "Pravidelné sväté omše"
                : "Rozpis nie je zverejnený"
              : isToday
              ? "Dnešná liturgia"
              : "Liturgia dňa"}
          </p>
          <h1>
            {day.isRegular
              ? day.masses.length
                ? "Sme tu pre vás každý deň"
                : "Informujte sa o čase svätej omše"
              : day.liturgy || "Sväté omše v našej farnosti"}
          </h1>
          <div className={styles.divider}>
            <span />
            <Icon name="cross" size={25} />
            <span />
          </div>
          <p className={styles.date}>
            {parishDesign ? (
              <span className={styles.dayStatus}>
                {isToday ? "Dnes" : "Vybraný deň"}
              </span>
            ) : null}
            <time dateTime={day.date}>
              {formatDate(day.date, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </time>
          </p>
          {day.isRegular ? (
            <p className={styles.notice}>
              {day.masses.length
                ? "Podrobný rozpis ešte nie je zverejnený. Časy sú pravidelné, môžu sa zmeniť."
                : "Podrobný rozpis ani pravidelné časy ešte nie sú potvrdené. Aktuálne informácie vám poskytne farská kancelária."}
            </p>
          ) : null}
          {day.status === "no-masses" ? (
            <p className={styles.noMass}>
              V tento deň nie sú naplánované sväté omše.
            </p>
          ) : (
            <div className={styles.masses}>
              {day.masses.map((mass, i) => (
                <div
                  className={styles.mass}
                  key={`${mass.time}-${mass.location}-${i}`}
                >
                  <span className={styles.location}>
                    {mass.location || "Sv. Alžbeta"}
                  </span>
                  <strong>{mass.time}</strong>
                  <span className={styles.celebrant}>
                    {mass.celebrant || mass.label || "Svätá omša"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href="/farnost/farske-oznamy" className={styles.bulletinLink}>
            Celý rozpis a farské oznamy
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={index === 0}
            aria-label="Predchádzajúci deň"
            className={styles.direction}
          >
            <Icon name="arrow-left" size={19} />
            <span>Predchádzajúci</span>
          </button>
          <div className={styles.days} role="group" aria-label="Vybrať deň">
            {days.map((item) => (
              <button
                type="button"
                key={item.date}
                onClick={() => setSelected(item.date)}
                className={`${styles.dayButton} ${
                  item.date === day.date ? styles.selected : ""
                } ${parishDesign && item.date === today ? styles.today : ""}`}
                aria-pressed={item.date === day.date}
                aria-current={
                  parishDesign && item.date === today ? "date" : undefined
                }
                aria-label={`${
                  item.date === today
                    ? "Dnes"
                    : formatDate(item.date, {
                        weekday: "short",
                        day: undefined,
                        month: undefined
                      }).replace(".", "")
                } ${formatDate(item.date, {
                  day: "numeric",
                  month: undefined
                }).replace(".", "")} · ${formatDate(item.date, {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })}`}
              >
                <span>
                  {item.date === today
                    ? "Dnes"
                    : formatDate(item.date, {
                        weekday: "short",
                        day: undefined,
                        month: undefined
                      }).replace(".", "")}
                </span>{" "}
                <strong>
                  {formatDate(item.date, {
                    day: "numeric",
                    month: undefined
                  }).replace(".", "")}
                </strong>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={index === days.length - 1}
            aria-label="Nasledujúci deň"
            className={styles.direction}
          >
            <span>Nasledujúci</span>
            <Icon name="arrow-right" size={19} />
          </button>
        </div>
        {!isToday ? (
          <button
            type="button"
            className={styles.backToday}
            onClick={() => setSelected(today)}
          >
            Späť na dnes
          </button>
        ) : null}
      </div>
    </section>
  );
}

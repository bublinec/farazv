"use client";

import { useRef, useState } from "react";
import type { CalendarDate, MediaAsset, ScheduleDay } from "@/content/types";
import { bulletinPendingMessage } from "@/content/bulletin-messages";
import { formatDate } from "@/lib/calendar";
import { formatCelebrantName, getMassLabel } from "@/lib/mass";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { LiturgyQuote } from "./LiturgyQuote";
import styles from "./MassHero.module.css";

/** Separate an imported liturgical rank from the celebration's name. */
function liturgicalHeading(day: ScheduleDay) {
  const original = day.isRegular
    ? "Rozpis svätých omší"
    : (day.liturgy || "Sväté omše v našej farnosti")
        .replace(/\s+/g, " ")
        .trim();
  const rank = original.match(
    /(?:\s*[·,;–—-]\s*|\s+)(prikázaná slávnosť|ľubovoľná spomienka|spomienka|sviatok|slávnosť)\s*$/iu
  );
  const name = rank ? original.slice(0, rank.index).trim() : original;

  return {
    // This imported all-caps celebration has no personal names to recase.
    // Keep other names as entered rather than guessing their capitalization.
    title: /^všetkých svätých$/iu.test(name) ? "Všetkých svätých" : name,
    rank: rank
      ? rank[1][0].toLocaleUpperCase("sk") +
        rank[1].slice(1).toLocaleLowerCase("sk")
      : undefined
  };
}

function MassTimes({ day }: { day: ScheduleDay }) {
  if (day.status === "no-masses")
    return (
      <p className={styles.noMass}>
        V tento deň nie sú naplánované sväté omše.
      </p>
    );

  return (
    <div className={styles.masses}>
      {day.masses.map((mass, index) => (
        <div className={styles.mass} key={`${mass.time}-${index}`}>
          <span className={styles.designation}>{getMassLabel(mass)}</span>
          <strong>{mass.time}</strong>
          <span className={styles.celebrant}>
            {formatCelebrantName(mass.celebrant) || "Svätá omša"}
          </span>
        </div>
      ))}
    </div>
  );
}

function HeroDayButton({
  day,
  today,
  selected,
  onSelect
}: {
  day: ScheduleDay;
  today: CalendarDate;
  selected: boolean;
  onSelect: (date: CalendarDate) => void;
}) {
  const isToday = day.date === today;
  const dayLabel = isToday
    ? "Dnes"
    : formatDate(day.date, {
        weekday: "short",
        day: undefined,
        month: undefined
      }).replace(".", "");
  const dayNumber = formatDate(day.date, {
    day: "numeric",
    month: undefined
  }).replace(".", "");
  const fullDate = formatDate(day.date, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(day.date)}
      className={`${styles.dayButton} ${selected ? styles.selected : ""} ${
        isToday ? styles.today : ""
      }`}
      aria-pressed={selected}
      aria-current={isToday ? "date" : undefined}
      aria-label={`${dayLabel} ${dayNumber} · ${fullDate}`}
    >
      <span>{dayLabel}</span> <strong>{dayNumber}</strong>
    </button>
  );
}

function DayNavigation({
  days,
  today,
  index,
  onSelect,
  onMove
}: {
  days: ScheduleDay[];
  today: CalendarDate;
  index: number;
  onSelect: (date: CalendarDate) => void;
  onMove: (offset: number) => void;
}) {
  return (
    <div className={styles.navigation}>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Predchádzajúci deň"
          className={styles.direction}
        >
          <Icon name="arrow-left" size={19} />
          <span>Predchádzajúci</span>
        </button>
        <div className={styles.days} role="group" aria-label="Vybrať deň">
          {days.map((day) => (
            <HeroDayButton
              key={day.date}
              day={day}
              today={today}
              selected={day.date === days[index]?.date}
              onSelect={onSelect}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === days.length - 1}
          aria-label="Nasledujúci deň"
          className={styles.direction}
        >
          <span>Nasledujúci</span>
          <Icon name="arrow-right" size={19} />
        </button>
      </div>
    </div>
  );
}

export function MassHero({
  days,
  today,
  image,
  announcementsPending = false
}: {
  days: ScheduleDay[];
  today: CalendarDate;
  image: MediaAsset;
  announcementsPending?: boolean;
}) {
  const [selected, setSelected] = useState(today);
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const index = Math.max(
    0,
    days.findIndex((day) => day.date === selected)
  );
  const day = days[index];

  if (!day) return null;
  const heading = liturgicalHeading(day);

  const move = (offset: number) => {
    const next = days[index + offset];

    if (next) setSelected(next.date);
  };

  return (
    <section className={styles.hero} aria-label="Rozpis svätých omší">
      <MediaImage
        image={image}
        priority
        quality="high"
        sizes="100vw"
        className={styles.background}
      />
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
          <header className={styles.liturgyHeading}>
            <p className="srOnly">
              <time dateTime={day.date}>
                {formatDate(day.date, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </time>
            </p>
            <h1>{heading.title}</h1>
            {heading.rank ? (
              <p className={styles.rank}>{heading.rank}</p>
            ) : null}
          </header>
          <LiturgyQuote date={day.date} liturgy={day.liturgy} />
          <div className={styles.divider} aria-hidden="true">
            <span />
            <Icon name="cross" size={25} />
            <span />
          </div>
          {announcementsPending || day.isRegular ? (
            <p className={styles.notice}>
              {announcementsPending ? <>{bulletinPendingMessage} </> : null}
              {day.isRegular
                ? day.masses.length
                  ? "Uvádzame pravidelné časy svätých omší, ktoré sa môžu zmeniť."
                  : "Časy svätých omší ešte nie sú potvrdené. Informujte sa vo farskej kancelárii."
                : null}
            </p>
          ) : null}
          <MassTimes day={day} />
        </div>
        <DayNavigation
          days={days}
          today={today}
          index={index}
          onSelect={setSelected}
          onMove={move}
        />
      </div>
    </section>
  );
}

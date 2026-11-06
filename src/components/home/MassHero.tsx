"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarDate, MediaAsset, ScheduleDay } from "@/content/types";
import { bulletinPendingMessage } from "@/content/bulletin-messages";
import { formatDate } from "@/lib/calendar";
import { splitLiturgy } from "@/lib/liturgy-day";
import { formatCelebrantName, getMassLabel } from "@/lib/mass";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { LiturgyQuote } from "./LiturgyQuote";
import styles from "./MassHero.module.css";

function liturgicalHeading(day: ScheduleDay) {
  const liturgy = splitLiturgy(day.liturgy, day.liturgyType);
  const name = day.isRegular
    ? "Rozpis svätých omší"
    : liturgy.liturgy || "Sväté omše v našej farnosti";

  return {
    // This imported all-caps celebration has no personal names to recase.
    // Keep other names as entered rather than guessing their capitalization.
    title: /^všetkých svätých$/iu.test(name) ? "Všetkých svätých" : name,
    liturgyType: day.isRegular ? undefined : liturgy.liturgyType
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

function HeroDaySlide({
  day,
  announcementsPending,
  leaving = false,
  animationClass = "",
  onAnimationEnd
}: {
  day: ScheduleDay;
  announcementsPending: boolean;
  leaving?: boolean;
  animationClass?: string;
  onAnimationEnd?: () => void;
}) {
  const heading = liturgicalHeading(day);
  const Heading = leaving ? "h2" : "h1";

  return (
    <div
      className={`${styles.content} ${animationClass} ${
        leaving ? styles.leaving : ""
      }`}
      data-current-slide={leaving ? undefined : true}
      aria-hidden={leaving || undefined}
      inert={leaving || undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onAnimationEnd?.();
      }}
    >
      <header className={styles.liturgyHeading}>
        {!leaving ? (
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
        ) : null}
        <Heading>{heading.title}</Heading>
        {heading.liturgyType ? (
          <p className={styles.liturgyType}>{heading.liturgyType}</p>
        ) : null}
      </header>
      <LiturgyQuote date={day.date} liturgy={heading.title} />
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
  const dayStrip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = dayStrip.current;
    if (!strip) return;

    const alignSelected = (smooth: boolean) => {
      const selected = strip.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]'
      );
      if (!selected) return;

      const stripBounds = strip.getBoundingClientRect();
      const bounds = selected.getBoundingClientRect();
      strip.scrollTo({
        left:
          strip.scrollLeft +
          bounds.left -
          stripBounds.left -
          (strip.clientWidth - bounds.width) / 2,
        behavior:
          smooth &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "smooth"
            : "auto"
      });
    };

    alignSelected(true);
    const resize = () => alignSelected(false);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [index]);

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
        <div
          ref={dayStrip}
          className={styles.days}
          role="group"
          aria-label="Vybrať deň"
        >
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
  const [previous, setPrevious] = useState<CalendarDate | null>(null);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const index = Math.max(
    0,
    days.findIndex((day) => day.date === selected)
  );
  const day = days[index];

  useEffect(() => {
    if (!previous) return;

    // Also clear a transition cancelled by a changed motion preference.
    const timer = window.setTimeout(() => setPrevious(null), 350);
    return () => window.clearTimeout(timer);
  }, [previous, selected]);

  if (!day) return null;
  const previousDay = days.find((entry) => entry.date === previous);

  function select(date: CalendarDate) {
    const target = days.findIndex((entry) => entry.date === date);
    if (target < 0 || target === index) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setPrevious(reducedMotion ? null : day.date);
    setDirection(target > index ? "next" : "previous");
    setSelected(date);
  }

  const move = (offset: number) => {
    const next = days[index + offset];

    if (next) select(next.date);
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
      <div className={`container ${styles.inner}`}>
        <div
          className={styles.viewport}
          aria-live="polite"
          aria-atomic="true"
          onTouchStart={(event) => {
            if (event.touches.length !== 1) {
              startTouch.current = null;
              return;
            }

            startTouch.current = {
              x: event.touches[0].clientX,
              y: event.touches[0].clientY
            };
          }}
          onTouchEnd={(event) => {
            const start = startTouch.current;
            startTouch.current = null;

            if (!start || event.touches.length) return;

            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;

            if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5)
              move(dx < 0 ? 1 : -1);
          }}
          onTouchCancel={() => {
            startTouch.current = null;
          }}
        >
          {previousDay ? (
            <HeroDaySlide
              key={previousDay.date}
              day={previousDay}
              announcementsPending={announcementsPending}
              leaving
              animationClass={
                direction === "next" ? styles.leaveNext : styles.leavePrevious
              }
            />
          ) : null}
          <HeroDaySlide
            key={day.date}
            day={day}
            announcementsPending={announcementsPending}
            animationClass={
              previousDay
                ? direction === "next"
                  ? styles.enterNext
                  : styles.enterPrevious
                : ""
            }
            onAnimationEnd={() => setPrevious(null)}
          />
        </div>
        <DayNavigation
          days={days}
          today={today}
          index={index}
          onSelect={select}
          onMove={move}
        />
      </div>
    </section>
  );
}

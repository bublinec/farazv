"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import { splitLiturgy } from "@/lib/liturgy-day";
import { Icon } from "@/components/ui/Icon";
import styles from "./WeeklySchedule.module.css";

export function WeeklySchedule({
  days,
  today,
  scrollToTodayOnMobile = false
}: {
  days: ScheduleDay[];
  today: CalendarDate;
  scrollToTodayOnMobile?: boolean;
}) {
  const initialDay = days.some((day) => day.date === today)
    ? today
    : days[0]?.date ?? today;
  const [expanded, setExpanded] = useState<CalendarDate[]>([initialDay]);
  const allExpanded = days.length > 0 && expanded.length === days.length;
  const firstDay = days[0];
  const lastDay = days.at(-1);
  const todaySection = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      !scrollToTodayOnMobile ||
      !window.matchMedia("(max-width: 800px)").matches
    )
      return;

    const target = todaySection.current;
    const hash = window.location.hash;
    const todayAnchors = [
      `#day-${today}`,
      `#day-heading-${today}`,
      `#schedule-${today}`
    ];
    if (!target || (hash && !todayAnchors.includes(hash))) return;

    let cancelled = false;
    let frame = 0;
    const cancel = () => {
      cancelled = true;
    };
    const settleAndScroll = () => {
      void document.fonts.ready.then(() => {
        if (cancelled) return;

        // Run after native history/hash restoration and the final font layout.
        frame = window.requestAnimationFrame(() => {
          frame = window.requestAnimationFrame(() => {
            if (
              cancelled ||
              !target.isConnected ||
              (window.location.hash &&
                !todayAnchors.includes(window.location.hash))
            )
              return;

            window.scrollTo({
              top: Math.max(
                0,
                target.getBoundingClientRect().top + window.scrollY - 24
              ),
              behavior: "instant"
            });
          });
        });
      });
    };

    const interactions = [
      "pointerdown",
      "touchstart",
      "wheel",
      "keydown"
    ] as const;
    for (const event of interactions) {
      window.addEventListener(event, cancel, { once: true, passive: true });
    }

    if (document.readyState === "complete") settleAndScroll();
    else window.addEventListener("load", settleAndScroll, { once: true });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", settleAndScroll);
      for (const event of interactions)
        window.removeEventListener(event, cancel);
    };
  }, [scrollToTodayOnMobile, today]);

  function toggle(date: CalendarDate) {
    setExpanded((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
    );
  }

  return (
    <div className={styles.schedule}>
      <div className={styles.heading}>
        <div>
          <h2>Rozpis svätých omší</h2>
          {firstDay && lastDay ? (
            <p className={styles.weekRange}>
              <time dateTime={firstDay.date}>
                {formatDate(firstDay.date, {
                  month: "long",
                  year:
                    firstDay.date.slice(0, 4) === lastDay.date.slice(0, 4)
                      ? undefined
                      : "numeric"
                })}
              </time>
              {" – "}
              <time dateTime={lastDay.date}>
                {formatDate(lastDay.date, { month: "long", year: "numeric" })}
              </time>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() =>
            setExpanded(
              allExpanded ? [initialDay] : days.map((day) => day.date)
            )
          }
        >
          {allExpanded ? "Zbaliť týždeň" : "Rozbaliť celý týždeň"}
        </button>
      </div>
      <div className={styles.days}>
        {days.map((day) => {
          const open = expanded.includes(day.date);
          const liturgy = splitLiturgy(day.liturgy, day.liturgyType);
          const weekday = formatDate(day.date, {
            weekday: "long",
            day: undefined,
            month: undefined
          });

          return (
            <section
              key={day.date}
              className={`${styles.day} ${
                day.date === today ? styles.today : ""
              }`}
              id={`day-${day.date}`}
              ref={day.date === today ? todaySection : undefined}
              aria-labelledby={`day-heading-${day.date}`}
              tabIndex={-1}
            >
              <h3 id={`day-heading-${day.date}`}>
                <button
                  type="button"
                  className={styles.dayToggle}
                  onClick={() => toggle(day.date)}
                  aria-expanded={open}
                  aria-controls={`schedule-${day.date}`}
                >
                  <span className={styles.dayNumber}>
                    {formatDate(day.date, {
                      day: "numeric",
                      month: undefined
                    }).replace(".", "")}
                    <small>
                      {formatDate(day.date, { month: "short", day: undefined })}
                    </small>
                  </span>
                  <span className={styles.dayName}>
                    <span className={styles.dayHeading}>
                      {weekday}
                      {day.date === today ? <em>Dnes</em> : null}
                    </span>
                    {!day.isRegular && liturgy.liturgy ? (
                      <small className={styles.liturgyTitle}>
                        {liturgy.liturgy}
                      </small>
                    ) : null}
                    {day.isRegular ? (
                      <small>
                        {day.masses.length
                          ? "Pravidelné časy · rozpis nie je zverejnený"
                          : "Rozpis nie je zverejnený"}
                      </small>
                    ) : liturgy.liturgyType ? (
                      <small className={styles.liturgyType}>
                        {liturgy.liturgyType}
                      </small>
                    ) : null}
                    {day.status === "no-masses" ? (
                      <small>Bez svätej omše</small>
                    ) : null}
                  </span>
                  <Icon
                    name="chevron"
                    size={17}
                    className={open ? styles.rotated : undefined}
                  />
                </button>
              </h3>
              <div
                id={`schedule-${day.date}`}
                hidden={!open}
                className={styles.details}
              >
                {day.status === "no-masses" ? (
                  <p className={styles.empty}>
                    V tento deň nie sú naplánované sväté omše.
                  </p>
                ) : (
                  day.masses.map((mass, index) => (
                    <div className={styles.mass} key={`${mass.time}-${index}`}>
                      <strong className={styles.time}>{mass.time}</strong>
                      <div className={styles.massBody}>
                        {mass.label?.trim() ? (
                          <p className={styles.massName}>{mass.label}</p>
                        ) : null}
                        {mass.intention ? (
                          <p className={styles.intention}>{mass.intention}</p>
                        ) : null}
                      </div>
                      {mass.celebrant ? (
                        <span className={styles.celebrant}>
                          {mass.celebrant}
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
                {day.isRegular ? (
                  <p className={styles.empty}>
                    {day.masses.length
                      ? "Časy sú pravidelné a môžu sa zmeniť. Celebrant ani úmysel nie sú potvrdení."
                      : "Časy svätých omší ešte nie sú potvrdené. Informujte sa vo farskej kancelárii."}
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

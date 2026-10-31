"use client";

import { useState } from "react";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { formatDate } from "@/lib/calendar";
import { Icon } from "@/components/ui/Icon";
import styles from "./WeeklySchedule.module.css";

export function WeeklySchedule({
  days,
  today
}: {
  days: ScheduleDay[];
  today: CalendarDate;
}) {
  const [expanded, setExpanded] = useState<CalendarDate[]>([today]);
  const allExpanded = expanded.length === days.length;
  function toggle(date: CalendarDate) {
    setExpanded((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
    );
  }
  return (
    <div>
      <div className={styles.heading}>
        <h2>Rozpis svätých omší</h2>
        <button
          type="button"
          onClick={() =>
            setExpanded(allExpanded ? [today] : days.map((day) => day.date))
          }
        >
          {allExpanded ? "Zbaliť týždeň" : "Rozbaliť celý týždeň"}
        </button>
      </div>
      <div className={styles.days}>
        {days.map((day) => {
          const open = expanded.includes(day.date);
          return (
            <section
              key={day.date}
              className={`${styles.day} ${
                day.date === today ? styles.today : ""
              }`}
              aria-labelledby={`day-heading-${day.date}`}
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
                    <span>
                      {formatDate(day.date, {
                        weekday: "long",
                        day: undefined,
                        month: undefined
                      })}
                      {day.date === today ? <em>Dnes</em> : null}
                    </span>
                    <small>
                      {day.isRegular
                        ? day.masses.length
                          ? "Pravidelné časy · rozpis nie je zverejnený"
                          : "Rozpis nie je zverejnený"
                        : day.liturgy || "Liturgia dňa"}
                    </small>
                  </span>
                  <span className={styles.times}>
                    {day.status === "no-masses"
                      ? "Bez svätej omše"
                      : day.masses.map((mass) => mass.time).join(" · ")}
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
                      <div>
                        <p className={styles.massName}>
                          {mass.location || "Kostol sv. Alžbety"}
                          {mass.label ? <span> · {mass.label}</span> : null}
                        </p>
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

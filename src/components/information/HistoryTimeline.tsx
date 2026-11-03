import type { HistoryMilestone } from "@/content/types";
import styles from "./HistoryTimeline.module.css";

export function HistoryTimeline({
  events,
  title = "Z histórie kostola",
  credit,
  headingId,
  lineStart = "heading"
}: {
  events?: readonly HistoryMilestone[];
  title?: string;
  credit?: string;
  headingId?: string;
  lineStart?: "heading" | "events";
}) {
  if (!events?.length) return null;

  const lineClass =
    lineStart === "events" ? styles.eventLine : styles.headingLine;

  return (
    <aside
      className={`${styles.timeline} ${lineClass}`}
      aria-label={headingId ? undefined : title}
      aria-labelledby={headingId}
    >
      <h2 id={headingId}>{title}</h2>
      <ol className={styles.events}>
        {events.map((event) => (
          <li className={styles.event} key={`${event.year}-${event.title}`}>
            <span className={styles.year}>{event.year}</span>
            <h3>{event.title}</h3>
            <p>{event.text}</p>
          </li>
        ))}
      </ol>
      {credit ? <p className={styles.credit}>{credit}</p> : null}
    </aside>
  );
}

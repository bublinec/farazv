import type { InformationPageDefinition } from "@/content/information";
import styles from "./InformationPage.module.css";

export function HistoryTimeline({
  events,
  title = "Z histórie kostola",
  credit
}: {
  events: InformationPageDefinition["timeline"];
  title?: string;
  credit?: string;
}) {
  if (!events?.length) return null;

  return (
    <aside className={styles.timeline} aria-label={title}>
      <h2>{title}</h2>
      {events.map((event) => (
        <div className={styles.timelineEvent} key={event.year}>
          <span className={styles.timelineYear}>{event.year}</span>
          <h3>{event.title}</h3>
          <p>{event.text}</p>
        </div>
      ))}
      {credit ? <p className={styles.credit}>{credit}</p> : null}
    </aside>
  );
}

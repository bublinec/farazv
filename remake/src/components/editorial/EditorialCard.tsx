import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { editorialPath, formatEditorialDate } from "@/lib/editorial";
import type { EditorialKind, EditorialSummary } from "@/lib/editorial";
import styles from "./EditorialCard.module.css";

interface EditorialCardProps {
  entry: EditorialSummary;
  kind: EditorialKind;
  featured?: boolean;
}

export function EditorialCard({
  entry,
  kind,
  featured = false
}: EditorialCardProps) {
  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ""} ${
        entry.cover ? "" : styles.withoutImage
      }`}
    >
      <Link href={editorialPath(entry, kind)} className={styles.link}>
        {entry.cover && (
          <div className={styles.image}>
            <MediaImage
              image={entry.cover}
              sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              fit="cover"
            />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.metadata}>
            <time dateTime={entry.date}>{formatEditorialDate(entry.date)}</time>
          </div>
          <h3>{entry.title}</h3>
          {entry.excerpt && <p>{entry.excerpt}</p>}
          <span className={styles.readMore}>
            {kind === "article" ? "Čítať ďalej" : "Zistiť viac"}{" "}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

export function EditorialGrid({
  entries,
  kind
}: {
  entries: readonly EditorialSummary[];
  kind: EditorialKind;
}) {
  return (
    <div
      className={`${styles.grid} ${entries.length === 2 ? styles.pair : ""}`}
    >
      {entries.map((entry) => (
        <EditorialCard key={entry.id} entry={entry} kind={kind} />
      ))}
    </div>
  );
}

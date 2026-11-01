import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { editorialPath, formatEditorialDate } from "@/lib/editorial";
import type { EditorialKind, EditorialSummary } from "@/lib/editorial";
import styles from "./EditorialCard.module.css";

interface EditorialCardProps {
  entry: EditorialSummary;
  kind: EditorialKind;
  imageSizes?: string;
}

export function EditorialCard({ entry, kind, imageSizes }: EditorialCardProps) {
  const isPost = kind === "news";

  return (
    <article
      className={`${styles.card} ${isPost ? styles.postCard : ""} ${
        entry.cover ? "" : styles.withoutImage
      }`}
    >
      <Link href={editorialPath(entry, kind)} className={styles.link}>
        {entry.cover && (
          <div className={styles.image}>
            <MediaImage
              image={entry.cover}
              sizes={
                imageSizes ??
                (isPost
                  ? "(max-width: 600px) 90vw, 300px"
                  : "(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw")
              }
              fit={isPost ? "contain" : "cover"}
              quality={isPost ? "high" : "standard"}
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
  kind,
  compact = false
}: {
  entries: readonly EditorialSummary[];
  kind: EditorialKind;
  compact?: boolean;
}) {
  const isPair = kind === "article" && entries.length === 2;
  const imageSizes = isPair
    ? "(max-width: 600px) 100vw, (max-width: 1280px) 50vw, 590px"
    : compact && kind === "news" && entries.length > 1
    ? "(max-width: 600px) 100vw, (max-width: 1100px) 300px, 220px"
    : undefined;

  return (
    <div
      className={
        kind === "news"
          ? `${styles.postGrid} ${compact ? styles.compactPosts : ""}`
          : `${styles.grid} ${isPair ? styles.pair : ""}`
      }
    >
      {entries.map((entry) => (
        <EditorialCard
          key={entry.id}
          entry={entry}
          kind={kind}
          imageSizes={imageSizes}
        />
      ))}
    </div>
  );
}

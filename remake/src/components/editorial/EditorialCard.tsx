import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { editorialPath, formatEditorialDate } from "@/lib/editorial";
import type { EditorialKind, EditorialSummary } from "@/lib/editorial";
import styles from "./EditorialCard.module.css";

const imageSlots = {
  article: "(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw",
  post: "(max-width: 600px) 90vw, 260px",
  articlePair: "(max-width: 600px) 100vw, (max-width: 1280px) 50vw, 590px",
  articleGrid:
    "(max-width: 600px) 100vw, (max-width: 980px) 50vw, (max-width: 1150px) 33vw, 25vw",
  compactPost: "(max-width: 600px) 100vw, 260px",
  featuredPost: "(max-width: 600px) 100vw, (max-width: 1100px) 260px, 320px"
};

interface EditorialCardProps {
  entry: EditorialSummary;
  kind: EditorialKind;
  imageSizes?: string;
}

export function EditorialCard({ entry, kind, imageSizes }: EditorialCardProps) {
  const isPost = kind === "news";
  const defaultImageSizes = isPost ? imageSlots.post : imageSlots.article;

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
              sizes={imageSizes ?? defaultImageSizes}
              fit="cover"
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
  const isPost = kind === "news";
  const hasFeaturedPost = compact && isPost && entries.length % 2 === 1;
  const classes = [isPost ? styles.postGrid : styles.grid];
  let imageSizes: string | undefined;

  if (isPost) {
    if (compact) classes.push(styles.compactPosts);
    if (compact && entries.length > 1) imageSizes = imageSlots.compactPost;
  } else if (entries.length === 2) {
    classes.push(styles.pair);
    imageSizes = imageSlots.articlePair;
  } else if (entries.length >= 4) {
    imageSizes = imageSlots.articleGrid;
  }

  return (
    <div className={classes.join(" ")}>
      {entries.map((entry, index) => (
        <EditorialCard
          key={entry.id}
          entry={entry}
          kind={kind}
          imageSizes={
            hasFeaturedPost && index === 0
              ? imageSlots.featuredPost
              : imageSizes
          }
        />
      ))}
    </div>
  );
}

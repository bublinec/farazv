import Link from "next/link";
import type { CSSProperties } from "react";
import type { ContentBlock, EditorialEntry } from "@/content/types";
import { pageMetadata } from "@/lib/seo";
import { editorialStructuredData } from "@/lib/structured-data";
import { StructuredData } from "@/components/ui/StructuredData";
import type { EditorialDocument } from "@/content/documents";
import type { EditorialSummary } from "@/lib/editorial";
import { RichText } from "./RichText";
import type { EditorialKind } from "@/lib/editorial";
import {
  editorialPath,
  formatEditorialDate,
  isSafeEditorialLink
} from "@/lib/editorial";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { ImageGallery } from "./ImageGallery";
import { EditorialGrid } from "./EditorialCard";
import styles from "./EditorialDetail.module.css";

function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "paragraph":
        return <p key={index}>{block.text}</p>;
      case "heading":
        return <h2 key={index}>{block.text}</h2>;
      case "quote":
        return (
          <blockquote key={index}>
            <p>{block.text}</p>
          </blockquote>
        );
      case "list":
        return (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );
      case "image":
        return <ImageGallery key={index} images={[block.image]} />;
      case "gallery":
        return <ImageGallery key={index} images={block.images} />;
      case "link":
        return (
          <p key={index}>
            {isSafeEditorialLink(block.href) ? (
              <a href={block.href}>
                {block.label} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              block.label
            )}
          </p>
        );
    }
  });
}

export function EditorialDetail({
  entry,
  kind,
  related = [],
  preview = false,
  notice = false
}: {
  entry: EditorialDocument;
  kind: EditorialKind;
  related?: EditorialSummary[];
  preview?: boolean;
  notice?: boolean;
}) {
  const listingHref =
    kind === "article" ? "/farnost/nase-spolocenstvo" : "/#vyveska";
  const cover = entry.cover ? (
    <MediaImage
      image={entry.cover}
      priority
      sizes="(max-width: 720px) 100vw, 720px"
      fit="contain"
    />
  ) : null;
  return (
    <>
      {!preview && (
        <StructuredData
          data={editorialStructuredData(
            entry,
            notice
              ? `/vyveska/${encodeURIComponent(entry.slug)}`
              : editorialPath(entry, kind)
          )}
        />
      )}
      <article className={styles.article}>
        <div className="container">
          <header className={styles.header}>
            <h1>{entry.title}</h1>
            <div className={styles.metadata}>
              <time dateTime={entry.date}>
                {formatEditorialDate(entry.date)}
              </time>
              {entry.author && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{entry.author}</span>
                </>
              )}
            </div>
            {entry.excerpt && <p className={styles.lead}>{entry.excerpt}</p>}
          </header>
          {entry.cover && (
            <figure
              className={styles.cover}
              style={
                { "--cover-width": `${entry.cover.width}px` } as CSSProperties
              }
            >
              {entry.isPoster ? (
                <ImageLightbox image={entry.cover} label="Zväčšiť plagát:">
                  {cover}
                </ImageLightbox>
              ) : (
                cover
              )}
              {entry.cover.caption && (
                <figcaption>{entry.cover.caption}</figcaption>
              )}
            </figure>
          )}
          <div className={`prose ${styles.body}`}>
            {preview ? (
              <p className={styles.previewNote}>
                Ukážka nového zobrazenia so skráteným textom. Úplné znenie
                pripravujeme.
              </p>
            ) : null}
            {entry.body ? (
              <RichText document={entry.body} className={styles.richText} />
            ) : (
              <ContentRenderer blocks={entry.blocks} />
            )}
            {entry.posterDestination &&
            isSafeEditorialLink(entry.posterDestination) ? (
              <p>
                <a href={entry.posterDestination}>
                  Viac informácií <span aria-hidden="true">↗</span>
                </a>
              </p>
            ) : null}
          </div>
          <footer className={styles.articleFooter}>
            <span>
              {kind === "article"
                ? "Zo života nášho spoločenstva."
                : "Ďakujeme, že ste súčasťou našej farnosti."}
            </span>
            <Link href={listingHref}>
              ← {kind === "article" ? "Všetky články" : "Späť na vývesku"}
            </Link>
          </footer>
        </div>
      </article>
      {related.length > 0 && (
        <section
          className={`section ${styles.related}`}
          aria-labelledby="related-editorial"
        >
          <div className="container">
            <div className={styles.relatedHeading}>
              <h2 id="related-editorial">Ešte chvíľu spolu</h2>
              <Link href={listingHref}>
                {kind === "article" ? "Všetky články" : "Výveska"}{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <EditorialGrid entries={related.slice(0, 3)} kind={kind} />
          </div>
        </section>
      )}
    </>
  );
}

export function editorialMetadata(
  entry: EditorialEntry,
  kind: EditorialKind,
  notice = false
) {
  const path = notice
    ? `/vyveska/${encodeURIComponent(entry.slug)}`
    : editorialPath(entry, kind);
  return pageMetadata({
    title: entry.title,
    description: entry.excerpt,
    path,
    image: entry.cover,
    article: { publishedTime: entry.date, author: entry.author }
  });
}

import type { CSSProperties } from "react";
import type { MediaAsset } from "@/content/types";
import { getPageCover } from "@/content/page-photographs";
import { MediaImage } from "./MediaImage";
import styles from "./PageHero.module.css";

export function PageHero({
  route,
  title,
  description,
  image
}: {
  route?: string;
  title: string;
  description?: string;
  image?: MediaAsset;
}) {
  const cover = route ? getPageCover(route) : undefined;
  const photograph = cover?.image ?? image;
  const crop = cover?.crop;
  const split = cover?.layout === "split";
  const cropStyle = crop
    ? ({
        "--cover-image-width": `${crop.desktopScale * 100}%`,
        "--cover-mobile-position": crop.mobilePosition
      } as CSSProperties)
    : undefined;

  return (
    <section
      className={`pageHero ${styles.hero} ${
        photograph ? styles.photographic : styles.decorative
      } ${split ? styles.split : ""}`}
      style={cropStyle}
    >
      {split && photograph ? (
        <div className={styles.splitBackdrop} aria-hidden="true">
          <MediaImage
            image={{ ...photograph, alt: "" }}
            quality="high"
            sizes="720px"
          />
        </div>
      ) : null}
      {photograph ? (
        <MediaImage
          image={{ ...photograph, alt: "" }}
          priority
          quality="high"
          className={styles.image}
          sizes={
            split
              ? "(max-width: 700px) 100vw, (max-width: 1360px) 50vw, 680px"
              : crop
              ? `(max-width: 700px) 100vw, ${crop.desktopScale * 100}vw`
              : "100vw"
          }
        />
      ) : null}
      <div className={`container ${styles.content}`}>
        <h1>{title}</h1>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </section>
  );
}

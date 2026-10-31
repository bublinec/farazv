import type { CSSProperties } from "react";
import type { MediaAsset } from "@/content/types";
import { getPageCover } from "@/content/page-photographs";
import { MediaImage } from "./MediaImage";
import styles from "./PageHero.module.css";

export function PageHero({
  route,
  title,
  eyebrow = "Farnosť Zvolen – mesto",
  description,
  image
}: {
  route?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  image?: MediaAsset;
}) {
  const cover = route ? getPageCover(route) : undefined;
  const photograph = cover?.image ?? image;
  const crop = cover?.crop;
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
      }`}
      style={cropStyle}
    >
      {photograph ? (
        <MediaImage
          image={{ ...photograph, alt: "" }}
          priority
          quality="high"
          className={styles.image}
          sizes={
            crop
              ? `(max-width: 700px) 100vw, ${crop.desktopScale * 100}vw`
              : "100vw"
          }
        />
      ) : null}
      <div className={`container ${styles.content}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
        <h1>{title}</h1>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </section>
  );
}

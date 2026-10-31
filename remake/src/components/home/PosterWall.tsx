import Link from "next/link";
import type { Poster } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./PosterWall.module.css";

export function PosterWall({ posters }: { posters: Poster[] }) {
  if (!posters.length) return null;
  return (
    <section
      id="vyveska"
      className={`section ${styles.section}`}
      aria-labelledby="noticeboard-heading"
    >
      <div className="container">
        <div id="noticeboard-heading">
          <SectionHeading
            eyebrow="Pozývame vás"
            title="Výveska"
            description="Pozvánky, podujatia a všetko, čo sa práve chystá v našej farnosti."
          />
        </div>
        <div className={styles.grid}>
          {posters.map((poster) => (
            <article key={poster.id} className={styles.poster}>
              <div className={styles.pin} aria-hidden="true" />
              {poster.href ? (
                <Link href={poster.href} className={styles.imageLink}>
                  <span className="srOnly">Zobraziť: {poster.title} </span>
                  <MediaImage
                    image={poster.image}
                    fit="contain"
                    sizes="(max-width: 550px) 75vw, (max-width: 900px) 45vw, 25vw"
                  />
                </Link>
              ) : (
                <ImageLightbox image={poster.image}>
                  <MediaImage
                    image={poster.image}
                    fit="contain"
                    sizes="(max-width: 550px) 75vw, (max-width: 900px) 45vw, 25vw"
                  />
                </ImageLightbox>
              )}
              <div className={styles.caption}>
                <h3>
                  {poster.href ? (
                    <Link href={poster.href}>{poster.title}</Link>
                  ) : (
                    poster.title
                  )}
                </h3>
                {poster.href ? (
                  <Link
                    href={poster.href}
                    aria-label={`Viac informácií: ${poster.title}`}
                  >
                    <Icon name="arrow-right" size={19} />
                  </Link>
                ) : (
                  <Icon name="image" size={18} />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

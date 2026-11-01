import type { InformationPageDefinition } from "@/content/information";
import { PageHero } from "@/components/ui/PageHero";
import { PageLinks } from "./PageSections";
import styles from "./VirtualTourPage.module.css";

export function VirtualTourPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <div className={`container ${styles.content}`}>
        {page.models?.map((model) => {
          const href = `https://sketchfab.com/models/${model.id}`;

          return (
            <section className={styles.model} key={model.id}>
              <div className={styles.heading}>
                <h2>{model.title}</h2>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  Otvoriť na Sketchfab ↗
                </a>
              </div>
              <iframe
                className={styles.frame}
                src={`${href}/embed?autostart=0&ui_controls=1&ui_infos=1&ui_watermark=1&ui_watermark_link=1`}
                title={`3D prehliadka: ${model.title}`}
                loading="lazy"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </section>
          );
        })}
        <PageLinks page={page} />
      </div>
    </>
  );
}

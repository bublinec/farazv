import Link from "next/link";
import {
  requirePublishedInformationContent,
  type InformationPageDefinition
} from "@/content/information";
import { churchHistory } from "@/content/church-history";
import { churchDetails, churchPhotographer } from "@/content/church-details";
import type { MediaAsset } from "@/content/types";
import { richTextToPlainText } from "@/lib/rich-text";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { ImageGallery } from "./ImageGallery";
import { ParishHistoryBanner } from "./ParishHistoryBanner";
import { HistoricalChurchGallery } from "./HistoricalChurchGallery";
import styles from "./SaintElizabethChurchPage.module.css";

function galleryGroups() {
  const source = requirePublishedInformationContent("/farnost/galeria");

  return source.sections
    .filter((section) => section.kind === "galleries")
    .map((section) => {
      const heading = section.body.content.find(
        (node) => node.type === "heading"
      );
      const title = heading
        ? richTextToPlainText({ type: "doc", content: [heading] })
        : "Fotografie kostola";
      const images = section.body.content
        .filter((node) => node.type === "imageGallery")
        .flatMap((node) => (node.attrs?.images as MediaAsset[]) ?? [])
        .map((image, index) => ({
          ...image,
          alt: image.alt || `${title} – fotografia ${index + 1}`
        }));

      return {
        id: section.id,
        title:
          section.id === "components_sections_galleries-6"
            ? "Ďalšie pohľady na farský kostol"
            : title,
        images
      };
    })
    .filter((group) => group.images.length);
}

export function SaintElizabethChurchPage({
  page
}: {
  page: InformationPageDefinition;
}) {
  const galleries = galleryGroups();

  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.history}`}>
        <div className={styles.reading}>
          <SectionHeading
            title="Kostol v premenách storočí"
            action={
              <details className={styles.sourceDetails}>
                <summary>
                  Pramene <Icon name="chevron" size={15} />
                </summary>
                <ul>
                  {Object.values(churchHistory.sources).map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.label}
                        <span className="srOnly">
                          {" "}
                          (otvorí sa v novom okne)
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            }
          />
          {churchHistory.sections.map((section) => (
            <section className={styles.chapter} key={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <div className={styles.sidebar}>
          <aside
            className={styles.timeline}
            aria-labelledby="kostol-timeline-heading"
          >
            <h2 id="kostol-timeline-heading">Časová os kostola</h2>
            <ol>
              {churchHistory.timeline.map((milestone) => (
                <li key={milestone.period}>
                  <span className={styles.period}>{milestone.period}</span>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </li>
              ))}
            </ol>
          </aside>
          <aside className={styles.visit} aria-label="Kostol sv. Alžbety">
            <MediaImage
              image={churchDetails.nave}
              sizes="(max-width: 850px) 90vw, 320px"
              quality="high"
            />
            <div>
              <h2>Náš farský kostol</h2>
              <p>
                Na Námestí SNP vo Zvolene. Miesto modlitby a slávenia sviatostí,
                ktoré spája generácie farníkov.
              </p>
              <Link href="/farnost/farske-oznamy" className="textLink">
                Rozpis svätých omší <Icon name="arrow-right" size={17} />
              </Link>
              <Link href="/kontakt" className="textLink">
                Kontakt na farnosť <Icon name="arrow-right" size={17} />
              </Link>
              <Link href={churchHistory.parishHref} className="textLink">
                O farnosti a jej dejinách <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <HistoricalChurchGallery />
      <section
        id="galeria"
        className={styles.galleries}
        aria-labelledby="kostol-galeria-heading"
      >
        <div className="container">
          <div className={styles.galleryHeading}>
            <h2 id="kostol-galeria-heading">Náš kostol zblízka</h2>
            <p>
              Fotografie prvých dvoch galérií:{" "}
              <a
                href={churchPhotographer.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {churchPhotographer.name}
              </a>
            </p>
          </div>
          {galleries.map((group) => (
            <section
              className={styles.galleryGroup}
              key={group.id}
              aria-labelledby={`galeria-${group.id}`}
            >
              <h3 id={`galeria-${group.id}`}>{group.title}</h3>
              <ImageGallery images={group.images} initialCount={16} />
            </section>
          ))}
        </div>
      </section>
      <section
        id="virtualna-prehliadka"
        className={`container ${styles.tours}`}
        aria-label="Virtuálna prehliadka a 3D modely"
      >
        <SectionHeading
          title="Virtuálna prehliadka"
          description="Prezrite si náš kostol, jeho vežu a detaily v panoramatických pohľadoch."
        />
        <ul className={styles.panoramas}>
          {churchHistory.panoramas.map((panorama) => (
            <li key={panorama.href}>
              <a
                className={styles.panorama}
                href={panorama.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.panoramaMark} aria-hidden="true">
                  360°
                </span>
                <div>
                  <h3>{panorama.title}</h3>
                  <span className={styles.panoramaLink}>
                    Otvoriť 360° prehliadku <Icon name="external" size={15} />
                    <span className="srOnly"> (otvorí sa v novom okne)</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.tourCredit}>
          360° prehliadky: Pavol Albert / ArtSohl.
        </p>
        <div className={styles.modelHeading}>
          <SectionHeading
            title="3D modely"
            description="Kaplnku a oltár si môžete prezrieť aj zblízka v trojrozmernom priestore."
          />
        </div>
        <div className={styles.tourGrid}>
          {churchHistory.tours.map((tour) => (
            <a
              key={tour.href}
              className={styles.tour}
              href={tour.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.tourImage}>
                <MediaImage
                  image={{ ...tour.image, alt: "" }}
                  sizes="(max-width: 650px) 90vw, 45vw"
                  fit="contain"
                />
              </div>
              <div className={styles.tourCopy}>
                <h3>{tour.title}</h3>
                <p>{tour.description}</p>
                <span className="textLink">
                  Otvoriť na Sketchfab <Icon name="external" size={17} />
                  <span className="srOnly"> (otvorí sa v novom okne)</span>
                </span>
              </div>
            </a>
          ))}
        </div>
        <p className={styles.tourCredit}>
          3D modely: Pavol Albert · Otvoria sa na samostatnej stránke Sketchfab.
        </p>
      </section>
      <ParishHistoryBanner currentSlug={page.slug} />
    </>
  );
}

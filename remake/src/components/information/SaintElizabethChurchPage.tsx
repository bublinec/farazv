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
          <SectionHeading title="Kostol v premenách storočí" />
          {churchHistory.sections.map((section) => (
            <section className={styles.chapter} key={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className={styles.sources}>
                Pramene:{" "}
                {section.sources.map((key, index) => {
                  const source = churchHistory.sources[key];
                  return (
                    <span key={key}>
                      {index ? " · " : ""}
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.label}
                      </a>
                    </span>
                  );
                })}
              </p>
            </section>
          ))}
        </div>
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
      </section>
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
              <ImageGallery images={group.images} initialCount={8} />
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
          title="Virtuálna prehliadka a 3D modely"
          description="Kaplnku a oltár si môžete prezrieť aj zblízka v trojrozmernom priestore."
        />
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

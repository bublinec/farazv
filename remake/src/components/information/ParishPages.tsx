import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { churchDetails, churchPhotographer } from "@/content/church-details";
import { serviceQuotations } from "@/content/service-quotations";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { ImageGallery } from "./ImageGallery";
import { ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { CommunityAside } from "./CommunityAside";
import { ServiceQuotation } from "./SourceQuotation";
import { PublishedContent, TourFallback } from "./PublishedContent";
import styles from "./InformationPage.module.css";

export function ChurchPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section
        className={`container ${styles.churchLayout} ${styles.churchReadingLayout}`}
      >
        <div className={styles.sacramentContent}>
          <ReadingCopy page={page} />
          <PageLinks page={page} />
        </div>
        <aside className={styles.timeline} aria-label="Z histórie kostola">
          <h2>Z histórie kostola</h2>
          {page.timeline?.map((event) => (
            <div className={styles.timelineEvent} key={event.year}>
              <h3>
                <span className={styles.timelineYear}>{event.year}</span>{" "}
                {event.title}
              </h3>
              <p>{event.text}</p>
            </div>
          ))}
          {page.credit ? <p className={styles.credit}>{page.credit}</p> : null}
        </aside>
      </section>
      {page.slug === "farnost/kostol-sv-alzbety" ? (
        <section className="section">
          <div className="container">
            <SectionHeading
              title="Náš kostol zblízka"
              description="Fotografie interiéru a detailov Kostola sv. Alžbety."
              action={
                <Link href="/farnost/galeria" className="textLink">
                  Celá galéria
                  <Icon name="arrow-right" size={17} />
                </Link>
              }
            />
            <ImageGallery
              images={[
                churchDetails.vault,
                churchDetails.iron,
                churchDetails.chapel,
                churchDetails.pews,
                churchDetails.window,
                churchDetails.book,
                churchDetails.nave,
                churchDetails.interior
              ]}
            />
          </div>
        </section>
      ) : null}
      <RelatedPages page={page} />
    </>
  );
}

export function CommunityPage({ page }: { page: InformationPageDefinition }) {
  const quotation = serviceQuotations[page.slug];

  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      {quotation ? <ServiceQuotation quotation={quotation} /> : null}
      <section className={`container ${styles.communityLayout}`}>
        <div>
          <ReadingCopy page={page} />
        </div>
        <CommunityAside page={page} />
      </section>
      <RelatedPages page={page} />
    </>
  );
}

export function SchoolPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.schoolLayout}`}>
        <div className={styles.schoolIntro}>
          <span className={styles.schoolMark} aria-hidden="true">
            a<span>+</span>
          </span>
          <p>
            Rastieme vo vedomostiach.
            <br />
            Rastieme v hodnotách.
          </p>
        </div>
        <div>
          <ReadingCopy page={page} />
          <PageLinks page={page} />
        </div>
      </section>
    </>
  );
}

export function GalleryPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.gallerySection}`}>
        <p className={styles.credit}>
          Detaily nášho kostola: fotografie{" "}
          <a href={churchPhotographer.href}>{churchPhotographer.name}</a>
        </p>
        <PublishedContent page={page} galleryOnly />
        <PageLinks page={page} />
      </section>
    </>
  );
}

export function ResourcePage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.resourceLayout}`}>
        <div className={styles.resourceContent}>
          <ReadingCopy page={page} />
          <TourFallback page={page} />
          <PageLinks page={page} />
        </div>
        <OfficeAside />
      </section>
    </>
  );
}

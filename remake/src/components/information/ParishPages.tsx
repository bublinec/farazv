import type { InformationPageDefinition } from "@/content/information";
import { serviceQuotations } from "@/content/service-quotations";
import { PageHero } from "@/components/ui/PageHero";
import { ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { CommunityAside } from "./CommunityAside";
import { ServiceQuotation } from "./SourceQuotation";
import { TourFallback } from "./PublishedContent";
import { ParishHistoryBanner } from "./ParishHistoryBanner";
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
      <ParishHistoryBanner currentSlug={page.slug} />
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

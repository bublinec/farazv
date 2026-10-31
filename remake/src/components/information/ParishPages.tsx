import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { churchPhotographer } from "@/content/church-details";
import { PageHero } from "@/components/ui/PageHero";
import { Arrow, ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
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
      <RelatedPages page={page} />
    </>
  );
}

export function CommunityPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.communityLayout}`}>
        <div>
          <ReadingCopy page={page} />
        </div>
        <aside className={styles.communityAside}>
          <h2>
            {page.source?.placeholderSource || page.contentSource === "curated"
              ? "Farská kancelária"
              : "Pridajte sa k nám"}
          </h2>
          {page.facts ? (
            <dl className={styles.facts}>
              {page.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {page.contentSource === "curated" ? (
            <p>
              O možnostiach zapojenia a potrebnej príprave sa informuj vo
              farskej kancelárii.
            </p>
          ) : !page.source?.placeholderSource ? (
            <p>Pomôžeme vám nájsť kontakt a prvé stretnutie.</p>
          ) : null}
          <Link className="button" href="/kontakt">
            Ozvite sa nám <Arrow />
          </Link>
        </aside>
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
        <PublishedContent page={page} />
        <p className={styles.credit}>
          Detaily nášho kostola: fotografie{" "}
          <a href={churchPhotographer.href}>{churchPhotographer.name}</a>
        </p>
        <TourFallback page={page} />
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

import type { InformationPageDefinition } from "@/content/information";
import { serviceQuotations } from "@/content/service-quotations";
import { PageHero } from "@/components/ui/PageHero";
import { MediaImage } from "@/components/ui/MediaImage";
import { RichText } from "@/components/editorial/RichText";
import { richTextToPlainText } from "@/lib/rich-text";
import { ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { CommunityAside } from "./CommunityAside";
import { ServiceQuotation } from "./SourceQuotation";
import { TourFallback } from "./PublishedContent";
import { ParishHistoryBanner } from "./ParishHistoryBanner";
import { HistoryTimeline } from "./HistoryTimeline";
import { readingHeadingId } from "./reading-anchors";
import styles from "./InformationPage.module.css";

function splitLieskovecPriests(page: InformationPageDefinition) {
  if (
    page.slug !== "farnost/kostol-sv-jana-pavla-v-lieskovci" ||
    page.contentSource !== "published"
  )
    return { page };

  for (const section of page.source.sections) {
    const nodes = section.body.content;
    const index = nodes.findIndex(
      (node) =>
        node.type === "heading" &&
        richTextToPlainText({ type: "doc", content: [node] }).trim() ===
          "Kňazi pochádzajúci z Lieskovca"
    );
    if (index < 0 || nodes[index + 1]?.type !== "bulletList") continue;

    const headingOrdinal = nodes
      .slice(0, index + 1)
      .filter((node) => node.type === "heading").length;

    return {
      page: {
        ...page,
        source: {
          ...page.source,
          sections: page.source.sections.map((entry) =>
            entry === section
              ? {
                  ...entry,
                  body: {
                    ...entry.body,
                    content: nodes.filter(
                      (_, nodeIndex) =>
                        nodeIndex !== index && nodeIndex !== index + 1
                    )
                  }
                }
              : entry
          )
        }
      },
      priests: {
        id: readingHeadingId(section.id, headingOrdinal),
        body: { type: "doc" as const, content: nodes.slice(index, index + 2) }
      }
    };
  }

  return { page };
}

export function ChurchPage({ page }: { page: InformationPageDefinition }) {
  const { page: readingPage, priests } = splitLieskovecPriests(page);

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
          <ReadingCopy page={readingPage} />
          <PageLinks page={page} />
        </div>
        <div className={styles.churchSidebar}>
          {page.patron ? (
            <figure className={styles.patron}>
              <MediaImage image={page.patron.image} sizes="320px" />
              <figcaption>
                <span>{page.patron.name}</span>
                <small>
                  Patrón kostola ·{" "}
                  <a
                    href={page.patron.sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Zdroj fotografie
                    <span className="srOnly"> (otvorí sa v novom okne)</span>
                  </a>
                </small>
              </figcaption>
            </figure>
          ) : null}
          <HistoryTimeline events={page.timeline} credit={page.credit} />
          {priests ? (
            <section className={styles.churchNote} id={priests.id}>
              <RichText document={priests.body} />
            </section>
          ) : null}
        </div>
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

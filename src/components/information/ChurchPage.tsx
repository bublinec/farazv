import type { InformationPageDefinition } from "@/content/information";
import { getChurchPageContent } from "@/content/church-presentation";
import { RichText } from "@/components/editorial/RichText";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageHero } from "@/components/ui/PageHero";
import { ReadingCopy, PageLinks } from "./PageSections";
import { HistoryTimeline } from "./HistoryTimeline";
import { ParishHistoryBanner } from "./ParishHistoryBanner";
import { readingHeadingId } from "./reading-anchors";
import styles from "./ChurchPage.module.css";

export function ChurchPage({ page }: { page: InformationPageDefinition }) {
  const { readingPage, sidebarNote } = getChurchPageContent(page);

  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.layout}`}>
        <div className={styles.reading}>
          <ReadingCopy page={readingPage} />
          <PageLinks page={page} />
        </div>
        <div className={styles.sidebar}>
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
          {sidebarNote ? (
            <section
              className={styles.note}
              id={readingHeadingId(
                sidebarNote.sourceSectionId,
                sidebarNote.headingOrdinal
              )}
            >
              <RichText document={sidebarNote.document} />
            </section>
          ) : null}
        </div>
      </section>
      <ParishHistoryBanner currentSlug={page.slug} />
    </>
  );
}

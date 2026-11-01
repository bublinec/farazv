import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import type { MediaAsset } from "@/content/types";
import { aerialImage, churchLieskovec, churchZolna } from "@/content/assets";
import { PageHero } from "@/components/ui/PageHero";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { ReadingCopy } from "./PageSections";
import { HistoryTimeline } from "./HistoryTimeline";
import {
  HistoricalChurchGallery,
  historicalGallerySectionId
} from "./HistoricalChurchGallery";
import styles from "./ParishPage.module.css";

const churchPhotographs: Record<string, MediaAsset> = {
  "/farnost/kostol-sv-alzbety": aerialImage,
  "/farnost/kostol-sv-jana-pavla-v-lieskovci": churchLieskovec,
  "/farnost/kostol-sv-matusa-v-zolnej": churchZolna
};

export function ParishPage({ page }: { page: InformationPageDefinition }) {
  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      <section className={`container ${styles.history}`}>
        <article className={styles.reading}>
          <ReadingCopy page={page} omitSectionId={historicalGallerySectionId} />
        </article>
        <div className={styles.sidebar}>
          <section
            className={styles.churches}
            aria-labelledby="parish-churches-heading"
          >
            <h2 id="parish-churches-heading">Naše kostoly</h2>
            <ul className={styles.links}>
              {page.links?.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {churchPhotographs[link.href] ? (
                      <MediaImage
                        image={{ ...churchPhotographs[link.href], alt: "" }}
                        sizes="88px"
                      />
                    ) : null}
                    <span>{link.label}</span>
                    <Icon name="arrow-right" size={17} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <HistoryTimeline events={page.timeline} title="Z dejín farnosti" />
        </div>
      </section>
      <HistoricalChurchGallery />
    </>
  );
}

import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { ReadingCopy } from "./PageSections";
import {
  HistoricalChurchGallery,
  historicalGallerySectionId
} from "./HistoricalChurchGallery";
import styles from "./ParishPage.module.css";

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
      </section>
      <HistoricalChurchGallery />
      <section
        className={`container ${styles.churches}`}
        aria-label="Naše kostoly"
      >
        <SectionHeading title="Naše kostoly" />
        <ul className={styles.links}>
          {page.links?.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <span>{link.label}</span>
                <Icon name="arrow-right" size={20} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

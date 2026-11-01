import type { InformationPageDefinition } from "@/content/information";
import { PageHero } from "@/components/ui/PageHero";
import { ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { SourceQuotation } from "./SourceQuotation";
import styles from "./InformationPage.module.css";

export function SacramentPage({ page }: { page: InformationPageDefinition }) {
  const firstSection = page.source?.sections[0];
  const openingQuotation =
    firstSection?.kind === "quotation_sections" ? firstSection : undefined;
  const isEucharist = page.slug === "sviatosti/sviatost-eucharistie";
  let preparationType: "baptism" | "marriage" | undefined;
  if (page.slug.endsWith("sviatost-krstu")) preparationType = "baptism";
  if (page.slug.endsWith("sviatost-manzelstva")) preparationType = "marriage";

  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      {openingQuotation ? (
        <SourceQuotation
          section={openingQuotation}
          sourceHref={
            isEucharist ? "https://dkc.kbs.sk/dkc.php?in=kkc1324" : undefined
          }
        />
      ) : null}
      <div className={`container ${styles.sacramentLayout}`}>
        <div className={styles.sacramentContent}>
          <PageLinks page={page} />
          <ReadingCopy page={page} omitSectionId={openingQuotation?.id} />
        </div>
        <OfficeAside
          preparationType={preparationType}
          title={page.aside?.title}
          description={page.aside?.description}
        />
      </div>
      <RelatedPages page={page} />
    </>
  );
}

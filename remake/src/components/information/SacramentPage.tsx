import type { InformationPageDefinition } from "@/content/information";
import { sacramentPreparation } from "@/content/sacrament-preparation";
import { PageHero } from "@/components/ui/PageHero";
import { SacramentsSection } from "@/components/home/SacramentsSection";
import { HospitalMinistrySection } from "@/components/home/HospitalMinistrySection";
import { ReadingCopy, PageLinks } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { SourceQuotation } from "./SourceQuotation";
import { PreparationTimeline } from "./PreparationTimeline";
import styles from "./InformationPage.module.css";

export function SacramentPage({ page }: { page: InformationPageDefinition }) {
  const firstSection = page.source?.sections[0];
  const openingQuotation =
    firstSection?.kind === "quotation_sections" ? firstSection : undefined;
  const isEucharist = page.slug === "sviatosti/sviatost-eucharistie";
  const isAnointing = page.slug === "sviatosti/sviatost-pomazania-chorych";
  const preparation = sacramentPreparation[page.slug];
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
          <ReadingCopy page={page} omitSectionId={openingQuotation?.id} />
        </div>
        <div className={styles.sacramentSidebar}>
          <PageLinks page={page} />
          <OfficeAside
            preparationType={preparationType}
            title={page.aside?.title}
            description={page.aside?.description}
          />
          {preparation ? (
            <PreparationTimeline preparation={preparation} />
          ) : null}
        </div>
      </div>

      {isAnointing ? <HospitalMinistrySection /> : null}

      <SacramentsSection />
    </>
  );
}

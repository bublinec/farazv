import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { getPublicDesign } from "@/server/public-design";
import { PageHero } from "@/components/ui/PageHero";
import { Arrow, ReadingCopy, PageLinks, RelatedPages } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { ReadingNavigation } from "./ReadingNavigation";
import styles from "./InformationPage.module.css";

export async function SacramentPage({
  page
}: {
  page: InformationPageDefinition;
}) {
  const parish = (await getPublicDesign()) === "parish";
  const baptism = page.slug.endsWith("sviatost-krstu");
  let preparationType: "baptism" | "marriage" | undefined;
  if (baptism) preparationType = "baptism";
  if (page.slug.endsWith("sviatost-manzelstva")) preparationType = "marriage";

  return (
    <>
      <PageHero
        title={page.title}
        eyebrow={page.eyebrow}
        description={page.introduction}
      />
      <div className={`container ${styles.sacramentLayout}`}>
        <div className={styles.sacramentContent}>
          {parish ? (
            <>
              <div className={styles.practicalLinks}>
                <Link href="/kontakt" className={styles.practicalContact}>
                  Kontakt na farskú kanceláriu <Arrow />
                </Link>
                <PageLinks page={page} />
              </div>
              <ReadingNavigation page={page} />
            </>
          ) : null}
          {baptism && !parish ? (
            <div
              className={styles.steps}
              role="group"
              aria-label="Príprava na krst"
            >
              <span>
                <b>01</b> Ozvite sa nám
              </span>
              <span>
                <b>02</b> Pripravte sa spolu
              </span>
              <span>
                <b>03</b> Slávme krst
              </span>
            </div>
          ) : null}
          <ReadingCopy page={page} />
          {!parish ? <PageLinks page={page} /> : null}
        </div>
        <OfficeAside preparationType={preparationType} />
      </div>
      <RelatedPages page={page} />
    </>
  );
}

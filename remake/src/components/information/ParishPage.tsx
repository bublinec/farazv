import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { PageHero } from "@/components/ui/PageHero";
import { ReadingCopy, PageLinks } from "./PageSections";
import styles from "./InformationPage.module.css";

export function ParishPage({ page }: { page: InformationPageDefinition }) {
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
        </div>
        <aside className={styles.officeAside} aria-label="Naše kostoly">
          <h2>Naše kostoly</h2>
          <PageLinks page={page} />
          <p>
            Aktuálne dianie a pozvania nájdete vo{" "}
            <Link href="/farnost/farske-oznamy">farských oznamoch</Link>.
          </p>
        </aside>
      </section>
    </>
  );
}

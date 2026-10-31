import Link from "next/link";
import type {
  InformationSection,
  InformationPageDefinition
} from "@/content/information";
import { informationPages } from "@/content/information";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PublishedContent } from "./PublishedContent";
import styles from "./InformationPage.module.css";
import reading from "./ReadingContent.module.css";

export const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>
);

function SectionCopy({ section }: { section: InformationSection }) {
  return (
    <>
      <h2>{section.title}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.items ? (
        <ul className={reading.checklist}>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function ReadingCopy({
  page,
  omitSectionId
}: {
  page: InformationPageDefinition;
  omitSectionId?: string;
}) {
  // A known source page must never silently fall back to an abridged rewrite.
  return page.contentSource === "published" ? (
    <PublishedContent page={page} omitSectionId={omitSectionId} />
  ) : (
    <div className={reading.readingCopy}>
      {page.sections.map((section, index) => (
        <section
          className={reading.copySection}
          key={section.title}
          id={`informacie-${index + 1}`}
        >
          <div className="prose">
            <SectionCopy section={section} />
          </div>
        </section>
      ))}
    </div>
  );
}

export function PageLinks({ page }: { page: InformationPageDefinition }) {
  if (!page.links?.length) return null;

  return (
    <div className={styles.pageLinks}>
      {page.links.map((link) => (
        <Link className={styles.resourceLink} key={link.href} href={link.href}>
          <span>
            {link.label}
            {link.description ? <small>{link.description}</small> : null}
          </span>
          <Arrow diagonal={link.href.startsWith("https://")} />
        </Link>
      ))}
    </div>
  );
}

export function RelatedPages({ page }: { page: InformationPageDefinition }) {
  const related = informationPages
    .filter((entry) => entry.kind === page.kind && entry.slug !== page.slug)
    .slice(0, 3);
  if (!related.length) return null;

  let relatedHeading = "Spoznajte aj ďalších";
  if (page.kind === "sacrament") relatedHeading = "Ďalšie sviatosti";
  if (page.kind === "church") relatedHeading = "Naše ďalšie kostoly";

  return (
    <section className={styles.related}>
      <div className="container">
        <SectionHeading title={relatedHeading} />
        <div className={styles.relatedGrid}>
          {related.map((entry) => (
            <Link
              key={entry.slug}
              href={`/${entry.slug}`}
              className={styles.relatedCard}
            >
              <h3>{entry.title}</h3>
              <p>{entry.introduction}</p>
              <span className={styles.textLink}>
                Zistiť viac <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

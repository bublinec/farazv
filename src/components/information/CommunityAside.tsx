import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import { OfficeAside } from "./OfficeAside";
import { Arrow } from "./PageSections";
import styles from "./InformationPage.module.css";

export function CommunityAside({
  page
}: {
  page: Pick<InformationPageDefinition, "slug" | "aside" | "facts">;
}) {
  const contact = page.aside?.contact;

  if (!contact && !page.facts?.length)
    return (
      <OfficeAside
        showLectorSchedules={page.slug === "spolocenstva/lektori"}
        title={page.aside?.title ?? "Ako sa zapojiť"}
        description={
          page.aside?.description ??
          "Aktuálny kontakt a možnosti zapojenia vám poskytne farská kancelária."
        }
      />
    );

  return (
    <aside
      className={styles.communityAside}
      aria-label={page.aside?.title ?? "Praktické informácie"}
    >
      <h2>{page.aside?.title ?? "Praktické informácie"}</h2>
      {page.aside?.description ? <p>{page.aside.description}</p> : null}
      {page.facts?.length ? (
        <dl className={styles.facts}>
          {page.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {contact ? (
        <div className={styles.asideContact}>
          <h3>Kontakt</h3>
          <p>{contact.name}</p>
          {contact.phones.map((phone) => (
            <div key={phone}>
              <a
                className={styles.officePhone}
                href={`tel:${phone.replace(/\s/g, "")}`}
              >
                {phone}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <Link className={styles.textLink} href="/kontakt">
          Farská kancelária <Arrow />
        </Link>
      )}
    </aside>
  );
}

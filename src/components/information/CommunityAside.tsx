import Link from "next/link";
import { LectorScheduleDialog } from "@/components/lectors/LectorScheduleDialog";
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
  const showLectorSchedules = page.slug === "spolocenstva/lektori";

  if (!contact && !page.facts?.length)
    return (
      <OfficeAside
        showLectorSchedules={showLectorSchedules}
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
      <header className={styles.asideHeading}>
        <h2>{page.aside?.title ?? "Praktické informácie"}</h2>
        {page.aside?.description ? <p>{page.aside.description}</p> : null}
      </header>
      <dl className={styles.facts}>
        {page.facts?.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
        {contact ? (
          <div>
            <dt>Kontakt</dt>
            <dd>
              <span>{contact.name}</span>
              <div className={styles.officeContacts}>
                {contact.phones.map((phone) => (
                  <a
                    key={phone}
                    className={styles.officePhone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </dd>
          </div>
        ) : null}
      </dl>
      {showLectorSchedules ? (
        <div className={styles.asideAction}>
          <LectorScheduleDialog />
        </div>
      ) : null}
      {!contact ? (
        <Link className={styles.textLink} href="/kontakt">
          Farská kancelária <Arrow />
        </Link>
      ) : null}
    </aside>
  );
}

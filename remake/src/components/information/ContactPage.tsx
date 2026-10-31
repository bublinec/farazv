import Link from "next/link";
import type { InformationPageDefinition } from "@/content/information";
import type { SettingsDocument } from "@/content/documents";
import { aerialImage } from "@/content/assets";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Unavailable } from "@/components/ui/Unavailable";
import { DonationSection } from "@/components/home/DonationSection";
import { PartnerLinks } from "./PublishedContent";
import { Arrow } from "./PageSections";
import { settingsOrUnavailable } from "./OfficeAside";
import styles from "./InformationPage.module.css";

function PriestCards({
  priests
}: {
  priests: NonNullable<SettingsDocument["priests"]>;
}) {
  if (!priests.length) return null;

  return (
    <section className={`container ${styles.priests}`}>
      <SectionHeading eyebrow="Pastoračná služba" title="Naši kňazi" />
      <div className={styles.priestGrid}>
        {priests.map((priest) => (
          <article
            className={styles.priestCard}
            key={`${priest.name}-${priest.role}`}
          >
            {priest.image ? (
              <MediaImage
                image={priest.image}
                sizes="(max-width:760px) 100vw, 360px"
              />
            ) : (
              <div className={styles.priestPlaceholder} aria-hidden="true">
                ✝
              </div>
            )}
            <div>
              <span>{priest.role}</span>
              <h3>{priest.name}</h3>
              {priest.phone ? (
                <a href={`tel:${priest.phone.replace(/\s/g, "")}`}>
                  {priest.phone}
                </a>
              ) : null}
              {priest.email ? (
                <a href={`mailto:${priest.email}`}>{priest.email}</a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function ContactPage({
  page
}: {
  page: InformationPageDefinition;
}) {
  const settings = await settingsOrUnavailable();

  return (
    <>
      <PageHero
        title={page.title}
        eyebrow={page.eyebrow}
        description={page.introduction}
      />
      {settings ? (
        <>
          <section className={`container ${styles.contactSection}`}>
            <div className={styles.contactMain}>
              <span className="eyebrow">{settings.name}</span>
              <h2>Farská kancelária</h2>
              <a
                className={styles.contactPhone}
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
              >
                {settings.phone}
                <Arrow diagonal />
              </a>
              {settings.mobile && settings.mobile !== settings.phone ? (
                <a
                  className={styles.contactMobile}
                  href={`tel:${settings.mobile.replace(/\s/g, "")}`}
                >
                  Mobil: {settings.mobile}
                  <Arrow diagonal />
                </a>
              ) : null}
              <a
                className={styles.contactEmail}
                href={`mailto:${settings.email}`}
              >
                {settings.email}
                <Arrow diagonal />
              </a>
              <div className={styles.contactAddress}>
                <span>Adresa</span>
                <address>{settings.address}</address>
                {settings.ico ? <small>IČO: {settings.ico}</small> : null}
              </div>
              {settings.contactNote ? (
                <p className={styles.contactNote}>{settings.contactNote}</p>
              ) : null}
            </div>
            <div className={styles.contactHours}>
              <h2>Kedy nás zastihnete</h2>
              <dl className={styles.hours}>
                {settings.officeHours.map((hours) => (
                  <div key={hours.day}>
                    <dt>{hours.day}</dt>
                    <dd>{hours.time}</dd>
                  </div>
                ))}
              </dl>
              {settings.officeNote ? <p>{settings.officeNote}</p> : null}
              <div className={styles.meetings}>
                <h3>Náuky</h3>
                <dl className={styles.hours}>
                  {settings.preparationMeetings.map((meeting) => (
                    <div key={meeting.name}>
                      <dt>{meeting.name}</dt>
                      <dd>{meeting.time}</dd>
                    </div>
                  ))}
                </dl>
                {settings.preparationNote ? (
                  <small>{settings.preparationNote}</small>
                ) : null}
              </div>
            </div>
          </section>
          <PriestCards priests={settings.priests ?? []} />
          <section className={styles.locationSection}>
            <div className={`container ${styles.locationGrid}`}>
              <div className={styles.locationImage}>
                <MediaImage
                  image={aerialImage}
                  sizes="(max-width:760px) 100vw, 50vw"
                />
              </div>
              <div className={styles.locationCopy}>
                <SectionHeading
                  eyebrow="Príďte za nami"
                  title="Tešíme sa na stretnutie"
                  description={settings.address}
                />
                <a
                  className="button"
                  href={
                    settings.mapLink ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      settings.address
                    )}`
                  }
                >
                  Nájsť cestu na mape <Arrow diagonal />
                </a>
                <Link
                  className={styles.textLink}
                  href="/farnost/kostol-sv-alzbety"
                >
                  Spoznajte náš kostol <Arrow />
                </Link>
              </div>
            </div>
          </section>
          <DonationSection iban={settings.iban} qr={settings.donationQr} />
        </>
      ) : (
        <div className={`container ${styles.contactSection}`}>
          <Unavailable title="Kontaktné údaje sú dočasne nedostupné." />
        </div>
      )}
      <PartnerLinks page={page} />
    </>
  );
}

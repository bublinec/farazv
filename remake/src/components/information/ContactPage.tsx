import type { InformationPageDefinition } from "@/content/information";
import type { SettingsDocument } from "@/content/documents";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Unavailable } from "@/components/ui/Unavailable";
import { DonationSection } from "@/components/home/DonationSection";
import { FeedbackInvite } from "@/components/feedback/FeedbackInvite";
import { PartnerLinks } from "./PublishedContent";
import { Arrow } from "./PageSections";
import { settingsOrUnavailable } from "./OfficeAside";
import { ParishMap } from "./ParishMap";
import styles from "./InformationPage.module.css";
import contact from "./ContactPage.module.css";

function PriestCards({
  priests
}: {
  priests: NonNullable<SettingsDocument["priests"]>;
}) {
  if (!priests.length) return null;

  return (
    <section className={`container ${styles.priests}`}>
      <SectionHeading title="Naši kňazi" />
      <div className={styles.priestGrid}>
        {priests.map((priest) => (
          <article
            className={styles.priestCard}
            key={`${priest.name}-${priest.role}`}
          >
            {priest.image ? (
              <MediaImage
                image={priest.image}
                sizes="(max-width: 760px) 42vw, (max-width: 1280px) 33vw, 382px"
                quality="high"
              />
            ) : (
              <div className={styles.priestPlaceholder} aria-hidden="true">
                ✝
              </div>
            )}
            <div>
              <h3>{priest.name}</h3>
              <p className={styles.priestRole}>
                {priest.role.replace(/farský vikár/gi, "Kaplán")}
              </p>
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
  const mapHref = settings
    ? settings.mapLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        settings.address
      )}`
    : "";

  return (
    <>
      <PageHero
        route={`/${page.slug}`}
        title={page.title}
        description={page.introduction}
      />
      {settings ? (
        <>
          <section className={`container ${contact.section}`}>
            <div className={contact.heading}>
              <SectionHeading title="Farská kancelária" />
            </div>
            <div className={contact.columns}>
              <div className={contact.office}>
                <section
                  className={contact.group}
                  aria-labelledby="office-contact"
                >
                  <h3 id="office-contact">Kontakt</h3>
                  <dl className={`${contact.details} ${contact.identity}`}>
                    <div>
                      <dt>{settings.mobile ? "Mobil:" : "Telefón:"}</dt>
                      <dd>
                        <a
                          href={`tel:${(
                            settings.mobile || settings.phone
                          ).replace(/\s/g, "")}`}
                        >
                          {settings.mobile || settings.phone}
                        </a>
                      </dd>
                    </div>
                    {settings.mobile && settings.mobile !== settings.phone ? (
                      <div>
                        <dt>Telefón:</dt>
                        <dd>
                          <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                            {settings.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>E-mail:</dt>
                      <dd>
                        <a href={`mailto:${settings.email}`}>
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>IBAN:</dt>
                      <dd className={contact.iban}>{settings.iban}</dd>
                    </div>
                  </dl>
                </section>

                <section
                  className={contact.group}
                  aria-labelledby="office-hours"
                >
                  <h3 id="office-hours">Úradné hodiny</h3>
                  {settings.officeNote ? (
                    <p className={contact.note}>
                      <span aria-hidden="true">i</span>
                      {settings.officeNote}
                    </p>
                  ) : null}
                  <dl className={contact.details}>
                    {settings.officeHours.map((hours) => (
                      <div key={hours.day}>
                        <dt>{hours.day}:</dt>
                        <dd>{hours.time}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section
                  className={contact.group}
                  aria-labelledby="office-preparation"
                >
                  <div className={contact.groupHeading}>
                    <h3 id="office-preparation">Náuky</h3>
                    {settings.preparationNote ? (
                      <p className={contact.note}>
                        <span aria-hidden="true">i</span>
                        {settings.preparationNote}
                      </p>
                    ) : null}
                  </div>
                  <dl className={contact.details}>
                    {settings.preparationMeetings.map((meeting) => (
                      <div key={meeting.name}>
                        <dt>{meeting.name}:</dt>
                        <dd>{meeting.time}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>

              <section
                className={contact.location}
                aria-labelledby="office-location"
              >
                <h3 id="office-location">Kde nás nájdete?</h3>
                <ParishMap address={settings.address} href={mapHref} />
                {settings.contactNote ? (
                  <p className={contact.note}>
                    <span aria-hidden="true">i</span>
                    {settings.contactNote}
                  </p>
                ) : null}
                <dl className={`${contact.details} ${contact.address}`}>
                  <div>
                    <dt>Adresa:</dt>
                    <dd>
                      <address>{settings.address}</address>
                    </dd>
                  </div>
                  {settings.ico ? (
                    <div>
                      <dt>IČO:</dt>
                      <dd>{settings.ico}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className={contact.links}>
                  <a href={mapHref}>
                    Nájsť cestu na mape <Arrow diagonal />
                  </a>
                </div>
              </section>
            </div>
          </section>
          <PriestCards priests={settings.priests ?? []} />
        </>
      ) : (
        <div className={`container ${contact.section}`}>
          <Unavailable title="Kontaktné údaje sú dočasne nedostupné." />
        </div>
      )}
      <FeedbackInvite divided />
      <PartnerLinks page={page} />
      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
    </>
  );
}

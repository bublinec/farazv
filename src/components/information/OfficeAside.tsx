import Link from "next/link";
import { LectorScheduleDialog } from "@/components/lectors/LectorScheduleDialog";
import type { SettingsDocument } from "@/content/documents";
import { getPublicSettings } from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { Arrow } from "./PageSections";
import styles from "./InformationPage.module.css";

export async function settingsOrUnavailable(): Promise<SettingsDocument | null> {
  try {
    return await getPublicSettings();
  } catch {
    return null;
  }
}

export async function OfficeAside({
  preparationType,
  title = "Farská kancelária",
  description,
  showLectorSchedules = false
}: {
  preparationType?: "baptism" | "marriage";
  title?: string;
  description?: string;
  showLectorSchedules?: boolean;
}) {
  const settings = await settingsOrUnavailable();

  if (!settings)
    return (
      <aside className={styles.officeAside} aria-label="Farská kancelária">
        <Unavailable compact title="Kontaktné údaje sú dočasne nedostupné." />
        {showLectorSchedules ? <LectorScheduleDialog /> : null}
      </aside>
    );

  const preparation = preparationType
    ? settings.preparationMeetings.find((meeting) =>
        preparationType === "baptism"
          ? /krst/i.test(meeting.name)
          : /sob|manžel|snúben/i.test(meeting.name)
      )
    : undefined;

  return (
    <aside className={styles.officeAside} aria-label="Farská kancelária">
      <header className={styles.asideHeading}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className={styles.officeContacts}>
        <a
          className={styles.officePhone}
          href={`tel:${settings.phone.replace(/\s/g, "")}`}
        >
          {settings.phone}
        </a>
        <a className={styles.officeEmail} href={`mailto:${settings.email}`}>
          {settings.email}
        </a>
      </div>
      {settings.officeHours.length || settings.officeNote ? (
        <div className={styles.officeSection}>
          {settings.officeHours.length ? (
            <>
              <h3 className={styles.asideLabel}>Úradné hodiny</h3>
              <dl className={styles.hours}>
                {settings.officeHours.map((hours) => (
                  <div key={hours.day}>
                    <dt>{hours.day}</dt>
                    <dd>
                      {hours.time.split(" a ").map((time, index) => (
                        <span key={`${index}-${time}`}>
                          {index ? " a " : null}
                          {time}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
          {settings.officeNote ? (
            <p className={styles.asideNote}>{settings.officeNote}</p>
          ) : null}
        </div>
      ) : null}
      {preparation ? (
        <div className={styles.preparation}>
          <h3 className={styles.asideLabel}>
            {preparationType === "baptism"
              ? "Príprava na krst"
              : "Predmanželská náuka"}
          </h3>
          <strong>{preparation.time}</strong>
          {settings.preparationNote ? (
            <small>{settings.preparationNote}</small>
          ) : null}
        </div>
      ) : null}
      {showLectorSchedules ? (
        <div className={styles.asideAction}>
          <LectorScheduleDialog />
        </div>
      ) : null}
      <Link href="/kontakt" className={styles.textLink}>
        Všetky kontakty a adresa <Arrow />
      </Link>
    </aside>
  );
}

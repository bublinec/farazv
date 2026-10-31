import Link from "next/link";
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
  preparationType
}: {
  preparationType?: "baptism" | "marriage";
}) {
  const settings = await settingsOrUnavailable();

  if (!settings)
    return (
      <aside className={styles.officeAside} aria-label="Farská kancelária">
        <Unavailable compact title="Kontaktné údaje sú dočasne nedostupné." />
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
      <span className="eyebrow">Sme tu pre vás</span>
      <h2>Dohodnime si stretnutie</h2>
      <p>Radi vám pomôžeme s prípravou aj s vašimi otázkami.</p>
      <a
        className={styles.officePhone}
        href={`tel:${settings.phone.replace(/\s/g, "")}`}
      >
        {settings.phone}
      </a>
      <dl className={styles.hours}>
        {settings.officeHours.map((hours) => (
          <div key={hours.day}>
            <dt>{hours.day}</dt>
            <dd>{hours.time}</dd>
          </div>
        ))}
      </dl>
      {settings.officeNote ? <p>{settings.officeNote}</p> : null}
      {preparation ? (
        <div className={styles.preparation}>
          <span>
            {preparationType === "baptism"
              ? "Príprava na krst"
              : "Predmanželská náuka"}
          </span>
          <strong>{preparation.time}</strong>
          {settings.preparationNote ? (
            <small>{settings.preparationNote}</small>
          ) : null}
        </div>
      ) : null}
      <Link href="/kontakt" className={styles.textLink}>
        Všetky kontakty a adresa <Arrow />
      </Link>
    </aside>
  );
}

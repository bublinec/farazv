import type { Metadata } from "next";
import Link from "next/link";
import { aerialImage } from "@/content/assets";
import type { BulletinDocument } from "@/content/documents";
import {
  getPublicBulletins,
  getPublicSettings,
  isFixtureMode
} from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { RichText } from "@/components/editorial/RichText";
import { markdownToDocument as parseMarkdown } from "@/lib/legacy-rich-text";
import { formatDate, getPublicWeek } from "@/lib/calendar";
import { getPreviewDate } from "@/lib/preview-date";
import { PageHero } from "@/components/ui/PageHero";
import { Icon } from "@/components/ui/Icon";
import { WeeklySchedule } from "@/components/bulletin/WeeklySchedule";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Farské oznamy",
  description:
    "Rozpis svätých omší a farské oznamy Farnosti sv. Alžbety Zvolen – mesto.",
  alternates: { canonical: "/farnost/farske-oznamy" }
};

export default async function BulletinPage() {
  const today = getPreviewDate();
  const [schedule, settings] = await Promise.all([
    getPublicBulletins(today).catch(() => null),
    getPublicSettings().catch(() => null)
  ]);
  if (!schedule)
    return (
      <>
        <PageHero
          route="/farnost/farske-oznamy"
          title="Farské oznamy"
          description="Sväté omše, úmysly a aktuálne oznamy na jednom mieste."
          image={aerialImage}
        />
        <section className="container section">
          <Unavailable title="Rozpis je dočasne nedostupný." />
        </section>
      </>
    );
  const { days, bulletin } = getPublicWeek(
    schedule,
    today,
    settings?.regularSchedule ?? {}
  );
  const donations =
    (bulletin as BulletinDocument | undefined)?.donations?.filter(
      (item) => item.label || item.amount
    ) ?? [];
  return (
    <>
      <PageHero
        route="/farnost/farske-oznamy"
        title="Farské oznamy"
        description="Sväté omše, úmysly a aktuálne oznamy na jednom mieste."
        image={aerialImage}
      />
      <section className="section">
        <div className="container">
          <div className={styles.period}>
            <div>
              <Icon name="calendar" size={20} />
              <span>
                {formatDate(days[0].date, { day: "numeric", month: "long" })} –{" "}
                {formatDate(days[7].date, {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            {isFixtureMode() ? (
              <span className={styles.preview}>Ukážkový rozpis</span>
            ) : null}
          </div>
          <div className={styles.layout}>
            <WeeklySchedule key={today} days={days} today={today} />
            <aside className={styles.aside}>
              <section className={styles.announcements}>
                <h2>Oznamy</h2>
                <ol>
                  {bulletin?.announcements.map((announcement, index) => (
                    <li key={announcement}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <RichText document={parseMarkdown(announcement)} />
                    </li>
                  ))}
                </ol>
                {!bulletin?.announcements.length ? (
                  <p>Oznamy na tento týždeň ešte nie sú zverejnené.</p>
                ) : null}
                {donations.length ? (
                  <div className={styles.donations}>
                    <h3>Milodary</h3>
                    {donations.map((item, index) => (
                      <p key={index}>
                        <span>
                          {item.category ? (
                            <small>{item.category}</small>
                          ) : null}
                          {item.label}
                        </span>
                        {item.amount ? <strong>{item.amount}</strong> : null}
                      </p>
                    ))}
                  </div>
                ) : null}
                <p className={styles.thanks}>Prajeme vám požehnaný týždeň.</p>
              </section>
              {settings ? (
                <section className={styles.contact}>
                  <Icon name="phone" size={23} />
                  <h3>Potrebujete sa poradiť?</h3>
                  <p>Sme vám k dispozícii vo farskej kancelárii.</p>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                    {settings.phone}
                  </a>
                  <Link href="/kontakt" className="textLink">
                    Kontakty a úradné hodiny
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

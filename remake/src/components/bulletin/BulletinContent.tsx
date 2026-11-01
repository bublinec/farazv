import Link from "next/link";
import type { BulletinDocument } from "@/content/documents";
import { bulletinPendingMessage } from "@/content/bulletin-messages";
import type { CalendarDate, ScheduleDay } from "@/content/types";
import { markdownToDocument } from "@/lib/legacy-rich-text";
import { RichText } from "@/components/editorial/RichText";
import { Icon } from "@/components/ui/Icon";
import { WeeklySchedule } from "./WeeklySchedule";
import styles from "./BulletinContent.module.css";

/** Shared public presentation also renders the unsaved admin preview. */
export function BulletinContent({
  days,
  today,
  bulletin,
  phone,
  fixture = false
}: {
  days: ScheduleDay[];
  today: CalendarDate;
  bulletin?: Pick<BulletinDocument, "announcements" | "donations">;
  phone?: string;
  fixture?: boolean;
}) {
  const donations =
    bulletin?.donations?.filter((item) => item.label || item.amount) ?? [];

  return (
    <section className="section">
      <div className="container">
        {fixture ? <p className={styles.preview}>Ukážkový rozpis</p> : null}
        <div className={styles.layout}>
          <WeeklySchedule key={today} days={days} today={today} />
          <aside className={styles.aside}>
            <section className={styles.announcements}>
              <h2>Oznamy</h2>
              <ol>
                {bulletin?.announcements.map((announcement, index) => (
                  <li key={`${index}-${announcement}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <RichText document={markdownToDocument(announcement)} />
                  </li>
                ))}
              </ol>
              {!bulletin?.announcements.length ? (
                <div className={styles.pending} role="status">
                  <Icon name="clock" size={23} />
                  <p>{bulletinPendingMessage}</p>
                </div>
              ) : null}
              {donations.length ? (
                <div className={styles.donations}>
                  <h3>Milodary</h3>
                  {donations.map((item, index) => (
                    <p key={index}>
                      <span>
                        {item.category ? <small>{item.category}</small> : null}
                        {item.label}
                      </span>
                      {item.amount ? <strong>{item.amount}</strong> : null}
                    </p>
                  ))}
                </div>
              ) : null}
              <p className={styles.thanks}>Prajeme vám požehnaný týždeň.</p>
            </section>
            {phone !== undefined ? (
              <section className={styles.contact}>
                <Icon name="phone" size={23} />
                <h3>Potrebujete sa poradiť?</h3>
                <p>Sme vám k dispozícii vo farskej kancelárii.</p>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
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
  );
}

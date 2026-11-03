import { siteConfig } from "@/content/site";
import { StructuredData } from "@/components/ui/StructuredData";
import { websiteStructuredData } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { heroImage } from "@/content/assets";
import { parishServices } from "@/content/services";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { altarRestoration } from "@/content/altar-restoration";
import {
  getPublicSettings,
  getPublicBulletins,
  getPublicActivePosts
} from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { getLocalDate, getPublicWeek } from "@/lib/calendar";
import { getPreviewNow } from "@/lib/preview-date";
import { editorialRecordPath } from "@/lib/record-routing";
import { MassHero } from "@/components/home/MassHero";
import { DonationSection } from "@/components/home/DonationSection";
import { SaintCharbelSection } from "@/components/home/SaintCharbelSection";
import { HospitalMinistrySection } from "@/components/home/HospitalMinistrySection";
import { AltarRestorationSection } from "@/components/home/AltarRestorationSection";
import { EditorialGrid } from "@/components/editorial/EditorialCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { WelcomeFeedbackBanner } from "@/components/feedback/WelcomeFeedbackBanner";
import { FeedbackInvite } from "@/components/feedback/FeedbackInvite";
import { feedbackWelcomeEndsOn } from "@/content/feedback";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Farnosť sv. Alžbety Zvolen – mesto",
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true
});

export default async function HomePage() {
  const now = getPreviewNow();
  const today = getLocalDate(now);
  const [settingsResult, bulletinResult, newsResult] = await Promise.allSettled(
    [
      getPublicSettings(),
      getPublicBulletins(today),
      getPublicActivePosts(today)
    ]
  );
  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const publicWeek =
    bulletinResult.status === "fulfilled"
      ? getPublicWeek(
          bulletinResult.value,
          now,
          settings?.regularSchedule ?? {}
        )
      : null;
  const days = publicWeek?.days;
  const permanentPostPaths = [
    editorialRecordPath("news", hospitalMinistry.serviceRosterSlug),
    editorialRecordPath("news", altarRestoration.postSlug)
  ];
  const recentNews =
    newsResult.status === "fulfilled"
      ? newsResult.value.filter(
          (entry) =>
            // Permanent announcements have their own sections below the feed.
            !permanentPostPaths.includes(entry.href ?? "")
        )
      : null;
  return (
    <div className={styles.home}>
      <StructuredData data={websiteStructuredData(settings)} />
      {days ? (
        <MassHero
          key={`${days[0]?.date}:${today}`}
          days={days}
          today={today}
          image={heroImage}
          announcementsPending={!publicWeek?.bulletin?.announcements.length}
        />
      ) : (
        <section className="container section">
          <Unavailable title="Rozpis je dočasne nedostupný." />
        </section>
      )}
      {getLocalDate() < feedbackWelcomeEndsOn ? (
        <WelcomeFeedbackBanner />
      ) : null}
      <section id="novinky" className={`section ${styles.posts}`}>
        <div id="vyveska" className="container">
          <SectionHeading
            title="Výveska"
            description="Aktuálne oznamy a pozvánky na podujatia z farského života."
          />
          {recentNews?.length ? (
            <EditorialGrid entries={recentNews} kind="news" compact />
          ) : recentNews ? (
            <p>Zatiaľ tu nie sú žiadne príspevky.</p>
          ) : (
            <Unavailable compact />
          )}
        </div>
      </section>

      <SaintCharbelSection />

      <HospitalMinistrySection />

      <section className={`section ${styles.services}`}>
        <div className="container">
          <SectionHeading title="Zapoj sa do života našej farnosti" />
          <div className={styles.communities}>
            {parishServices.map(({ title, description, href }) => (
              <Link href={href} className={styles.community} key={href}>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="textLink">
                  Zistiť viac
                  <Icon name="arrow-right" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AltarRestorationSection />

      <div className={styles.feedback}>
        <FeedbackInvite />
      </div>
      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
    </div>
  );
}

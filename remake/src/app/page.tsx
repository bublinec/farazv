import type { Metadata } from "next";
import Link from "next/link";
import { heroImage } from "@/content/assets";
import { churchDetails } from "@/content/church-details";
import { parishServices } from "@/content/services";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { altarRestoration } from "@/content/altar-restoration";
import {
  getPublicSettings,
  getPublicBulletins,
  getPublicActivePosts,
  getPublicEditorialPage,
  getPublicEntry
} from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { getLocalDate, getPublicWeek } from "@/lib/calendar";
import { getPreviewDate } from "@/lib/preview-date";
import { editorialRecordPath } from "@/lib/record-routing";
import { MassHero } from "@/components/home/MassHero";
import { DonationSection } from "@/components/home/DonationSection";
import { SaintCharbelSection } from "@/components/home/SaintCharbelSection";
import { HospitalMinistrySection } from "@/components/home/HospitalMinistrySection";
import { AltarRestorationSection } from "@/components/home/AltarRestorationSection";
import { EditorialGrid } from "@/components/editorial/EditorialCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { WelcomeFeedbackBanner } from "@/components/feedback/WelcomeFeedbackBanner";
import { FeedbackInvite } from "@/components/feedback/FeedbackInvite";
import { feedbackWelcomeEndsOn } from "@/content/feedback";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Farnosť sv. Alžbety Zvolen – mesto" },
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const today = getPreviewDate();
  const [
    settingsResult,
    bulletinResult,
    newsResult,
    articlesResult,
    restorationResult
  ] = await Promise.allSettled([
    getPublicSettings(),
    getPublicBulletins(today),
    getPublicActivePosts(today),
    getPublicEditorialPage("article"),
    getPublicEntry("news", altarRestoration.postSlug)
  ]);
  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const publicWeek =
    bulletinResult.status === "fulfilled"
      ? getPublicWeek(
          bulletinResult.value,
          today,
          settings?.regularSchedule ?? {}
        )
      : null;
  const days = publicWeek?.days;
  const restorationArticle =
    restorationResult.status === "fulfilled" ? restorationResult.value : null;
  const permanentPostPaths = [
    editorialRecordPath("news", hospitalMinistry.serviceRosterSlug),
    ...(restorationArticle
      ? [editorialRecordPath("news", altarRestoration.postSlug)]
      : [])
  ];
  const recentNews =
    newsResult.status === "fulfilled"
      ? newsResult.value.filter(
          (entry) =>
            // Permanent announcements have their own sections below the feed.
            !permanentPostPaths.includes(entry.href ?? "")
        )
      : null;
  const recentArticles =
    articlesResult.status === "fulfilled"
      ? articlesResult.value.items.slice(0, 3)
      : null;
  return (
    <div className={styles.home}>
      {days ? (
        <MassHero
          key={today}
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

      {/* Keep this here in case we have new articles */}
      {/* <section
        id="spolocenstvo"
        className={`section ${styles.posts} ${styles.magazine}`}
      >
        <div className={styles.magazineBackground} aria-hidden="true">
          <MediaImage image={{ ...churchDetails.pews, alt: "" }} sizes="55vw" />
        </div>
        <div className="container">
          <SectionHeading
            title="Naše spoločenstvo"
            description="Časopis a príbehy ľudí, ktorí tvoria našu farnosť."
            action={
              <Link href="/farnost/nase-spolocenstvo" className="textLink">
                Všetky články
                <Icon name="arrow-right" size={17} />
              </Link>
            }
          />
          {recentArticles ? (
            <EditorialGrid entries={recentArticles} kind="article" />
          ) : (
            <Unavailable compact />
          )}
        </div>
      </section> */}

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

      <AltarRestorationSection article={restorationArticle} />

      <div className={styles.feedback}>
        <FeedbackInvite />
      </div>
      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
    </div>
  );
}

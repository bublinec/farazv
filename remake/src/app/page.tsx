import type { Metadata } from "next";
import Link from "next/link";
import { heroImage } from "@/content/assets";
import { churchDetails } from "@/content/church-details";
import { parishServices } from "@/content/services";
import { hospitalMinistry } from "@/content/hospital-ministry";
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
import { SacramentsSection } from "@/components/home/SacramentsSection";
import { DonationSection } from "@/components/home/DonationSection";
import { SaintCharbelSection } from "@/components/home/SaintCharbelSection";
import { HospitalMinistrySection } from "@/components/home/HospitalMinistrySection";
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
    hospitalRosterResult
  ] = await Promise.allSettled([
    getPublicSettings(),
    getPublicBulletins(today),
    getPublicActivePosts(today),
    getPublicEditorialPage("article"),
    getPublicEntry("news", hospitalMinistry.serviceRosterSlug)
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
  const recentNews =
    newsResult.status === "fulfilled" ? newsResult.value : null;
  const recentArticles =
    articlesResult.status === "fulfilled"
      ? articlesResult.value.items.slice(0, 3)
      : null;
  const hospitalRosterHref =
    hospitalRosterResult.status === "fulfilled" && hospitalRosterResult.value
      ? editorialRecordPath("news", hospitalMinistry.serviceRosterSlug)
      : undefined;

  return (
    <>
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
            title="Zo života našej farnosti"
            description="Aktuálne oznamy, pozvánky na podujatia a správy z farského života."
          />
          {recentNews?.length ? (
            <EditorialGrid entries={recentNews} kind="news" />
          ) : recentNews ? (
            <p>Zatiaľ tu nie sú žiadne príspevky.</p>
          ) : (
            <Unavailable compact />
          )}
        </div>
      </section>
      <SaintCharbelSection />
      <HospitalMinistrySection serviceRosterHref={hospitalRosterHref} />
      <section className="section">
        <div className="container">
          <SectionHeading
            title="Zapoj sa do života našej farnosti"
            align="center"
          />
          <div className={styles.communities}>
            {parishServices.map(({ title, description, href }, index) => (
              <Link href={href} className={styles.community} key={href}>
                <span className={styles.communityNumber}>0{index + 1}</span>
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
      <SacramentsSection />
      <section className="section">
        <div className="container">
          <SectionHeading
            title="Náš kostol zblízka"
            description="Fotografie interiéru a detailov Kostola sv. Alžbety."
            action={
              <Link href="/farnost/galeria" className="textLink">
                Celá galéria
                <Icon name="arrow-right" size={17} />
              </Link>
            }
          />
          <div className={styles.gallery}>
            {[
              churchDetails.vault,
              churchDetails.iron,
              churchDetails.chapel,
              churchDetails.pews
            ].map((image) => (
              <Link
                href="/farnost/galeria"
                key={image.src}
                aria-label={`Galéria kostola: ${image.alt}`}
              >
                <MediaImage
                  image={image}
                  sizes="(max-width: 550px) 50vw, 25vw"
                />
                <span aria-hidden="true">
                  <Icon name="image" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section
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
      </section>
      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
      <FeedbackInvite />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { heroImage } from "@/content/assets";
import { churchDetails } from "@/content/church-details";
import {
  getPublicSettings,
  getPublicBulletins,
  getPublicEditorialPage,
  getPublicPosters
} from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { getPublicWeek } from "@/lib/calendar";
import { getPreviewDate } from "@/lib/preview-date";
import { editorialPath } from "@/lib/editorial";
import { MassHero } from "@/components/home/MassHero";
import { PosterWall } from "@/components/home/PosterWall";
import { SacramentsSection } from "@/components/home/SacramentsSection";
import { DonationSection } from "@/components/home/DonationSection";
import { EditorialGrid } from "@/components/editorial/EditorialCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
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
    postersResult,
    newsResult,
    articlesResult
  ] = await Promise.allSettled([
    getPublicSettings(),
    getPublicBulletins(today),
    getPublicPosters(today),
    getPublicEditorialPage("news"),
    getPublicEditorialPage("article")
  ]);
  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const days =
    bulletinResult.status === "fulfilled"
      ? getPublicWeek(
          bulletinResult.value,
          today,
          settings?.regularSchedule ?? {}
        ).days
      : null;
  const activePosters =
    postersResult.status === "fulfilled" ? postersResult.value : [];

  const posterDestinations = new Set(
    activePosters.map((poster) => poster.href)
  );

  const recentNews =
    newsResult.status === "fulfilled"
      ? newsResult.value.items
          .filter(
            (entry) => !posterDestinations.has(editorialPath(entry, "news"))
          )
          .slice(0, 3)
      : null;
  const recentArticles =
    articlesResult.status === "fulfilled"
      ? articlesResult.value.items.slice(0, 3)
      : null;

  return (
    <>
      {days ? (
        <MassHero key={today} days={days} today={today} image={heroImage} />
      ) : (
        <section className="container section">
          <Unavailable title="Rozpis je dočasne nedostupný." />
        </section>
      )}
      {postersResult.status === "fulfilled" ? (
        <PosterWall posters={activePosters} />
      ) : (
        <section id="vyveska" className="container section">
          <Unavailable compact title="Výveska je dočasne nedostupná." />
        </section>
      )}
      <section id="novinky" className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Zo života farnosti"
            title="Čo je u nás nové"
            action={
              <Link href="/prispevky" className="textLink">
                Všetky príspevky
                <Icon name="arrow-right" size={17} />
              </Link>
            }
          />
          {recentNews ? (
            <EditorialGrid entries={recentNews} kind="news" />
          ) : (
            <Unavailable compact />
          )}
        </div>
      </section>
      <SacramentsSection />
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Náš farský kostol"
            title="Miesto, ktoré poznáme"
            description="Krása ukrytá v detailoch. Nahliadnite do Kostola sv. Alžbety."
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
      <section id="spolocenstvo" className={`section ${styles.magazine}`}>
        <div className={styles.magazineBackground} aria-hidden="true">
          <MediaImage image={{ ...churchDetails.pews, alt: "" }} sizes="55vw" />
        </div>
        <div className="container">
          <SectionHeading
            eyebrow="Ľudia, príbehy, viera"
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
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Vo farnosti nie ste sami"
            title="Nájdite svoje spoločenstvo"
            align="center"
          />
          <div className={styles.communities}>
            {[
              [
                "Detský spevokol",
                "Radosť z hudby a spoločnej viery pre najmenších.",
                "/spolocenstva/detsky-spevokol"
              ],
              [
                "Mládežnícky zbor",
                "Miesto pre mladých, ktorí chcú spievať a patriť do spoločenstva.",
                "/spolocenstva/mladeznicky-zbor"
              ],
              [
                "Miništranti",
                "Služba pri oltári, priateľstvá a spoločné zážitky.",
                "/spolocenstva/ministranti"
              ]
            ].map(([title, description, href], index) => (
              <Link href={href} className={styles.community} key={href}>
                <span className={styles.communityNumber}>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="textLink">
                  Spoznať spoločenstvo
                  <Icon name="arrow-right" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {settings ? (
        <DonationSection iban={settings.iban} qr={settings.donationQr} />
      ) : null}
    </>
  );
}

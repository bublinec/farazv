import type { Metadata } from "next";
import Link from "next/link";
import { churchGallery, heroImage } from "@/content/assets";
import { churchDetails } from "@/content/church-details";
import { getPublicDesign } from "@/server/public-design";
import { ChurchWelcome } from "@/components/design/ChurchWelcome";
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
  const design = await getPublicDesign();
  const parishDesign = design === "parish";
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
  const showNoticeboard =
    postersResult.status === "rejected" || activePosters.length > 0;

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
        <MassHero
          key={today}
          days={days}
          today={today}
          image={heroImage}
          design={design}
        />
      ) : (
        <section className="container section">
          <Unavailable title="Rozpis je dočasne nedostupný." />
        </section>
      )}
      {parishDesign ? (
        <nav className={styles.sectionJump} aria-label="Na tejto stránke">
          <div className={`container ${styles.sectionJumpInner}`}>
            {showNoticeboard ? (
              <a href="#vyveska">
                Výveska<span aria-hidden="true">↓</span>
              </a>
            ) : null}
            <a href="#novinky">
              Novinky<span aria-hidden="true">↓</span>
            </a>
            <a href="#sviatosti">
              Sviatosti<span aria-hidden="true">↓</span>
            </a>
            <a href="#spolocenstvo">
              Časopis<span aria-hidden="true">↓</span>
            </a>
          </div>
        </nav>
      ) : null}
      {postersResult.status === "fulfilled" ? (
        <PosterWall posters={activePosters} />
      ) : (
        <section id="vyveska" className="container section">
          <Unavailable compact title="Výveska je dočasne nedostupná." />
        </section>
      )}
      <section id={parishDesign ? "novinky" : undefined} className="section">
        <div className="container">
          <div className={styles.sectionTop}>
            <SectionHeading
              eyebrow="Zo života farnosti"
              title="Čo je u nás nové"
            />
            <Link href="/prispevky" className="textLink">
              Všetky príspevky
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          {recentNews ? (
            <EditorialGrid entries={recentNews} kind="news" />
          ) : (
            <Unavailable compact />
          )}
        </div>
      </section>
      {parishDesign ? <ChurchWelcome /> : null}
      <section
        id={parishDesign ? "sviatosti" : undefined}
        className={`${styles.highlights} ${
          parishDesign ? styles.parishHighlights : ""
        }`}
      >
        <div className={`container ${styles.highlightsInner}`}>
          {parishDesign ? (
            <figure className={styles.sacramentDetail}>
              <MediaImage
                image={churchDetails.book}
                sizes="(max-width:650px) 35vw, 22vw"
              />
              <figcaption>Zo života nášho kostola</figcaption>
            </figure>
          ) : null}
          <div>
            <p className="eyebrow">Sme tu pre vás</p>
            <h2>V každej etape života.</h2>
            <p>
              Praktické informácie, kontakty a pomoc pri príprave na prijatie
              sviatostí.
            </p>
            <Link href="/sviatosti/sviatost-krstu" className={styles.goldLink}>
              Prijatie sviatostí
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
          <div className={styles.highlightLinks}>
            <Link href="/sviatosti/sviatost-krstu">
              <span>
                <small>Nový začiatok</small>Krst
              </span>
              <Icon name="arrow-right" size={20} />
            </Link>
            <Link href="/sviatosti/sviatost-manzelstva">
              <span>
                <small>Spoločná cesta</small>Manželstvo
              </span>
              <Icon name="arrow-right" size={20} />
            </Link>
            <Link href="/sviatosti/sviatost-zmierenia">
              <span>
                <small>Pokoj pre dušu</small>Zmierenie
              </span>
              <Icon name="arrow-right" size={20} />
            </Link>
            <Link href="/kontakt">
              <span>
                <small>Radi vám pomôžeme</small>Farská kancelária
              </span>
              <Icon name="arrow-right" size={20} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className={styles.sectionTop}>
            <SectionHeading
              eyebrow="Náš farský kostol"
              title="Miesto, ktoré poznáme"
              description="Krása ukrytá v detailoch. Nahliadnite do Kostola sv. Alžbety."
            />
            <Link href="/farnost/galeria" className="textLink">
              Celá galéria
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          <div className={styles.gallery}>
            {(parishDesign
              ? [
                  churchDetails.vault,
                  churchDetails.iron,
                  churchDetails.chapel,
                  churchDetails.pews
                ]
              : churchGallery.slice(0, 4)
            ).map((image) => (
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
        id={parishDesign ? "spolocenstvo" : undefined}
        className={`section ${styles.magazine} ${
          parishDesign ? styles.parishMagazine : ""
        }`}
      >
        <div className="container">
          <div className={styles.sectionTop}>
            {parishDesign ? (
              <div className={styles.magazineDetail}>
                <MediaImage image={churchDetails.pews} sizes="180px" />
              </div>
            ) : null}
            <SectionHeading
              eyebrow="Ľudia, príbehy, viera"
              title="Naše spoločenstvo"
              description="Časopis a príbehy ľudí, ktorí tvoria našu farnosť."
            />
            <Link href="/farnost/nase-spolocenstvo" className="textLink">
              Všetky články
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
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
          <div
            className={`${styles.communities} ${
              parishDesign ? styles.parishCommunities : ""
            }`}
          >
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

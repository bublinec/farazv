import Link from "next/link";
import type { EditorialDocument } from "@/content/documents";
import { hospitalMinistry } from "@/content/hospital-ministry";
import {
  contentBlocksToRichText,
  richTextToPlainText,
  withoutRichTextMedia
} from "@/lib/rich-text";
import { RichText } from "@/components/editorial/RichText";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./HospitalMinistrySection.module.css";

export function HospitalMinistrySection({
  article
}: {
  article: EditorialDocument | null;
}) {
  const reading = article
    ? withoutRichTextMedia(
        article.body ?? contentBlocksToRichText(article.blocks)
      )
    : null;
  const readingText = reading
    ? richTextToPlainText(reading).replace(/\s+/g, " ").trim()
    : "";
  const hasReading =
    readingText &&
    readingText !== (article?.excerpt ?? "").replace(/\s+/g, " ").trim();

  return (
    <section
      id={hospitalMinistry.sectionId}
      aria-labelledby="nemocnica-heading"
      className={styles.section}
    >
      <div className="container">
        <header className={`sectionHeading ${styles.heading}`}>
          <h2 id="nemocnica-heading">Duchovná služba v nemocnici</h2>
          <span className="headingRule" aria-hidden="true" />
          <p>
            Vďaka ochote kňazov a laikov je v Nemocnici AGEL vo Zvolene dostupná
            duchovná služba pre pacientov.
          </p>
        </header>
        <div className={styles.layout}>
          <div className={styles.mass}>
            <div className={styles.massDetails}>
              <h3>Svätá omša</h3>
              <p className={styles.massTime}>
                <span>Každú sobotu</span>
                <strong>15:00</strong>
              </p>
              <p className={styles.location}>
                <Icon name="pin" size={20} />
                <span>
                  Jedáleň na <strong>2. poschodí</strong>
                  <br />
                  spoločného pavilónu
                </span>
              </p>
            </div>
            <a
              className={styles.plan}
              href={hospitalMinistry.plan.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.planViewport}>
                <MediaImage
                  image={hospitalMinistry.plan}
                  sizes="(max-width: 480px) 140vw, (max-width: 760px) 70vw, 500px"
                  quality="high"
                />
              </span>
              <span>
                Zväčšiť plán areálu
                <span className="srOnly"> (otvorí sa v novom okne)</span>
              </span>
            </a>
          </div>
          <div className={styles.services}>
            <section>
              <h3>Sväté prijímanie na izbách</h3>
              <p className={styles.when}>V nedeľu dopoludnia</p>
              <p>
                Záujem o sväté prijímanie nahláste zdravotníckemu personálu
                <strong> v nedeľu do 10:00.</strong> Akolyta vám ho prinesie na
                izbu v dopoludňajších hodinách.
              </p>
            </section>
            <section>
              <h3>Spoveď a pomazanie chorých</h3>
              <p className={styles.when}>V ktorýkoľvek deň na vyžiadanie</p>
              <p>
                {article?.excerpt ||
                  "Sviatosť pomazania chorých prináša posilu, úľavu a nádej pacientom v ťažkých chvíľach choroby."}
              </p>
              <p className={styles.request}>
                Obráťte sa na kňaza podľa rozpisu nižšie alebo na{" "}
                <Link href="/kontakt">farskú kanceláriu</Link>.
              </p>
            </section>
            <p className={styles.note}>
              Pamätajte aj na duchovné potreby svojich hospitalizovaných
              blízkych a pomôžte im o tejto službe dozvedieť sa.
            </p>
          </div>
        </div>
        <section
          className={styles.rosterSection}
          aria-labelledby="nemocnica-sluzba-heading"
        >
          <header>
            <h3 id="nemocnica-sluzba-heading">Kňazská služba v nemocnici</h3>
            <a
              href={hospitalMinistry.rosterSource}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rosterSource}
            >
              Pôvodný rozpis
              <span className="srOnly"> (otvorí sa v novom okne)</span>
            </a>
          </header>
          <dl className={styles.roster}>
            {hospitalMinistry.roster.map(({ day, priest, phone }) => (
              <div key={day}>
                <dt>{day}</dt>
                <dd>
                  <span>{priest}</span>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </dd>
              </div>
            ))}
            <div>
              <dt>Sobota</dt>
              <dd className={styles.saturday}>
                Kňaz, ktorý slúži svätú omšu o 15:00 v nemocnici.
              </dd>
            </div>
          </dl>
        </section>
        {hasReading && reading ? (
          <details className={styles.guidance}>
            <summary>
              O prijímaní sviatosti pomazania chorých
              <Icon name="chevron" size={20} />
            </summary>
            <RichText document={reading} className={styles.guidanceBody} />
          </details>
        ) : null}
      </div>
    </section>
  );
}

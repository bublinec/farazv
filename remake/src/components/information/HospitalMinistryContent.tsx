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
import styles from "./HospitalMinistryContent.module.css";

export function HospitalMinistryContent({
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
    <section aria-label={hospitalMinistry.title} className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.mass}>
            <div className={styles.massDetails}>
              <h2>Svätá omša v nemocnici</h2>
              <p className={styles.massTime}>
                <span>{hospitalMinistry.mass.day}</span>
                <strong>{hospitalMinistry.mass.time}</strong>
              </p>
              <p className={styles.location}>
                <Icon name="pin" size={20} />
                <span>{hospitalMinistry.mass.location}</span>
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
                  sizes="(max-width: 480px) 140vw, (max-width: 900px) 75vw, 560px"
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
              <h2>Sväté prijímanie na izbách</h2>
              <p className={styles.when}>{hospitalMinistry.communion.day}</p>
              <p>
                Záujem o sväté prijímanie nahláste zdravotníckemu personálu
                <strong>
                  {" "}
                  v nedeľu do {hospitalMinistry.communion.registrationDeadline}.
                </strong>{" "}
                Akolyta vám ho prinesie na izbu v dopoludňajších hodinách.
              </p>
            </section>
            <section>
              <h2>Spoveď a pomazanie chorých</h2>
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
            <h2 id="nemocnica-sluzba-heading">Kňazská služba podľa dní</h2>
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
                Kňaz, ktorý slúži svätú omšu o {hospitalMinistry.mass.time} v
                nemocnici.
              </dd>
            </div>
          </dl>
        </section>
        {hasReading && reading ? (
          <section
            className={styles.guidance}
            aria-labelledby="pomazanie-chorych-heading"
          >
            <div className={styles.guidanceReading}>
              <h2 id="pomazanie-chorych-heading">
                O prijímaní sviatosti pomazania chorých
              </h2>
              <RichText document={reading} className={styles.guidanceBody} />
              <Link
                href="/sviatosti/sviatost-pomazania-chorych"
                className="textLink"
              >
                Viac o sviatosti pomazania chorých{" "}
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

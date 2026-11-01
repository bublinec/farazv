import { saintCharbel } from "@/content/saint-charbel";
import { churchDetails } from "@/content/church-details";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import styles from "./SaintCharbelSection.module.css";

export function SaintCharbelSection() {
  return (
    <section
      id={saintCharbel.sectionId}
      aria-labelledby="svaty-sarbel-heading"
      className={styles.section}
    >
      <div className={styles.background} aria-hidden="true">
        <MediaImage image={{ ...churchDetails.chapel, alt: "" }} sizes="60vw" />
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={styles.portrait}>
          <MediaImage
            image={saintCharbel.portrait}
            sizes="280px"
            fit="contain"
          />
        </div>
        <div className={styles.content}>
          <h2 id="svaty-sarbel-heading">Pobožnosť ku cti sv. Šarbela</h2>
          <p className={styles.schedule}>
            <strong>Každého 22. v mesiaci</strong> po večernej svätej omši o
            18:00.
          </p>
          <p className={styles.location}>
            <Icon name="church" size={20} />
            Kostol sv. Alžbety vo Zvolene
          </p>
          <p>
            Pobožnosť je spojená s pomazaním olejom a prosbami za uzdravenie.
            Svoje krátke modlitbové úmysly za uzdravenie môžete poslať aj
            online.
          </p>
          <a
            href={saintCharbel.intentionFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.intentionLink}
          >
            Poslať modlitbový úmysel
            <Icon name="external" size={17} />
            <span className="srOnly"> (otvorí sa v novom okne)</span>
          </a>
          <p className={styles.note}>
            Ak 22. deň pripadne na nedeľu, pobožnosť sa koná v predvečer — v
            sobotu.
          </p>
        </div>
      </div>
    </section>
  );
}

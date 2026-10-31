import Link from "next/link";
import { churchDetails, churchPhotographer } from "@/content/church-details";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./ChurchWelcome.module.css";

export function ChurchWelcome() {
  return (
    <section className={styles.welcome} aria-labelledby="church-welcome-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Kostol sv. Alžbety vo Zvolene</p>
          <h2 id="church-welcome-title">
            Naša farnosť.
            <br />
            Náš kostol.
          </h2>
          <p className={styles.description}>
            Miesto modlitby, stretnutí a príbehov, ktoré spájajú generácie. Na
            zvolenskom námestí.
          </p>
          <div className={styles.links}>
            <Link href="/farnost/kostol-sv-alzbety">
              Spoznajte náš kostol <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/farnost/galeria">
              Galéria <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <figure className={styles.details}>
          <div className={`${styles.photo} ${styles.pews}`}>
            <MediaImage
              image={churchDetails.pews}
              className={styles.image}
              sizes="(max-width: 700px) 30vw, 150px"
            />
          </div>
          <div className={`${styles.photo} ${styles.vault}`}>
            <MediaImage
              image={churchDetails.vault}
              className={styles.image}
              sizes="(max-width: 700px) 36vw, 180px"
            />
          </div>
          <div className={`${styles.photo} ${styles.window}`}>
            <MediaImage
              image={churchDetails.window}
              className={styles.image}
              sizes="(max-width: 700px) 22vw, 110px"
            />
          </div>
          <figcaption className={styles.credit}>
            Fotografie nášho kostola:{" "}
            <a href={churchPhotographer.href}>{churchPhotographer.name}</a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

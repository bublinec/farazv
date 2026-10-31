import Link from "next/link";
import { sacramentsBackground, sacramentSummaries } from "@/content/sacraments";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./SacramentsSection.module.css";

export function SacramentsSection() {
  return (
    <section
      id="sviatosti"
      aria-labelledby="sviatosti-heading"
      className={styles.section}
    >
      <div className={styles.background} aria-hidden="true">
        <MediaImage
          image={{ ...sacramentsBackground, alt: "" }}
          sizes="100vw"
          quality="high"
        />
      </div>

      <div className={`container ${styles.content}`}>
        <div
          className={`sectionHeading sectionHeadingCenter ${styles.heading}`}
        >
          <p className="eyebrow">Farnosť</p>
          <h2 id="sviatosti-heading">Sviatosti</h2>
          <span className="headingRule" aria-hidden="true" />
        </div>

        <ul className={styles.sacraments}>
          {sacramentSummaries.map((sacrament) => (
            <li key={sacrament.href}>
              <article className={styles.sacrament}>
                <h3>{sacrament.title}</h3>
                <p>{sacrament.description}</p>
                <Link href={sacrament.href} className={styles.more}>
                  Zistiť viac
                  <span className="srOnly">: {sacrament.title}</span>
                  <Icon name="arrow-right" size={19} />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

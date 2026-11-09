import Link from "next/link";
import { sacramentsBackground, sacramentSummaries } from "@/content/sacraments";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import { getPublicPageLinks } from "@/server/public-content";
import styles from "./SacramentsSection.module.css";

export async function SacramentsSection() {
  // Sacrament pages added in the administration follow the original six.
  const added = (await getPublicPageLinks())
    .filter((page) => page.group === "sacrament")
    .map((page) => ({
      title: page.title,
      description: page.description,
      href: `/${page.route}`
    }));

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
          <h2 id="sviatosti-heading">Sviatosti</h2>
          <span className="headingRule" aria-hidden="true" />
        </div>

        <ul className={styles.sacraments}>
          {[...sacramentSummaries, ...added].map((sacrament) => (
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

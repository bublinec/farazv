import Link from "next/link";
import {
  parishHistoryBackground,
  parishHistoryLinks
} from "@/content/parish-history-banner";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./ParishHistoryBanner.module.css";

export function ParishHistoryBanner({ currentSlug }: { currentSlug: string }) {
  const links = parishHistoryLinks.filter(
    (link) => link.href !== `/${currentSlug}`
  );

  return (
    <section
      className={styles.section}
      aria-labelledby="farnost-historia-heading"
    >
      <div className={styles.background} aria-hidden="true">
        <MediaImage
          image={parishHistoryBackground}
          sizes="100vw"
          quality="high"
        />
      </div>

      <div className={`container ${styles.content}`}>
        <header
          className={`sectionHeading sectionHeadingCenter ${styles.heading}`}
        >
          <h2 id="farnost-historia-heading">Naša farnosť v premenách času</h2>
          <span className={`headingRule ${styles.rule}`} aria-hidden="true" />
        </header>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href} className={styles.item}>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <Link href={link.href} className={styles.more}>
                Zistiť viac
                <span className="srOnly">: {link.title}</span>
                <Icon name="arrow-right" size={19} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

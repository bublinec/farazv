import Link from "next/link";
import type { SettingsDocument } from "@/content/documents";
import { siteConfig } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { ChurchMark } from "./ChurchMark";
import styles from "./Footer.module.css";

export function Footer({ settings }: { settings: SettingsDocument | null }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <div className={styles.identity}>
          <Link href="/" className={styles.brand}>
            <ChurchMark className={styles.churchTower} />
            <h2>
              {siteConfig.name}
              <small>{siteConfig.city}</small>
            </h2>
          </Link>
          <p>
            Spolu tvoríme živé spoločenstvo viery,
            <br />
            nádeje a lásky.
          </p>
        </div>
        <div>
          <h3>Naša farnosť</h3>
          <ul>
            <li>
              <Link href="/farnost/farske-oznamy">Farské oznamy</Link>
            </li>
            <li>
              <Link href="/farnost/nase-spolocenstvo">Naše spoločenstvo</Link>
            </li>
            <li>
              <Link href="/farnost/galeria">Galéria kostola</Link>
            </li>
            <li>
              <Link href="/sviatosti/sviatost-krstu">Sviatosti</Link>
            </li>
            <li>
              <Link href="/kontakt">Všetky kontakty</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Úradné hodiny</h3>
          {settings ? (
            <ul className={styles.hours}>
              {settings.officeHours.map((row) => (
                <li key={row.day}>
                  <span>{row.day}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Kontaktné údaje sú dočasne nedostupné.</p>
          )}
          <Link href="/kontakt" className={styles.more}>
            Farská kancelária <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        <div>
          <h3>Sme tu pre vás</h3>
          {settings ? (
            <ul className={styles.contact}>
              <li>
                <Icon name="phone" size={16} />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                  {settings.phone}
                </a>
              </li>
              <li>
                <Icon name="mail" size={16} />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
              <li>
                <Icon name="pin" size={17} />
                <span>{settings.address}</span>
              </li>
            </ul>
          ) : (
            <p>Skúste stránku obnoviť neskôr.</p>
          )}
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
        <div>
          <a href="https://gdpr.kbs.sk/" target="_blank" rel="noreferrer">
            Ochrana osobných údajov
          </a>
          <a href={siteConfig.sourceUrl} target="_blank" rel="noreferrer">
            Otvorený kód pre farnosti <Icon name="external" size={12} />
          </a>
          <Link href="/admin">Redakcia</Link>
        </div>
      </div>
    </footer>
  );
}

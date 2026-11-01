import Link from "next/link";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./HospitalMinistrySection.module.css";

export function HospitalMinistrySection({
  serviceRosterHref
}: {
  serviceRosterHref?: string;
}) {
  return (
    <section
      id={hospitalMinistry.sectionId}
      aria-labelledby="nemocnica-heading"
      className={styles.section}
    >
      <div className={`container ${styles.inner}`}>
        <header className={styles.heading}>
          <h2 id="nemocnica-heading">Duchovná služba v nemocnici</h2>
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
              <MediaImage
                image={hospitalMinistry.plan}
                sizes="(max-width: 480px) 90vw, (max-width: 760px) 45vw, 320px"
              />
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
                Sviatosť zmierenia a pomazania chorých môžete prijať aj počas
                pobytu v nemocnici. Obráťte sa na kňaza podľa rozpisu služby
                alebo na farskú kanceláriu.
              </p>
              <Link
                href={serviceRosterHref ?? "/kontakt"}
                className={styles.contact}
              >
                {serviceRosterHref
                  ? "Rozpis služby a kontakty"
                  : "Kontakt na farskú kanceláriu"}
                <Icon name="arrow-right" size={17} />
              </Link>
            </section>
            <p className={styles.note}>
              Pamätajte aj na duchovné potreby svojich hospitalizovaných
              blízkych a pomôžte im o tejto službe dozvedieť sa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { Icon } from "@/components/ui/Icon";
import styles from "./HospitalMinistrySection.module.css";

export function HospitalMinistrySection() {
  return (
    <section
      id={hospitalMinistry.sectionId}
      aria-labelledby="nemocnica-heading"
      className={styles.section}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.introduction}>
          <h2 id="nemocnica-heading">{hospitalMinistry.title}</h2>
          <p>
            V Nemocnici AGEL vo Zvolene je pre pacientov dostupná duchovná
            služba. Pamätajte aj na svojich hospitalizovaných blízkych.
          </p>
          <Link href={hospitalMinistry.href} className="textLink">
            Informácie a kontakty <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Svätá omša</dt>
            <dd>
              <strong>
                {hospitalMinistry.mass.day} o {hospitalMinistry.mass.time}
              </strong>
              <span>{hospitalMinistry.mass.location}</span>
            </dd>
          </div>
          <div>
            <dt>Sväté prijímanie na izbách</dt>
            <dd>
              <strong>{hospitalMinistry.communion.day}</strong>
              <span>
                Záujem nahláste personálu do{" "}
                {hospitalMinistry.communion.registrationDeadline}.
              </span>
            </dd>
          </div>
          <div>
            <dt>Spoveď a pomazanie chorých</dt>
            <dd>V ktorýkoľvek deň na vyžiadanie</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

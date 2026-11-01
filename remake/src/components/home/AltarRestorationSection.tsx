import Link from "next/link";
import type { EditorialDocument } from "@/content/documents";
import { altarRestoration } from "@/content/altar-restoration";
import { MediaImage } from "@/components/ui/MediaImage";
import { IbanAccount } from "@/components/ui/IbanAccount";
import { Icon } from "@/components/ui/Icon";
import styles from "./AltarRestorationSection.module.css";

export function AltarRestorationSection({
  article
}: {
  article: EditorialDocument | null;
}) {
  if (!article) return null;

  return (
    <section
      id={altarRestoration.sectionId}
      className={styles.section}
      aria-labelledby="obnova-oltarov-heading"
    >
      <div className={styles.background} aria-hidden="true">
        <MediaImage
          image={{ ...altarRestoration.homepagePhotograph, alt: "" }}
          sizes="(max-width: 760px) 100vw, 72vw"
          quality="high"
        />
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h2 id="obnova-oltarov-heading">Pomôžme obnoviť oltár sv. Jozefa</h2>
          <p className={styles.introduction}>
            <strong>Posledný z trojice oltárov nášho farského kostola.</strong>{" "}
            Vaše milodary nám pomáhajú dokončiť ich obnovu.
          </p>
          <div className={styles.appeal}>
            <p className={styles.goal}>
              <span>Cieľ zbierky na oltár sv. Jozefa</span>
              <strong>{altarRestoration.goal}</strong>
            </p>
            <div className={styles.account}>
              <IbanAccount
                iban={altarRestoration.iban}
                label="Transparentný účet na obnovu oltárov"
              />
              <p className={styles.bank}>Prispieť môžete aj osobne.</p>
            </div>
          </div>
          <p className={styles.benefactors}>
            Každého <strong>17. v mesiaci</strong> sa v Kostole sv. Alžbety
            modlíme za našich dobrodincov a obetujeme za nich svätú omšu.
          </p>
          <div className={styles.footer}>
            <Link href={altarRestoration.href} className={styles.more}>
              Zobraziť viac <Icon name="arrow-right" size={18} />
            </Link>
            <p className={styles.thanks}>Pán Boh vám zaplať a požehnaj!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

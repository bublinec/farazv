import { IbanAccount } from "@/components/ui/IbanAccount";
import { MediaImage } from "@/components/ui/MediaImage";
import { churchDetails } from "@/content/church-details";
import type { MediaAsset } from "@/content/types";
import styles from "./DonationSection.module.css";

export function DonationSection({
  iban,
  qr
}: {
  iban: string;
  qr?: MediaAsset;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.background} aria-hidden="true">
        <MediaImage image={{ ...churchDetails.chapel, alt: "" }} sizes="55vw" />
      </div>
      <div
        className={`container ${styles.inner} ${!qr ? styles.withoutQr : ""}`}
      >
        {qr ? (
          <figure className={styles.qr}>
            <img
              src={qr.src}
              width={qr.width}
              height={qr.height}
              alt={qr.alt}
              loading="lazy"
            />
            <figcaption>Načítajte v bankovej aplikácii</figcaption>
          </figure>
        ) : null}
        <div className={styles.content}>
          <h2>Aj malý dar pomáha veľkým veciam.</h2>
          <p>Váš príspevok pomáha starať sa o naše kostoly a život farnosti.</p>
          <IbanAccount iban={iban} />
          <p className={styles.thanks}>Pán Boh zaplať za každý milodar.</p>
        </div>
      </div>
    </section>
  );
}

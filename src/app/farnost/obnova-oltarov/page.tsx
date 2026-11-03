import type { Metadata } from "next";
import { altarRestoration } from "@/content/altar-restoration";
import { PageHero } from "@/components/ui/PageHero";
import { IbanAccount } from "@/components/ui/IbanAccount";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const description =
  "Pomôžme obnoviť oltár sv. Jozefa, posledný z trojice oltárov Kostola sv. Alžbety vo Zvolene. Informácie o zbierke a príhovor našim dobrodincom.";

export const metadata: Metadata = {
  title: altarRestoration.title,
  description,
  alternates: { canonical: altarRestoration.href },
  openGraph: {
    title: altarRestoration.title,
    description,
    url: altarRestoration.href,
    images: [
      {
        url: altarRestoration.photograph.src,
        width: altarRestoration.photograph.width,
        height: altarRestoration.photograph.height,
        alt: altarRestoration.photograph.alt
      }
    ]
  }
};

export default function AltarRestorationPage() {
  return (
    <>
      <PageHero
        title={altarRestoration.title}
        description="Pomôžme dokončiť obnovu posledného z trojice oltárov nášho farského kostola."
        image={altarRestoration.photograph}
      />
      <div className={`container ${styles.layout}`}>
        <article className={styles.letter} aria-labelledby="prihovor-heading">
          <header>
            <h2 id="prihovor-heading">{altarRestoration.letter.title}</h2>
            <span className="headingRule" aria-hidden="true" />
          </header>
          <div className={`prose ${styles.reading}`}>
            {altarRestoration.letter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              {altarRestoration.letter.closing}
              <br />
              {altarRestoration.letter.signature}
            </p>
          </div>
        </article>
        <aside className={styles.appeal} aria-labelledby="zbierka-heading">
          <h2 id="zbierka-heading">Zbierka na posledný oltár</h2>
          <p>
            Vaše milodary sú určené na obnovu <strong>oltára sv. Jozefa</strong>
            , posledného z trojice oltárov nášho farského kostola.
          </p>
          <p className={styles.goal}>
            <span>Cieľ zbierky na jeho obnovu</span>
            <strong>{altarRestoration.goal}</strong>
          </p>
          <IbanAccount
            iban={altarRestoration.iban}
            label="Transparentný účet na obnovu oltárov"
          />
          <p className={styles.bank}>
            UniCredit Bank · Prispieť môžete aj osobne.
          </p>
          <p className={styles.benefactors}>
            Každého <strong>17. v mesiaci</strong> sa v Kostole sv. Alžbety
            modlíme za našich dobrodincov a obetujeme za nich svätú omšu.
          </p>
          <p className={styles.thanks}>Pán Boh vám zaplať a požehnaj!</p>
        </aside>
      </div>
    </>
  );
}

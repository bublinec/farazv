import type { Metadata } from "next";
import { altarRestoration } from "@/content/altar-restoration";
import type { EditorialDocument, RichTextDocument } from "@/content/documents";
import { getPublicEntry } from "@/server/public-content";
import {
  contentBlocksToRichText,
  richTextToPlainText,
  withoutRichTextMedia
} from "@/lib/rich-text";
import { PageHero } from "@/components/ui/PageHero";
import { IbanAccount } from "@/components/ui/IbanAccount";
import { Unavailable } from "@/components/ui/Unavailable";
import { RichText } from "@/components/editorial/RichText";
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

export default async function AltarRestorationPage() {
  let article: EditorialDocument | null = null;
  let letterUnavailable = false;

  try {
    article = await getPublicEntry("news", altarRestoration.postSlug);
  } catch {
    letterUnavailable = true;
  }

  let letter: RichTextDocument | null = null;

  if (article) {
    const original = withoutRichTextMedia(
      article.body ?? contentBlocksToRichText(article.blocks)
    );
    const [opening, ...content] = original.content;
    // The page supplies a readable heading; keep the complete published speech.
    letter =
      opening?.type === "heading" &&
      richTextToPlainText({ type: "doc", content: [opening] }).trim() ===
        "Poďakovanie a forma pomoci"
        ? { ...original, content }
        : original;
  }

  return (
    <>
      <PageHero
        title={altarRestoration.title}
        description="Pomôžme dokončiť obnovu posledného z trojice oltárov nášho farského kostola."
        image={altarRestoration.photograph}
      />
      <div
        className={`container ${styles.layout} ${
          !letter ? styles.withoutLetter : ""
        }`}
      >
        {letter ? (
          <article className={styles.letter} aria-labelledby="prihovor-heading">
            <header>
              <h2 id="prihovor-heading">Príhovor a poďakovanie dobrodincom</h2>
              <span className="headingRule" aria-hidden="true" />
            </header>
            <RichText document={letter} className={styles.reading} />
          </article>
        ) : null}
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
        {letterUnavailable ? (
          <Unavailable title="Príhovor je dočasne nedostupný." compact />
        ) : null}
      </div>
    </>
  );
}

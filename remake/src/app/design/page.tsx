import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { churchGallery } from "@/content/assets";
import { MediaImage } from "@/components/ui/MediaImage";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dva návrhy našej farskej stránky",
  robots: { index: false, follow: false }
};

export default function DesignComparisonPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <div className={`container section ${styles.page}`}>
      <p className="eyebrow">Pracovné návrhy · október 2026</p>
      <h1>
        Tá istá farnosť.
        <br />
        Dve podoby stránky.
      </h1>
      <p className={styles.lead}>
        Oba návrhy používajú rovnaký obsah a funkcie. Druhý dáva viac priestoru
        nášmu kostolu, jeho detailom a známemu pocitu farského spoločenstva.
      </p>
      <div className={styles.choices}>
        <article>
          <div className={styles.original}>
            <img
              src="/design/v1-home.jpg"
              alt="Uložený prvý návrh farskej stránky"
              width="1440"
              height="1000"
            />
          </div>
          <span className="eyebrow">Návrh 01 · uložený</span>
          <h2>Pokojný a prehľadný</h2>
          <p>
            Pôvodná verzia s písmom Ubuntu, modrou a zlatou, veľkou fotografiou
            pri rozpise a pravidelným usporiadaním.
          </p>
          <a href="/design/v1" className="buttonOutline">
            Otvoriť návrh 01 →
          </a>
        </article>
        <article>
          <div className={styles.photo}>
            <MediaImage
              image={churchGallery[0]}
              sizes="(max-width:700px) 100vw, 45vw"
            />
          </div>
          <span className="eyebrow">Návrh 02 · na porovnanie</span>
          <h2>Bližšie k nášmu kostolu</h2>
          <p>
            Teplejší podklad, knižné nadpisy a viac drobných fotografií: klenby,
            lavice, červený koberec a umelecké detaily.
          </p>
          <a href="/design/v2" className="button">
            Otvoriť návrh 02 →
          </a>
        </article>
      </div>
      <p className={styles.note}>
        Zvolený návrh sa pri prechádzaní stránky zachová v tomto prehliadači. V
        hornom pruhu sa môžete vrátiť k prvému návrhu. Obsah sviatostí, histórie
        a článkov ostáva rovnaký.
      </p>
    </div>
  );
}

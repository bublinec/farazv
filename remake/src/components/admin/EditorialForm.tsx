"use client";

import dynamic from "next/dynamic";
import type { EditorialDocument, RichTextDocument } from "@/content/documents";
import { contentBlocksToRichText } from "@/lib/rich-text";
import { Field } from "./Fields";
import { ImageField } from "./MediaPicker";
import styles from "./Admin.module.css";

const VisualEditor = dynamic(() => import("./VisualEditor"), {
  ssr: false,
  loading: () => <p role="status">Načítavam textový editor…</p>
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function EditorialForm({
  document,
  onChange,
  pathLocked = false,
  disabled = false
}: {
  document: EditorialDocument;
  onChange: (doc: EditorialDocument) => void;
  pathLocked?: boolean;
  disabled?: boolean;
}) {
  function update<K extends keyof EditorialDocument>(
    key: K,
    value: EditorialDocument[K]
  ) {
    onChange({ ...document, [key]: value });
  }

  const body: RichTextDocument =
    document.body ?? contentBlocksToRichText(document.blocks ?? []);

  return (
    <>
      <section className={styles.panel}>
        <h2>Základné údaje</h2>
        <div className={styles.fields}>
          <Field
            label="Názov"
            value={document.title}
            onChange={(value) => update("title", value)}
            wide
            maxLength={300}
          />
          <label className={`${styles.field} ${styles.wide}`}>
            Adresa stránky · posledná časť URL
            <input
              value={document.slug ?? ""}
              readOnly={pathLocked}
              onChange={(event) => update("slug", event.target.value)}
              maxLength={300}
            />
            <small>
              {pathLocked
                ? "Adresa už bola zverejnená. Zmena názvu ju nemení, aby existujúce odkazy ostali funkčné."
                : "Malé písmená bez diakritiky, číslice a spojovníky. Názov ani dátum adresu automaticky nemenia."}
            </small>
            {!pathLocked ? (
              <button
                className={styles.secondary}
                type="button"
                style={{ alignSelf: "start" }}
                onClick={() => update("slug", slugify(document.title))}
              >
                Vytvoriť adresu z názvu
              </button>
            ) : null}
          </label>
          <Field
            label="Dátum zobrazenia"
            type="date"
            value={document.date}
            onChange={(value) =>
              update("date", value as EditorialDocument["date"])
            }
            hint="Zverejnenie je okamžité. Tento dátum slúži na zobrazenie a radenie."
          />
          <Field
            label="Autor"
            value={document.author}
            onChange={(value) => update("author", value)}
            maxLength={300}
          />
          <Field
            label="Krátky úvod do zoznamu"
            value={document.excerpt}
            onChange={(value) => update("excerpt", value)}
            multiline
            wide
            maxLength={3000}
          />
        </div>
      </section>
      <section className={styles.panel}>
        <ImageField
          label="Titulný obrázok"
          value={document.cover}
          onChange={(image) => update("cover", image)}
        />
      </section>
      <section className={styles.panel}>
        <h2>Obsah</h2>
        <VisualEditor
          disabled={disabled}
          value={body}
          onChange={(value) => update("body", value)}
        />
        <p className={styles.hint}>
          Nadpis stránky je vyššie. V texte začínajte nadpisom 2. Obrázok
          vložíte z knižnice alebo priamym nahraním; PDF pridajte ako existujúci
          odkaz.
        </p>
      </section>
      <section className={styles.panel}>
        <h2>Umiestnenie a plagát</h2>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={document.showInNews ?? false}
            onChange={(e) => update("showInNews", e.target.checked)}
          />
          Zobraziť aj medzi novinkami
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={document.isPoster ?? false}
            onChange={(e) => update("isPoster", e.target.checked)}
          />
          Zobraziť titulný obrázok na nástenke ako plagát
        </label>
        {document.isPoster ? (
          <div className={styles.fields}>
            <Field
              label="Cieľ plagátu (nepovinné)"
              value={document.posterDestination}
              onChange={(value) => update("posterDestination", value)}
              hint="https://… alebo /miestna-stranka. Bez cieľa sa otvorí detail, prípadne samotný plagát."
            />
            <Field
              label="Zobrazovať plagát do (vrátane)"
              type="date"
              value={document.posterExpiresOn}
              onChange={(value) => update("posterExpiresOn", value)}
              hint="Po tomto dni sa plagát automaticky skryje. Detail zostane dostupný."
            />
          </div>
        ) : null}
      </section>
    </>
  );
}

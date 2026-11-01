"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type {
  EditorialDocument,
  EditorialRecordKind,
  RichTextDocument
} from "@/content/documents";
import { contentBlocksToRichText } from "@/lib/rich-text";
import { Field } from "./Fields";
import { ImageField } from "./MediaPicker";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";

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
  kind,
  document,
  onChange,
  pathLocked = false,
  disabled = false
}: {
  kind: EditorialRecordKind;
  document: EditorialDocument;
  onChange: (doc: EditorialDocument) => void;
  pathLocked?: boolean;
  disabled?: boolean;
}) {
  const customSlug = useRef(Boolean(document.slug));

  function updateTitle(title: string) {
    onChange({
      ...document,
      title,
      ...(!pathLocked && !customSlug.current ? { slug: slugify(title) } : {})
    });
  }

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
        <div className={formStyles.stack}>
          <Field
            label="Názov"
            path="title"
            value={document.title}
            onChange={updateTitle}
            maxLength={300}
          />
          <ImageField
            label="Titulný obrázok"
            path="cover"
            value={document.cover}
            onChange={(image) => update("cover", image)}
          />
          <Field
            label="Krátky úvod"
            path="excerpt"
            value={document.excerpt}
            onChange={(value) => update("excerpt", value)}
            multiline
            maxLength={3000}
          />
        </div>
      </section>
      <section className={styles.panel} data-field="body">
        <h2>Obsah</h2>
        <VisualEditor
          disabled={disabled}
          value={body}
          onChange={(value) => update("body", value)}
        />
      </section>
      <section className={styles.panel}>
        <h2>Podrobnosti</h2>
        <div className={styles.fields}>
          <Field
            label="Dátum zobrazenia"
            path="date"
            type="date"
            value={document.date}
            onChange={(value) =>
              update("date", value as EditorialDocument["date"])
            }
            hint="Určuje dátum a poradie na webe."
          />
          <Field
            label="Autor"
            value={document.author}
            onChange={(value) => update("author", value)}
            maxLength={300}
          />
        </div>
        <details className={formStyles.options}>
          <summary>Adresa stránky</summary>
          <Field
            label="Posledná časť adresy"
            path="slug"
            value={document.slug}
            readOnly={pathLocked}
            autoCapitalize="none"
            spellCheck={false}
            onChange={(value) => {
              customSlug.current = true;
              update("slug", value);
            }}
            maxLength={300}
            hint={
              pathLocked ? "Po zverejnení zostáva adresa rovnaká." : undefined
            }
          />
          {!pathLocked ? (
            <button
              className={styles.quietLink}
              type="button"
              onClick={() => {
                customSlug.current = false;
                update("slug", slugify(document.title));
              }}
            >
              Použiť adresu z názvu
            </button>
          ) : null}
        </details>
        {kind === "article" ? (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={document.showInNews ?? false}
              onChange={(e) => update("showInNews", e.target.checked)}
            />
            Zobraziť aj na Výveske
          </label>
        ) : null}
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={document.isPoster ?? false}
            onChange={(e) => update("isPoster", e.target.checked)}
          />
          Príspevok tvorí plagát
        </label>
        {document.isPoster ? (
          <div className={styles.fields}>
            <Field
              label="Odkaz na ďalšie informácie (nepovinné)"
              path="posterDestination"
              value={document.posterDestination}
              onChange={(value) => update("posterDestination", value)}
            />
            <Field
              label="Zobraziť na úvodnej stránke do (vrátane)"
              path="posterExpiresOn"
              type="date"
              value={document.posterExpiresOn}
              onChange={(value) => update("posterExpiresOn", value)}
              hint="Po tomto dni sa skryje z úvodnej stránky. Jeho vlastná adresa zostáva dostupná."
            />
          </div>
        ) : null}
      </section>
    </>
  );
}

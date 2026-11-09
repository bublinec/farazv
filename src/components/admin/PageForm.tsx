"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type {
  PageBlock,
  PageCard,
  PageDocument
} from "@/content/page-documents";
import { Icon } from "@/components/ui/Icon";
import { Field, StringList } from "./Fields";
import { ImageField } from "./MediaPicker";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";
import pageStyles from "./PageForm.module.css";

const VisualEditor = dynamic(() => import("./VisualEditor"), {
  ssr: false,
  loading: () => <p role="status">Načítavam textový editor…</p>
});

function newBlockId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function move<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;

  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Up, down and remove controls shared by blocks, cards and list rows. */
function RowControls({
  index,
  count,
  label,
  onMove,
  onRemove
}: {
  index: number;
  count: number;
  label: string;
  onMove: (offset: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className={pageStyles.controls}>
      <button
        type="button"
        className={formStyles.rowAction}
        disabled={index === 0}
        aria-label={`Posunúť vyššie: ${label}`}
        title="Posunúť vyššie"
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={formStyles.rowAction}
        disabled={index === count - 1}
        aria-label={`Posunúť nižšie: ${label}`}
        title="Posunúť nižšie"
        onClick={() => onMove(1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={`${formStyles.rowAction} ${formStyles.removeAction}`}
        aria-label={`Odstrániť: ${label}`}
        title="Odstrániť"
        onClick={() => {
          if (window.confirm(`Naozaj odstrániť „${label}“?`)) onRemove();
        }}
      >
        <Icon name="minus" size={17} />
      </button>
    </div>
  );
}

function CardEditor({
  card,
  path,
  imageTitle,
  onChange
}: {
  card: PageCard;
  path: string;
  imageTitle: string;
  onChange: (card: PageCard) => void;
}) {
  return (
    <div className={pageStyles.card}>
      <div className={styles.fields}>
        <Field
          label="Nadpis karty"
          path={`${path}.title`}
          value={card.title}
          onChange={(title) => onChange({ ...card, title })}
          maxLength={300}
        />
        <Field
          label="Text karty"
          path={`${path}.text`}
          value={card.text}
          onChange={(text) => onChange({ ...card, text })}
          multiline
          rows={3}
          maxLength={3000}
        />
        <Field
          label="Odkaz (nepovinné)"
          path={`${path}.href`}
          value={card.href}
          onChange={(href) => onChange({ ...card, href })}
          hint="Napr. /kontakt alebo https://…"
          autoCapitalize="none"
          spellCheck={false}
        />
        <Field
          label="Text odkazu"
          path={`${path}.linkLabel`}
          value={card.linkLabel}
          onChange={(linkLabel) => onChange({ ...card, linkLabel })}
          placeholder="Zistiť viac"
          maxLength={200}
        />
      </div>
      <ImageField
        label="Fotka karty (nepovinné)"
        path={`${path}.image`}
        imageTitle={card.title || imageTitle}
        value={card.image}
        onChange={(image) => onChange({ ...card, image })}
      />
    </div>
  );
}

function BlockEditor({
  block,
  index,
  imageTitle,
  disabled,
  onChange
}: {
  block: PageBlock;
  index: number;
  imageTitle: string;
  disabled: boolean;
  onChange: (block: PageBlock) => void;
}) {
  const path = `blocks.${index}`;

  if (block.type === "text")
    return (
      <>
        <div className={styles.fields}>
          <Field
            label={
              block.collapsed
                ? "Otázka (nadpis zbaleného bloku)"
                : "Nadpis bloku (nepovinné)"
            }
            path={`${path}.title`}
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            maxLength={300}
          />
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={block.collapsed ?? false}
            onChange={(event) =>
              onChange({ ...block, collapsed: event.target.checked })
            }
          />
          Zbalený blok – čitateľ ho otvorí kliknutím na otázku
        </label>
        <div data-field={`${path}.body`}>
          <VisualEditor
            imageTitle={imageTitle}
            disabled={disabled}
            value={block.body}
            onChange={(body) => onChange({ ...block, body })}
          />
        </div>
      </>
    );

  const updateCards = (cards: PageCard[]) => onChange({ ...block, cards });

  return (
    <>
      <div className={styles.fields}>
        <Field
          label="Nadpis skupiny kariet (nepovinné)"
          path={`${path}.title`}
          value={block.title}
          onChange={(title) => onChange({ ...block, title })}
          maxLength={300}
        />
      </div>
      {block.cards.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className={pageStyles.cardRow}
          data-field={`${path}.cards.${cardIndex}`}
        >
          <div className={pageStyles.rowHeader}>
            <strong>Karta {cardIndex + 1}</strong>
            <RowControls
              index={cardIndex}
              count={block.cards.length}
              label={card.title || `Karta ${cardIndex + 1}`}
              onMove={(offset) =>
                updateCards(move(block.cards, cardIndex, offset))
              }
              onRemove={() =>
                updateCards(block.cards.filter((_, i) => i !== cardIndex))
              }
            />
          </div>
          <CardEditor
            card={card}
            path={`${path}.cards.${cardIndex}`}
            imageTitle={imageTitle}
            onChange={(next) =>
              updateCards(
                block.cards.map((item, i) => (i === cardIndex ? next : item))
              )
            }
          />
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => updateCards([...block.cards, { title: "" }])}
      >
        + Pridať kartu
      </button>
    </>
  );
}

/** Repeated two-field rows for facts and links. */
function PairRows<T extends Record<string, string | undefined>>({
  rows,
  path,
  fields,
  empty,
  addLabel,
  rowLabel,
  onChange
}: {
  rows: T[];
  path: string;
  fields: { key: keyof T & string; label: string; hint?: ReactNode }[];
  empty: T;
  addLabel: string;
  rowLabel: (row: T, index: number) => string;
  onChange: (rows: T[]) => void;
}) {
  return (
    <>
      {rows.map((row, index) => (
        <div
          className={pageStyles.pairRow}
          key={index}
          data-field={`${path}.${index}`}
        >
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              hint={field.hint}
              path={`${path}.${index}.${field.key}`}
              value={row[field.key]}
              onChange={(value) =>
                onChange(
                  rows.map((item, i) =>
                    i === index ? { ...item, [field.key]: value } : item
                  )
                )
              }
            />
          ))}
          <RowControls
            index={index}
            count={rows.length}
            label={rowLabel(row, index)}
            onMove={(offset) => onChange(move(rows, index, offset))}
            onRemove={() => onChange(rows.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => onChange([...rows, { ...empty }])}
      >
        {addLabel}
      </button>
    </>
  );
}

export function PageForm({
  document,
  onChange,
  disabled = false
}: {
  document: PageDocument;
  onChange: (document: PageDocument) => void;
  disabled?: boolean;
}) {
  function update<K extends keyof PageDocument>(
    key: K,
    value: PageDocument[K]
  ) {
    onChange({ ...document, [key]: value });
  }

  const blocks = document.blocks;
  const updateBlocks = (next: PageBlock[]) => update("blocks", next);

  return (
    <>
      <section className={styles.panel}>
        <p className={styles.hint}>
          Adresa stránky: <strong>/{document.route}</strong>
        </p>
        <div className={formStyles.editorialOverview}>
          <div className={formStyles.editorialText}>
            <Field
              label="Nadpis"
              path="title"
              value={document.title}
              onChange={(title) => update("title", title)}
              maxLength={300}
            />
            <Field
              label="Úvod pod nadpisom"
              path="introduction"
              value={document.introduction}
              onChange={(value) => update("introduction", value)}
              multiline
              rows={3}
              maxLength={1000}
            />
            <Field
              label="Krátky popis do kariet a menu"
              path="menuDescription"
              value={document.menuDescription}
              onChange={(value) => update("menuDescription", value)}
              multiline
              rows={2}
              maxLength={500}
              hint="Použije sa pri novo pridaných stránkach na úvodnej stránke. Ak ostane prázdny, použije sa úvod."
            />
          </div>
          <div className={formStyles.editorialCover}>
            <ImageField
              label="Fotka v hlavičke"
              imageTitle={document.title}
              path="cover"
              value={document.cover}
              onChange={(cover) => update("cover", cover)}
            />
          </div>
        </div>
      </section>

      <section className={styles.panel} data-field="quotation">
        <h2>Citát</h2>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!document.quotation}
            onChange={(event) =>
              update(
                "quotation",
                event.target.checked ? { text: "", attribution: "" } : undefined
              )
            }
          />
          Zobraziť modrý pás s citátom pod hlavičkou
        </label>
        {document.quotation ? (
          <div className={styles.fields}>
            <Field
              label="Text citátu"
              path="quotation.text"
              value={document.quotation.text}
              onChange={(text) =>
                update("quotation", { ...document.quotation!, text })
              }
              multiline
              rows={4}
              wide
              maxLength={3000}
            />
            <Field
              label="Zdroj"
              path="quotation.attribution"
              value={document.quotation.attribution}
              onChange={(attribution) =>
                update("quotation", { ...document.quotation!, attribution })
              }
              hint="Napr. Katechizmus Katolíckej cirkvi 1213 (pomlčka sa doplní sama)."
            />
            <Field
              label="Odkaz na zdroj (nepovinné)"
              path="quotation.href"
              value={document.quotation.href}
              onChange={(href) =>
                update("quotation", { ...document.quotation!, href })
              }
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
        ) : null}
      </section>

      <section className={styles.panel} data-field="blocks">
        <h2>Obsah stránky</h2>
        <p className={styles.hint}>
          Obsah tvoria bloky. Bloky môžete pridávať, presúvať a odstraňovať.
          Textový blok obsahuje text, nadpisy, zoznamy, obrázky aj galérie.
        </p>
        {blocks.map((block, index) => {
          const label =
            block.title?.trim() ||
            (block.type === "text"
              ? `Textový blok ${index + 1}`
              : `Karty ${index + 1}`);

          return (
            <div
              key={block.id}
              className={pageStyles.block}
              data-field={`blocks.${index}`}
            >
              <div className={pageStyles.rowHeader}>
                <strong>
                  {index + 1}.{" "}
                  {block.type === "text" ? "Textový blok" : "Karty"}
                  {block.title?.trim() ? ` · ${block.title}` : ""}
                </strong>
                <RowControls
                  index={index}
                  count={blocks.length}
                  label={label}
                  onMove={(offset) => updateBlocks(move(blocks, index, offset))}
                  onRemove={() =>
                    updateBlocks(blocks.filter((_, i) => i !== index))
                  }
                />
              </div>
              <BlockEditor
                block={block}
                index={index}
                imageTitle={document.title}
                disabled={disabled}
                onChange={(next) =>
                  updateBlocks(
                    blocks.map((item, i) => (i === index ? next : item))
                  )
                }
              />
            </div>
          );
        })}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              updateBlocks([
                ...blocks,
                {
                  type: "text",
                  id: newBlockId("text"),
                  body: { type: "doc", content: [{ type: "paragraph" }] }
                }
              ])
            }
          >
            + Textový blok
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              updateBlocks([
                ...blocks,
                {
                  type: "cards",
                  id: newBlockId("karty"),
                  cards: [{ title: "" }]
                }
              ])
            }
          >
            + Blok kariet
          </button>
        </div>
      </section>

      <section className={styles.panel} data-field="aside">
        <h2>Bočný panel</h2>
        <p className={styles.hint}>
          {document.group === "sacrament"
            ? "Pri sviatostiach sa pod textom panela automaticky zobrazí kontakt na farskú kanceláriu z Nastavení."
            : "Bez kontaktu a údajov sa zobrazí kontakt na farskú kanceláriu z Nastavení."}
        </p>
        <div className={styles.fields}>
          <Field
            label="Nadpis panela"
            path="aside.title"
            value={document.aside?.title}
            onChange={(title) =>
              update(
                "aside",
                title || document.aside?.description || document.aside?.contact
                  ? { ...document.aside, title }
                  : undefined
              )
            }
            maxLength={300}
          />
          <Field
            label="Text panela"
            path="aside.description"
            value={document.aside?.description}
            onChange={(description) =>
              update("aside", {
                title: document.aside?.title ?? "",
                ...document.aside,
                description
              })
            }
            multiline
            rows={3}
            maxLength={2000}
          />
        </div>
        {document.group === "service" ? (
          <>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={!!document.aside?.contact}
                onChange={(event) =>
                  update("aside", {
                    title: document.aside?.title ?? "",
                    ...document.aside,
                    contact: event.target.checked
                      ? { name: "", phones: [""] }
                      : undefined
                  })
                }
              />
              Zobraziť kontaktnú osobu
            </label>
            {document.aside?.contact ? (
              <div data-field="aside.contact">
                <Field
                  label="Meno kontaktnej osoby"
                  path="aside.contact.name"
                  value={document.aside.contact.name}
                  onChange={(name) =>
                    update("aside", {
                      ...document.aside!,
                      contact: { ...document.aside!.contact!, name }
                    })
                  }
                  maxLength={300}
                />
                <h3>Telefóny</h3>
                <StringList
                  label="Telefón"
                  values={document.aside.contact.phones}
                  onChange={(phones) =>
                    update("aside", {
                      ...document.aside!,
                      contact: { ...document.aside!.contact!, phones }
                    })
                  }
                />
              </div>
            ) : null}
            <h3>Praktické údaje</h3>
            <PairRows
              rows={document.facts}
              path="facts"
              fields={[
                { key: "label", label: "Názov (napr. Nácvik)" },
                { key: "value", label: "Hodnota (napr. Nedeľa o 9:00)" }
              ]}
              empty={{ label: "", value: "" }}
              addLabel="+ Pridať údaj"
              rowLabel={(row, index) => row.label || `Údaj ${index + 1}`}
              onChange={(facts) => update("facts", facts)}
            />
          </>
        ) : null}
      </section>

      <section className={styles.panel} data-field="links">
        <h2>Odkazy</h2>
        <p className={styles.hint}>
          Napr. formulár alebo PDF uložené na Google Drive. Interné stránky
          začínajú lomkou, napr. /farnost/farske-oznamy.
        </p>
        <PairRows
          rows={document.links}
          path="links"
          fields={[
            { key: "label", label: "Text odkazu" },
            { key: "href", label: "Adresa" }
          ]}
          empty={{ label: "", href: "" }}
          addLabel="+ Pridať odkaz"
          rowLabel={(row, index) => row.label || `Odkaz ${index + 1}`}
          onChange={(links) => update("links", links)}
        />
      </section>

      <section className={styles.panel} data-field="preparation">
        <h2>Kroky prípravy</h2>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!document.preparation}
            onChange={(event) =>
              update(
                "preparation",
                event.target.checked
                  ? {
                      title: document.title,
                      steps: [{ when: "", title: "", description: "" }]
                    }
                  : undefined
              )
            }
          />
          Zobraziť časovú os prípravy v bočnom paneli
        </label>
        {document.preparation ? (
          <>
            <Field
              label="Nadpis časovej osi"
              path="preparation.title"
              value={document.preparation.title}
              onChange={(title) =>
                update("preparation", { ...document.preparation!, title })
              }
              maxLength={300}
            />
            <PairRows
              rows={document.preparation.steps}
              path="preparation.steps"
              fields={[
                { key: "when", label: "Kedy" },
                { key: "title", label: "Krok" },
                { key: "description", label: "Popis" }
              ]}
              empty={{ when: "", title: "", description: "" }}
              addLabel="+ Pridať krok"
              rowLabel={(row, index) => row.title || `Krok ${index + 1}`}
              onChange={(steps) =>
                update("preparation", { ...document.preparation!, steps })
              }
            />
          </>
        ) : null}
      </section>
    </>
  );
}

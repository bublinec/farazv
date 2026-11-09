"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import type {
  PageBlock,
  PageCard,
  PageDocument
} from "@/content/page-documents";
import { richTextToPlainText } from "@/lib/rich-text";
import { Icon } from "@/components/ui/Icon";
import { useInvalidField } from "./EditorValidation";
import { Field, StringList } from "./Fields";
import { ImageField } from "./MediaPicker";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";
import pageStyles from "./PageForm.module.css";

const VisualEditor = dynamic(() => import("./VisualEditor"), {
  ssr: false,
  loading: () => <p role="status">Načítavam textový editor…</p>
});

type TabId = "content" | "header" | "aside";

const tabs: { id: TabId; label: string }[] = [
  { id: "content", label: "Obsah" },
  { id: "header", label: "Hlavička" },
  { id: "aside", label: "Bočný panel" }
];

/** Which tab holds a server validation field path. */
function tabForField(path: string): TabId | null {
  if (!path) return null;
  if (path.startsWith("blocks")) return "content";
  if (/^(aside|facts|links|preparation)/.test(path)) return "aside";
  return "header";
}

type BlockKind = "text" | "question" | "cards";

const blockKinds: {
  kind: BlockKind;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    kind: "text",
    icon: "¶",
    label: "Text",
    description: "Odseky, nadpisy, zoznamy, fotky a galérie."
  },
  {
    kind: "question",
    icon: "?",
    label: "Otázka a odpoveď",
    description: "Zbalená otázka, ktorú si čitateľ rozbalí."
  },
  {
    kind: "cards",
    icon: "▦",
    label: "Karty",
    description: "Dlaždice s nadpisom, textom, fotkou a odkazom."
  }
];

function newBlockId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function createBlock(kind: BlockKind): PageBlock {
  const body = { type: "doc" as const, content: [{ type: "paragraph" }] };

  if (kind === "cards")
    return { type: "cards", id: newBlockId("karty"), cards: [{ title: "" }] };
  if (kind === "question")
    return {
      type: "text",
      id: newBlockId("otazka"),
      title: "",
      collapsed: true,
      body
    };
  return { type: "text", id: newBlockId("text"), body };
}

function blockKind(block: PageBlock): BlockKind {
  if (block.type === "cards") return "cards";
  return block.collapsed ? "question" : "text";
}

/** A one-line description of a closed block. */
function blockSummary(block: PageBlock) {
  if (block.type === "cards") {
    const titles = block.cards.map((card) => card.title.trim()).filter(Boolean);
    const count = `${block.cards.length} ${
      block.cards.length === 1
        ? "karta"
        : block.cards.length < 5
        ? "karty"
        : "kariet"
    }`;
    return titles.length ? `${count}: ${titles.join(", ")}` : count;
  }

  const text = richTextToPlainText(block.body).replace(/\s+/g, " ").trim();
  const heading = block.title?.trim();
  if (heading && text) return `${heading} – ${text}`;
  return heading || text || "Prázdny blok";
}

function move<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;

  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Up, down, duplicate and remove controls for blocks, cards and rows. */
function RowControls({
  index,
  count,
  label,
  onMove,
  onDuplicate,
  onRemove
}: {
  index: number;
  count: number;
  label: string;
  onMove: (offset: number) => void;
  onDuplicate?: () => void;
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
      {onDuplicate ? (
        <button
          type="button"
          className={formStyles.rowAction}
          aria-label={`Duplikovať: ${label}`}
          title="Duplikovať"
          onClick={onDuplicate}
        >
          ⧉
        </button>
      ) : null}
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

/** Insert a new block at a position; opens a small picker of block types. */
function BlockInserter({
  onInsert,
  prominent = false
}: {
  onInsert: (kind: BlockKind) => void;
  prominent?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!open)
    return (
      <div
        className={`${pageStyles.inserter} ${
          prominent ? pageStyles.inserterProminent : ""
        }`}
      >
        <button
          type="button"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">+</span>
          {prominent ? "Pridať blok" : "Pridať blok sem"}
        </button>
      </div>
    );

  return (
    <div
      className={pageStyles.picker}
      role="group"
      aria-label="Vyberte typ bloku"
    >
      <div className={pageStyles.pickerTiles}>
        {blockKinds.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            className={pageStyles.pickerTile}
            onClick={() => {
              setOpen(false);
              onInsert(entry.kind);
            }}
          >
            <span className={pageStyles.pickerIcon} aria-hidden="true">
              {entry.icon}
            </span>
            <strong>{entry.label}</strong>
            <small>{entry.description}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.quietLink}
        onClick={() => setOpen(false)}
      >
        Zrušiť
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
                ? "Otázka (čitateľ ju vidí zbalenú)"
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
            label={block.collapsed ? "Odpoveď" : "Text bloku"}
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
              onDuplicate={() =>
                updateCards([
                  ...block.cards.slice(0, cardIndex + 1),
                  structuredClone(card),
                  ...block.cards.slice(cardIndex + 1)
                ])
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

/** Repeated rows for facts, links and preparation steps. */
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
  fields: {
    key: keyof T & string;
    label: string;
    hint?: ReactNode;
    multiline?: boolean;
  }[];
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
              multiline={field.multiline}
              rows={field.multiline ? 3 : undefined}
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

function ContentTab({
  document,
  disabled,
  invalidField,
  onChange
}: {
  document: PageDocument;
  disabled: boolean;
  invalidField: string;
  onChange: (blocks: PageBlock[]) => void;
}) {
  const blocks = document.blocks;
  const [openBlocks, setOpenBlocks] = useState<Set<string>>(
    () => new Set(blocks.length === 1 ? [blocks[0].id] : [])
  );

  // A validation error inside a closed block opens that block.
  useEffect(() => {
    const match = /^blocks\.(\d+)/.exec(invalidField);
    const block = match ? blocks[Number(match[1])] : undefined;
    if (block)
      setOpenBlocks((current) =>
        current.has(block.id) ? current : new Set([...current, block.id])
      );
  }, [invalidField, blocks]);

  function toggle(id: string) {
    setOpenBlocks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function insert(position: number, kind: BlockKind) {
    const block = createBlock(kind);
    setOpenBlocks((current) => new Set([...current, block.id]));
    onChange([...blocks.slice(0, position), block, ...blocks.slice(position)]);
  }

  return (
    <section className={styles.panel} data-field="blocks">
      <h2 className="srOnly">Obsah stránky</h2>
      <p className={styles.hint}>
        Stránka sa skladá z blokov. Ťuknutím na blok ho otvoríte na úpravu.
        Tlačidlom + pridáte nový blok na vybrané miesto.
      </p>
      {blocks.map((block, index) => {
        const kind = blockKinds.find(
          (entry) => entry.kind === blockKind(block)
        )!;
        const isOpen = openBlocks.has(block.id);
        const summary = blockSummary(block);

        return (
          <div key={block.id}>
            {index === 0 ? (
              <BlockInserter onInsert={(type) => insert(0, type)} />
            ) : null}
            <article
              className={`${pageStyles.block} ${
                isOpen ? pageStyles.blockOpen : ""
              }`}
              data-field={`blocks.${index}`}
              aria-label={`${index + 1}. ${kind.label}`}
            >
              <div className={pageStyles.blockHeader}>
                <button
                  type="button"
                  className={pageStyles.blockToggle}
                  aria-expanded={isOpen}
                  aria-controls={`blok-${block.id}`}
                  onClick={() => toggle(block.id)}
                >
                  <span className={pageStyles.blockIcon} aria-hidden="true">
                    {kind.icon}
                  </span>
                  <span className={pageStyles.blockText}>
                    <strong>
                      {index + 1}. {kind.label}
                    </strong>
                    <small>{summary}</small>
                  </span>
                  <span className={pageStyles.blockChevron} aria-hidden="true">
                    <Icon name="chevron" size={20} />
                  </span>
                </button>
                <RowControls
                  index={index}
                  count={blocks.length}
                  label={`${index + 1}. ${kind.label}`}
                  onMove={(offset) => onChange(move(blocks, index, offset))}
                  onDuplicate={() => {
                    const copy = {
                      ...structuredClone(block),
                      id: newBlockId(block.type)
                    };
                    setOpenBlocks((current) => new Set([...current, copy.id]));
                    onChange([
                      ...blocks.slice(0, index + 1),
                      copy,
                      ...blocks.slice(index + 1)
                    ]);
                  }}
                  onRemove={() =>
                    onChange(blocks.filter((_, i) => i !== index))
                  }
                />
              </div>
              <div
                id={`blok-${block.id}`}
                className={pageStyles.blockBody}
                hidden={!isOpen}
              >
                <BlockEditor
                  block={block}
                  index={index}
                  imageTitle={document.title}
                  disabled={disabled}
                  onChange={(next) =>
                    onChange(
                      blocks.map((item, i) => (i === index ? next : item))
                    )
                  }
                />
              </div>
            </article>
            <BlockInserter
              prominent={index === blocks.length - 1}
              onInsert={(type) => insert(index + 1, type)}
            />
          </div>
        );
      })}
      {blocks.length === 0 ? (
        <BlockInserter prominent onInsert={(type) => insert(0, type)} />
      ) : null}
    </section>
  );
}

function HeaderTab({
  document,
  update
}: {
  document: PageDocument;
  update: <K extends keyof PageDocument>(
    key: K,
    value: PageDocument[K]
  ) => void;
}) {
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
    </>
  );
}

function AsideTab({
  document,
  update
}: {
  document: PageDocument;
  update: <K extends keyof PageDocument>(
    key: K,
    value: PageDocument[K]
  ) => void;
}) {
  return (
    <>
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
                {
                  key: "value",
                  label: "Hodnota (napr. Nedeľa o 9:00)",
                  multiline: true
                }
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
                { key: "description", label: "Popis", multiline: true }
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

export function PageForm({
  document,
  onChange,
  disabled = false
}: {
  document: PageDocument;
  onChange: (document: PageDocument) => void;
  disabled?: boolean;
}) {
  const [tab, setTab] = useState<TabId>("content");
  const invalidField = useInvalidField();

  // Show the tab containing a field the server rejected.
  useEffect(() => {
    const target = tabForField(invalidField);
    if (target) setTab(target);
  }, [invalidField]);

  function update<K extends keyof PageDocument>(
    key: K,
    value: PageDocument[K]
  ) {
    onChange({ ...document, [key]: value });
  }

  return (
    <>
      <div
        className={pageStyles.tabs}
        role="tablist"
        aria-label="Časti stránky"
      >
        {tabs.map((entry) => (
          <button
            key={entry.id}
            id={`zalozka-${entry.id}`}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            aria-controls={`panel-${entry.id}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* Panels stay mounted so text editors keep their place between tabs. */}
      <div
        id="panel-content"
        role="tabpanel"
        aria-labelledby="zalozka-content"
        hidden={tab !== "content"}
      >
        <ContentTab
          document={document}
          disabled={disabled}
          invalidField={invalidField}
          onChange={(blocks) => update("blocks", blocks)}
        />
      </div>
      <div
        id="panel-header"
        role="tabpanel"
        aria-labelledby="zalozka-header"
        hidden={tab !== "header"}
      >
        <HeaderTab document={document} update={update} />
      </div>
      <div
        id="panel-aside"
        role="tabpanel"
        aria-labelledby="zalozka-aside"
        hidden={tab !== "aside"}
      >
        <AsideTab document={document} update={update} />
      </div>
    </>
  );
}

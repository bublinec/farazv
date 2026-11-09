import type { RichTextNode } from "@/content/documents";
import {
  pageGroupForRoute,
  pageGroups,
  type PageDocument
} from "@/content/page-documents";
import { isSafeLink, validateRichText } from "@/lib/rich-text";
import { draftBodyImages, hasMeaningfulBody } from "./editorial";
import {
  asArray,
  asObject,
  draftMedia,
  fail,
  keepFields,
  optionalText,
  requireText
} from "./shared";

function optionalLink(value: unknown, field: string) {
  optionalText(value, 4096, "Skontrolujte adresu odkazu.");
  if (value && !isSafeLink(value))
    fail(
      "Odkaz musí byť bezpečná adresa (https://, /, tel: alebo mailto:).",
      field
    );
}

function draftRichText(value: unknown, field: string) {
  let document;
  try {
    document = validateRichText(value ?? { type: "doc", content: [] });
  } catch {
    return fail("Skontrolujte formát a odkazy v texte.", field);
  }

  draftBodyImages(document as RichTextNode);
  return document;
}

function draftBlocks(value: unknown) {
  const blocks = asArray(
    value ?? [],
    60,
    "Stránka môže mať najviac 60 blokov."
  );
  const ids = new Set<string>();

  for (const [index, item] of blocks.entries()) {
    const block = asObject(item, "Skontrolujte bloky stránky.");
    const path = `blocks.${index}`;
    requireText(block.id, 120, "Blok nemá platnú identitu.");
    if (!/^[\w-]+$/.test(block.id as string) || ids.has(block.id as string))
      fail("Blok nemá platnú identitu.", path);
    ids.add(block.id as string);
    optionalText(block.title, 300, "Skontrolujte nadpis bloku.");

    if (block.type === "text") {
      if (
        block.titleLevel !== undefined &&
        ![2, 3].includes(block.titleLevel as number)
      )
        fail("Skontrolujte úroveň nadpisu bloku.", path);
      if (block.collapsed !== undefined && typeof block.collapsed !== "boolean")
        fail("Skontrolujte prepínač zbaleného bloku.", path);
      block.body = draftRichText(block.body, `${path}.body`);
      keepFields(block, [
        "type",
        "id",
        "title",
        "titleLevel",
        "collapsed",
        "body"
      ]);
    } else if (block.type === "cards") {
      const cards = asArray(
        block.cards ?? [],
        24,
        "Blok môže mať najviac 24 kariet."
      );
      for (const [cardIndex, entry] of cards.entries()) {
        const card = asObject(entry, "Skontrolujte kartu.");
        const cardPath = `${path}.cards.${cardIndex}`;
        requireText(card.title, 300, "Skontrolujte nadpis karty.");
        optionalText(card.text, 3000, "Skontrolujte text karty.");
        optionalText(card.linkLabel, 200, "Skontrolujte popis odkazu karty.");
        optionalLink(card.href, `${cardPath}.href`);
        if (card.image !== undefined) draftMedia(card.image);
        keepFields(card, ["title", "text", "image", "href", "linkLabel"]);
      }
      block.cards = cards;
      keepFields(block, ["type", "id", "title", "cards"]);
    } else fail("Stránka obsahuje nepodporovaný blok.", path);
  }

  return blocks;
}

/** Parse a safe editable sacrament or service page draft. */
export function parsePageDraft(input: Record<string, unknown>): PageDocument {
  requireText(input.route, 200, "Stránka nemá platnú adresu.");
  const group = pageGroupForRoute(input.route as string);
  if (!group || group !== input.group)
    fail("Stránka nemá platnú adresu alebo skupinu.");

  requireText(input.title, 300, "Skontrolujte nadpis.");
  input.eyebrow ??= pageGroups[group!].eyebrow;
  requireText(input.eyebrow, 120, "Skontrolujte nadradený popis.");
  input.introduction ??= "";
  requireText(input.introduction, 1000, "Skontrolujte úvod.");
  optionalText(input.menuDescription, 500, "Skontrolujte krátky popis.");
  if (input.cover !== undefined) draftMedia(input.cover);

  if (input.quotation !== undefined) {
    const quotation = asObject(input.quotation, "Skontrolujte citát.");
    requireText(quotation.text, 3000, "Skontrolujte text citátu.");
    requireText(quotation.attribution, 500, "Skontrolujte zdroj citátu.");
    optionalLink(quotation.href, "quotation.href");
    keepFields(quotation, ["text", "attribution", "href"]);
  }

  input.blocks = draftBlocks(input.blocks);

  if (input.aside !== undefined) {
    const aside = asObject(input.aside, "Skontrolujte bočný panel.");
    requireText(aside.title, 300, "Skontrolujte nadpis bočného panelu.");
    optionalText(aside.description, 2000, "Skontrolujte text bočného panelu.");
    if (aside.contact !== undefined) {
      const contact = asObject(aside.contact, "Skontrolujte kontakt.");
      requireText(contact.name, 300, "Skontrolujte meno kontaktu.");
      for (const phone of asArray(
        contact.phones ?? [],
        6,
        "Najviac 6 telefónov."
      ))
        requireText(phone, 40, "Skontrolujte telefónne číslo.");
      contact.phones ??= [];
      keepFields(contact, ["name", "phones"]);
    }
    keepFields(aside, ["title", "description", "contact"]);
  }

  for (const fact of asArray(input.facts ?? [], 20, "Najviac 20 údajov.")) {
    const entry = asObject(fact, "Skontrolujte praktické údaje.");
    requireText(entry.label, 200, "Skontrolujte názov údaja.");
    requireText(entry.value, 1000, "Skontrolujte hodnotu údaja.");
    keepFields(entry, ["label", "value"]);
  }
  input.facts ??= [];

  for (const [index, link] of asArray(
    input.links ?? [],
    20,
    "Najviac 20 odkazov."
  ).entries()) {
    const entry = asObject(link, "Skontrolujte odkazy.");
    requireText(entry.label, 300, "Skontrolujte text odkazu.");
    requireText(entry.href, 4096, "Skontrolujte adresu odkazu.");
    optionalLink(entry.href, `links.${index}.href`);
    optionalText(entry.description, 500, "Skontrolujte popis odkazu.");
    keepFields(entry, ["label", "href", "description"]);
  }
  input.links ??= [];

  if (input.preparation !== undefined) {
    const preparation = asObject(
      input.preparation,
      "Skontrolujte kroky prípravy."
    );
    requireText(preparation.title, 300, "Skontrolujte nadpis prípravy.");
    for (const step of asArray(
      preparation.steps ?? [],
      20,
      "Najviac 20 krokov."
    )) {
      const entry = asObject(step, "Skontrolujte krok prípravy.");
      for (const key of ["when", "title", "description"]) {
        entry[key] ??= "";
        requireText(entry[key], 1000, "Skontrolujte krok prípravy.");
      }
      keepFields(entry, ["when", "title", "description"]);
    }
    preparation.steps ??= [];
    keepFields(preparation, ["title", "steps"]);
  }

  keepFields(input, [
    "route",
    "group",
    "title",
    "eyebrow",
    "introduction",
    "menuDescription",
    "cover",
    "quotation",
    "blocks",
    "aside",
    "facts",
    "links",
    "preparation"
  ]);

  return input as unknown as PageDocument;
}

/** Publication requires a complete, readable page. */
export function requirePublishedPage(page: PageDocument) {
  if (!page.title.trim()) fail("Vyplňte nadpis stránky.", "title");
  if (!page.introduction.trim()) fail("Vyplňte úvod stránky.", "introduction");

  const hasContent = page.blocks.some((block) =>
    block.type === "text"
      ? hasMeaningfulBody(block.body) || !!block.title?.trim()
      : block.cards.length > 0
  );
  if (!hasContent) fail("Pridajte aspoň jeden blok s obsahom.", "blocks");

  if (page.quotation && !page.quotation.text.trim())
    fail("Doplňte text citátu alebo citát vypnite.", "quotation.text");

  for (const [index, block] of page.blocks.entries()) {
    if (block.type === "text" && block.collapsed && !block.title?.trim())
      fail("Zbalený blok potrebuje nadpis (otázku).", `blocks.${index}.title`);
    if (block.type === "cards")
      block.cards.forEach((card, cardIndex) => {
        if (!card.title.trim())
          fail(
            "Karta potrebuje nadpis.",
            `blocks.${index}.cards.${cardIndex}.title`
          );
      });
    if (block.type === "cards" && !block.cards.length)
      fail(
        "Blok kariet je prázdny. Pridajte kartu alebo blok odstráňte.",
        `blocks.${index}`
      );
  }

  for (const [index, link] of page.links.entries())
    if (!link.label.trim() || !link.href.trim())
      fail("Odkaz potrebuje text aj adresu.", `links.${index}`);

  page.preparation?.steps.forEach((step, index) => {
    if (!step.title.trim())
      fail("Krok prípravy potrebuje nadpis.", `preparation.steps.${index}`);
  });
}

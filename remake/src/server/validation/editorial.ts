import type { EditorialDocument, RichTextNode } from "@/content/documents";
import type { ContentBlock } from "@/content/types";
import {
  contentBlocksToRichText,
  isSafeLink,
  validateRichText
} from "@/lib/rich-text";
import {
  asArray,
  asObject,
  draftMedia,
  fail,
  isCalendarDate,
  isSafePosterDestination,
  keepFields,
  optionalText,
  requireText,
  validateMedia
} from "./shared";

function draftBodyImages(node: RichTextNode) {
  if (node.type === "image") {
    const attrs = node.attrs;
    // The rich-text parser already strips unsupported attributes and schemes.
    // Every image must also belong to the imported/configured Cloudinary account.
    if (!validateMedia(attrs))
      fail("Vyberte obrázky v texte z knižnice Cloudinary.");
  }
  if (node.type === "imageGallery")
    for (const image of asArray(
      node.attrs?.images,
      200,
      "Skontrolujte galériu."
    ))
      draftMedia(image);
  node.content?.forEach(draftBodyImages);
}

function hasMeaningfulBody(node: RichTextNode): boolean {
  return (
    (node.type === "text" && !!node.text?.trim()) ||
    node.type === "image" ||
    (node.type === "imageGallery" &&
      !!(node.attrs?.images as unknown[])?.length) ||
    (node.content?.some(hasMeaningfulBody) ?? false)
  );
}

function draftBlocks(value: unknown): ContentBlock[] {
  const result = asArray(value ?? [], 2000, "Skontrolujte obsah príspevku.");
  for (const item of result) {
    const block = asObject(item, "Skontrolujte obsah príspevku.");
    if (["paragraph", "heading", "quote"].includes(block.type as string)) {
      requireText(block.text, 100000, "Skontrolujte text príspevku.");
      keepFields(block, ["type", "text"]);
    } else if (block.type === "list") {
      for (const text of asArray(block.items, 500, "Skontrolujte zoznam."))
        requireText(text, 100000, "Skontrolujte text zoznamu.");
      keepFields(block, ["type", "items"]);
    } else if (block.type === "image") {
      draftMedia(block.image);
      keepFields(block, ["type", "image"]);
    } else if (block.type === "gallery") {
      for (const image of asArray(block.images, 200, "Skontrolujte galériu."))
        draftMedia(image);
      keepFields(block, ["type", "images"]);
    } else if (block.type === "link") {
      if (!isSafeLink(block.href)) fail("Skontrolujte bezpečnú adresu odkazu.");
      requireText(block.label, 3000, "Skontrolujte popis odkazu.");
      keepFields(block, ["type", "href", "label"]);
    } else fail("Príspevok obsahuje nepodporovaný blok.");
  }
  return result as ContentBlock[];
}

export function parseEditorialDraft(
  input: Record<string, unknown>
): EditorialDocument {
  optionalText(input.id, 200, "Neplatná identita obsahu.");
  requireText(input.title, 500, "Skontrolujte názov.");
  requireText(input.slug, 240, "Skontrolujte URL príspevku.");
  if (!isCalendarDate(input.date)) fail("Vyplňte platný dátum zobrazenia.");
  if (input.excerpt === undefined) input.excerpt = "";
  requireText(input.excerpt, 5000, "Skontrolujte perex.");
  optionalText(input.author, 500, "Skontrolujte autora.");

  if (input.cover !== undefined) draftMedia(input.cover);
  for (const key of ["isPoster", "showInNews"])
    if (input[key] !== undefined && typeof input[key] !== "boolean")
      fail("Skontrolujte prepínače zobrazenia príspevku.");

  optionalText(input.posterDestination, 4096, "Skontrolujte cieľ plagátu.");
  if (
    input.posterDestination &&
    !isSafePosterDestination(input.posterDestination)
  )
    fail("Cieľ plagátu musí byť bezpečný odkaz.");
  optionalText(input.posterExpiresOn, 10, "Skontrolujte platnosť plagátu.");
  if (input.posterExpiresOn && !isCalendarDate(input.posterExpiresOn))
    fail("Skontrolujte dátum ukončenia plagátu.");

  const normalizedBlocks = draftBlocks(input.blocks);
  try {
    input.body = validateRichText(
      input.body ?? contentBlocksToRichText(normalizedBlocks)
    );
  } catch {
    fail("Skontrolujte formát a odkazy v texte.");
  }

  draftBodyImages(input.body as RichTextNode);
  input.blocks = [];

  keepFields(input, [
    "id",
    "title",
    "slug",
    "date",
    "excerpt",
    "author",
    "cover",
    "body",
    "blocks",
    "isPoster",
    "showInNews",
    "posterDestination",
    "posterExpiresOn"
  ]);

  return input as unknown as EditorialDocument;
}

export function requirePublishedEditorial(entry: EditorialDocument) {
  if (!entry.title.trim()) fail("Vyplňte názov.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug))
    fail("URL môže obsahovať malé písmená bez diakritiky, čísla a pomlčky.");
  if (
    !entry.body ||
    (!hasMeaningfulBody(entry.body) && !(entry.isPoster && entry.cover))
  )
    fail("Pridajte text alebo obrázok do obsahu príspevku.");
  if (entry.isPoster && !entry.cover) fail("Plagát musí mať obrázok.");

  // Drafts may retain an in-page anchor or incomplete URL. Publication keeps
  // the existing stricter destination policy until an explicit product change.
  if (
    entry.posterDestination &&
    !isSafePosterDestination(entry.posterDestination, true)
  )
    fail("Cieľ plagátu musí byť platný bezpečný odkaz.");
}

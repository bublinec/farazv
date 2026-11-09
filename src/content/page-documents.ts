import type { RichTextDocument } from "./documents";
import type { MediaAsset } from "./types";

/**
 * Editable sacrament and parish-service pages. Shared by the admin form,
 * validation and public rendering; no server clients or secrets belong here.
 */
export type PageGroup = "sacrament" | "service";

export const pageGroups: Record<
  PageGroup,
  { prefix: string; label: string; eyebrow: string }
> = {
  sacrament: { prefix: "sviatosti", label: "Sviatosti", eyebrow: "Sviatosti" },
  service: {
    prefix: "spolocenstva",
    label: "Služby vo farnosti",
    eyebrow: "Služba vo farnosti"
  }
};

export interface PageCard {
  title: string;
  text?: string;
  image?: MediaAsset;
  href?: string;
  linkLabel?: string;
}

export type PageBlock =
  | {
      type: "text";
      id: string;
      /** Optional visible heading above the text. */
      title?: string;
      titleLevel?: 2 | 3;
      /** Show the block as a closed question that readers can open. */
      collapsed?: boolean;
      body: RichTextDocument;
    }
  | {
      type: "cards";
      id: string;
      title?: string;
      cards: PageCard[];
    };

export interface PageQuotation {
  text: string;
  attribution: string;
  href?: string;
}

export interface PagePreparation {
  title: string;
  steps: { when: string; title: string; description: string }[];
}

export interface PageDocument {
  /** Public path without the leading slash, e.g. `sviatosti/sviatost-krstu`. */
  route: string;
  group: PageGroup;
  title: string;
  eyebrow: string;
  introduction: string;
  /** Short card/menu description for pages added in the administration. */
  menuDescription?: string;
  cover?: MediaAsset;
  quotation?: PageQuotation;
  blocks: PageBlock[];
  aside?: {
    title: string;
    description?: string;
    contact?: { name: string; phones: string[] };
  };
  facts: { label: string; value: string }[];
  links: { label: string; href: string; description?: string }[];
  preparation?: PagePreparation;
}

export const pageSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function pageRecordId(route: string) {
  return `page-${route.replace(/\//g, "-")}`;
}

export function pageRoute(group: PageGroup, slug: string) {
  return `${pageGroups[group].prefix}/${slug}`;
}

export function pageGroupForRoute(route: string): PageGroup | null {
  const [prefix, slug, ...rest] = route.split("/");
  if (!slug || rest.length || !pageSlugPattern.test(slug)) return null;

  for (const [group, definition] of Object.entries(pageGroups))
    if (definition.prefix === prefix) return group as PageGroup;
  return null;
}

export function slugifyPageTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

/** Admin list entry: built-in pages appear even before their first edit. */
export interface PageSummary {
  route: string;
  group: PageGroup;
  title: string;
  builtIn: boolean;
  recordId: string | null;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  updatedAt: string | null;
}

export interface PageRevision {
  id: string;
  recordId: string;
  version: number;
  action: "save" | "publish" | "unpublish" | "restore";
  actor: string;
  createdAt: string;
  title: string;
}

/** Published navigation entry for a page added in the administration. */
export interface PublicPageLink {
  route: string;
  group: PageGroup;
  title: string;
  description: string;
}

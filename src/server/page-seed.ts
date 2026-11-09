import "server-only";
import type { RichTextNode } from "@/content/documents";
import {
  findInformationPage,
  informationPages,
  type InformationPageDefinition
} from "@/content/information";
import { getPublicInformationContent } from "@/content/information-updates";
import { getInformationReadingNodes } from "@/content/information-presentation";
import {
  pageGroupForRoute,
  pageGroups,
  type PageBlock,
  type PageDocument,
  type PageGroup
} from "@/content/page-documents";
import { getPageCover } from "@/content/page-photographs";
import { sacramentPreparation } from "@/content/sacrament-preparation";
import { serviceQuotations } from "@/content/service-quotations";
import { parishServices } from "@/content/services";
import { richTextToPlainText } from "@/lib/rich-text";

/** The eucharist band links its catechism source; keep it when copying. */
const quotationSources: Record<string, string> = {
  "sviatosti/sviatost-eucharistie": "https://dkc.kbs.sk/dkc.php?in=kkc1324"
};

/** Sacrament and service pages whose code version can be taken over by the CMS. */
export function builtInEditablePages(): {
  route: string;
  group: PageGroup;
  title: string;
}[] {
  const sacraments = informationPages
    .filter((page) => page.kind === "sacrament")
    .map((page) => ({
      route: page.slug,
      group: "sacrament" as const,
      title: page.title
    }));
  const services = parishServices.map((service) => {
    const route = service.href.replace(/^\//, "");
    return {
      route,
      group: "service" as const,
      title: findInformationPage(route)?.title ?? service.title
    };
  });

  return [...sacraments, ...services];
}

export function builtInPageRoutes(): ReadonlySet<string> {
  return new Set(builtInEditablePages().map((page) => page.route));
}

export function isBuiltInEditablePage(route: string) {
  return builtInEditablePages().some((page) => page.route === route);
}

/** Every fixed informational route, including pages outside the editable groups. */
export function isStaticInformationRoute(route: string) {
  return !!findInformationPage(route);
}

const plain = (nodes: RichTextNode[]) =>
  richTextToPlainText({ type: "doc", content: nodes }).trim();

/**
 * Split presented source nodes into blocks. Collapsed questions become their own
 * closed blocks; everything else keeps its source section identity.
 */
function sectionBlocks(
  sectionId: string,
  nodes: ReturnType<typeof getInformationReadingNodes>
): PageBlock[] {
  const blocks: PageBlock[] = [];
  let pending: RichTextNode[] = [];
  let collapsedCount = 0;

  const flush = () => {
    if (!pending.length) return;
    blocks.push({
      type: "text",
      id: blocks.length ? `${sectionId}-${blocks.length + 1}` : sectionId,
      body: { type: "doc", content: pending }
    });
    pending = [];
  };

  for (let index = 0; index < nodes.length; index += 1) {
    const { node, collapsed } = nodes[index];
    if (node.type !== "heading" || !collapsed) {
      pending.push(node);
      continue;
    }

    flush();
    const level = Number(node.attrs?.level ?? 2);
    const next = nodes.findIndex(
      (candidate, nextIndex) =>
        nextIndex > index &&
        candidate.node.type === "heading" &&
        Number(candidate.node.attrs?.level ?? 2) <= level
    );
    const end = next === -1 ? nodes.length : next;
    collapsedCount += 1;
    blocks.push({
      type: "text",
      id: `${sectionId}-otazka-${collapsedCount}`,
      title: plain([node]),
      titleLevel: level >= 3 ? 3 : 2,
      collapsed: true,
      body: {
        type: "doc",
        content: nodes.slice(index + 1, end).map((entry) => entry.node)
      }
    });
    index = end - 1;
  }
  flush();

  return blocks;
}

function sourceBlocks(page: InformationPageDefinition): {
  blocks: PageBlock[];
  quotation?: PageDocument["quotation"];
} {
  if (page.contentSource === "curated")
    return {
      blocks: page.sections.map(
        (section, index): PageBlock => ({
          type: "text",
          id: `informacie-${index + 1}`,
          body: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: section.title }]
              },
              ...(section.paragraphs ?? []).map((paragraph) => ({
                type: "paragraph",
                content: [{ type: "text", text: paragraph }]
              })),
              ...(section.items?.length
                ? [
                    {
                      type: "bulletList",
                      content: section.items.map((item) => ({
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [{ type: "text", text: item }]
                          }
                        ]
                      }))
                    }
                  ]
                : [])
            ]
          }
        })
      )
    };

  const source = getPublicInformationContent(page.source);
  if (source.placeholderSource) return { blocks: [] };

  const sections = source.sections.filter(
    (section) =>
      section.body.content.length &&
      !["multi_paragraph_image_banners", "partners_sections"].includes(
        section.kind
      )
  );
  const opening =
    page.kind === "sacrament" && sections[0]?.kind === "quotation_sections"
      ? sections[0]
      : undefined;

  let quotation: PageDocument["quotation"];
  if (opening) {
    const [quote, ...attribution] = opening.body.content;
    quotation = {
      text: plain(quote?.type === "blockquote" ? quote.content ?? [] : [quote]),
      attribution: plain(attribution).replace(/^[—–-]\s*/, ""),
      ...(quotationSources[page.slug]
        ? { href: quotationSources[page.slug] }
        : {})
    };
  }

  return {
    quotation,
    blocks: sections
      .filter((section) => section !== opening)
      .flatMap((section) =>
        sectionBlocks(section.id, getInformationReadingNodes(section, page))
      )
  };
}

/** Copy the current public code version into an editable draft. */
export function seedPageDocument(route: string): PageDocument {
  const page = findInformationPage(route);
  const group = pageGroupForRoute(route);
  if (!page || !group || !isBuiltInEditablePage(route))
    throw new Error(`Unknown built-in editable page: ${route}`);

  const { blocks, quotation: sourceQuotation } = sourceBlocks(page);
  const serviceQuotation = serviceQuotations[route];
  const quotation =
    sourceQuotation ??
    (serviceQuotation
      ? {
          text: serviceQuotation.text,
          attribution: serviceQuotation.attribution,
          href: serviceQuotation.href
        }
      : undefined);
  const preparation = sacramentPreparation[route];
  const cover = getPageCover(`/${route}`)?.image;

  return {
    route,
    group,
    title: page.title,
    eyebrow: page.eyebrow,
    introduction: page.introduction,
    ...(cover ? { cover: { ...cover } } : {}),
    ...(quotation ? { quotation } : {}),
    blocks,
    ...(page.aside
      ? {
          aside: {
            title: page.aside.title,
            ...(page.aside.description
              ? { description: page.aside.description }
              : {}),
            ...(page.aside.contact
              ? {
                  contact: {
                    name: page.aside.contact.name,
                    phones: [...page.aside.contact.phones]
                  }
                }
              : {})
          }
        }
      : {}),
    facts: (page.facts ?? []).map((fact) => ({ ...fact })),
    links: (page.links ?? []).map((link) => ({ ...link })),
    ...(preparation
      ? {
          preparation: {
            title: preparation.title,
            steps: preparation.steps.map((step) => ({ ...step }))
          }
        }
      : {})
  };
}

/** An empty draft for a page added in the administration. */
export function emptyPageDocument(
  group: PageGroup,
  route: string,
  title: string
): PageDocument {
  return {
    route,
    group,
    title,
    eyebrow: pageGroups[group].eyebrow,
    introduction: "",
    menuDescription: "",
    blocks: [
      {
        type: "text",
        id: "informacie-1",
        body: { type: "doc", content: [{ type: "paragraph" }] }
      }
    ],
    facts: [],
    links: []
  };
}

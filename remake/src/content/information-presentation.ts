import type { RichTextNode } from "./documents";
import type {
  InformationPageDefinition,
  PublishedInformationSection
} from "./information";
import { richTextToPlainText } from "@/lib/rich-text";

export interface PresentedReadingNode {
  node: RichTextNode;
  /** Count original headings, including hidden titles, to preserve deep links. */
  headingOrdinal: number;
  collapsed?: boolean;
}

interface SectionPresentation {
  expectedOpening: string;
  hide?: boolean;
  hideOpening?: boolean;
  openingLevel?: number;
  subtopicOffset?: number;
  headingLevel?: number;
  headings?: Record<string, { level?: number; collapsed?: boolean }>;
}

/** Source IDs locate a section; expected text guards every exceptional rule. */
const pagePresentation: Record<string, Record<string, SectionPresentation>> = {
  "farnost/o-farnosti": {
    "components_sections_text-101": {
      expectedOpening: "História farnosti",
      subtopicOffset: 1
    },
    "components_sections_images_text_grids-2": {
      expectedOpening: "Veľkomoravské osídlenie a prvý kostol",
      headingLevel: 3
    },
    "components_sections_text-100": {
      expectedOpening: "Duchovný život",
      subtopicOffset: 1
    }
  },
  "farnost/kostol-sv-jana-pavla-v-lieskovci": {
    "components_sections_text-3": {
      expectedOpening: "Kostol sv. Jána Pavla II. v Lieskovci",
      hideOpening: true
    }
  },
  "spolocenstva/reholne-sestry": {
    "components_sections_text-117": {
      expectedOpening: "Kongregácia Dcér sv. Františka Assiského (CFSF)",
      subtopicOffset: 1
    }
  },
  "spolocenstva/ministranti": {
    "components_shared_slides-6": {
      expectedOpening: "Začni miništrovať",
      hide: true
    }
  },
  "sviatosti/sviatost-manzelstva": {
    "components_sections_text-6": {
      expectedOpening: "Ako postupovať pri uzatváraní manželstva?",
      headings: {
        "Potrebné listiny:": { level: 3 },
        "Aké sú manželské prekážky?": { collapsed: true }
      }
    }
  },
  "sviatosti/sviatost-pomazania-chorych": {
    "components_sections_text-2": {
      expectedOpening: "Prijímateľ sviatosti pomazania chorých",
      openingLevel: 2
    }
  }
};

const legacyLabels = new Set([
  "o farnosti",
  "spoločenstvo",
  "farnosť",
  "galéria",
  "galeria",
  "zolná"
]);

function nodeText(node: RichTextNode) {
  return richTextToPlainText({ type: "doc", content: [node] }).trim();
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("sk");
}

function sectionPresentation(
  section: PublishedInformationSection,
  page: InformationPageDefinition
) {
  const rule = pagePresentation[page.slug]?.[section.id];
  if (!rule) return undefined;

  const opening = section.body.content[0];
  const headings = section.body.content
    .filter((node) => node.type === "heading")
    .map(nodeText);

  if (
    !opening ||
    nodeText(opening) !== rule.expectedOpening ||
    (opening.type !== "heading" && !rule.openingLevel) ||
    Object.keys(rule.headings ?? {}).some(
      (heading) => !headings.includes(heading)
    )
  )
    throw new Error(
      `Review static presentation for /${page.slug}, ${section.id}: the expected source text has changed.`
    );

  return rule;
}

export function isInformationCredit(node: RichTextNode) {
  return (
    node.type === "paragraph" &&
    /^(?:autor:|autorka:|claudia nemcová$)/i.test(nodeText(node))
  );
}

/** Presentation only: preserve source copy, links, images and heading anchors. */
export function getInformationReadingNodes(
  section: PublishedInformationSection,
  page: InformationPageDefinition
): PresentedReadingNode[] {
  const rule = sectionPresentation(section, page);
  if (rule?.hide) return [];

  const seenCredits = new Set<string>();
  let headingOrdinal = 0;

  return section.body.content.flatMap((original, index) => {
    let node = original;
    if (index === 0 && rule?.openingLevel)
      node = {
        ...node,
        type: "heading",
        attrs: { ...node.attrs, level: rule.openingLevel }
      };

    if (node.type === "heading") headingOrdinal += 1;

    const value = nodeText(node);
    const label = normalize(value);

    if (node.type === "paragraph" && index < 2 && legacyLabels.has(label))
      return [];

    if (
      node.type === "heading" &&
      index < 2 &&
      (label === normalize(page.title) ||
        label === normalize(page.eyebrow) ||
        (index === 0 && rule?.hideOpening))
    )
      return [];

    if (section.kind === "slides" && node.type === "image") return [];

    if (isInformationCredit(node)) {
      const credit = normalize(value.replace(/^autor(?:ka)?:\s*/i, ""));
      if (seenCredits.has(credit)) return [];
      seenCredits.add(credit);
    }

    const headingRule =
      node.type === "heading" ? rule?.headings?.[value] : undefined;
    if (node.type === "heading") {
      const sourceLevel = Number(node.attrs?.level ?? 2);
      const level =
        headingRule?.level ??
        rule?.headingLevel ??
        (index > 0
          ? Math.min(sourceLevel + (rule?.subtopicOffset ?? 0), 6)
          : sourceLevel);

      node = { ...node, attrs: { ...node.attrs, level } };
    }

    return [
      {
        node,
        headingOrdinal,
        ...(headingRule?.collapsed ? { collapsed: true } : {})
      }
    ];
  });
}

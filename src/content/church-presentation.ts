import type { RichTextDocument } from "./documents";
import type { InformationPageDefinition } from "./information";
import { richTextToPlainText } from "@/lib/rich-text";

interface ChurchPageContent {
  readingPage: InformationPageDefinition;
  sidebarNote?: {
    document: RichTextDocument;
    sourceSectionId: string;
    headingOrdinal: number;
  };
}

/** Relocate the original priest list without changing the imported source. */
export function getChurchPageContent(
  page: InformationPageDefinition
): ChurchPageContent {
  if (
    page.slug !== "farnost/kostol-sv-jana-pavla-v-lieskovci" ||
    page.contentSource !== "published"
  )
    return { readingPage: page };

  const section = page.source.sections.find(
    (entry) => entry.id === "components_sections_text-3"
  );
  if (!section) return { readingPage: page };

  const nodes = section.body.content;
  const index = nodes.findIndex(
    (node) =>
      node.type === "heading" &&
      richTextToPlainText({ type: "doc", content: [node] }).trim() ===
        "Kňazi pochádzajúci z Lieskovca"
  );
  if (index < 0 || nodes[index + 1]?.type !== "bulletList")
    return { readingPage: page };

  const readingSection = {
    ...section,
    body: {
      ...section.body,
      content: [...nodes.slice(0, index), ...nodes.slice(index + 2)]
    }
  };

  return {
    readingPage: {
      ...page,
      source: {
        ...page.source,
        sections: page.source.sections.map((entry) =>
          entry === section ? readingSection : entry
        )
      }
    },
    sidebarNote: {
      document: { type: "doc", content: nodes.slice(index, index + 2) },
      sourceSectionId: section.id,
      headingOrdinal: nodes
        .slice(0, index + 1)
        .filter((node) => node.type === "heading").length
    }
  };
}

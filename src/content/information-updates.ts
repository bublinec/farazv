import type { PublishedInformationContent } from "./information";
import type { RichTextNode } from "./documents";
import { richTextToPlainText } from "@/lib/rich-text";

/** Reviewed 31 October 2026. Keep the imported source intact as provenance. */
const confirmationGuidance =
  "Informácie o aktuálnej príprave a termínoch stretnutí nájdete vo farských oznamoch alebo vám ich poskytne farská kancelária.";
const marriageGuidance =
  "Aktuálne termíny predmanželských kurzov si overte vo farských oznamoch alebo vo farskej kancelárii. Pri príprave na sobáš vám pomôžeme dohodnúť ďalší postup.";
const familyGuidance =
  "O najbližšom Dni farskej rodiny a možnostiach prihlásenia sa informujte vo farských oznamoch alebo vo farskej kancelárii.";

function paragraph(value: string): RichTextNode {
  return { type: "paragraph", content: [{ type: "text", text: value }] };
}

function heading(value: string): RichTextNode {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text: value }]
  };
}

function nodeText(node: RichTextNode) {
  return richTextToPlainText({ type: "doc", content: [node] });
}

function expectNode(nodes: RichTextNode[], index: number, startsWith: string) {
  if (!nodes[index] || !nodeText(nodes[index]).startsWith(startsWith))
    throw new Error(
      "A reviewed static update no longer matches its source. Review it before regenerating public copy."
    );
}

function updateSection(
  source: PublishedInformationContent,
  sectionId: string,
  update: (nodes: RichTextNode[]) => RichTextNode[]
): PublishedInformationContent {
  if (!source.sections.some((section) => section.id === sectionId))
    throw new Error("A reviewed static section is missing from its source.");

  return {
    ...source,
    sections: source.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            body: { ...section.body, content: update(section.body.content) }
          }
        : section
    )
  };
}

/** Explicit editorial corrections, not a rule that treats every old date as stale. */
export function getPublicInformationContent(
  source: PublishedInformationContent
): PublishedInformationContent {
  switch (source.route) {
    case "/spolocenstva/mladeznicky-zbor":
      return updateSection(source, "components_sections_text-64", (nodes) => {
        expectNode(
          nodes,
          4,
          "Ak máš bližšie otázky, môžeš nás kontaktovať - Kristína Považanová"
        );
        // The contact is displayed once, as a telephone link in the page aside.
        return nodes.filter((_, index) => index !== 4);
      });

    case "/spolocenstva/ministranti":
      return updateSection(source, "components_sections_text-63", (nodes) => {
        expectNode(nodes, 6, "Tešíme sa na každého nového člena");
        const [invitation, ...contact] = nodes[6].content ?? [];
        if (
          invitation?.text !==
            "Tešíme sa na každého nového člena, tak neváhaj a príď medzi nás!" ||
          nodeText({ type: "paragraph", content: contact }) !==
            "Ak máš akékoľvek otázky alebo sa chceš dozvedieť viac, môžeš nás kontaktovať na telefónnom čísle 0951 606 212."
        )
          throw new Error(
            "The ministers' invitation and contact have changed."
          );

        return nodes.map((node, index) =>
          index === 6 ? { ...node, content: [invitation] } : node
        );
      });

    case "/spolocenstva/detsky-spevokol": {
      const sectionId = "components_sections_text-123";
      const section = source.sections.find((entry) => entry.id === sectionId);
      const invitation = section?.body.content[2];
      if (
        !section ||
        !invitation ||
        !nodeText(invitation).normalize("NFC").startsWith("Pridaj sa k nám!")
      )
        throw new Error("The children's choir invitation has changed.");

      expectNode(section.body.content, 6, "Okrem toho, že zbor");
      expectNode(
        section.body.content,
        8,
        "Ak máš bližšie otázky, môžeš nás kontaktovať – Magdaléna Turanská"
      );
      const updated = updateSection(source, sectionId, (nodes) =>
        nodes.flatMap((node, index) => {
          if (index === 2 || index === 8) return [];
          if (index === 6) return [heading("Naše spoločné chvíle"), node];
          return [node];
        })
      );

      return {
        ...updated,
        sections: [
          ...updated.sections,
          {
            id: "detsky-spevokol-pozvanie",
            kind: "text",
            body: {
              type: "doc",
              content: [heading("Kedy a kde nás nájdeš"), invitation]
            }
          }
        ]
      };
    }

    case "/sviatosti/sviatost-birmovania":
      return updateSection(source, "components_sections_text-9", (nodes) => {
        expectNode(
          nodes,
          3,
          "Sviatosť birmovania v našej farnosti bude vyslúžená v nedeľu 16. 10. 2022"
        );
        expectNode(
          nodes,
          12,
          "Birmovná príprava, ktorá sa začala v októbri 2021"
        );
        return nodes.flatMap((node, index) =>
          index === 3
            ? []
            : index === 12
            ? [paragraph(confirmationGuidance)]
            : [node]
        );
      });

    case "/sviatosti/sviatost-manzelstva":
      return updateSection(source, "components_sections_text-6", (nodes) => {
        expectNode(
          nodes,
          5,
          "Aké sú termíny prípravných kurzov pred manželstvom v našej farnosti v roku 2026?"
        );
        expectNode(nodes, 7, "1. Turnus:");
        expectNode(nodes, 8, "13. 03. (piatok)");
        expectNode(nodes, 9, "2. Turnus:");
        expectNode(nodes, 10, "08. 05. (piatok)");
        expectNode(nodes, 11, "3. Turnus:");
        expectNode(nodes, 12, "28. 08. (piatok)");

        return nodes.flatMap((node, index) => {
          if (index === 5)
            return [
              {
                ...node,
                content: [
                  { type: "text", text: "Príprava na sviatosť manželstva" }
                ]
              }
            ];
          if (index === 7) return [paragraph(marriageGuidance)];
          return index >= 8 && index <= 12 ? [] : [node];
        });
      });

    case "/farnost/cirkevna-skola":
      return updateSection(
        source,
        "components_sections_images_text_grids-11",
        (nodes) => {
          expectNode(nodes, 2, "Naša Základná škola sv. Dominika Savia");
          expectNode(nodes, 7, "V školskom roku 2022/2023 nám pribudlo 38");
          const currentClaim = " (aktuálne máme 234\nžiakov)";
          const relativeDate = "v predminulom školskom roku";
          const original = nodeText(nodes[2]);
          if (
            !original.includes(currentClaim) ||
            !original.includes(relativeDate)
          )
            throw new Error(
              "The reviewed school update no longer matches its source."
            );

          const updated = paragraph(
            original
              .replace(currentClaim, "")
              .replace(relativeDate, "v minulosti")
          );
          return nodes.flatMap((node, index) =>
            index === 7 ? [] : index === 2 ? [updated] : [node]
          );
        }
      );

    case "/den-farskej-rodiny":
      return updateSection(source, "components_sections_text-227", (nodes) => {
        // The poster advertises 13 June 2026, with a 20 June rain date.
        if (
          nodes[0]?.type !== "image" ||
          nodes[0].attrs?.src !==
            "https://res.cloudinary.com/dmx3wfvko/image/upload/v1778694979/plagat_2026_57e80c0f61.png"
        )
          throw new Error("The reviewed parish-family invitation has changed.");
        return [paragraph(familyGuidance), ...nodes.slice(1)];
      });

    default:
      return source;
  }
}

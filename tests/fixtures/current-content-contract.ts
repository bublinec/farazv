import { readFileSync } from "node:fs";

interface Layout {
  slug: string;
  title: string;
  eyebrow: string;
  links?: { href: string }[];
  sections?: { title: string; paragraphs?: string[]; items?: string[] }[];
}
const approved = JSON.parse(
  readFileSync(
    new URL("./approved-static-content.json", import.meta.url),
    "utf8"
  )
) as { layouts: Layout[]; reading: { route: string; blocks: string[] }[] };

// Explicit adaptations for already shipped route moves and contact cards.
// The independent original export is deliberately unchanged.
export const currentLayouts: Layout[] = [
  ...approved.layouts
    .filter(
      (page) =>
        ![
          "birmovanci",
          "farnost/galeria",
          "farnost/virtualna-prehliadka"
        ].includes(page.slug)
    )
    .map((page) =>
      [
        "sviatosti/sviatost-eucharistie",
        "sviatosti/sviatost-birmovania",
        "farnost/kostol-sv-alzbety"
      ].includes(page.slug)
        ? { ...page, links: [] }
        : page
    ),
  { slug: "farnost/o-farnosti", title: "O farnosti", eyebrow: "Naša farnosť" }
];

export function expectedPublicReading(route: string): string[] {
  // Original church history now lives on the parish-history page. Its former
  // route has a dedicated church presentation and merged gallery/tour sections.
  if (
    [
      "/farnost/kostol-sv-alzbety",
      "/spolocenstva/akolyti",
      "/spolocenstva/lektori"
    ].includes(route)
  )
    return [];
  const sourceRoute =
    route === "/farnost/o-farnosti" ? "/farnost/kostol-sv-alzbety" : route;
  const blocks = approved.reading.find(
    (page) => page.route === sourceRoute
  )!.blocks;
  if (route === "/spolocenstva/detsky-spevokol") {
    const invitation = blocks.find((text) =>
      text.normalize("NFC").startsWith("Pridaj sa k nám!")
    )!;
    return [
      ...blocks
        .filter(
          (text) =>
            text !== invitation && !text.startsWith("Ak máš bližšie otázky,")
        )
        .flatMap((text) =>
          text.startsWith("Okrem toho, že zbor")
            ? ["Naše spoločné chvíle", text]
            : [text]
        ),
      "Kedy a kde nás nájdeš",
      invitation
    ];
  }
  if (route === "/spolocenstva/mladeznicky-zbor")
    return blocks.filter((text) => !text.startsWith("Ak máš bližšie otázky,"));
  if (route === "/spolocenstva/ministranti")
    return blocks.map((text) =>
      text.startsWith("Tešíme sa na každého nového člena,")
        ? "Tešíme sa na každého nového člena, tak neváhaj a príď medzi nás!"
        : text
    );
  return blocks;
}

export const movedCommunityContacts = [
  {
    slug: "spolocenstva/detsky-spevokol",
    name: "Manželia Liečkovci",
    phones: ["+421 949 739 289", "+421 949 171 777"]
  },
  {
    slug: "spolocenstva/mladeznicky-zbor",
    name: "Kristína Považanová",
    phones: ["0944 389 886"]
  },
  {
    slug: "spolocenstva/ministranti",
    name: "Filip Krahulec",
    phones: ["0951 606 212"]
  }
];

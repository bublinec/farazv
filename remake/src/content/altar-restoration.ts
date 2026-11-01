import type { MediaAsset } from "./types";

/** Dedicated restoration appeal, distinct from the account for everyday parish life. */
export const altarRestoration = {
  title: "Obnova oltára sv. Jozefa",
  href: "/farnost/obnova-oltarov",
  sectionId: "obnova-oltarov",
  postSlug: "pomozme-spolu-zrestaurovat-oltar-1",
  iban: "SK53 1111 0000 0066 1528 6057",
  goal: "82 000 €",
  // Claudia Nemcová's existing Marian chapel gallery photograph.
  photograph: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551071/IMG_3168_78eb1d97d5.jpg",
    width: 1024,
    height: 1536,
    alt: "Barokové oltáre v Mariánskej kaplnke pri Kostole sv. Alžbety"
  } satisfies MediaAsset
};

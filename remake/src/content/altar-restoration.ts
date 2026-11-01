import type { MediaAsset } from "./types";

/** Dedicated restoration appeal, distinct from the account for everyday parish life. */
export const altarRestoration = {
  title: "Obnova oltárov v kaplnke",
  href: "/farnost/obnova-oltarov",
  sectionId: "obnova-oltarov",
  postSlug: "pomozme-spolu-zrestaurovat-oltar-1",
  iban: "SK53 1111 0000 0066 1528 6057",
  goal: "82 000 €",
  photograph: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551071/IMG_3168_78eb1d97d5.jpg",
    width: 1024,
    height: 1536,
    alt: "Barokové oltáre v Mariánskej kaplnke pri Kostole sv. Alžbety"
  } satisfies MediaAsset,
  homepagePhotograph: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551115/IMG_3196_3863d76145.jpg",
    width: 1024,
    height: 1536,
    alt: "Oltár sv. Jozefa v Kostole sv. Alžbety vo Zvolene"
  } satisfies MediaAsset
};

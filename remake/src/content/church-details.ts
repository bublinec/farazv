import type { MediaAsset } from "./types";

/** Details from the original parish gallery, photographed by Claudia Nemcová. */
export const churchDetails = {
  pews: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551364/IMG_4745_d4a6f8790b.jpg",
    width: 1024,
    height: 1536,
    alt: "Drevené lavice a červený koberec v Kostole sv. Alžbety vo Zvolene"
  },
  vault: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551427/IMG_4835_7edebca911.jpg",
    width: 1024,
    height: 683,
    alt: "Maľovaná klenba Kostola sv. Alžbety vo Zvolene"
  },
  book: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551421/IMG_4819_8ec33d9741.jpg",
    width: 1024,
    height: 1536,
    alt: "Zdobená liturgická kniha v Kostole sv. Alžbety vo Zvolene"
  },
  window: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551400/IMG_4794_94955124af.jpg",
    width: 1024,
    height: 1536,
    alt: "Lomené okno v interiéri Kostola sv. Alžbety vo Zvolene"
  },
  iron: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551390/IMG_4774_167708ca92.jpg",
    width: 1024,
    height: 1536,
    alt: "Detail kovovej špirály v interiéri Kostola sv. Alžbety vo Zvolene"
  },
  chapel: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551378/IMG_4766_24f6dc89ac.jpg",
    width: 1024,
    height: 1536,
    alt: "Lomená klenba bočnej kaplnky Kostola sv. Alžbety vo Zvolene"
  },
  nave: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551363/IMG_4744_5df9dc5fa5.jpg",
    width: 1024,
    height: 1536,
    alt: "Hlavná loď a oltár Kostola sv. Alžbety vo Zvolene"
  },
  interior: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551432/IMG_4839_494a51725f.jpg",
    width: 1024,
    height: 683,
    alt: "Pohľad do Kostola sv. Alžbety vo Zvolene"
  }
} satisfies Record<string, MediaAsset>;

export const churchPhotographer = {
  name: "Claudia Nemcová",
  href: "https://nemcovaclaudia.myportfolio.com/work"
};

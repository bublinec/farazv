import type { MediaAsset } from "./types";

/** Permanent details from the original homepage's hospital-service panel. */
export const hospitalMinistry = {
  title: "Duchovná služba v nemocnici",
  href: "/farnost/duchovna-sluzba-v-nemocnici",
  sectionId: "duchovna-sluzba-v-nemocnici",
  mass: {
    day: "Každú sobotu",
    time: "15:00",
    location: "Jedáleň na 2. poschodí spoločného pavilónu"
  },
  communion: {
    day: "V nedeľu dopoludnia",
    registrationDeadline: "10:00"
  },
  serviceRosterSlug: "sluzba-pomazania-chorych-nemocnica-zvolen",
  // Transcribed from the newer cover; the older image in the article has a
  // superseded Thursday contact and must not be combined with this roster.
  rosterSource:
    "https://res.cloudinary.com/dmx3wfvko/image/upload/v1789807686/rozpis_spovedania_v_nemocnici_6753655666.jpg",
  roster: [
    { day: "Pondelok", priest: "Lukáš Líška", phone: "0915 801 998" },
    { day: "Utorok", priest: "Marek Hraňo", phone: "0908 488 545" },
    { day: "Streda", priest: "Daniel Markovič", phone: "0902 462 308" },
    { day: "Štvrtok", priest: "Rafael Tresa, OP", phone: "0904 846 801" },
    { day: "Piatok", priest: "Marián Gregor ml.", phone: "0908 964 805" }
  ],
  plan: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1682798720/Nemocnica_omse_8b2ffe1977.png",
    width: 2293,
    height: 1003,
    alt: "Plán areálu nemocnice vo Zvolene s vyznačeným pavilónom, v ktorom sa konajú sväté omše"
  } satisfies MediaAsset
};

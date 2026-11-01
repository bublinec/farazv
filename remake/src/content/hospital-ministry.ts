import type { MediaAsset } from "./types";

/** Permanent details from the original homepage's hospital-service panel. */
export const hospitalMinistry = {
  sectionId: "duchovna-sluzba-v-nemocnici",
  serviceRosterSlug: "sluzba-pomazania-chorych-nemocnica-zvolen",
  plan: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1682798720/Nemocnica_omse_8b2ffe1977.png",
    width: 2293,
    height: 1003,
    alt: "Plán areálu nemocnice vo Zvolene s vyznačeným pavilónom, v ktorom sa konajú sväté omše"
  } satisfies MediaAsset
};

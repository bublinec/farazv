import "server-only";
import { churchDetails } from "./church-details";
import { aerialImage, churchGallery, churchLieskovec } from "./assets";
import { publishedInformationContent } from "./information-content";
import type { MediaAsset } from "./types";

/**
 * Most legacy pages already have a deliberately cropped photograph. Reuse it
 * instead of replacing the church detail with one repeated decorative image.
 * Exceptions replace stock pictures/an illustration and give the new or curated
 * pages real church details. Original source records remain unchanged.
 */
const churchPhotographOverrides: Partial<Record<string, PageCover>> = {
  "/farnost/o-farnosti": { image: aerialImage },
  "/farnost/kostol-sv-jana-pavla-v-lieskovci": {
    image: churchLieskovec,
    layout: "split"
  },
  "/objav-krista": { image: churchGallery[1] },
  "/sviatosti/sviatost-pomazania-chorych": { image: churchDetails.chapel },
  "/spolocenstva/lektori": { image: churchDetails.book },
  "/spolocenstva/akolyti": { image: churchDetails.iron },
  "/spolocenstva/mladeznicky-zbor": { image: churchDetails.window }
};

interface PageCover {
  image: MediaAsset;
  layout?: "split";
  crop?: { desktopScale: number; mobilePosition: string };
}

// The original confirmation panorama has an out-of-focus foreground on its left.
const coverCrops: Partial<Record<string, NonNullable<PageCover["crop"]>>> = {
  "/sviatosti/sviatost-birmovania": {
    desktopScale: 1.45,
    mobilePosition: "70% center"
  }
};

export function getPageCover(route: string): PageCover | undefined {
  const override = churchPhotographOverrides[route];
  const image =
    override?.image ??
    publishedInformationContent.find((page) => page.route === route)?.cover;

  return image ? { ...override, image, crop: coverCrops[route] } : undefined;
}

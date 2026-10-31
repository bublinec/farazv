import "server-only";
import { churchDetails } from "./church-details";
import { churchGallery } from "./assets";
import { publishedInformationContent } from "./information-content";
import type { MediaAsset } from "./types";

/**
 * Most legacy pages already have a deliberately cropped photograph. Reuse it
 * instead of replacing the church detail with one repeated decorative image.
 * Exceptions replace stock pictures/an illustration and give the new or curated
 * pages real church details. Original source records remain unchanged.
 */
const churchPhotographOverrides: Partial<Record<string, MediaAsset>> = {
  "/prispevky": churchDetails.pews,
  "/objav-krista": churchGallery[1],
  "/sviatosti/sviatost-pomazania-chorych": churchDetails.chapel,
  "/spolocenstva/lektori": churchDetails.book,
  "/spolocenstva/akolyti": churchDetails.iron,
  "/spolocenstva/mladeznicky-zbor": churchDetails.window
};

interface PageCover {
  image: MediaAsset;
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
  const image =
    churchPhotographOverrides[route] ??
    publishedInformationContent.find((page) => page.route === route)?.cover;

  return image ? { image, crop: coverCrops[route] } : undefined;
}

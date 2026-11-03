import type { MetadataRoute } from "next";
import type { EditorialRecordKind } from "@/content/documents";
import { siteConfig } from "@/content/site";
import { saintCharbel } from "@/content/saint-charbel";
import { altarRestoration } from "@/content/altar-restoration";
import { editorialRecordPath } from "./record-routing";

/** Input contains published records only; a draft save must not affect lastmod. */
export function publicEditorialSitemap(
  records: {
    kind: string;
    slug: string | null;
    publishedAt: string | null;
  }[]
): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];
  for (const record of records) {
    if (
      !record.slug ||
      !["article", "news", "event", "notice"].includes(record.kind)
    )
      continue;
    if (
      (record.kind === "news" || record.kind === "event") &&
      [saintCharbel.formerPostSlug, altarRestoration.postSlug].includes(
        record.slug
      )
    )
      continue;

    pages.push({
      url: new URL(
        editorialRecordPath(record.kind as EditorialRecordKind, record.slug),
        siteConfig.url
      ).href,
      ...(record.publishedAt ? { lastModified: record.publishedAt } : {})
    });
  }
  return pages;
}
